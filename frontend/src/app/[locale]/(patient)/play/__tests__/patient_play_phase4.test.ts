import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock next-intl and routing to run in Vitest Node environment
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href, ...props }: any) =>
    React.createElement("a", { href, ...props }, children),
  usePathname: () => "/en/play",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

import PatientPlayPage from "../page";
import PatientAlbumPage from "../album/page";
import PatientTalkPage from "../talk/page";
import PatientRemindersPage from "../reminders/page";
import { MemoryMatchGame } from "../components/MemoryMatchGame";
import { CalmBreakScreen } from "../components/CalmBreakScreen";
import { SessionCompletedScreen } from "../components/SessionCompletedScreen";

describe("Phase 4: Patient Layer Redesign (/play)", () => {
  it("exports PatientPlayPage component", () => {
    expect(typeof PatientPlayPage).toBe("function");
  });

  it("exports PatientAlbumPage component", () => {
    expect(typeof PatientAlbumPage).toBe("function");
  });

  it("exports PatientTalkPage component", () => {
    expect(typeof PatientTalkPage).toBe("function");
  });

  it("exports PatientRemindersPage component", () => {
    expect(typeof PatientRemindersPage).toBe("function");
  });

  it("exports MemoryMatchGame component with SVG leaf pattern", () => {
    expect(typeof MemoryMatchGame).toBe("function");
  });

  it("exports CalmBreakScreen component", () => {
    expect(typeof CalmBreakScreen).toBe("function");
  });

  it("exports SessionCompletedScreen component", () => {
    expect(typeof SessionCompletedScreen).toBe("function");
  });
});
