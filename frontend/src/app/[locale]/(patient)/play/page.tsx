"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { BigButton } from "@/components/patient/BigButton";
import { recordGameEventOffline, generateUUIDv7 } from "@/lib/offline";

interface CardItem {
  id: string;
  name: string;
  icon: string;
  pairKey: string;
}

const CULTURAL_ITEMS = [
  { nameKey: "gamosa", icon: "🧣", nameDefault: "Gamosa" },
  { nameKey: "chai", icon: "🍃", nameDefault: "Chai Leaf" },
  { nameKey: "dhol", icon: "🥁", nameDefault: "Dhol" },
  { nameKey: "jaapi", icon: "👒", nameDefault: "Jaapi" },
];

export default function PatientPlayPage() {
  const t = useTranslations("Play");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  // Screen states: 'home' | 'playing' | 'completed'
  const [gameState, setGameState] = useState<"home" | "playing" | "completed">("home");

  // Game state
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");

  const turnStartTimeRef = useRef<number>(Date.now());
  const patientId = "patient-demo-ner";

  // Start new game session
  const handleStartGame = () => {
    const newSessionId = generateUUIDv7();
    setSessionId(newSessionId);

    // Create 4-card deck (2 pairs) for calm, non-overwhelming memory stimulation
    const selectedPairs = CULTURAL_ITEMS.slice(0, 2);
    const deck: CardItem[] = [];

    selectedPairs.forEach((item, pairIdx) => {
      deck.push({
        id: `card_${pairIdx}_a`,
        name: item.nameDefault,
        icon: item.icon,
        pairKey: item.nameKey,
      });
      deck.push({
        id: `card_${pairIdx}_b`,
        name: item.nameDefault,
        icon: item.icon,
        pairKey: item.nameKey,
      });
    });

    // Gentle deterministic shuffle
    deck.sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIndices([]);
    setMatchedKeys([]);
    setFeedback("");
    setGameState("playing");
    turnStartTimeRef.current = Date.now();
  };

  // Handle card tap
  const handleCardClick = async (index: number) => {
    // Prevent clicking if already 2 flipped or already matched
    if (flippedIndices.length === 2 || flippedIndices.includes(index)) return;
    const card = cards[index];
    if (matchedKeys.includes(card.pairKey)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // If this is the second card of the turn, evaluate match
    if (newFlipped.length === 2) {
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];
      const responseTimeMs = Date.now() - turnStartTimeRef.current;
      const isMatch = firstCard.pairKey === secondCard.pairKey;

      // Offline event logging with UUIDv7
      await recordGameEventOffline({
        patient_id: patientId,
        session_id: sessionId,
        domain: "memory_match",
        item_id: `match_${firstCard.pairKey}_${secondCard.pairKey}`,
        difficulty: -0.8, // Calibrated difficulty
        correct: isMatch,
        response_time_ms: responseTimeMs,
      });

      if (isMatch) {
        // Dignified feedback (no patronising praise)
        setFeedback(t("feedbackRight"));
        const newMatched = [...matchedKeys, firstCard.pairKey];
        setMatchedKeys(newMatched);
        setFlippedIndices([]);
        turnStartTimeRef.current = Date.now();

        // Check if all pairs are matched
        if (newMatched.length === cards.length / 2) {
          setTimeout(() => {
            setGameState("completed");
          }, 1000);
        }
      } else {
        // Courteous non-blaming feedback
        setFeedback(t("feedbackHere"));
        setTimeout(() => {
          setFlippedIndices([]);
          setFeedback("");
          turnStartTimeRef.current = Date.now();
        }, 1200);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-lg mx-auto w-full py-4 space-y-6">
      {/* Top Navigation & Orientation Banner */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-lg font-semibold text-[#1B3B36] p-2 hover:bg-[#F2EFE9] rounded-xl no-underline"
          style={{ minHeight: "48px" }}
        >
          <span aria-hidden="true">⬅️</span>
          <span>{tCommon("back")}</span>
        </Link>
        <span className="text-sm font-semibold text-[#52504C] bg-white px-3 py-1.5 rounded-full border border-[#D1CEC4]">
          {t("todayIs")}: {new Date().toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>

      {/* STATE 1: HOME */}
      {gameState === "home" && (
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
              onClick={handleStartGame}
              aria-label={t("startSession")}
            />
          </div>
        </>
      )}

      {/* STATE 2: PLAYING MEMORY MATCH */}
      {gameState === "playing" && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-[#1B3B36]">
              {t("matchGameTitle")}
            </h2>
            <p className="text-base text-[#52504C] mt-1" role="status" aria-live="polite">
              {feedback || t("matchGamePrompt")}
            </p>
          </div>

          {/* Cards Grid: Minimum 72px touch target with visible text labels */}
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
                  aria-label={isFlipped ? card.name : `Hidden card ${idx + 1}`}
                >
                  {isFlipped ? (
                    <>
                      <span className="text-4xl mb-1" aria-hidden="true">
                        {card.icon}
                      </span>
                      <span className="text-sm font-bold tracking-tight">
                        {card.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl opacity-80" aria-hidden="true">
                      🌿
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setGameState("home")}
              className="text-base text-[#52504C] underline hover:text-[#1C1C1A] py-2 px-4"
              style={{ minHeight: "44px" }}
            >
              {t("calmBreak")}
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: COMPLETED */}
      {gameState === "completed" && (
        <div className="bg-white rounded-3xl p-6 border-3 border-[#2D6A4F] shadow-sm text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#EAF3EE] flex items-center justify-center text-4xl border-2 border-[#2D6A4F]" aria-hidden="true">
            🌱
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#2D6A4F]">
              {t("feedbackRight")}
            </h2>
            <p className="text-base text-[#52504C] mt-2">
              {t("takeRest")}
            </p>
          </div>
          <BigButton
            label={tCommon("continue")}
            variant="primary"
            onClick={() => setGameState("home")}
          />
        </div>
      )}
    </div>
  );
}
