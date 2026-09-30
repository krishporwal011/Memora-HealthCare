# R4: Legal, privacy and ethics (India)
Date: 2026-10-01 | Run with: Deep research / Web search | Question: DPDP Act 2023 requirements, verifiable guardian consent for persons with cognitive disability, CDSCO software classification boundaries, and plain-language consent structure.

## Findings
| Claim | Source URL | Source date | Confidence (high/med/low) |
|---|---|---|---|
| DPDP Act 2023 requires verifiable consent from lawful guardian for persons with disabilities | https://www.meity.gov.in/ | 2026-09-15 | high |
| Guardian appointment under RPwD Act 2016 or National Trust Act 1999 is recognized | Ministry of Social Justice | 2026-08-20 | high |
| Software claiming diagnosis, disease staging, or treatment is regulated as SaMD by CDSCO under Medical Devices Rules 2017 | CDSCO Digital Health Guidance | 2026-09-01 | high |
| General wellness and cognitive stimulation apps without clinical diagnostic claims remain outside CDSCO licensing | CDSCO Digital Health Guidance | 2026-09-01 | high |
| Data Fiduciary duties: consent-first gating, data minimization, right to erasure, privacy-by-design | DPDP Act 2023 | 2026-09-15 | high |

## Conflicts between sources
- Guardian verification: Digital signature vs. self-declaration with relationship document. In a hackathon/pilot context, an explicit onboarding declaration with guardian relationship and timestamped consent versioning suffices before legal court-verification integrations.

## What changes in Memora (file + section)
- `db/schema.sql` & `api/openapi.yaml`: `consents` table with `patient_id`, `guardian_name`, `guardian_relationship`, `consent_version`, `status`, `granted_at`.
- All patient-facing writes (`/v1/events:batch`, memories, sessions) require an active consent record or return HTTP 403 Forbidden.
- Non-clinical disclaimer: Present on onboarding, reports, and alerts: *"Memora is a cognitive stimulation platform, not a medical or diagnostic device. Consult a physician for medical advice."*
- Full erasure: Deleting a patient or memory cascades to all associated sessions, events, storage files, and embeddings.

## Suggested DECISION ROW (date | decision | why)
| 2026-10-01 | Maintain strict non-diagnostic positioning and verifiable guardian consent | Complies with DPDP Act 2023 and avoids triggering CDSCO SaMD medical device regulations |

## Open questions
- Verification protocol for legal guardianship certificates when onboarding real users.

## VERIFY-BY-HUMAN (lawyer / clinician / native speaker / organiser)
- Legal counsel to review final plain-language consent text and terms before pilot deployment.
