"""
Memora AI Quiz Generation Service (B14).
Generates personalized reminiscence quiz items from patient's own approved memories.

Requirements & Safety Invariants:
- Vector search with patient-scoped filtering (never retrieve another patient's data)
- Only approved memories (is_approved=True) can be selected
- JSON schema validation via Pydantic
- Blocklist and non-diagnostic vocabulary validation (no "Alzheimer", "dementia", "stage", etc.)
- Exactly one retry on JSON parse or blocklist failure before skipping
"""

import json
import math
import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ValidationError
from app.database import db
from app.services.anomaly import is_safe_message, BANNED_WORDS


class QuizOption(BaseModel):
    id: str
    text: str
    is_correct: bool


class GeneratedQuizItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    patient_id: str
    memory_id: str
    question_text: str
    options: List[QuizOption]
    difficulty: float = Field(default=0.0, ge=-4.0, le=4.0)
    domain: str = "reminiscence"
    image_url: Optional[str] = None
    approval_status: str = "pending"


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Compute cosine similarity between two numeric vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0

    return dot_product / (norm_a * norm_b)


def retrieve_patient_memories(
    patient_id: str,
    query_embedding: Optional[List[float]] = None,
    top_k: int = 3,
    only_approved: bool = True,
) -> List[Dict[str, Any]]:
    """
    Retrieve candidate memories strictly scoped to the given patient_id.
    Safety: Under NO circumstances can another patient's memories be retrieved.
    """
    candidates = []

    for mem in db.memories.values():
        # Hard patient isolation check
        if mem.get("patient_id") != patient_id:
            continue

        # Approval check: Only approved memories may be used to generate quizzes
        if only_approved and not mem.get("is_approved", False):
            continue

        score = 0.0
        embedding_id = mem.get("embedding_id")
        if query_embedding and embedding_id and embedding_id in db.embeddings:
            mem_vec = db.embeddings[embedding_id]
            score = cosine_similarity(query_embedding, mem_vec)

        candidates.append((score, mem))

    # Sort descending by vector similarity score
    candidates.sort(key=lambda x: x[0], reverse=True)
    return [c[1] for c in candidates[:top_k]]


def _mock_llm_generate(memory: Dict[str, Any], attempt: int = 1) -> str:
    """
    Simulate LLM JSON completion based on memory caption and metadata.
    In testing, attempt=1 can be configured or mocked to simulate failure/retry.
    """
    caption = memory.get("caption", "Family gathering")
    year = memory.get("year", 1985)
    people = memory.get("people", ["Family"])
    primary_person = people[0] if people else "family members"

    # Default valid completion
    return json.dumps({
        "question_text": f"Who was with you during the {caption}?",
        "options": [
            {"id": "opt-1", "text": primary_person, "is_correct": True},
            {"id": "opt-2", "text": "A school teacher", "is_correct": False},
            {"id": "opt-3", "text": "Postman from town", "is_correct": False},
        ],
        "difficulty": -0.2,
    })


def validate_and_parse_quiz_json(
    raw_json_str: str,
    patient_id: str,
    memory_id: str,
    image_url: Optional[str] = None,
) -> Optional[GeneratedQuizItem]:
    """
    Validates JSON structure, Pydantic schema, and blocklist rules.
    Returns GeneratedQuizItem if valid, None otherwise.
    """
    try:
        data = json.loads(raw_json_str)
    except (json.JSONDecodeError, TypeError):
        return None

    if not isinstance(data, dict):
        return None

    question_text = data.get("question_text", "")
    options_data = data.get("options", [])

    # 1. Blocklist & Non-diagnostic Safety Validation
    if not is_safe_message(question_text):
        return None

    if not options_data or not isinstance(options_data, list) or len(options_data) < 2:
        return None

    has_correct = False
    for opt in options_data:
        if not isinstance(opt, dict):
            return None
        opt_text = opt.get("text", "")
        if not is_safe_message(opt_text):
            return None
        if opt.get("is_correct") is True:
            has_correct = True

    if not has_correct:
        return None

    # 2. Pydantic Schema Validation
    try:
        parsed_options = [QuizOption(**opt) for opt in options_data]
        item = GeneratedQuizItem(
            patient_id=patient_id,
            memory_id=memory_id,
            question_text=question_text,
            options=parsed_options,
            difficulty=float(data.get("difficulty", 0.0)),
            image_url=image_url,
        )
        return item
    except (ValidationError, ValueError):
        return None


def generate_quiz_item_from_memory(
    patient_id: str,
    memory: Dict[str, Any],
    llm_callable=None,
) -> Optional[GeneratedQuizItem]:
    """
    Generate a personalized quiz item from a memory with exactly ONE retry on failure.
    """
    # Hard patient ownership guard
    if memory.get("patient_id") != patient_id:
        return None

    generate_fn = llm_callable or _mock_llm_generate
    image_url = memory.get("signed_url")

    # Attempt 1
    raw_output_1 = generate_fn(memory, attempt=1)
    item = validate_and_parse_quiz_json(raw_output_1, patient_id, memory["id"], image_url)
    if item is not None:
        return item

    # Attempt 2 (One retry)
    raw_output_2 = generate_fn(memory, attempt=2)
    item_retry = validate_and_parse_quiz_json(raw_output_2, patient_id, memory["id"], image_url)
    if item_retry is not None:
        return item_retry

    # Both attempts failed -> skip item
    return None


def generate_quiz_for_patient(
    patient_id: str,
    query_embedding: Optional[List[float]] = None,
    top_k: int = 1,
    llm_callable=None,
) -> List[GeneratedQuizItem]:
    """
    Top-level quiz generation pipeline:
    1. Retrieve approved memories strictly for patient_id
    2. Generate quiz item with validation and 1-retry fallback
    3. Return validated items
    """
    memories = retrieve_patient_memories(
        patient_id=patient_id,
        query_embedding=query_embedding,
        top_k=top_k,
        only_approved=True,
    )

    items: List[GeneratedQuizItem] = []
    for mem in memories:
        quiz_item = generate_quiz_item_from_memory(
            patient_id=patient_id,
            memory=mem,
            llm_callable=llm_callable,
        )
        if quiz_item:
            items.append(quiz_item)

    return items
