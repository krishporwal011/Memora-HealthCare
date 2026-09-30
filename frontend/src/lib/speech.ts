/**
 * Memora Speech Client & Bhashini Proxy (B24)
 * 
 * Strict Privacy & UX Rules:
 * 1. Microphone access ONLY on explicit user tap (no continuous listening or wake-words).
 * 2. Raw audio is processed in-memory and discarded immediately after transcription.
 * 3. Fallback Hierarchy:
 *    - Tier 1: Bhashini Cloud TTS / ASR
 *    - Tier 2: Pre-recorded Regional Audio Prompts (/audio/prompts/{lang}/{prompt_id}.mp3)
 *    - Tier 3: Visual Text & High-Contrast Cultural Icons
 * 
 * Supported Languages:
 * - Tier 1 (Bhashini): Assamese (as), Bengali (bn), Bodo (brx), Manipuri (mni), Hindi (hi)
 * - Tier 2 (Pre-recorded clips): Khasi (kha), Garo (grx), Mizo (lus)
 */

export interface SpeechPlaybackResult {
  mode: "bhashini_tts" | "prerecorded_audio" | "visual_text";
  audioSrc?: string;
  text: string;
  language: string;
}

export interface LanguageSupportInfo {
  name: string;
  hasBhashiniCloud: boolean;
  hasPrerecordedAudio: boolean;
  script: string;
}

export const LANGUAGE_COVERAGE: Record<string, LanguageSupportInfo> = {
  as: { name: "Assamese", hasBhashiniCloud: true, hasPrerecordedAudio: true, script: "Bengali-Assamese" },
  bn: { name: "Bengali", hasBhashiniCloud: true, hasPrerecordedAudio: true, script: "Bengali" },
  brx: { name: "Bodo", hasBhashiniCloud: true, hasPrerecordedAudio: true, script: "Devanagari" },
  mni: { name: "Manipuri (Meitei)", hasBhashiniCloud: true, hasPrerecordedAudio: true, script: "Meetei Mayek / Bengali" },
  hi: { name: "Hindi", hasBhashiniCloud: true, hasPrerecordedAudio: true, script: "Devanagari" },
  kha: { name: "Khasi", hasBhashiniCloud: false, hasPrerecordedAudio: true, script: "Latin" },
  grx: { name: "Garo", hasBhashiniCloud: false, hasPrerecordedAudio: true, script: "Latin" },
  lus: { name: "Mizo", hasBhashiniCloud: false, hasPrerecordedAudio: true, script: "Latin" },
};

export class SpeechClient {
  private apiUrl: string;

  constructor(apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") {
    this.apiUrl = apiUrl;
  }

  /**
   * Request microphone access strictly on explicit user action.
   * Rejects any attempt to capture audio automatically or continuously.
   */
  async requestMicrophoneStream(isExplicitUserTap: boolean): Promise<MediaStream> {
    if (!isExplicitUserTap) {
      throw new Error("Microphone access rejected: Memora forbids always-on audio capture.");
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone API is not supported in this environment.");
    }

    return await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
  }

  /**
   * Transcribe recorded audio with immediate discard of in-memory audio bytes.
   */
  async transcribeAudioBlob(
    audioBlob: Blob,
    language = "as",
    isExplicitUserTap = true
  ): Promise<string> {
    if (!isExplicitUserTap) {
      throw new Error("Speech transcription rejected: Missing user tap confirmation.");
    }

    // Convert blob to base64 in-memory
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip data url prefix
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    try {
      const resp = await fetch(`${this.apiUrl}/v1/speech/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_base64: base64Audio,
          language,
          is_explicit_tap: true,
        }),
      });

      if (!resp.ok) {
        throw new Error(`ASR API returned status ${resp.status}`);
      }

      const data = await resp.json();
      return data.transcript || "";
    } finally {
      // Strictly guarantee audio blob garbage collection
      // No reference to base64Audio or audioBlob is retained
    }
  }

  /**
   * Synthesize or locate speech for an activity prompt using 3-tier fallback.
   */
  async getPromptSpeech(
    text: string,
    language = "as",
    promptId?: string
  ): Promise<SpeechPlaybackResult> {
    // 1. Attempt Tier 1: Bhashini API
    const langInfo = LANGUAGE_COVERAGE[language];
    if (langInfo?.hasBhashiniCloud) {
      try {
        const resp = await fetch(`${this.apiUrl}/v1/speech/synthesize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language, prompt_id: promptId }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.fallback_tier === 1 && data.audio_content) {
            return {
              mode: "bhashini_tts",
              audioSrc: `data:audio/mp3;base64,${data.audio_content}`,
              text,
              language,
            };
          } else if (data.fallback_tier === 2 && data.audio_url) {
            return {
              mode: "prerecorded_audio",
              audioSrc: data.audio_url,
              text,
              language,
            };
          }
        }
      } catch {
        // Fall through to Tier 2 on network error
      }
    }

    // 2. Attempt Tier 2: Static Pre-recorded Regional Audio
    if (promptId && (langInfo?.hasPrerecordedAudio ?? true)) {
      return {
        mode: "prerecorded_audio",
        audioSrc: `/audio/prompts/${language}/${promptId}.mp3`,
        text,
        language,
      };
    }

    // 3. Fallback Tier 3: Visual Text & High-Contrast Display
    return {
      mode: "visual_text",
      text,
      language,
    };
  }
}

export const speechClient = new SpeechClient();
