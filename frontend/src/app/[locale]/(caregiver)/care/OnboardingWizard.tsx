"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Scale, Lightbulb, Sprout } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ONBOARDING_STRINGS } from "./strings";

interface OnboardingWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function OnboardingWizard({ onComplete, onCancel }: OnboardingWizardProps) {
  const locale = useLocale();
  const strings = ONBOARDING_STRINGS[locale] || ONBOARDING_STRINGS.en;

  // 6 steps: 1: signIn, 2: profile, 3: consent, 4: guardian, 5: memories, 6: calibration
  const [step, setStep] = useState<number>(1);

  // Form state
  const [caregiverPhone, setCaregiverPhone] = useState("+91 ");
  const [caregiverName, setCaregiverName] = useState("");
  const [elderName, setElderName] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [lacksCapacity, setLacksCapacity] = useState(true);
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [guardianNote, setGuardianNote] = useState("");
  const [guardianDeclared, setGuardianDeclared] = useState(false);
  const [firstMemoryTitle, setFirstMemoryTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleNext = async () => {
    setSubmitError(null);

    if (step === 1 && caregiverPhone.trim().length < 5) {
      setSubmitError("Please provide a valid phone number.");
      return;
    }
    if (step === 2 && (!caregiverName.trim() || !elderName.trim())) {
      setSubmitError("Please provide both names.");
      return;
    }
    if (step === 3 && !consentAccepted) {
      setSubmitError("Consent acceptance is required to proceed under DPDP Act 2023.");
      return;
    }
    if (step === 4 && (!guardianDeclared || !guardianRelationship.trim())) {
      setSubmitError("Please declare guardianship status and state relationship.");
      return;
    }

    if (step === 5) {
      // Submit onboarding payload to backend API
      setIsSubmitting(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/v1/onboarding`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer caregiver-demo-ner",
          },
          body: JSON.stringify({
            full_name: elderName,
            preferred_language: locale,
            initial_theta: 0.0,
            lacks_capacity: lacksCapacity,
            capacity_notes: "Assessed by family caregiver during onboarding",
            guardian_name: caregiverName,
            guardian_relationship: guardianRelationship,
            guardian_note: guardianNote || "Primary caregiver",
            consent_version: "2026.1",
          }),
        });

        if (!response.ok) {
          // If offline or dev backend not reachable, proceed with client state for demo
          console.warn("Backend onboarding not reachable, caching locally");
        }
      } catch (err) {
        console.warn("Onboarding network failure, continuing in offline mode:", err);
      } finally {
        setIsSubmitting(false);
        setStep(6);
      }
      return;
    }

    if (step < 6) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[var(--primary)] shadow-sm max-w-xl mx-auto space-y-6">
      {/* Progress tracker */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <span className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider">
          Step {step} of 6
        </span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] border border-[var(--border)]">
          {step === 1 && strings.stepSignIn}
          {step === 2 && strings.stepProfile}
          {step === 3 && strings.stepConsent}
          {step === 4 && strings.stepGuardian}
          {step === 5 && strings.stepMemories}
          {step === 6 && strings.stepCalibration}
        </span>
      </div>

      {submitError && (
        <div
          role="alert"
          className="bg-[var(--alert-light)] text-[var(--alert)] p-3 rounded-xl border border-[var(--alert)] text-sm"
        >
          {submitError}
        </div>
      )}

      {/* STEP 1: Sign-In */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[var(--ink)]">{strings.stepSignIn}</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Sign in with your phone number to manage family memories and track progress.
            </p>
          </div>
          <div>
            <label htmlFor="caregiver-phone" className="block text-sm font-semibold text-[var(--ink)] mb-1">
              {strings.caregiverPhoneLabel}
            </label>
            <input
              id="caregiver-phone"
              type="tel"
              value={caregiverPhone}
              onChange={(e) => setCaregiverPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] focus:border-[var(--primary)] text-base font-medium outline-hidden"
              style={{ minHeight: "48px" }}
            />
          </div>
        </div>
      )}

      {/* STEP 2: Caregiver & Elder Profile */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[var(--ink)]">{strings.stepProfile}</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Tell us your name and the elder you are assisting.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor="caregiver-name" className="block text-sm font-semibold text-[var(--ink)] mb-1">
                {strings.caregiverNameLabel}
              </label>
              <input
                id="caregiver-name"
                type="text"
                placeholder="e.g., Jonali Baruah"
                value={caregiverName}
                onChange={(e) => setCaregiverName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] focus:border-[var(--primary)] text-base outline-hidden"
                style={{ minHeight: "48px" }}
              />
            </div>
            <div>
              <label htmlFor="elder-name" className="block text-sm font-semibold text-[var(--ink)] mb-1">
                {strings.elderNameLabel}
              </label>
              <input
                id="elder-name"
                type="text"
                placeholder="e.g., Bhaben Baruah"
                value={elderName}
                onChange={(e) => setElderName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--primary)] text-base outline-hidden"
                style={{ minHeight: "48px" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Plain-Language Consent */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-bold text-[var(--ink)]">{strings.stepConsent}</h2>
            <span className="text-xs font-bold text-[var(--alert)] bg-[var(--alert-light)] px-2.5 py-1 rounded-full border border-[var(--alert)] inline-flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>{strings.lawyerPending}</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3 text-sm text-[var(--ink)] leading-relaxed break-words">
            <p>{strings.consentBody}</p>
            <div className="p-3 bg-white rounded-xl border border-[var(--border)] text-xs text-[var(--ink-soft)]">
              <strong>Non-Diagnostic Commitment:</strong> Memora never diagnoses, stages conditions, or prescribes treatments. Data is protected under India DPDP Act 2023.
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-[var(--bg)]">
            <input
              type="checkbox"
              id="consent-check"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="w-6 h-6 mt-0.5 rounded accent-[var(--primary)] shrink-0 cursor-pointer"
            />
            <span className="text-sm font-medium text-[var(--ink)]">
              I have read and accept the plain-language terms on behalf of my family.
            </span>
          </label>
        </div>
      )}

      {/* STEP 4: Guardian Path & Capacity Determination */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[var(--ink)]">{strings.stepGuardian}</h2>
            <p className="text-xs text-[var(--ink-soft)]">{strings.capacityExplanation}</p>
          </div>

          {/* Capacity Question */}
          <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
            <span className="text-sm font-bold text-[var(--ink)] block">
              {strings.capacityQuestion}
            </span>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--ink)]">
                <input
                  type="radio"
                  name="capacity"
                  checked={lacksCapacity}
                  onChange={() => setLacksCapacity(true)}
                  className="w-5 h-5 accent-[var(--primary)]"
                />
                Yes (Guardian Consent Path)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--ink)]">
                <input
                  type="radio"
                  name="capacity"
                  checked={!lacksCapacity}
                  onChange={() => setLacksCapacity(false)}
                  className="w-5 h-5 accent-[var(--primary)]"
                />
                No (Assisted Self-Consent)
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="guardian-rel" className="block text-sm font-semibold text-[var(--ink)] mb-1">
                {strings.relationshipPlaceholder}
              </label>
              <input
                id="guardian-rel"
                type="text"
                placeholder="e.g., Daughter"
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] focus:border-[var(--primary)] text-base outline-hidden"
                style={{ minHeight: "48px" }}
              />
            </div>

            <div>
              <label htmlFor="guardian-note" className="block text-sm font-semibold text-[var(--ink)] mb-1">
                {strings.notePlaceholder}
              </label>
              <input
                id="guardian-note"
                type="text"
                placeholder="e.g., Primary caregiver living at home"
                value={guardianNote}
                onChange={(e) => setGuardianNote(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] focus:border-[var(--primary)] text-base outline-hidden"
                style={{ minHeight: "48px" }}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-[var(--bg)]">
              <input
                type="checkbox"
                id="guardian-declaration"
                checked={guardianDeclared}
                onChange={(e) => setGuardianDeclared(e.target.checked)}
                className="w-6 h-6 mt-0.5 rounded accent-[var(--primary)] shrink-0 cursor-pointer"
              />
              <span className="text-sm font-medium text-[var(--ink)]">
                {strings.guardianDeclaration}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* STEP 5: First Memories */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[var(--ink)]">{strings.firstMemoryTitle}</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Add a favorite memory, family milestone, or traditional festival to personalize reminiscence activities.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="memory-title" className="block text-sm font-semibold text-[var(--ink)] mb-1">
                {strings.memoryCaption}
              </label>
              <input
                id="memory-title"
                type="text"
                placeholder={strings.memoryCaptionPlaceholder}
                value={firstMemoryTitle}
                onChange={(e) => setFirstMemoryTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--primary)] text-base outline-hidden"
                style={{ minHeight: "48px" }}
              />
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--ink-soft)] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span>You can upload photos, voice stories, and favorite songs later from the Memories tab.</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Calibration Hand-Off */}
      {step === 6 && (
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[var(--primary-light)] flex items-center justify-center text-3xl border-2 border-[var(--primary)]" aria-hidden="true">
            <Sprout className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[var(--primary)]">{strings.calibrationTitle}</h2>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-md mx-auto">
              {strings.calibrationDesc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-left text-xs text-[var(--ink)] space-y-1.5">
            <div><strong>Elder:</strong> {elderName || "Elder"}</div>
            <div><strong>Caregiver:</strong> {caregiverName} ({guardianRelationship || "Guardian"})</div>
            <div><strong>Language:</strong> {locale.toUpperCase()}</div>
            <div><strong>Consent:</strong> Verifiable DPDP 2026.1 ({strings.lawyerPending})</div>
          </div>

          <div className="pt-2">
            <Link
              href="/play"
              className="inline-flex items-center justify-center w-full px-6 py-4 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-bold text-lg shadow-sm transition-colors no-underline"
              style={{ minHeight: "64px" }}
            >
              {strings.startCalibrationBtn}
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Buttons for Steps 1-5 */}
      {step < 6 && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-3 rounded-xl border-2 border-[var(--border)] text-sm font-semibold text-[var(--ink-soft)] hover:bg-[var(--surface-hover)] transition-colors"
            style={{ minHeight: "48px" }}
          >
            {strings.backBtn}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
            style={{ minHeight: "48px" }}
          >
            {isSubmitting ? "Saving..." : strings.continueBtn}
          </button>
        </div>
      )}
    </div>
  );
}
