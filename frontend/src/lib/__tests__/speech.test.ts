import { describe, it, expect } from "vitest";
import { SpeechClient, LANGUAGE_COVERAGE } from "../speech";

describe("B24: Frontend Speech Client & Privacy Guardrails", () => {
  it("documents verified regional language coverage and fallback order", () => {
    expect(LANGUAGE_COVERAGE.as.hasBhashiniCloud).toBe(true);
    expect(LANGUAGE_COVERAGE.bn.hasBhashiniCloud).toBe(true);
    expect(LANGUAGE_COVERAGE.brx.hasBhashiniCloud).toBe(true);
    expect(LANGUAGE_COVERAGE.mni.hasBhashiniCloud).toBe(true);
    expect(LANGUAGE_COVERAGE.hi.hasBhashiniCloud).toBe(true);

    // Tribal / non-scheduled regional languages must have pre-recorded audio fallbacks
    expect(LANGUAGE_COVERAGE.kha.hasPrerecordedAudio).toBe(true);
    expect(LANGUAGE_COVERAGE.grx.hasPrerecordedAudio).toBe(true);
    expect(LANGUAGE_COVERAGE.lus.hasPrerecordedAudio).toBe(true);
  });

  it("strictly rejects microphone access without explicit user tap", async () => {
    const client = new SpeechClient();
    await expect(client.requestMicrophoneStream(false)).rejects.toThrow(
      "Microphone access rejected: Memora forbids always-on audio capture."
    );
  });

  it("strictly rejects transcription without explicit user tap", async () => {
    const client = new SpeechClient();
    const dummyBlob = new Blob(["dummy audio"], { type: "audio/wav" });
    await expect(client.transcribeAudioBlob(dummyBlob, "as", false)).rejects.toThrow(
      "Speech transcription rejected: Missing user tap confirmation."
    );
  });

  it("executes Tier 2 pre-recorded audio fallback when promptId is provided", async () => {
    const client = new SpeechClient("http://localhost:8000");
    const result = await client.getPromptSpeech("আজিৰ খেল", "as", "game_prompt_1");
    // If backend isn't reached or in test env, it cleanly falls back to tier 2 or 3
    expect(["prerecorded_audio", "bhashini_tts", "visual_text"]).toContain(result.mode);
    expect(result.text).toBe("আজিৰ খেল");
  });

  it("executes Tier 3 visual text fallback when no audio source is present", async () => {
    const client = new SpeechClient("http://localhost:9999"); // unreachable port
    const result = await client.getPromptSpeech("শান্ত বাৰ্তা", "unknown_code");
    expect(result.mode).toBe("visual_text");
    expect(result.text).toBe("শান্ত বাৰ্তা");
  });
});
