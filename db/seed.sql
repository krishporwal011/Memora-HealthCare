-- ============================================================================
-- MEMORA SYNTHETIC DEMO SEED DATA (SIH26003)
-- Strict Invariants:
-- 1. ALL records explicitly labelled '(SYNTHETIC DEMO)'.
-- 2. Contains NO real patient names, contact numbers, or real clinical data.
-- 3. Idempotent: ON CONFLICT (id) DO NOTHING ensures safe re-execution.
-- ============================================================================

-- 1. Profiles (ASHA & Caregivers)
INSERT INTO profiles (id, email, full_name, role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'anamika.asha@phc-tezpur.ner.gov.in', 'Anamika Bora (SYNTHETIC DEMO ASHA)', 'asha'),
    ('00000000-0000-0000-0000-000000000002', 'jonali.caregiver@memora.test', 'Jonali Baruah (SYNTHETIC DEMO Caregiver)', 'caregiver'),
    ('00000000-0000-0000-0000-000000000003', 'bipul.caregiver@memora.test', 'Bipul Saikia (SYNTHETIC DEMO Caregiver)', 'caregiver'),
    ('00000000-0000-0000-0000-000000000004', 'pranab.caregiver@memora.test', 'Pranab Das (SYNTHETIC DEMO Caregiver)', 'caregiver')
ON CONFLICT (id) DO NOTHING;

-- 2. Patients (All labelled SYNTHETIC DEMO)
INSERT INTO patients (id, full_name, preferred_language, current_theta) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Bhaben Baruah (SYNTHETIC DEMO)', 'as', 0.0),
    ('10000000-0000-0000-0000-000000000002', 'Hemoprabha Saikia (SYNTHETIC DEMO)', 'as', 0.0),
    ('10000000-0000-0000-0000-000000000003', 'Dharanidhar Das (SYNTHETIC DEMO)', 'as', 0.0)
ON CONFLICT (id) DO NOTHING;

-- 3. Patient Memberships (RLS Access Control)
INSERT INTO patient_members (id, patient_id, user_id, role) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'primary_caregiver'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'asha'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'primary_caregiver'),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'asha'),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'primary_caregiver'),
    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'asha')
ON CONFLICT (id) DO NOTHING;

-- 4. DPDP Act 2023 Guardian Consents
INSERT INTO consents (id, patient_id, granted_by_user_id, guardian_name, guardian_relationship, consent_version, is_active, guardian_note) VALUES
    ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Jonali Baruah (SYNTHETIC DEMO)', 'Daughter', '2026.1', true, 'Guardian consent verified for reminiscence and monitoring activities.'),
    ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Bipul Saikia (SYNTHETIC DEMO)', 'Son', '2026.1', true, 'Guardian consent verified under DPDP Act 2023.'),
    ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Pranab Das (SYNTHETIC DEMO)', 'Son', '2026.1', true, 'Guardian consent verified under DPDP Act 2023.')
ON CONFLICT (id) DO NOTHING;

-- 5. Approved Memories Bank
INSERT INTO memories (id, patient_id, created_by_user_id, memory_type, caption, people, year, storage_bucket, storage_path, signed_url, is_approved) VALUES
    ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'photo', 'Rongali Bihu family celebration in courtyard (SYNTHETIC DEMO)', ARRAY['Grandmother', 'Family'], 1985, 'memora-private-memories', '10000000-0000-0000-0000-000000000001/photos/bihu_1985.jpg', 'https://supabase.co/storage/v1/object/sign/memora-private-memories/bihu_1985.jpg?token=synthetic', true),
    ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'photo', 'Harvest celebration in ancestral village (SYNTHETIC DEMO)', ARRAY['Family'], 1978, 'memora-private-memories', '10000000-0000-0000-0000-000000000002/photos/harvest_1978.jpg', 'https://supabase.co/storage/v1/object/sign/memora-private-memories/harvest_1978.jpg?token=synthetic', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Approved AI Quiz Questions
INSERT INTO quiz_items (id, patient_id, memory_id, question_text, options, difficulty, domain, approval_status, is_approved) VALUES
    ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Who is receiving the phulam gamosa in the family photograph? (SYNTHETIC DEMO)', '[{"id": "o1", "text": "Grandmother (SYNTHETIC)", "is_correct": true}, {"id": "o2", "text": "Uncle (SYNTHETIC)", "is_correct": false}]'::jsonb, 0.0, 'reminiscence_photo', 'approved', true)
ON CONFLICT (id) DO NOTHING;
