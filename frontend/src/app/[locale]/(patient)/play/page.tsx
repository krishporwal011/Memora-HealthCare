"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { BigButton } from "@/components/patient/BigButton";
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

  // Screen modes: 'home' | 'playing' | 'break' | 'completed'
  const [screenMode, setScreenMode] = useState<"home" | "playing" | "break" | "completed">("home");

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
    <div className="flex-1 flex flex-col justify-between max-w-lg mx-auto w-full py-4 space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold text-[#1B3B36] p-2 hover:bg-[#F2EFE9] rounded-xl no-underline"
          style={{ minHeight: "48px" }}
        >
          <span aria-hidden="true">⬅️</span>
          <span>{tCommon("back")}</span>
        </Link>
        <span className="text-sm font-semibold text-[#52504C] bg-white px-3 py-1.5 rounded-full border border-[#D1CEC4]">
          {t("todayIs")}: {new Date().toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>

      {/* Calm Offline / Sync Status Notice */}
      {!syncState.isOnline ? (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#FFF8E7] text-[#7A5800] border border-[#E0D0A0] px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-xs"
        >
          <span className="text-xl" aria-hidden="true">📡</span>
          <span>{tCommon("offlineNotice")}</span>
        </div>
      ) : syncState.isSyncing ? (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#EAF3EE] text-[#1B3B36] border border-[#A7D1B9] px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-medium"
        >
          <span className="text-sm" aria-hidden="true">🔄</span>
          <span>Saving activities...</span>
        </div>
      ) : null}

      {/* 1. HOME SCREEN */}
      {screenMode === "home" && (
        <>
          <div className="bg-white rounded-3xl p-6 border-3 border-[#1B3B36] shadow-sm text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#F8F6F0] flex items-center justify-center text-4xl border-2 border-[#1B3B36]" aria-hidden="true">
              🌸
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1B3B36]">
              {t("title")}
            </h2>
            <p className="text-lg text-[#52504C] leading-relaxed max-w-sm mx-auto">
              {t("matchGamePrompt")}
            </p>
          </div>

          <div className="pt-4">
            <BigButton
              label={t("startSession")}
              icon="▶️"
              variant="primary"
              onClick={handleStartSession}
              aria-label={t("startSession")}
            />
          </div>
        </>
      )}

      {/* 2. PLAYING ADAPTIVE MATCH */}
      {screenMode === "playing" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#1B3B36]">
              {t("matchGameTitle")}
            </h2>
            <p className="text-base text-[#52504C] mt-1" role="status" aria-live="polite">
              {feedback || hintMessage || t("matchGamePrompt")}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {cards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx) || matchedKeys.includes(card.pairKey);
              const isMatched = matchedKeys.includes(card.pairKey);

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(idx)}
                  disabled={isMatched}
                  className={`h-36 rounded-2xl border-3 flex flex-col items-center justify-center p-3 transition-all duration-150 select-none shadow-sm cursor-pointer ${
                    isMatched
                      ? "bg-[#EAF3EE] border-[#2D6A4F] text-[#2D6A4F]"
                      : isFlipped
                      ? "bg-white border-[#1B3B36] text-[#1C1C1A]"
                      : "bg-[#1B3B36] border-[#1B3B36] text-white hover:bg-[#122824]"
                  }`}
                  style={{ minHeight: "72px", minWidth: "72px" }}
                  aria-label={isFlipped ? card.name : `Card ${idx + 1}`}
                >
                  {isFlipped ? (
                    <>
                      <span className="text-4xl mb-1" aria-hidden="true">{card.icon}</span>
                      <span className="text-sm font-bold tracking-tight">{card.name}</span>
                    </>
                  ) : (
                    <span className="text-3xl opacity-80" aria-hidden="true">🌿</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setScreenMode("break")}
              className="text-base text-[#52504C] underline hover:text-[#1C1C1A] py-2 px-4"
              style={{ minHeight: "44px" }}
            >
              {t("calmBreak")}
            </button>
          </div>
        </div>
      )}

      {/* 3. CALM BREAK & ORIENTATION CARD */}
      {screenMode === "break" && (
        <div className="bg-white rounded-3xl p-6 border-3 border-[#1B3B36] shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F8F6F0] flex items-center justify-center text-3xl border-2 border-[#1B3B36]" aria-hidden="true">
              ☕
            </div>
            <h2 className="text-2xl font-bold text-[#1B3B36]">{t("calmBreak")}</h2>
            <p className="text-sm text-[#52504C]">{t("takeRest")}</p>
          </div>

          {/* Orientation Card Details */}
          <div className="space-y-3 bg-[#F8F6F0] p-4 rounded-2xl border border-[#D1CEC4]">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">📅</span>
              <div>
                <span className="text-xs font-bold text-[#52504C] block uppercase tracking-wider">{t("todayIs")}</span>
                <span className="text-base font-bold text-[#1C1C1A]">{orientationData.todayDateFormatted}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">💊</span>
              <div>
                <span className="text-xs font-bold text-[#52504C] block uppercase tracking-wider">{t("medicineReminder")}</span>
                <span className="text-base font-medium text-[#1C1C1A]">{orientationData.nextMedicineText}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">🏡</span>
              <div>
                <span className="text-xs font-bold text-[#52504C] block uppercase tracking-wider">{t("whoIsHome")}</span>
                <span className="text-base font-medium text-[#1C1C1A]">{orientationData.whoIsHomeText}</span>
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

      {/* 4. COMPLETED SESSION */}
      {screenMode === "completed" && (
        <div className="bg-white rounded-3xl p-6 border-3 border-[#2D6A4F] shadow-sm text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#EAF3EE] flex items-center justify-center text-4xl border-2 border-[#2D6A4F]" aria-hidden="true">
            🌱
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2D6A4F]">{t("feedbackRight")}</h2>
            <p className="text-base text-[#52504C] mt-2">{t("takeRest")}</p>
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
