-- Memora PostgreSQL Schema + Row Level Security (RLS)
-- Smart India Hackathon 2026 (SIH26003)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. User Profiles linked to Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('caregiver', 'asha', 'admin')),
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    preferred_language TEXT NOT NULL DEFAULT 'as' CHECK (preferred_language IN ('en', 'hi', 'as', 'bn', 'mni', 'brx')),
    initial_theta DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    current_theta DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Patient Memberships (Caregivers & ASHA workers assigned to patients)
CREATE TABLE IF NOT EXISTS patient_members (
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('caregiver', 'primary_caregiver', 'asha')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (patient_id, user_id)
);

-- 4. Verifiable Consents (DPDP Act 2023 Alignment)
-- No patient game activity or memory may be stored without an active consent row
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    granted_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    guardian_name TEXT NOT NULL,
    guardian_relationship TEXT NOT NULL,
    guardian_note TEXT,
    capacity_assessed BOOLEAN NOT NULL DEFAULT TRUE,
    capacity_notes TEXT,
    consent_version TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Game Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, -- Client-generated UUIDv7
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    total_items INT NOT NULL DEFAULT 0,
    terminated_reason TEXT CHECK (terminated_reason IN ('normal', 'consecutive_errors', 'time_limit')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Game Activity Events (Offline-First Queue Ingestion)
-- Primary key is client-generated UUIDv7 string.
-- Upserts use ON CONFLICT (id) DO NOTHING for idempotency.
CREATE TABLE IF NOT EXISTS game_events (
    id TEXT PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    item_id TEXT NOT NULL,
    difficulty DOUBLE PRECISION NOT NULL,
    correct BOOLEAN NOT NULL,
    response_time_ms INT NOT NULL,
    client_timestamp TIMESTAMPTZ NOT NULL,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Ability Scores Longitudinal History
CREATE TABLE IF NOT EXISTS ability_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    theta DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Private Memories (Photos, Songs, Stories with pgvector embeddings)
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('photo', 'song', 'story')),
    caption TEXT NOT NULL,
    people TEXT[] DEFAULT '{}',
    year INT,
    storage_bucket TEXT NOT NULL DEFAULT 'memora-private-memories',
    storage_path TEXT NOT NULL,
    embedding_id UUID,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_events_patient ON game_events(patient_id, client_timestamp);
CREATE INDEX IF NOT EXISTS idx_ability_scores_patient ON ability_scores(patient_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_consents_patient ON consents(patient_id, is_active);
CREATE INDEX IF NOT EXISTS idx_memories_patient ON memories(patient_id, memory_type);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ability_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_member(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM patient_members
        WHERE patient_id = p_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_consent(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM consents
        WHERE patient_id = p_id
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Patients Policies
CREATE POLICY "Members can view assigned patients"
    ON patients FOR SELECT
    USING (is_member(id));

-- Consents Policies
CREATE POLICY "Members can view patient consents"
    ON consents FOR SELECT
    USING (is_member(patient_id));

CREATE POLICY "Members can register patient consent"
    ON consents FOR INSERT
    WITH CHECK (is_member(patient_id));

-- Game Events Policies (Consent-Gated Writes)
CREATE POLICY "Members can view patient events"
    ON game_events FOR SELECT
    USING (is_member(patient_id));

CREATE POLICY "Members can insert events only with active consent"
    ON game_events FOR INSERT
    WITH CHECK (is_member(patient_id) AND has_consent(patient_id));

-- Ability Scores Policies
CREATE POLICY "Members can view patient ability scores"
    ON ability_scores FOR SELECT
    USING (is_member(patient_id));

-- Memories Policies (Private Bucket Access & Consent-Gated)
CREATE POLICY "Members can view patient memories with active consent"
    ON memories FOR SELECT
    USING (is_member(patient_id) AND has_consent(patient_id));

CREATE POLICY "Members can insert patient memories with active consent"
    ON memories FOR INSERT
    WITH CHECK (is_member(patient_id) AND has_consent(patient_id));

CREATE POLICY "Members can delete patient memories with active consent"
    ON memories FOR DELETE
    USING (is_member(patient_id) AND has_consent(patient_id));

-- 7. QUIZ ITEMS (AI Generated from Approved Memories & Approval Queue)
CREATE TABLE IF NOT EXISTS quiz_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    difficulty DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    domain TEXT NOT NULL DEFAULT 'reminiscence',
    image_url TEXT,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_by_user_id UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE quiz_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view patient quiz items with active consent"
    ON quiz_items FOR SELECT
    USING (is_member(patient_id) AND has_consent(patient_id));

CREATE POLICY "Members can update quiz item approval status"
    ON quiz_items FOR UPDATE
    USING (is_member(patient_id) AND has_consent(patient_id));

CREATE POLICY "Members can insert quiz items with active consent"
    ON quiz_items FOR INSERT
    WITH CHECK (is_member(patient_id) AND has_consent(patient_id));

