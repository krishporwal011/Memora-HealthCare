import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock next-intl and routing for Vitest Node environment
vi.mock("@/i18n/routing", () => ({
  Link: ({ children, href, ...props }: any) =>
    React.createElement("a", { href, ...props }, children),
  usePathname: () => "/en/sync",
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

import SyncCenterPage from "../sync/page";
import SettingsPage from "../settings/page";
import PrivacyPage from "../privacy/page";
import OfflineExplanationPage from "../offline/page";
import NotFoundPage from "../not-found";

describe("Phase 8: Shared Utility Screens", () => {
  it("exports SyncCenterPage component", () => {
    expect(typeof SyncCenterPage).toBe("function");
  });

  it("exports SettingsPage component", () => {
    expect(typeof SettingsPage).toBe("function");
  });

  it("exports PrivacyPage component", () => {
    expect(typeof PrivacyPage).toBe("function");
  });

  it("exports OfflineExplanationPage component", () => {
    expect(typeof OfflineExplanationPage).toBe("function");
  });

  it("exports NotFoundPage component", () => {
    expect(typeof NotFoundPage).toBe("function");
  });
});
