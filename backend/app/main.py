from fastapi import FastAPI, Depends, status, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.auth import get_current_user, AuthUser
from app.database import db
from app.services.pdf_generator import generate_asha_pdf_report
from app.services.speech import (
    TranscribeRequest,
    TranscribeResponse,
    SynthesizeRequest,
    SynthesizeResponse,
    LanguageCoverageResponse,
    transcribe_audio_stream,
    synthesize_speech_stream,
    get_language_coverage,
)

app = FastAPI(
    title="Memora Backend API",
    version="1.0.0",
    description="Offline-first, consent-gated cognitive platform API for SIH26003."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request/Response Models matching api/openapi.yaml
class PatientCreate(BaseModel):
    full_name: str
    preferred_language: str = "as"
    initial_theta: float = 0.0

class ConsentCreate(BaseModel):
    patient_id: str
    guardian_name: str
    guardian_relationship: str
    consent_version: str
    guardian_note: Optional[str] = None
    capacity_assessed: bool = True
    capacity_notes: Optional[str] = None

class OnboardingRequest(BaseModel):
    full_name: str
    preferred_language: str = "as"
    initial_theta: float = 0.0
    lacks_capacity: bool = True
    capacity_notes: Optional[str] = None
    guardian_name: str
    guardian_relationship: str
    guardian_note: Optional[str] = None
    consent_version: str = "2026.1"

class GameEventInput(BaseModel):
    id: str  # Client-generated UUIDv7
    patient_id: str
    session_id: str
    domain: str
    item_id: str
    difficulty: float
    correct: bool
    response_time_ms: int
    timestamp: str

class BatchEventsRequest(BaseModel):
    patient_id: str
    events: List[GameEventInput] = Field(..., max_length=200)

class AbilityScore(BaseModel):
    id: str
    patient_id: str
    domain: str
    theta: float
    recorded_at: str

class MemoryCreate(BaseModel):
    memory_type: str  # photo | song | story
    caption: str
    people: Optional[List[str]] = []
    year: Optional[int] = None
    file_path: Optional[str] = None

class Memory(BaseModel):
    id: str
    patient_id: str
    created_by_user_id: str
    memory_type: str
    caption: str
    people: List[str]
    year: Optional[int]
    storage_bucket: str
    storage_path: str
    signed_url: str
    embedding_id: Optional[str] = None
    is_approved: bool
    created_at: str

class QuizOptionModel(BaseModel):
    id: str
    text: str
    is_correct: bool

class GeneratedQuizItemModel(BaseModel):
    id: str
    patient_id: str
    memory_id: str
    question_text: str
    options: List[QuizOptionModel]
    difficulty: float = 0.0
    domain: str = "reminiscence"
    image_url: Optional[str] = None
    approval_status: str = "pending"
    is_approved: bool = False
    reviewed_by_user_id: Optional[str] = None
    reviewed_at: Optional[str] = None
    created_at: Optional[str] = None

class AshaPatientSummaryModel(BaseModel):
    id: str
    full_name: str
    status: str
    status_label: str
    triage_priority: int
    last_active: str
    sessions_this_week: int
    average_score: float
    active_alert_domain: Optional[str] = None
    unwell_today: bool = False
    is_synthetic: bool = True

class AshaPatientDetailModel(BaseModel):
    id: str
    full_name: str
    preferred_language: str
    status: str
    status_label: str
    triage_priority: int
    unwell_today: bool = False
    is_synthetic: bool = True
    guardian_name: str
    guardian_relationship: str
    current_theta: float
    recent_domains: List[Dict[str, Any]]
    active_alerts: List[Dict[str, Any]]
    created_at: str

@app.get("/v1/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

@app.post("/v1/onboarding", status_code=status.HTTP_201_CREATED)
def onboard_patient(body: OnboardingRequest, user: AuthUser = Depends(get_current_user)):
    return db.onboard_patient(user_id=user.user_id, data=body.model_dump())

@app.get("/v1/patients")
def list_patients(user: AuthUser = Depends(get_current_user)):
    return db.list_patients_for_user(user.user_id)

@app.post("/v1/patients", status_code=status.HTTP_201_CREATED)
def create_patient(body: PatientCreate, user: AuthUser = Depends(get_current_user)):
    return db.create_patient(
        user_id=user.user_id,
        full_name=body.full_name,
        preferred_language=body.preferred_language,
        initial_theta=body.initial_theta,
    )

@app.get("/v1/patients/{patient_id}")
def get_patient(patient_id: str, user: AuthUser = Depends(get_current_user)):
    return db.get_patient(patient_id, user.user_id)

@app.get("/v1/patients/{patient_id}/ability", response_model=List[AbilityScore])
def get_patient_ability(patient_id: str, user: AuthUser = Depends(get_current_user)):
    return db.get_patient_ability_history(patient_id=patient_id, user_id=user.user_id)

@app.post("/v1/consents", status_code=status.HTTP_201_CREATED)
def record_consent(body: ConsentCreate, user: AuthUser = Depends(get_current_user)):
    return db.record_consent(
        user_id=user.user_id,
        patient_id=body.patient_id,
        guardian_name=body.guardian_name,
        guardian_relationship=body.guardian_relationship,
        consent_version=body.consent_version,
        guardian_note=body.guardian_note,
        capacity_assessed=body.capacity_assessed,
        capacity_notes=body.capacity_notes,
    )

@app.get("/v1/consents/{patient_id}")
def get_consent(patient_id: str, user: AuthUser = Depends(get_current_user)):
    consent = db.get_patient_consent(patient_id=patient_id, user_id=user.user_id)
    if not consent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active consent found")
    return consent

@app.post("/v1/events:batch")
def ingest_events_batch(body: BatchEventsRequest, user: AuthUser = Depends(get_current_user)):
    return db.ingest_batch_events(
        user_id=user.user_id,
        patient_id=body.patient_id,
        events=[ev.model_dump() for ev in body.events],
    )

@app.get("/v1/patients/{patient_id}/memories", response_model=List[Memory])
def list_patient_memories(
    patient_id: str,
    type: Optional[str] = None,
    user: AuthUser = Depends(get_current_user),
):
    return db.list_memories(user_id=user.user_id, patient_id=patient_id, memory_type=type)

@app.post("/v1/patients/{patient_id}/memories", response_model=Memory, status_code=status.HTTP_201_CREATED)
def create_patient_memory(
    patient_id: str,
    body: MemoryCreate,
    user: AuthUser = Depends(get_current_user),
):
    return db.create_memory(
        user_id=user.user_id,
        patient_id=patient_id,
        memory_type=body.memory_type,
        caption=body.caption,
        people=body.people,
        year=body.year,
        file_path=body.file_path,
    )

@app.get("/v1/memories/{memory_id}", response_model=Memory)
def get_memory_details(
    memory_id: str,
    user: AuthUser = Depends(get_current_user),
):
    return db.get_memory(memory_id=memory_id, user_id=user.user_id)

@app.delete("/v1/memories/{memory_id}")
def delete_memory(
    memory_id: str,
    user: AuthUser = Depends(get_current_user),
):
    return db.delete_memory(memory_id=memory_id, user_id=user.user_id)

@app.get("/v1/patients/{patient_id}/approval-queue", response_model=List[GeneratedQuizItemModel])
def get_approval_queue(
    patient_id: str,
    user: AuthUser = Depends(get_current_user),
):
    return db.get_approval_queue(patient_id=patient_id, user_id=user.user_id)

@app.post("/v1/quiz-items/{item_id}/approve", response_model=GeneratedQuizItemModel)
def approve_quiz_item(
    item_id: str,
    user: AuthUser = Depends(get_current_user),
):
    return db.approve_quiz_item(item_id=item_id, user_id=user.user_id)

@app.post("/v1/quiz-items/{item_id}/reject", response_model=GeneratedQuizItemModel)
def reject_quiz_item(
    item_id: str,
    user: AuthUser = Depends(get_current_user),
):
    return db.reject_quiz_item(item_id=item_id, user_id=user.user_id)

@app.get("/v1/patients/{patient_id}/quiz-items", response_model=List[GeneratedQuizItemModel])
def list_patient_quiz_items(
    patient_id: str,
    user: AuthUser = Depends(get_current_user),
):
    return db.list_approved_quiz_items_for_patient(patient_id=patient_id, user_id=user.user_id)

@app.get("/v1/asha/patients", response_model=List[AshaPatientSummaryModel])
def list_asha_assigned_patients(user: AuthUser = Depends(get_current_user)):
    return db.list_asha_patients(asha_user_id=user.user_id)

@app.get("/v1/asha/patients/{patient_id}", response_model=AshaPatientDetailModel)
def get_asha_assigned_patient(patient_id: str, user: AuthUser = Depends(get_current_user)):
    return db.get_asha_patient_detail(patient_id=patient_id, asha_user_id=user.user_id)

@app.get("/v1/asha/patients/{patient_id}/report.pdf")
def export_asha_patient_pdf_report(patient_id: str, user: AuthUser = Depends(get_current_user)):
    detail = db.get_asha_patient_detail(patient_id=patient_id, asha_user_id=user.user_id)
    pdf_bytes = generate_asha_pdf_report(detail)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=memora-report-{patient_id[:8]}.pdf",
        },
    )

@app.get("/v1/speech/languages", response_model=LanguageCoverageResponse)
def get_speech_coverage_info():
    return get_language_coverage()

@app.post("/v1/speech/transcribe", response_model=TranscribeResponse)
def transcribe_speech(body: TranscribeRequest, user: AuthUser = Depends(get_current_user)):
    try:
        return transcribe_audio_stream(
            audio_base64=body.audio_base64,
            language=body.language,
            is_explicit_tap=body.is_explicit_tap,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@app.post("/v1/speech/synthesize", response_model=SynthesizeResponse)
def synthesize_speech(body: SynthesizeRequest, user: AuthUser = Depends(get_current_user)):
    return synthesize_speech_stream(
        text=body.text,
        language=body.language,
        prompt_id=body.prompt_id,
    )


