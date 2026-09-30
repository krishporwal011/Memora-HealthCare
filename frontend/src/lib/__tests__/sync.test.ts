import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateBackoffDelay,
  syncBatch,
  syncAllUnsynced,
  getSyncStatusMessage,
  setupAutoSync,
  getSyncState,
} from "../sync";
import * as offlineModule from "../offline";

describe("Memora Offline Sync Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Exponential Backoff Calculation", () => {
    it("calculates exponential backoff delays with upper clamp", () => {
      expect(calculateBackoffDelay(0)).toBe(0);
      expect(calculateBackoffDelay(1, 1000, 30000, 2)).toBe(1000);
      expect(calculateBackoffDelay(2, 1000, 30000, 2)).toBe(2000);
      expect(calculateBackoffDelay(3, 1000, 30000, 2)).toBe(4000);
      expect(calculateBackoffDelay(4, 1000, 30000, 2)).toBe(8000);
      expect(calculateBackoffDelay(5, 1000, 30000, 2)).toBe(16000);
      expect(calculateBackoffDelay(6, 1000, 30000, 2)).toBe(30000); // clamped at 30s
      expect(calculateBackoffDelay(10, 1000, 30000, 2)).toBe(30000); // clamped at 30s
    });
  });

  describe("Batch Sync & Strict Acknowledged Deletion", () => {
    it("deletes ONLY acknowledged IDs returned by the server", async () => {
      const ev1: offlineModule.GameEventRecord = {
        id: "018f3a2b-8c4d-7123-8abc-012345678001",
        patient_id: "patient-1",
        session_id: "session-1",
        domain: "memory_match",
        item_id: "card-01",
        difficulty: 0.0,
        correct: true,
        response_time_ms: 1200,
        timestamp: "2026-10-01T10:00:00Z",
        synced: 0,
      };
      const ev2: offlineModule.GameEventRecord = {
        id: "018f3a2b-8c4d-7123-8abc-012345678002",
        patient_id: "patient-1",
        session_id: "session-1",
        domain: "memory_match",
        item_id: "card-02",
        difficulty: 0.5,
        correct: false,
        response_time_ms: 1800,
        timestamp: "2026-10-01T10:01:00Z",
        synced: 0,
      };

      // Mock removeAcknowledgedEvents
      const removeSpy = vi.spyOn(offlineModule, "removeAcknowledgedEvents").mockResolvedValue(undefined);

      // Mock fetch: server acknowledges ONLY ev1, NOT ev2
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          acknowledged_ids: [ev1.id],
          new_theta: 0.25,
          processed_count: 1,
        }),
      } as unknown as Response);

      const result = await syncBatch([ev1, ev2], { apiUrl: "http://localhost:8000" });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(result.acknowledgedIds).toEqual([ev1.id]);
      expect(result.processedCount).toBe(1);

      // Verify strict ack rule: removeAcknowledgedEvents was called with ONLY ev1.id
      expect(removeSpy).toHaveBeenCalledWith([ev1.id]);
      expect(removeSpy).not.toHaveBeenCalledWith(expect.arrayContaining([ev2.id]));
    });

    it("does not delete any local events when server request fails", async () => {
      const ev: offlineModule.GameEventRecord = {
        id: "018f3a2b-8c4d-7123-8abc-012345678003",
        patient_id: "patient-1",
        session_id: "session-1",
        domain: "memory_match",
        item_id: "card-01",
        difficulty: 0.0,
        correct: true,
        response_time_ms: 1000,
        timestamp: "2026-10-01T10:00:00Z",
        synced: 0,
      };

      const removeSpy = vi.spyOn(offlineModule, "removeAcknowledgedEvents").mockResolvedValue(undefined);

      // Mock server 500 error
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      } as unknown as Response);

      await expect(syncBatch([ev], { apiUrl: "http://localhost:8000" })).rejects.toThrow("500");

      // Verify zero deletions
      expect(removeSpy).not.toHaveBeenCalled();
    });
  });

  describe("Offline Replay & Tab Interruption Scenario", () => {
    it("simulates tab close mid-sync and replay: verifies no events lost and idempotent sync", async () => {
      const testEvents: offlineModule.GameEventRecord[] = [
        {
          id: "018f3a2b-8c4d-7123-8abc-012345678004",
          patient_id: "patient-1",
          session_id: "session-1",
          domain: "memory_match",
          item_id: "card-01",
          difficulty: 0.0,
          correct: true,
          response_time_ms: 1100,
          timestamp: "2026-10-01T10:00:00Z",
          synced: 0,
        },
      ];

      // 1. Initial attempt: simulated network disconnect mid-flight
      vi.spyOn(offlineModule, "getUnsyncedEvents")
        .mockResolvedValueOnce(testEvents) // run1 initial fetch
        .mockResolvedValueOnce(testEvents) // run2 retry fetch (replayed from queue)
        .mockResolvedValueOnce([]); // run2 subsequent fetch (drained)

      const removeSpy = vi.spyOn(offlineModule, "removeAcknowledgedEvents").mockResolvedValue(undefined);

      vi.spyOn(globalThis, "fetch")
        .mockRejectedValueOnce(new Error("Network connection lost"))
        // 2. Tab reopened / retry: server responds with ack
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            acknowledged_ids: [testEvents[0].id],
            new_theta: 0.15,
            processed_count: 1,
          }),
        } as unknown as Response);

      // First run fails
      const run1 = await syncAllUnsynced();
      expect(run1.success).toBe(false);
      expect(run1.error).toContain("Network connection lost");
      expect(removeSpy).not.toHaveBeenCalled();

      // Second run succeeds (idempotent replay)
      const run2 = await syncAllUnsynced();
      expect(run2.success).toBe(true);
      expect(run2.totalSynced).toBe(1);
      expect(run2.totalAcknowledged).toContain(testEvents[0].id);
      expect(removeSpy).toHaveBeenCalledWith([testEvents[0].id]);
    });
  });

  describe("Calm Status Text", () => {
    it("provides accessible, non-alarmist status copy", () => {
      const offlineMsg = getSyncStatusMessage({
        isOnline: false,
        isSyncing: false,
        pendingCount: 2,
        lastSyncTime: null,
        lastError: null,
        retryAttempt: 0,
      });
      expect(offlineMsg).toContain("Working offline");

      const syncingMsg = getSyncStatusMessage({
        isOnline: true,
        isSyncing: true,
        pendingCount: 2,
        lastSyncTime: null,
        lastError: null,
        retryAttempt: 0,
      });
      expect(syncingMsg).toContain("Saving activities");

      const syncedMsg = getSyncStatusMessage({
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: Date.now(),
        lastError: null,
        retryAttempt: 0,
      });
      expect(syncedMsg).toContain("All activities saved");
    });
  });
});
