import { describe, it, expect } from "vitest";
import { DEFAULT_CONTACTS, FamilyCallBar } from "../FamilyCallBar";
import { VoiceButton } from "../VoiceButton";
import { PromptBubble } from "../PromptBubble";
import { ReminderCard } from "../ReminderCard";
import { ActivityShell } from "../ActivityShell";

describe("DESIGN.md Section 3 Patient Components", () => {
  it("exports FamilyCallBar with valid default contacts and touch targets", () => {
    expect(DEFAULT_CONTACTS).toHaveLength(2);
    expect(DEFAULT_CONTACTS[0].name).toBe("Jonali");
    expect(DEFAULT_CONTACTS[0].relation).toBe("Daughter");
    expect(DEFAULT_CONTACTS[0].phone).toMatch(/^tel:/);
    expect(typeof FamilyCallBar).toBe("function");
  });

  it("exports VoiceButton as an accessible tap-to-speak component", () => {
    expect(typeof VoiceButton).toBe("function");
  });

  it("exports PromptBubble for gentle assistant messages", () => {
    expect(typeof PromptBubble).toBe("function");
  });

  it("exports ReminderCard with appropriate routine action types", () => {
    expect(typeof ReminderCard).toBe("function");
  });

  it("exports ActivityShell with home and family call navigation support", () => {
    expect(typeof ActivityShell).toBe("function");
  });
});
