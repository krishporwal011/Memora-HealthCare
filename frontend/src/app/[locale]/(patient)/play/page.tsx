"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Sparkles, Image as ImageIcon, MessageCircle, ArrowLeft, Coffee } from "lucide-react";
import { BigButton } from "@/components/ui/BigButton";
import { DayHeader } from "@/components/ui/DayHeader";
import { FamilyCallBar } from "@/components/patient/FamilyCallBar";
import { SyncStatusChip } from "@/components/ui/SyncStatusChip";
import { recordGameEventOffline } from "@/lib/offline";
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
import { MemoryMatchGame, type CardItem } from "./components/MemoryMatchGame";
import { CalmBreakScreen } from "./components/CalmBreakScreen";
import { SessionCompletedScreen } from "./components/SessionCompletedScreen";

export default function PatientPlayPage() {
  const t = useTranslations("Play");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  // Screen modes: 'home' | 'playing' | 'photo_quiz' | 'break' | 'completed'
  const [screenMode, setScreenMode] = useState<
    "home" | "playing" | "photo_quiz" | "break" | "completed"
  >("home");

  // Session state
  const [sessionCtx, setSessionCtx] = useState<SessionContext>(() =>
    createInitialSession("patient-demo-ner", 0.0)
  );
  const [orientationData] = useState<OrientationCardData>(getDefaultOrientationData);

  // Active game cards
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [hintMessage, setHintMessage] = useState<string>("");

  // Offline sync setup
  const [, setSyncState] = useState<SyncState>(() => ({
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
      setSessionCtx((prev) => {
        const updated = handleTurnTimeoutOrError(prev);
        if (updated.hintShown && !updated.answerRevealed) {
          setHintMessage(t("matchGamePrompt"));
        } else if (updated.answerRevealed) {
          setFeedback(t("feedbackHere"));
        }
        return updated;
      });
    }, 20000);

    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    };
  }, [screenMode, flippedIndices, t]);

  // Start adaptive session
  const handleStartSession = () => {
    const newCtx = createInitialSession("patient-demo-ner", sessionCtx.state.theta);
    setSessionCtx(newCtx);

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

    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];
      const responseTimeMs = Date.now() - turnStartTimeRef.current;
      const isMatch = firstCard.pairKey === secondCard.pairKey;

      const currentItem = sessionCtx.currentItem || CULTURAL_ITEM_BANK[0];
      const updatedAdaptiveState = processAnswer(sessionCtx.state, currentItem, isMatch);

      await recordGameEventOffline({
        patient_id: sessionCtx.state.patientId,
        session_id: `session-${sessionCtx.state.sessionStartTime}`,
        domain: "memory_match",
        item_id: currentItem.id,
        difficulty: currentItem.difficulty,
        correct: isMatch,
        response_time_ms: responseTimeMs,
      });

      syncAllUnsynced().catch(() => {});

      setSessionCtx((prev) => ({
        ...prev,
        state: updatedAdaptiveState,
      }));

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
    <div className="flex-1 flex flex-col gap-6 max-w-3xl mx-auto w-full px-4 py-5 pb-8">
      {/* ── Orientation Day Header (Slim, one line) ── */}
      <DayHeader locale={locale} patientName="Bhaben" />

      {/* ── Top Bar: Back to Home & Sync Status ── */}
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

        <SyncStatusChip />
      </div>

      {/* ── 1. PATIENT HOME (Three Big Choices) ── */}
      {screenMode === "home" && (
        <div className="flex-1 flex flex-col justify-center gap-6">
          {/* Welcome orientation card */}
          <div
            className="rounded-[var(--radius-card)] p-6 md:p-8 text-center space-y-2 border-2 shadow-sm"
            style={{
              background: "var(--surface)",
              borderColor: "var(--primary)",
            }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: "var(--primary)" }}>
              {t("title")}
            </h2>
            <p className="text-lg md:text-xl font-medium max-w-md mx-auto" style={{ color: "var(--ink-soft)" }}>
              {t("matchGamePrompt")}
            </p>
          </div>

          {/* Three Big Choices: min 64px touch targets */}
          <div className="space-y-4">
            {/* Choice 1: Memory Match Activity */}
            <BigButton
              label="Memory Match Activity"
              icon={<Sparkles size={26} />}
              variant="primary"
              size="patient"
              onClick={handleStartSession}
              aria-label="Start Memory Match Activity"
            />

            {/* Choice 2: Family Memories Album */}
            <Link href="/play/album" className="no-underline block">
              <BigButton
                label="Family Memories Album"
                icon={<ImageIcon size={26} />}
                variant="accent"
                size="patient"
                className="w-full"
                aria-label="Open Family Memories Album"
              />
            </Link>

            {/* Choice 3: Talk to Memora */}
            <Link href="/play/talk" className="no-underline block">
              <BigButton
                label="Talk to Memora"
                icon={<MessageCircle size={26} />}
                variant="surface"
                size="patient"
                className="w-full"
                aria-label="Talk to Memora companion"
              />
            </Link>

            {/* Choice 4: Photo Memories Reminiscence */}
            <BigButton
              label="Photo Question Reminiscence"
              icon={<Sparkles size={24} />}
              variant="surface"
              size="large"
              className="w-full"
              onClick={() => setScreenMode("photo_quiz")}
              aria-label="Photo Question Reminiscence"
            />
          </div>

          {/* Speed Dial to Family (Always pinned 1 tap away) */}
          <div className="pt-2">
            <FamilyCallBar />
          </div>
        </div>
      )}

      {/* ── 2. PHOTO REMINISCENCE ── */}
      {screenMode === "photo_quiz" && (
        <PhotoQuestionActivity
          patientId={sessionCtx.state.patientId}
          onComplete={() => setScreenMode("completed")}
          onExit={() => setScreenMode("home")}
        />
      )}

      {/* ── 3. MEMORY MATCH GAME ── */}
      {screenMode === "playing" && (
        <MemoryMatchGame
          cards={cards}
          flippedIndices={flippedIndices}
          matchedKeys={matchedKeys}
          feedback={feedback}
          hintMessage={hintMessage}
          defaultPrompt={t("matchGamePrompt")}
          title={t("matchGameTitle")}
          calmBreakLabel={t("calmBreak")}
          onCardClick={handleCardClick}
          onCalmBreak={() => setScreenMode("break")}
        />
      )}

      {/* ── 4. CALM BREAK & ORIENTATION ── */}
      {screenMode === "break" && (
        <CalmBreakScreen
          orientationData={orientationData}
          title={t("calmBreak")}
          takeRestLabel={t("takeRest")}
          medicineReminderLabel={t("medicineReminder")}
          whoIsHomeLabel={t("whoIsHome")}
          continueLabel={tCommon("continue")}
          onContinue={() => setScreenMode("home")}
        />
      )}

      {/* ── 5. COMPLETED SESSION ── */}
      {screenMode === "completed" && (
        <SessionCompletedScreen
          feedbackLabel={t("feedbackRight")}
          takeRestLabel={t("takeRest")}
          continueLabel={tCommon("continue")}
          onContinue={() => setScreenMode("break")}
        />
      )}
    </div>
  );
}
