import json
import pytest
from app.database import db
from app.services.quiz_generator import (
    retrieve_patient_memories,
    generate_quiz_item_from_memory,
    generate_quiz_for_patient,
    cosine_similarity,
    validate_and_parse_quiz_json,
)

@pytest.fixture(autouse=True)
def reset_database():
    """Reset repository before each test."""
    db.memories.clear()
    db.embeddings.clear()
    db.patients.clear()
    db.patient_members.clear()
    db.consents.clear()


def test_cross_patient_retrieval_is_impossible():
    """Verify that memories from Patient B are NEVER retrieved for Patient A."""
    # 1. Setup Patient A memories (1 approved, 1 unapproved)
    mem_a1 = {
        "id": "mem-a1",
        "patient_id": "patient-a",
        "caption": "Bihu festival with daughter",
        "people": ["Jonali"],
        "year": 1985,
        "is_approved": True,
        "embedding_id": "emb-a1",
    }
    mem_a2 = {
        "id": "mem-a2",
        "patient_id": "patient-a",
        "caption": "Unapproved draft memory",
        "people": [],
        "is_approved": False,
        "embedding_id": "emb-a2",
    }

    # 2. Setup Patient B memory
    mem_b1 = {
        "id": "mem-b1",
        "patient_id": "patient-b",
        "caption": "Tea garden visit with brother",
        "people": ["Ranjit"],
        "year": 1990,
        "is_approved": True,
        "embedding_id": "emb-b1",
    }

    db.memories["mem-a1"] = mem_a1
    db.memories["mem-a2"] = mem_a2
    db.memories["mem-b1"] = mem_b1

    db.embeddings["emb-a1"] = [1.0, 0.0]
    db.embeddings["emb-a2"] = [0.5, 0.5]
    db.embeddings["emb-b1"] = [1.0, 0.0]  # Identical vector to mem-a1

    # Query for Patient A
    results_a = retrieve_patient_memories(
        patient_id="patient-a",
        query_embedding=[1.0, 0.0],
        only_approved=True,
    )

    # Must contain ONLY mem-a1. mem-b1 (foreign) and mem-a2 (unapproved) MUST NOT appear
    assert len(results_a) == 1
    assert results_a[0]["id"] == "mem-a1"
    assert all(m["patient_id"] == "patient-a" for m in results_a)
    assert not any(m["patient_id"] == "patient-b" for m in results_a)


def test_invalid_json_triggers_one_retry_then_skips_if_unresolved():
    """Verify that invalid JSON prompts exactly one retry and skips if still invalid."""
    mem = {
        "id": "mem-01",
        "patient_id": "patient-1",
        "caption": "Family gathering",
        "is_approved": True,
    }

    call_count = 0

    def mock_broken_llm(m, attempt=1):
        nonlocal call_count
        call_count += 1
        return "NOT VALID JSON {{{{ broken"

    # Both attempts fail -> item is skipped
    item = generate_quiz_item_from_memory("patient-1", mem, llm_callable=mock_broken_llm)
    assert item is None
    assert call_count == 2  # Exactly 2 calls: attempt 1 + 1 retry


def test_invalid_json_recovers_on_retry():
    """Verify that if attempt 1 returns invalid JSON but attempt 2 succeeds, item is accepted."""
    mem = {
        "id": "mem-02",
        "patient_id": "patient-1",
        "caption": "Old village house",
        "is_approved": True,
    }

    call_count = 0

    def mock_recovering_llm(m, attempt=1):
        nonlocal call_count
        call_count += 1
        if attempt == 1:
            return "broken string..."
        return json.dumps({
            "question_text": "What color was the gate in the village house?",
            "options": [
                {"id": "1", "text": "Green wooden gate", "is_correct": True},
                {"id": "2", "text": "Red brick wall", "is_correct": False},
            ],
            "difficulty": 0.0,
        })

    item = generate_quiz_item_from_memory("patient-1", mem, llm_callable=mock_recovering_llm)
    assert item is not None
    assert call_count == 2
    assert item.question_text == "What color was the gate in the village house?"


def test_blocklist_rejects_diagnostic_vocabulary():
    """Verify that diagnostic or clinical vocabulary triggers retry and is rejected."""
    mem = {
        "id": "mem-03",
        "patient_id": "patient-1",
        "caption": "Ancestral temple visit",
        "is_approved": True,
    }

    # LLM attempts to generate text with banned diagnostic terms
    def mock_diagnostic_llm(m, attempt=1):
        if attempt == 1:
            return json.dumps({
                "question_text": "Did your dementia symptoms start at this temple?",
                "options": [{"id": "1", "text": "Yes", "is_correct": True}],
                "difficulty": 0.0,
            })
        else:
            return json.dumps({
                "question_text": "What severe Alzheimer stage was diagnosed here?",
                "options": [{"id": "1", "text": "Stage 2", "is_correct": True}],
                "difficulty": 0.0,
            })

    # Both attempts contain banned terms ("dementia", "severe", "alzheimer", "stage")
    item = generate_quiz_item_from_memory("patient-1", mem, llm_callable=mock_diagnostic_llm)
    assert item is None  # Blocked and skipped


def test_cosine_similarity_computation():
    """Verify cosine similarity calculation for vector embeddings."""
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    v3 = [0.0, 1.0, 0.0]

    assert cosine_similarity(v1, v2) == pytest.approx(1.0, abs=1e-5)
    assert cosine_similarity(v1, v3) == pytest.approx(0.0, abs=1e-5)
    assert cosine_similarity([], []) == 0.0
