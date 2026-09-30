from fastapi import FastAPI, Depends, status
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

@app.get("/v1/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

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

@app.post("/v1/consents", status_code=status.HTTP_201_CREATED)
def record_consent(body: ConsentCreate, user: AuthUser = Depends(get_current_user)):
    return db.record_consent(
        user_id=user.user_id,
        patient_id=body.patient_id,
        guardian_name=body.guardian_name,
        guardian_relationship=body.guardian_relationship,
        consent_version=body.consent_version,
    )

@app.post("/v1/events:batch")
def ingest_events_batch(body: BatchEventsRequest, user: AuthUser = Depends(get_current_user)):
    return db.ingest_batch_events(
        user_id=user.user_id,
        patient_id=body.patient_id,
        events=[ev.model_dump() for ev in body.events],
    )
