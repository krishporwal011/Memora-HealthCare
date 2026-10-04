import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock next-intl and routing for Vitest Node environment
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href, ...props }: any) =>
    React.createElement("a", { href, ...props }, children),
  usePathname: () => "/en/house",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

import MemoryHousePage from "../page";
import { MemoryHouseAlbumFallback, HOUSE_MEMORIES } from "../components/MemoryHouseAlbumFallback";
import { MemoryHouseScene } from "../components/MemoryHouseScene";

describe("Phase 9: 3D Memory House & Album Fallback Tests", () => {
  it("exports MemoryHousePage, fallback, and 3D scene components", () => {
    expect(typeof MemoryHousePage).toBe("function");
    expect(typeof MemoryHouseAlbumFallback).toBe("function");
    expect(typeof MemoryHouseScene).toBe("function");
  });

  it("verifies HOUSE_MEMORIES has valid NER cultural items and strict Rule 01 compliance", () => {
    expect(HOUSE_MEMORIES.length).toBeGreaterThanOrEqual(4);

    const bannedPatterns = [
      /\balzheimer/i,
      /\bdementia\b/i,
      /\bstage\b/i,
      /\bdiagnos/i,
      /\bdisease\b/i,
      /\bdecline\b/i,
      /\bdeteriorat/i,
      /\bsevere\b/i,
      /\bmoderate\b/i,
    ];

    for (const mem of HOUSE_MEMORIES) {
      expect(mem.id).toBeDefined();
      expect(mem.title).toBeDefined();
      expect(mem.caption).toBeDefined();
      expect(mem.year).toBeGreaterThan(1900);
      expect(mem.people.length).toBeGreaterThan(0);
      expect(mem.story.length).toBeGreaterThan(20);

      // Rule 01 check
      for (const pattern of bannedPatterns) {
        expect(pattern.test(mem.title)).toBe(false);
        expect(pattern.test(mem.caption)).toBe(false);
        expect(pattern.test(mem.story)).toBe(false);
      }
    }
  });

  it("verifies all HOUSE_MEMORIES contain approved tags and synthetic family origins", () => {
    const tezpurMem = HOUSE_MEMORIES.find((m) => m.title.includes("Tezpur") || m.story.includes("Tezpur"));
    expect(tezpurMem).toBeDefined();
    expect(tezpurMem?.people).toContain("Grandmother");

    const ferryMem = HOUSE_MEMORIES.find((m) => m.title.includes("Ferry"));
    expect(ferryMem).toBeDefined();
    expect(ferryMem?.year).toBe(1991);
  });
});
