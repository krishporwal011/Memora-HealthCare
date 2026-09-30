import { describe, it, expect } from "vitest";
import { generateUUIDv7 } from "../offline";

describe("Client-side UUIDv7 Generation", () => {
  it("generates valid RFC 9562 UUIDv7 format", () => {
    const id1 = generateUUIDv7();
    const id2 = generateUUIDv7();

    // Standard UUID format: 8-4-4-4-12 hex characters
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id1).toMatch(uuidRegex);
    expect(id2).toMatch(uuidRegex);

    // Uniqueness
    expect(id1).not.toBe(id2);
  });

  it("generates monotonically sortable timestamps in UUIDv7", () => {
    const id1 = generateUUIDv7();
    const id2 = generateUUIDv7();

    // In string comparison, lexicographical sorting aligns with time ordering
    expect(id1 <= id2).toBe(true);
  });
});
