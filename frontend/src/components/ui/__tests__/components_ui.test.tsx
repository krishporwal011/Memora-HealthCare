import { describe, it, expect } from "vitest";
import { BigButton } from "../BigButton";
import { StatusChip } from "../StatusChip";
import { DayHeader } from "../DayHeader";
import { SectionHeader } from "../SectionHeader";
import { Disclosure } from "../Disclosure";
import { EmptyState } from "../EmptyState";
import { SyncStatusChip } from "../SyncStatusChip";
import { OfflineBanner } from "../OfflineBanner";
import { SkeletonLoader } from "../SkeletonLoader";
import { MemoryCard } from "../MemoryCard";

describe("Phase 2: Design System Components", () => {
  it("exports BigButton component function", () => {
    expect(typeof BigButton).toBe("function");
  });

  it("exports StatusChip component function", () => {
    expect(typeof StatusChip).toBe("function");
  });

  it("exports DayHeader component function", () => {
    expect(typeof DayHeader).toBe("function");
  });

  it("exports SectionHeader component function", () => {
    expect(typeof SectionHeader).toBe("function");
  });

  it("exports Disclosure component function", () => {
    expect(typeof Disclosure).toBe("function");
  });

  it("exports EmptyState component function", () => {
    expect(typeof EmptyState).toBe("function");
  });

  it("exports SyncStatusChip component function", () => {
    expect(typeof SyncStatusChip).toBe("function");
  });

  it("exports OfflineBanner component function", () => {
    expect(typeof OfflineBanner).toBe("function");
  });

  it("exports SkeletonLoader component function", () => {
    expect(typeof SkeletonLoader).toBe("function");
  });

  it("exports photo-led MemoryCard component function", () => {
    expect(typeof MemoryCard).toBe("function");
  });
});
