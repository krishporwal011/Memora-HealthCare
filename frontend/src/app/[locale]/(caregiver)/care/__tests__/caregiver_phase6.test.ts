import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock next-intl and routing for Vitest Node environment
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href, ...props }: any) =>
    React.createElement("a", { href, ...props }, children),
  usePathname: () => "/en/care",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

import CaregiverDashboardPage from "../page";
import CaregiverTimelinePage from "../timeline/page";
import CaregiverPeoplePage from "../people/page";

describe("Phase 6: Caregiver Portal Redesign (/care)", () => {
  it("exports CaregiverDashboardPage component", () => {
    expect(typeof CaregiverDashboardPage).toBe("function");
  });

  it("exports CaregiverTimelinePage component", () => {
    expect(typeof CaregiverTimelinePage).toBe("function");
  });

  it("exports CaregiverPeoplePage component", () => {
    expect(typeof CaregiverPeoplePage).toBe("function");
  });
});
