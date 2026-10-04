import { describe, it, expect, beforeEach } from "vitest";
import { useMemoraStore } from "../useMemoraStore";

describe("Phase 3: useMemoraStore (Calm Mode & Display Mode)", () => {
  beforeEach(() => {
    useMemoraStore.setState({
      calmMode: false,
      displayMode: "gallery",
      fontSize: "medium",
      highContrast: false,
      audioAssistance: true,
    });
  });

  it("toggles calm mode correctly", () => {
    expect(useMemoraStore.getState().calmMode).toBe(false);
    useMemoraStore.getState().toggleCalmMode();
    expect(useMemoraStore.getState().calmMode).toBe(true);
    // When calm mode is ON, display mode should be album
    expect(useMemoraStore.getState().displayMode).toBe("album");
  });

  it("sets display mode to gallery or album", () => {
    useMemoraStore.getState().setDisplayMode("album");
    expect(useMemoraStore.getState().displayMode).toBe("album");

    useMemoraStore.getState().setDisplayMode("gallery");
    expect(useMemoraStore.getState().displayMode).toBe("gallery");
    expect(useMemoraStore.getState().calmMode).toBe(false);
  });

  it("updates font size preference", () => {
    useMemoraStore.getState().setFontSize("large");
    expect(useMemoraStore.getState().fontSize).toBe("large");
  });

  it("toggles high contrast preference", () => {
    useMemoraStore.getState().setHighContrast(true);
    expect(useMemoraStore.getState().highContrast).toBe(true);
  });
});
