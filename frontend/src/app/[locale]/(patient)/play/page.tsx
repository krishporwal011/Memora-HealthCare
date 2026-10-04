"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowLeft, PhoneCall } from "lucide-react";
import { BigButton } from "@/components/patient/BigButton";
import { DayHeader } from "@/components/patient/DayHeader";
import { FamilyCallBar } from "@/components/patient/FamilyCallBar";
import { SyncStatusChip } from "@/components/common/SyncStatusChip";
import { recordGameEventOffline, generateUUIDv7 } from "@/lib/offline";
import {
  subscribeSyncState,
  setupAutoSync,
  syncAllUnsynced,
  type SyncState,
} from "@/lib/sync";
import {
  CULTURAL_ITEM_BANK,
  createInitialSession,
  getDefaultOrientationData,
  handleTurnTimeoutOrError,
  SessionContext,
  OrientationCardData,
} from "@/lib/session";
import { processAnswer, selectNextItem } from "@/lib/adaptive";
import { PhotoQuestionActivity } from "./PhotoQuestionActivity";

interface CardItem {
  id: string;
  name: string;
  icon: string;
  pairKey: string;
  hint?: string;
}

export default function PatientPlayPage() {
  const t = useTranslations("Play");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  // Screen modes: 'home' | 'playing' | 'photo_quiz' | 'break' | 'completed'
  const [screenMode, setScreenMode] = useState<"home" | "playing" | "photo_quiz" | "break" | "completed">("home");

  // Session state
  const [sessionCtx, setSessionCtx] = useState<SessionContext>(() =>
    createInitialSession("patient-demo-ner", 0.0)
  );
  const [orientationData, setOrientationData] = useState<OrientationCardData>(getDefaultOrientationData);

  // Active game cards
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [hintMessage, setHintMessage] = useState<string>("");

  // Offline sync state
  const [syncState, setSyncState] = useState<SyncState>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    lastError: null,
    retryAttempt: 0,
  }));

  useEffect(() => {
    const cleanupAutoSync = setupAutoSync();
    const unsubscribe = subscribeSyncState((s) => setSyncState(s));
    return () => {
      cleanupAutoSync();
      unsubscribe();
    };
  }, []);

  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const turnStartTimeRef = useRef<number>(Date.now());

  // 20-second gentle inactivity timer (prompts a hint without alarm bells)
  useEffect(() => {
    if (screenMode !== "playing") {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
      return;
    }

    turnTimerRef.current = setTimeout(() => {
      // 20 seconds passed without answer: trigger hint
      setSessionCtx((prev) => {
        const updated = handleTurnTimeoutOrError(prev);
        if (updated.hintShown && !updated.answerRevealed) {
          setHintMessage("Look closely at the items with green leaves.");
        } else if (updated.answerRevealed) {
          setFeedback(t("feedbackHere"));
        }
        return updated;
      });
    }, 20000); // 20 seconds

    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    };
  }, [screenMode, flippedIndices, t]);

  // Start adaptive session
  const handleStartSession = () => {
    const newCtx = createInitialSession("patient-demo-ner", sessionCtx.state.theta);
    setSessionCtx(newCtx);

    // Pick 2 items nearest to current optimal difficulty b*
    const targetItem = newCtx.currentItem || CULTURAL_ITEM_BANK[0];
    const candidate2 =
      selectNextItem(CULTURAL_ITEM_BANK, newCtx.state.theta, [targetItem.id]) ||
      CULTURAL_ITEM_BANK[1];

    const deck: CardItem[] = [
      {
        id: "c1",
        name: (targetItem.content as { name: string }).name,
        icon: (targetItem.content as { icon: string }).icon,
        pairKey: targetItem.id,
        hint: (targetItem.content as { hint: string }).hint,
      },
      {
        id: "c2",
        name: (targetItem.content as { name: string }).name,
        icon: (targetItem.content as { icon: string }).icon,
        pairKey: targetItem.id,
        hint: (targetItem.content as { hint: string }).hint,
      },
      {
        id: "c3",
        name: (candidate2.content as { name: string }).name,
        icon: (candidate2.content as { icon: string }).icon,
        pairKey: candidate2.id,
        hint: (candidate2.content as { hint: string }).hint,
      },
      {
        id: "c4",
        name: (candidate2.content as { name: string }).name,
        icon: (candidate2.content as { icon: string }).icon,
        pairKey: candidate2.id,
        hint: (candidate2.content as { hint: string }).hint,
      },
    ];

    deck.sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIndices([]);
    setMatchedKeys([]);
    setFeedback("");
    setHintMessage("");
    setScreenMode("playing");
    turnStartTimeRef.current = Date.now();
  };

  // Card click interaction
  const handleCardClick = async (index: number) => {
    if (flippedIndices.length === 2 || flippedIndices.includes(index)) return;
    const card = cards[index];
    if (matchedKeys.includes(card.pairKey)) return;

    // Clear timeout timer on active response
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];
      const responseTimeMs = Date.now() - turnStartTimeRef.current;
      const isMatch = firstCard.pairKey === secondCard.pairKey;

      // Process answer in adaptive engine
      const currentItem = sessionCtx.currentItem || CULTURAL_ITEM_BANK[0];
      const updatedAdaptiveState = processAnswer(sessionCtx.state, currentItem, isMatch);

      // Record offline event
      await recordGameEventOffline({
        patient_id: sessionCtx.state.patientId,
        session_id: `session-${sessionCtx.state.sessionStartTime}`,
        domain: "memory_match",
        item_id: currentItem.id,
        difficulty: currentItem.difficulty,
        correct: isMatch,
        response_time_ms: responseTimeMs,
      });

      // Opportunistic sync attempt if online
      syncAllUnsynced().catch(() => {});

      setSessionCtx((prev) => ({
        ...prev,
        state: updatedAdaptiveState,
      }));

      // Check if adaptive safety stop triggered (3 consecutive errors or 10 min cap)
      if (updatedAdaptiveState.isTerminated) {
        setTimeout(() => {
          setScreenMode("break");
        }, 1200);
        return;
      }

      if (isMatch) {
        setFeedback(t("feedbackRight"));
        const newMatched = [...matchedKeys, firstCard.pairKey];
        setMatchedKeys(newMatched);
        setFlippedIndices([]);
        setHintMessage("");
        turnStartTimeRef.current = Date.now();

        if (newMatched.length === cards.length / 2) {
          setTimeout(() => {
            setScreenMode("completed");
          }, 1000);
        }
      } else {
        setFeedback(t("feedbackHere"));
        setTimeout(() => {
          setFlippedIndices([]);
          setFeedback("");
          turnStartTimeRef.current = Date.now();
        }, 1400);
      }
    }
  };

  return (
    <div
      className="flex-1 flex flex-col gap-6 max-w-3xl mx-auto w-full px-4 py-5"
    >
      {/* Day Header — always visible for orientation */}
      <DayHeader locale={locale} />

      {/* Top row: Home button + Sync status + Call Family button (visible on every screen) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base md:text-lg font-bold px-4 py-2.5 rounded-full border no-underline transition-all active:scale-95 shadow-xs"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--primary)",
            minHeight: "56px",
          }}
          aria-label="Return to home screen"
        >
          <ArrowLeft size={22} aria-hidden="true" />
          <span>{tCommon("back")}</span>
        </Link>

        <div className="flex items-center gap-3">
          <SyncStatusChip />
          <a
            href="tel:+919876543210"
            className="inline-flex items-center gap-2 text-base font-bold px-5 py-2.5 rounded-full text-white no-underline shadow-sm transition-transform active:scale-95 cursor-pointer"
            style={{
              background: "var(--accent)",
              minHeight: "56px",
            }}
            aria-label="Call family member now"
          >
            <PhoneCall size={20} aria-hidden="true" />
            <span>Call Family</span>
          </a>
        </div>
      </div>

      {/* 1. HOME SCREEN */}
      {screenMode === "home" && (
        <div className="flex-1 flex flex-col justify-center gap-6">
          {/* Welcome card */}
          <div
            className="rounded-[var(--radius-card)] p-6 md:p-8 text-center space-y-3"
            style={{
              background: "var(--surface)",
              border: "2.5px solid var(--primary)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl border-2"
              style={{ background: "var(--primary-light)", borderColor: "var(--primary)" }}
              aria-hidden="true"
            >
              🌸
            </div>
            <h2
              className="text-2xl md:text-3xl font-bold leading-snug"
              style={{ color: "var(--primary)" }}
            >
              {t("title")}
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed max-w-lg mx-auto"
              style={{ color: "var(--ink-soft)" }}
            >
              {t("matchGamePrompt")}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-4">
            <BigButton
              label={t("startSession")}
              icon="▶"
              variant="primary"
              onClick={handleStartSession}
              aria-label={t("startSession")}
            />
            <BigButton
              label="Family Photo Memories"
              icon="📸"
              variant="accent"
              onClick={() => setScreenMode("photo_quiz")}
              aria-label="Play Family Photo Memories"
            />
          </div>

          {/* Speed Dial to Family (always 1 tap away) */}
          <div className="pt-2">
            <FamilyCallBar />
          </div>
        </div>
      )}

      {/* 2. PHOTO QUIZ */}
      {screenMode === "photo_quiz" && (
        <PhotoQuestionActivity
          patientId={sessionCtx.state.patientId}
          onComplete={() => setScreenMode("completed")}
          onExit={() => setScreenMode("home")}
        />
      )}

      {/* 3. MEMORY MATCH GAME */}
      {screenMode === "playing" && (
        <div className="flex-1 flex flex-col gap-5">
          <div className="text-center">
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--ink)" }}
            >
              {t("matchGameTitle")}
            </h2>
            <p
              className="text-lg mt-1 min-h-[1.5em]"
              role="status"
              aria-live="polite"
              style={{ color: feedback ? "var(--primary)" : "var(--ink-soft)" }}
            >
              {feedback || hintMessage || t("matchGamePrompt")}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full">
            {cards.map((card, idx) => {
              const isFlipped =
                flippedIndices.includes(idx) || matchedKeys.includes(card.pairKey);
              const isMatched = matchedKeys.includes(card.pairKey);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(idx)}
                  disabled={isMatched}
                  className="h-36 rounded-[var(--radius-card)] flex flex-col items-center justify-center p-3 transition-all duration-200 select-none cursor-pointer"
                  style={{
                    minHeight: "72px",
                    minWidth: "72px",
                    border: isMatched
                      ? "2.5px solid var(--success)"
                      : isFlipped
                      ? "2.5px solid var(--primary)"
                      : "2.5px solid var(--primary)",
                    background: isMatched
                      ? "var(--success-light)"
                      : isFlipped
                      ? "var(--surface)"
                      : "var(--primary)",
                    boxShadow: isFlipped && !isMatched
                      ? "var(--shadow-md)"
                      : "var(--shadow-sm)",
                  }}
                  aria-label={isFlipped ? card.name : `Card ${idx + 1}`}
                >
                  {isFlipped ? (
                    <>
                      <span className="text-4xl mb-1" aria-hidden="true">
                        {card.icon}
                      </span>
                      <span
                        className="text-sm font-bold tracking-tight"
                        style={{
                          color: isMatched ? "var(--success)" : "var(--ink)",
                        }}
                      >
                        {card.name}
                      </span>
                    </>
                  ) : (
                    /* NER-inspired back face: three vertical leaf stripes */
                    <div
                      className="flex gap-1.5 items-center"
                      aria-hidden="true"
                    >
                      <span style={{ fontSize: "1.4rem", opacity: 0.6 }}>🌿</span>
                      <span style={{ fontSize: "1.8rem", opacity: 0.8 }}>🌿</span>
                      <span style={{ fontSize: "1.4rem", opacity: 0.6 }}>🌿</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setScreenMode("break")}
              className="text-base font-semibold underline py-2 px-4 rounded-xl transition-colors"
              style={{ color: "var(--ink-soft)", minHeight: "44px" }}
            >
              {t("calmBreak")}
            </button>
          </div>
        </div>
      )}

      {/* 4. CALM BREAK & ORIENTATION */}
      {screenMode === "break" && (
        <div
          className="rounded-[var(--radius-card)] p-6 space-y-5"
          style={{
            background: "var(--surface)",
            border: "2.5px solid var(--primary)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="text-center space-y-2">
            <div
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl border-2"
              style={{
                background: "var(--primary-light)",
                borderColor: "var(--primary)",
              }}
              aria-hidden="true"
            >
              ☕
            </div>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              {t("calmBreak")}
            </h2>
            <p style={{ color: "var(--ink-soft)" }}>{t("takeRest")}</p>
          </div>

          {/* Orientation details */}
          <div
            className="space-y-3 p-4 rounded-[var(--radius-md)]"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0" aria-hidden="true">💊</span>
              <div>
                <span
                  className="text-xs font-bold block uppercase tracking-wider"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {t("medicineReminder")}
                </span>
                <span
                  className="text-base font-medium block"
                  style={{ color: "var(--ink)" }}
                >
                  {orientationData.nextMedicineText}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0" aria-hidden="true">🏡</span>
              <div>
                <span
                  className="text-xs font-bold block uppercase tracking-wider"
                  style={{ color: "var(--ink-muted)" }}
                >
                  {t("whoIsHome")}
                </span>
                <span
                  className="text-base font-medium block"
                  style={{ color: "var(--ink)" }}
                >
                  {orientationData.whoIsHomeText}
                </span>
              </div>
            </div>
          </div>

          <BigButton
            label={tCommon("continue")}
            variant="primary"
            onClick={() => setScreenMode("home")}
          />
        </div>
      )}

      {/* 5. COMPLETED SESSION */}
      {screenMode === "completed" && (
        <div
          className="rounded-[var(--radius-card)] p-6 text-center space-y-5 animate-pop"
          style={{
            background: "var(--surface)",
            border: "2.5px solid var(--success)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl border-2"
            style={{
              background: "var(--success-light)",
              borderColor: "var(--success)",
            }}
            aria-hidden="true"
          >
            🌱
          </div>
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--success)" }}
            >
              {t("feedbackRight")}
            </h2>
            <p
              className="text-base mt-2"
              style={{ color: "var(--ink-soft)" }}
            >
              {t("takeRest")}
            </p>
          </div>
          <BigButton
            label={tCommon("continue")}
            variant="primary"
            onClick={() => setScreenMode("break")}
          />
        </div>
      )}
    </div>
  );
}
