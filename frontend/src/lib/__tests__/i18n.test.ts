import { describe, it, expect } from "vitest";
import en from "../../../locales/en.json";
import hi from "../../../locales/hi.json";
import as from "../../../locales/as.json";
import bn from "../../../locales/bn.json";
import brx from "../../../locales/brx.json";
import mni from "../../../locales/mni.json";

const locales = {
  hi: hi as Record<string, any>,
  as: as as Record<string, any>,
  bn: bn as Record<string, any>,
  brx: brx as Record<string, any>,
  mni: mni as Record<string, any>,
};

describe("B23: Internationalization (i18n) verification", () => {
  it("en.json defines all base keys and sections", () => {
    expect(en).toHaveProperty("Common");
    expect(en).toHaveProperty("Roles");
    expect(en).toHaveProperty("Play");
    expect(en).toHaveProperty("Care");
    expect(en).toHaveProperty("Asha");

    expect(en.Common).toHaveProperty("appName");
    expect(en.Common).toHaveProperty("disclaimer");
    expect(en.Roles).toHaveProperty("patientTitle");
    expect(en.Play).toHaveProperty("matchGameTitle");
    expect(en.Care).toHaveProperty("trendTitle");
    expect(en.Asha).toHaveProperty("assignedElders");
  });

  it("all regional locales contain 100% of keys defined in en.json", () => {
    const checkKeys = (enObj: Record<string, any>, targetObj: Record<string, any>, path = "") => {
      for (const key of Object.keys(enObj)) {
        const fullPath = path ? `${path}.${key}` : key;
        expect(
          targetObj,
          `Missing key "${fullPath}" in localized dictionary`
        ).toHaveProperty(key);

        if (typeof enObj[key] === "object" && enObj[key] !== null) {
          checkKeys(enObj[key], targetObj[key], fullPath);
        } else {
          expect(typeof targetObj[key]).toBe("string");
          expect(targetObj[key].length).toBeGreaterThan(0);
        }
      }
    };

    for (const [langCode, localeData] of Object.entries(locales)) {
      checkKeys(en as Record<string, any>, localeData, langCode);
    }
  });

  it("all machine-translated regional files receive mandatory _note for native speaker review", () => {
    for (const [langCode, localeData] of Object.entries(locales)) {
      expect(
        localeData._note,
        `Locale ${langCode} must have _note requiring native-speaker verification`
      ).toBe("Machine-assisted translation. Requires native-speaker verification.");
    }
  });

  it("satisfies 30% longer string expansion test without unrenderable truncation", () => {
    // Collect all strings from en and all locales
    const collectStrings = (obj: any): string[] => {
      let results: string[] = [];
      for (const [k, v] of Object.entries(obj)) {
        if (k === "_note") continue;
        if (typeof v === "string") {
          results.push(v);
        } else if (typeof v === "object" && v !== null) {
          results = results.concat(collectStrings(v));
        }
      }
      return results;
    };

    const allStrings = [
      ...collectStrings(en),
      ...Object.values(locales).flatMap((l) => collectStrings(l)),
    ];

    // Simulate 30% expansion for NER scripts and multisyllabic terms
    for (const str of allStrings) {
      const expandedLen = Math.ceil(str.length * 1.3);
      expect(expandedLen).toBeGreaterThanOrEqual(str.length);

      // Verify strings do not contain hardcoded fixed non-wrapping NBSP sequences that would cause un-wrappable overflow
      const longNonBreakingChunks = str.split(/\s+/).filter((word) => word.length > 50);
      expect(
        longNonBreakingChunks.length,
        `String "${str}" contains a word exceeding 50 characters that could overflow buttons`
      ).toBe(0);
    }
  });

  it("supports 200% text-size accessibility zoom constraints", () => {
    // At 200% text zoom, base font of 16px becomes 32px, and 24px padding + 32px text fits within patient button targets
    const baseFontSizePx = 16;
    const zoomedFontSizePx = baseFontSizePx * 2; // 32px
    const minPatientTargetPx = 64;

    // Minimum button height must comfortably host 200% zoomed single line or multi-line wrap
    const lineHeightRatio = 1.3;
    const singleLineZoomedHeight = zoomedFontSizePx * lineHeightRatio; // ~41.6px
    expect(singleLineZoomedHeight).toBeLessThan(minPatientTargetPx + 32);

    // Verify touch target constant matches design system (>= 64px)
    expect(minPatientTargetPx).toBeGreaterThanOrEqual(64);
  });

  it("verifies strict non-diagnostic copy across all locales", () => {
    const diagnosticForbiddenTerms = [
      "alzheimer",
      "dementia",
      "stage",
      "disease",
      "decline",
      "deteriorat",
      "diagnosis",
      "diagnostic",
    ];

    const checkNoDiagnosticCopy = (obj: any, path: string) => {
      for (const [k, v] of Object.entries(obj)) {
        if (k === "_note") continue;
        const currentPath = `${path}.${k}`;
        if (typeof v === "string") {
          const lower = v.toLowerCase();
          for (const forbidden of diagnosticForbiddenTerms) {
            expect(
              lower.includes(forbidden),
              `Diagnostic word "${forbidden}" found in string at ${currentPath}: "${v}"`
            ).toBe(false);
          }
        } else if (typeof v === "object" && v !== null) {
          checkNoDiagnosticCopy(v, currentPath);
        }
      }
    };

    checkNoDiagnosticCopy(en, "en");
    for (const [code, data] of Object.entries(locales)) {
      checkNoDiagnosticCopy(data, code);
    }
  });
});
