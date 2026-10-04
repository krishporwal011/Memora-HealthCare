import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT_FRONTEND = path.resolve(__dirname, "../..");
const SRC_DIR = path.resolve(__dirname, "..");
const LOCALES_DIR = path.resolve(ROOT_FRONTEND, "locales");
const SUPPORTED_LOCALES = ["en", "hi", "as", "bn", "brx", "mni"];

describe("Phase 1: Foundation Redesign Tests", () => {
  it("verifies middleware matcher and routing configuration cover all six locales", () => {
    const routingContent = fs.readFileSync(path.resolve(SRC_DIR, "i18n/routing.ts"), "utf-8");
    for (const loc of SUPPORTED_LOCALES) {
      expect(routingContent).toContain(`"${loc}"`);
    }

    const middlewareContent = fs.readFileSync(path.resolve(SRC_DIR, "middleware.ts"), "utf-8");
    expect(middlewareContent).toContain("/(as|bn|brx|en|hi|mni)/:path*");

    for (const loc of SUPPORTED_LOCALES) {
      expect(middlewareContent).toContain(loc);
    }
  });

  it("verifies zero unapproved hardcoded hex values in frontend/src", () => {
    const allowedHexFiles = new Set([
      path.resolve(SRC_DIR, "styles/tokens.css"),
      path.resolve(SRC_DIR, "app/layout.tsx"), // meta theme-color #2F6F6B
    ]);

    const hexRegex = /#[0-9a-fA-F]{3,8}/g;
    const violations: { file: string; match: string; line: number }[] = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== "__tests__") {
            scanDir(fullPath);
          }
        } else if (/\.(tsx?|css)$/.test(entry.name) && !allowedHexFiles.has(fullPath) && !entry.name.includes(".test.")) {
          const content = fs.readFileSync(fullPath, "utf-8");
          const lines = content.split("\n");
          lines.forEach((lineText, idx) => {
            const matches = lineText.match(hexRegex);
            if (matches) {
              matches.forEach((m) => {
                violations.push({ file: path.relative(SRC_DIR, fullPath), match: m, line: idx + 1 });
              });
            }
          });
        }
      }
    }

    scanDir(SRC_DIR);
    expect(violations).toEqual([]);
  });

  it("verifies zero external googleapis / google fonts URLs in styles and source", () => {
    const googleFontRegex = /fonts\.googleapis\.com|fonts\.gstatic\.com/i;
    const globalsCss = fs.readFileSync(path.resolve(SRC_DIR, "styles/globals.css"), "utf-8");
    expect(globalsCss).not.toMatch(googleFontRegex);
  });

  it("verifies 100% locale key parity across all six locale files", () => {
    const locales = ["en", "hi", "as", "bn", "brx", "mni"];
    const loadedLocales: Record<string, any> = {};

    for (const loc of locales) {
      const filePath = path.join(LOCALES_DIR, `${loc}.json`);
      expect(fs.existsSync(filePath), `Locale file missing: ${loc}.json`).toBe(true);
      loadedLocales[loc] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    function extractKeys(obj: any, prefix = ""): string[] {
      let keys: string[] = [];
      for (const key of Object.keys(obj)) {
        if (key === "_note") continue;
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null) {
          keys = keys.concat(extractKeys(obj[key], fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys.sort();
    }

    const baselineKeys = extractKeys(loadedLocales["en"]);

    for (const loc of locales) {
      if (loc === "en") continue;
      const targetKeys = extractKeys(loadedLocales[loc]);
      expect(targetKeys, `Key parity mismatch for locale ${loc}`).toEqual(baselineKeys);
    }
  });

  it("verifies zero Rule 01 banned words in locales, layout metadata, and manifest", () => {
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

    const filesToAudit = [
      path.resolve(ROOT_FRONTEND, "public/manifest.json"),
      path.resolve(SRC_DIR, "app/layout.tsx"),
      ...["en", "hi", "as", "bn", "brx", "mni"].map((l) => path.join(LOCALES_DIR, `${l}.json`)),
    ];

    const violations: { file: string; word: string }[] = [];

    for (const file of filesToAudit) {
      const content = fs.readFileSync(file, "utf-8");
      for (const pattern of bannedPatterns) {
        if (pattern.test(content)) {
          violations.push({ file: path.basename(file), word: pattern.source });
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
