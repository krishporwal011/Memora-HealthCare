import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock next-intl and routing for Vitest Node environment
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href, ...props }: any) =>
    React.createElement("a", { href, ...props }, children),
  usePathname: () => "/en",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

import { LandingAlbumView } from "../components/LandingAlbumView";
import { LandingGalleryView } from "../components/LandingGalleryView";
import { EntryChoiceModal } from "../components/EntryChoiceModal";
import { HomeClientContainer } from "../components/HomeClientContainer";

describe("Phase 5: Cinematic Landing Showcase", () => {
  it("exports LandingAlbumView component", () => {
    expect(typeof LandingAlbumView).toBe("function");
  });

  it("exports LandingGalleryView component", () => {
    expect(typeof LandingGalleryView).toBe("function");
  });

  it("exports EntryChoiceModal component", () => {
    expect(typeof EntryChoiceModal).toBe("function");
  });

  it("exports HomeClientContainer component", () => {
    expect(typeof HomeClientContainer).toBe("function");
  });
});
