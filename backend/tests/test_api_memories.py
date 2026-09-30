import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_database():
    """Reset repository before each test."""
    db.profiles.clear()
    db.patients.clear()
    db.patient_members.clear()
    db.consents.clear()
    db.game_events.clear()
    db.ability_scores.clear()
    db.memories.clear()
    db.embeddings.clear()
    db.storage_files.clear()


def test_create_memory_stores_private_asset_signed_url_and_embedding():
    """Verify memory upload generates signed URL, stores in private bucket, and generates vector embedding."""
    # 1. Onboard patient with consent
    res_onboard = client.post(
        "/v1/onboarding",
        json={
            "full_name": "Bhaben Baruah",
            "preferred_language": "as",
            "lacks_capacity": True,
            "guardian_name": "Jonali Baruah",
            "guardian_relationship": "Daughter",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_onboard.status_code == 201
    patient_id = res_onboard.json()["patient"]["id"]

    # 2. Upload a photo memory
    memory_payload = {
        "memory_type": "photo",
        "caption": "Rongali Bihu festival at ancestral home in Tezpur",
        "people": ["Grandmother", "Ranjit", "Jonali"],
        "year": 1985,
        "file_path": f"{patient_id}/photos/bihu_1985.jpg",
    }
    res_mem = client.post(
        f"/v1/patients/{patient_id}/memories",
        json=memory_payload,
        headers={"Authorization": "Bearer caregiver-jonali"},
    )
    assert res_mem.status_code == 201
    mem_data = res_mem.json()

    # Bucket must be private
    assert mem_data["storage_bucket"] == "memora-private-memories"
    assert mem_data["storage_path"] == f"{patient_id}/photos/bihu_1985.jpg"

    # Signed URL must be provided for secure private media streaming
    assert "signed_url" in mem_data
    assert "token=signed-" in mem_data["signed_url"]

    # Storage file and embedding must be registered in backend state
    assert mem_data["storage_path"] in db.storage_files
    embedding_id = mem_data["embedding_id"]
    assert embedding_id in db.embeddings
    assert len(db.embeddings[embedding_id]) == 384


def test_rls_isolation_only_authorized_members_can_read_memories():
    """Verify Row Level Security: User B cannot read Patient A's private memories."""
    # 1. Caregiver A onboards Patient A and adds a memory
    res_onboard = client.post(
        "/v1/onboarding",
        json={
            "full_name": "Patient Alpha",
            "preferred_language": "as",
            "lacks_capacity": True,
            "guardian_name": "Caregiver A",
            "guardian_relationship": "Son",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )
    patient_id = res_onboard.json()["patient"]["id"]

    res_mem = client.post(
        f"/v1/patients/{patient_id}/memories",
        json={"memory_type": "song", "caption": "Old Bihu Folk Melody", "year": 1978},
        headers={"Authorization": "Bearer caregiver-a"},
    )
    memory_id = res_mem.json()["id"]

    # 2. Caregiver A can list and retrieve the memory
    res_list_a = client.get(
        f"/v1/patients/{patient_id}/memories",
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_list_a.status_code == 200
    assert len(res_list_a.json()) == 1

    res_get_a = client.get(
        f"/v1/memories/{memory_id}",
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_get_a.status_code == 200
    assert res_get_a.json()["caption"] == "Old Bihu Folk Melody"

    # 3. Caregiver B attempts to list memories -> 403 Forbidden!
    res_list_b = client.get(
        f"/v1/patients/{patient_id}/memories",
        headers={"Authorization": "Bearer caregiver-b"},
    )
    assert res_list_b.status_code == 403
    assert "Not authorized" in res_list_b.json()["detail"]

    # 4. Caregiver B attempts to retrieve single memory -> 403 Forbidden!
    res_get_b = client.get(
        f"/v1/memories/{memory_id}",
        headers={"Authorization": "Bearer caregiver-b"},
    )
    assert res_get_b.status_code == 403
    assert "Not authorized" in res_get_b.json()["detail"]


def test_delete_memory_removes_file_and_embedding():
    """Verify that deleting a memory cascades to delete private storage asset and vector embedding."""
    # 1. Onboard patient and add memory
    res_onboard = client.post(
        "/v1/onboarding",
        json={
            "full_name": "Patient Delta",
            "preferred_language": "hi",
            "lacks_capacity": True,
            "guardian_name": "Caregiver A",
            "guardian_relationship": "Daughter",
            "consent_version": "2026.1",
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )
    patient_id = res_onboard.json()["patient"]["id"]

    res_mem = client.post(
        f"/v1/patients/{patient_id}/memories",
        json={
            "memory_type": "story",
            "caption": "School teacher memories in Jorhat",
            "year": 1965,
        },
        headers={"Authorization": "Bearer caregiver-a"},
    )
    mem_data = res_mem.json()
    memory_id = mem_data["id"]
    storage_path = mem_data["storage_path"]
    embedding_id = mem_data["embedding_id"]

    # Confirm created in state
    assert storage_path in db.storage_files
    assert embedding_id in db.embeddings
    assert memory_id in db.memories

    # 2. Delete memory
    res_del = client.delete(
        f"/v1/memories/{memory_id}",
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_del.status_code == 200
    del_data = res_del.json()
    assert del_data["file_deleted"] is True
    assert del_data["embedding_deleted"] is True

    # 3. Confirm full cascading erasure: memory, file, and embedding are gone
    assert memory_id not in db.memories
    assert storage_path not in db.storage_files
    assert embedding_id not in db.embeddings

    # Subsequent GET returns 404 Not Found
    res_get_deleted = client.get(
        f"/v1/memories/{memory_id}",
        headers={"Authorization": "Bearer caregiver-a"},
    )
    assert res_get_deleted.status_code == 404
