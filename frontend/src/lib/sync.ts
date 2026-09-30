/**
 * Memora Offline-First Sync Client
 *
 * Requirements:
 * - Batches up to 200 events
 * - Deletes ONLY acknowledged events returned by server
 * - Retry with exponential backoff on network / transient failures
 * - Calm, accessible offline status text
 * - Automatic synchronization upon network reconnection
 */

import {
  getUnsyncedEvents,
  removeAcknowledgedEvents,
  type GameEventRecord,
} from "./offline";

export interface SyncConfig {
  apiUrl?: string;
  authToken?: string;
  maxBatchSize?: number; // max 200 per batch
  initialRetryDelayMs?: number; // default 1000ms
  maxRetryDelayMs?: number; // default 30000ms
  backoffFactor?: number; // default 2
  maxRetries?: number; // default 5
}

export interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  lastError: string | null;
  retryAttempt: number;
}

export interface SyncBatchResult {
  acknowledgedIds: string[];
  newTheta?: number;
  processedCount: number;
}

export interface SyncAllResult {
  totalSynced: number;
  totalAcknowledged: string[];
  remainingPending: number;
  success: boolean;
  error?: string;
}

const DEFAULT_CONFIG: Required<SyncConfig> = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  authToken: "caregiver-demo-ner",
  maxBatchSize: 200,
  initialRetryDelayMs: 1000,
  maxRetryDelayMs: 30000,
  backoffFactor: 2,
  maxRetries: 5,
};

let currentState: SyncState = {
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncTime: null,
  lastError: null,
  retryAttempt: 0,
};

type StateListener = (state: SyncState) => void;
const listeners = new Set<StateListener>();

export function getSyncState(): SyncState {
  return { ...currentState };
}

export function subscribeSyncState(listener: StateListener): () => void {
  listeners.add(listener);
  listener(getSyncState());
  return () => {
    listeners.delete(listener);
  };
}

function updateState(partial: Partial<SyncState>) {
  currentState = { ...currentState, ...partial };
  for (const listener of listeners) {
    listener(getSyncState());
  }
}

/**
 * Compute exponential backoff delay with upper clamp.
 */
export function calculateBackoffDelay(
  attempt: number,
  initialDelay = 1000,
  maxDelay = 30000,
  factor = 2
): number {
  if (attempt <= 0) return 0;
  const delay = initialDelay * Math.pow(factor, attempt - 1);
  return Math.min(delay, maxDelay);
}

/**
 * Send a single batch of up to 200 events to the server.
 * Critical rule: Only events acknowledged by the server are deleted locally.
 */
export async function syncBatch(
  events: GameEventRecord[],
  config: SyncConfig = {}
): Promise<SyncBatchResult> {
  if (events.length === 0) {
    return { acknowledgedIds: [], processedCount: 0 };
  }

  const resolvedConfig = { ...DEFAULT_CONFIG, ...config };
  const patientId = events[0].patient_id;

  // Format request matching OpenAPI BatchEventsRequest schema
  const payload = {
    patient_id: patientId,
    events: events.map((e) => ({
      id: e.id,
      patient_id: e.patient_id,
      session_id: e.session_id,
      domain: e.domain,
      item_id: e.item_id,
      difficulty: e.difficulty,
      correct: e.correct,
      response_time_ms: e.response_time_ms,
      timestamp: e.timestamp,
    })),
  };

  const response = await fetch(`${resolvedConfig.apiUrl}/v1/events:batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resolvedConfig.authToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Sync batch request failed with status ${response.status}: ${errorText}`
    );
  }

  const result = await response.json();
  const acknowledgedIds: string[] = result.acknowledged_ids || [];

  // Strictly delete ONLY IDs confirmed as persisted by the backend
  if (acknowledgedIds.length > 0) {
    await removeAcknowledgedEvents(acknowledgedIds);
  }

  return {
    acknowledgedIds,
    newTheta: result.new_theta,
    processedCount: acknowledgedIds.length,
  };
}

/**
 * Synchronize all unsynced events stored locally in batches of up to 200.
 * Retries with exponential backoff on failure.
 */
export async function syncAllUnsynced(config: SyncConfig = {}): Promise<SyncAllResult> {
  const resolvedConfig = { ...DEFAULT_CONFIG, ...config };

  if (currentState.isSyncing) {
    return {
      totalSynced: 0,
      totalAcknowledged: [],
      remainingPending: currentState.pendingCount,
      success: false,
      error: "Sync already in progress",
    };
  }

  updateState({ isSyncing: true, lastError: null });

  let totalSynced = 0;
  const allAcknowledged: string[] = [];

  try {
    let unsynced = await getUnsyncedEvents(resolvedConfig.maxBatchSize);
    updateState({ pendingCount: unsynced.length });

    while (unsynced.length > 0) {
      // Group events by patient_id so each batch request is for a single patient
      const patientGroups = new Map<string, GameEventRecord[]>();
      for (const ev of unsynced) {
        const group = patientGroups.get(ev.patient_id) || [];
        group.push(ev);
        patientGroups.set(ev.patient_id, group);
      }

      for (const [, patientEvents] of patientGroups.entries()) {
        const batchResult = await syncBatch(patientEvents, resolvedConfig);
        totalSynced += batchResult.processedCount;
        allAcknowledged.push(...batchResult.acknowledgedIds);
      }

      // Check if more events remain in Dexie
      unsynced = await getUnsyncedEvents(resolvedConfig.maxBatchSize);
      updateState({ pendingCount: unsynced.length });
    }

    updateState({
      isSyncing: false,
      lastSyncTime: Date.now(),
      lastError: null,
      retryAttempt: 0,
      pendingCount: 0,
    });

    return {
      totalSynced,
      totalAcknowledged: allAcknowledged,
      remainingPending: 0,
      success: true,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Sync failed";
    const nextAttempt = currentState.retryAttempt + 1;

    updateState({
      isSyncing: false,
      lastError: errorMsg,
      retryAttempt: nextAttempt,
    });

    return {
      totalSynced,
      totalAcknowledged: allAcknowledged,
      remainingPending: currentState.pendingCount,
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Setup automatic synchronization on network reconnect and window lifecycle.
 * Returns an unbind cleanup function.
 */
export function setupAutoSync(config: SyncConfig = {}): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = () => {
    updateState({ isOnline: true, retryAttempt: 0, lastError: null });
    // Trigger immediate sync on reconnection
    syncAllUnsynced(config).catch(() => {});
  };

  const handleOffline = () => {
    updateState({ isOnline: false });
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Initial sync attempt if online
  if (navigator.onLine) {
    syncAllUnsynced(config).catch(() => {});
  }

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

/**
 * Generate calm, reassuring, accessible offline/sync status copy.
 */
export function getSyncStatusMessage(
  state: SyncState,
  translations?: {
    offline?: string;
    syncing?: string;
    synced?: string;
    pending?: string;
  }
): string {
  if (!state.isOnline) {
    return (
      translations?.offline ||
      "Working offline. Your activities are safely saved on this device."
    );
  }

  if (state.isSyncing) {
    return translations?.syncing || "Saving activities...";
  }

  if (state.pendingCount > 0) {
    return (
      translations?.pending ||
      `${state.pendingCount} activity event(s) saved locally. Will sync automatically.`
    );
  }

  return translations?.synced || "All activities saved.";
}
