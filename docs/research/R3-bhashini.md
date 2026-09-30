# R3: Bhashini and language coverage
Date: 2026-10-01 | Run with: Deep research / Web search | Question: Bhashini services (ASR, TTS, translation) for NER languages, pipeline call shape, licensing, and fallback hierarchy.

## Findings
| Claim | Source URL | Source date | Confidence (high/med/low) |
|---|---|---|---|
| Bhashini Compute API supports Assamese, Bengali, Bodo, Manipuri (Meitei) for ASR and TTS | https://bhashini.ai/ | 2026-09-30 | high |
| ASR uses AI4Bharat Conformer Multilingual ASR models | https://bhashini.gitbook.io/ | 2026-09-25 | high |
| Compute API payload executes ASR and TTS via single pipeline call specifying taskType and serviceId | https://bhashini.gitbook.io/ | 2026-09-25 | high |
| Khasi, Garo, and Mizo have limited/unverified ASR coverage on public endpoints | https://bhashini.gov.in/ulca/model/explore-models | 2026-09-28 | medium |
| Student teams can obtain API key via Bhashini portal registration for hackathons | https://bhashini.gov.in/ | 2026-09-20 | high |
| Fallback hierarchy: Bhashini cloud API -> Pre-recorded regional audio clips -> Visual text/icon fallback | Project Architecture | 2026-10-01 | high |

## Conflicts between sources
- Coverage depth varies between scheduled Indian languages (Assamese, Bengali, Bodo, Manipuri) and non-scheduled tribal languages of NER (Khasi, Garo, Mizo). 
- Scheduled languages have working ASR/TTS on Bhashini; non-scheduled languages must use pre-recorded audio prompts and icon fallbacks.

## What changes in Memora (file + section)
- `backend/app/services/speech.py`: Implement Bhashini client proxy with pipeline shape `{pipelineTasks: [{taskType: "asr", config: {language: {sourceLanguage: lang}}}]}`.
- `frontend/src/lib/speech.ts`: Multi-tier fallback handling (Bhashini -> Pre-recorded Audio -> Visual icons).
- Mic interaction: strictly on-demand explicit tap; audio stream transcribed then immediately deleted; zero raw audio persisted to disk or Supabase.

## Suggested DECISION ROW (date | decision | why)
| 2026-10-01 | Prioritize Assamese, Bengali, Hindi, Bodo, Manipuri on Bhashini; pre-recorded audio for Khasi/Garo | Aligns with verified Bhashini model coverage across NER |

## Open questions
- Student hackathon API quota limits during live finale demonstration.

## VERIFY-BY-HUMAN (lawyer / clinician / native speaker / organiser)
- Native speakers to review Assamese and Meitei TTS pronunciation and pre-recorded prompts.
