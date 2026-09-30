import Dexie, { type Table } from "dexie";

export interface GameEventRecord {
  id: string; // Client-generated UUIDv7
  patient_id: string;
  session_id: string;
  domain: string;
  item_id: string;
  difficulty: number;
  correct: boolean;
  response_time_ms: number;
  timestamp: string;
  synced: number; // 0 = unacknowledged, 1 = acknowledged
}

export interface PatientStateRecord {
  patient_id: string;
  theta: number;
  answers_count: number;
  recent_item_ids: string[];
  updated_at: string;
}

export class MemoraDatabase extends Dexie {
  events!: Table<GameEventRecord, string>;
  patient_state!: Table<PatientStateRecord, string>;

  constructor() {
    super("MemoraDB");
    this.version(1).stores({
      events: "id, patient_id, session_id, domain, synced, timestamp",
      patient_state: "patient_id",
    });
  }
}

export const db = new MemoraDatabase();

/**
 * Generate a UUIDv7 (timestamp-ordered UUID) client-side.
 * Conforms to RFC 9562 for monotonically sortable unique identifiers.
 */
export function generateUUIDv7(): string {
  const now = Date.now();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Timestamp in ms (48 bits)
  bytes[0] = (now / 0x10000000000) & 0xff;
  bytes[1] = (now / 0x100000000) & 0xff;
  bytes[2] = (now / 0x1000000) & 0xff;
  bytes[3] = (now / 0x10000) & 0xff;
  bytes[4] = (now / 0x100) & 0xff;
  bytes[5] = now & 0xff;

  // Version 7: set bits 4-7 to 0111 (0x70)
  bytes[6] = 0x70 | (bytes[6] & 0x0f);

  // Variant 1 (RFC 4122/9562): set bits 6-7 to 10 (0x80)
  bytes[8] = 0x80 | (bytes[8] & 0x3f);

  // Format as standard UUID string (8-4-4-4-12)
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Save an activity event offline with guaranteed client-generated UUIDv7.
 */
export async function recordGameEventOffline(
  eventData: Omit<GameEventRecord, "id" | "synced" | "timestamp"> & {
    id?: string;
    timestamp?: string;
  }
): Promise<GameEventRecord> {
  const record: GameEventRecord = {
    id: eventData.id || generateUUIDv7(),
    patient_id: eventData.patient_id,
    session_id: eventData.session_id,
    domain: eventData.domain,
    item_id: eventData.item_id,
    difficulty: eventData.difficulty,
    correct: eventData.correct,
    response_time_ms: eventData.response_time_ms,
    timestamp: eventData.timestamp || new Date().toISOString(),
    synced: 0,
  };

  await db.events.put(record);
  return record;
}

/**
 * Fetch a batch of unsynced events (max 200).
 */
export async function getUnsyncedEvents(batchSize = 200): Promise<GameEventRecord[]> {
  return await db.events.where("synced").equals(0).limit(batchSize).toArray();
}

/**
 * Delete only acknowledged events after the server confirms persistence.
 */
export async function removeAcknowledgedEvents(acknowledgedIds: string[]): Promise<void> {
  if (acknowledgedIds.length === 0) return;
  await db.events.bulkDelete(acknowledgedIds);
}
