from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from app.auth import get_current_user, AuthUser
from app.database import db

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
