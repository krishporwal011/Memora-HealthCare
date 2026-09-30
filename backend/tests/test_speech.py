import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.speech import (
    get_language_coverage,
    transcribe_audio_stream,
    synthesize_speech_stream,
    SUPPORTED_BHASHINI_LANGUAGES,
    REGIONAL_FALLBACK_LANGUAGES,
)

client = TestClient(app)

def test_language_coverage_endpoint():
    resp = client.get("/v1/speech/languages")
    assert resp.status_code == 200
    data = resp.json()
    
    assert "bhashini_supported" in data
    assert "as" in data["bhashini_supported"]
    assert "bn" in data["bhashini_supported"]
    assert "brx" in data["bhashini_supported"]
    assert "mni" in data["bhashini_supported"]
    assert "hi" in data["bhashini_supported"]
    
    assert "regional_fallbacks" in data
    assert "kha" in data["regional_fallbacks"]
    assert "grx" in data["regional_fallbacks"]
    assert "lus" in data["regional_fallbacks"]
    
    assert len(data["fallback_order"]) == 3
    assert "Bhashini" in data["fallback_order"][0]
    assert "Pre-recorded" in data["fallback_order"][1]
    assert "Visual Text" in data["fallback_order"][2]

def test_transcribe_rejects_always_on_listening():
    # Attempting to transcribe without explicit user tap must raise an error
    headers = {"Authorization": "Bearer dummy-user"}
    payload = {
        "audio_base64": "UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
        "language": "as",
        "is_explicit_tap": False,
    }
    resp = client.post("/v1/speech/transcribe", json=payload, headers=headers)
    assert resp.status_code == 400
    assert "strictly forbids always-on listening" in resp.json()["detail"]

def test_transcribe_with_explicit_tap_discards_raw_audio():
    headers = {"Authorization": "Bearer dummy-user"}
    payload = {
        "audio_base64": "UklGRi4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=",
        "language": "as",
        "is_explicit_tap": True,
    }
    resp = client.post("/v1/speech/transcribe", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["language"] == "as"
    assert data["raw_audio_discarded"] is True
    assert len(data["transcript"]) > 0

def test_synthesize_tier_fallback_hierarchy():
    headers = {"Authorization": "Bearer dummy-user"}
    
    # Tier 2: With prompt_id -> Pre-recorded regional audio
    payload_prerecorded = {
        "text": "আজি হ'ল সোমবাৰ",
        "language": "as",
        "prompt_id": "today_monday",
    }
    resp2 = client.post("/v1/speech/synthesize", json=payload_prerecorded, headers=headers)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["fallback_tier"] == 2
    assert data2["audio_url"] == "/audio/prompts/as/today_monday.mp3"
    assert data2["visual_text"] == "আজি হ'ল সোমবাৰ"

    # Regional language without cloud TTS (Khasi) -> Tier 2 audio fallback
    payload_khasi = {
        "text": "Khasi prompt",
        "language": "kha",
    }
    resp_kha = client.post("/v1/speech/synthesize", json=payload_khasi, headers=headers)
    assert resp_kha.status_code == 200
    assert resp_kha.json()["fallback_tier"] == 2
    assert resp_kha.json()["audio_url"] == "/audio/prompts/kha/default_prompt.mp3"

    # Visual text fallback (Tier 3)
    res_tier3 = synthesize_speech_stream(text="Fallback visual prompt", language="unknown_lang")
    assert res_tier3.fallback_tier == 3
    assert res_tier3.visual_text == "Fallback visual prompt"
    assert res_tier3.audio_content is None
    assert res_tier3.audio_url is None
