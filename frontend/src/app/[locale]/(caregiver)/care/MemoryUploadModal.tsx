"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

export interface MemoryItem {
  id: string;
  memory_type: "photo" | "song" | "story";
  caption: string;
  people: string[];
  year?: number;
  signed_url?: string;
  is_approved: boolean;
  is_offline_pending?: boolean;
  created_at: string;
}

interface MemoryUploadModalProps {
  patientId: string;
  onClose: () => void;
  onMemoryAdded: (memory: MemoryItem) => void;
}

export function MemoryUploadModal({ patientId, onClose, onMemoryAdded }: MemoryUploadModalProps) {
  const locale = useLocale();

  const [memoryType, setMemoryType] = useState<"photo" | "song" | "story">("photo");
  const [caption, setCaption] = useState("");
  const [peopleInput, setPeopleInput] = useState("");
  const [yearInput, setYearInput] = useState<string>("");
  const [isApproved, setIsApproved] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Requirement: Caption required!
    if (!caption.trim()) {
      setErrorMessage("Caption is required to personalize activities.");
      return;
    }

    const people = peopleInput
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const year = yearInput ? parseInt(yearInput, 10) : undefined;

    setIsUploading(true);
    setUploadProgress(15);

    try {
      if (isOnline) {
        setUploadProgress(45);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/v1/patients/${patientId}/memories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer caregiver-demo-ner",
          },
          body: JSON.stringify({
            memory_type: memoryType,
            caption: caption.trim(),
            people,
            year,
            file_path: fileName ? `${patientId}/${memoryType}s/${fileName}` : undefined,
          }),
        });

        setUploadProgress(85);

        if (response.ok) {
          const savedData = await response.json();
          setUploadProgress(100);
          onMemoryAdded(savedData);
          onClose();
          return;
        }
      }

      // Offline fallback: save locally to device
      setUploadProgress(100);
      const offlineMemory: MemoryItem = {
        id: `offline-mem-${Date.now()}`,
        memory_type: memoryType,
        caption: caption.trim(),
        people,
        year,
        is_approved: isApproved,
        is_offline_pending: true,
        created_at: new Date().toISOString(),
      };

      onMemoryAdded(offlineMemory);
      onClose();
    } catch {
      // 3G throttle / network error resilience: save locally
      const fallbackMemory: MemoryItem = {
        id: `offline-mem-${Date.now()}`,
        memory_type: memoryType,
        caption: caption.trim(),
        people,
        year,
        is_approved: isApproved,
        is_offline_pending: true,
        created_at: new Date().toISOString(),
      };
      onMemoryAdded(fallbackMemory);
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border-2 border-[#1B3B36] shadow-xl space-y-6 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-[#D1CEC4]">
          <h2 id="modal-title" className="text-xl md:text-2xl font-bold text-[#1C1C1A]">
            Add Family Memory
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 text-[#52504C] hover:text-[#1C1C1A] text-xl rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Offline notice if offline */}
        {!isOnline && (
          <div
            role="status"
            className="bg-[#FFF8E7] text-[#7A5800] border border-[#E0D0A0] p-3 rounded-2xl flex items-center gap-2 text-xs font-medium"
          >
            <span aria-hidden="true">📡</span>
            <span>Working offline. Memory will be saved locally on this phone and synced later.</span>
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="bg-[#FDF1EC] text-[#9A3412] p-3 rounded-xl border border-[#F5C2B1] text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Memory Type Selector */}
          <div>
            <span className="block text-sm font-semibold text-[#1C1C1A] mb-2">Memory Type</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMemoryType("photo")}
                className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold border-2 transition-colors flex flex-col items-center gap-1 ${
                  memoryType === "photo"
                    ? "border-[#1B3B36] bg-[#EAF3EE] text-[#1B3B36]"
                    : "border-[#D1CEC4] bg-white text-[#52504C] hover:bg-[#F8F6F0]"
                }`}
                style={{ minHeight: "48px" }}
              >
                <span className="text-lg" aria-hidden="true">📸</span>
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setMemoryType("song")}
                className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold border-2 transition-colors flex flex-col items-center gap-1 ${
                  memoryType === "song"
                    ? "border-[#1B3B36] bg-[#EAF3EE] text-[#1B3B36]"
                    : "border-[#D1CEC4] bg-white text-[#52504C] hover:bg-[#F8F6F0]"
                }`}
                style={{ minHeight: "48px" }}
              >
                <span className="text-lg" aria-hidden="true">🎵</span>
                <span>Song / Audio</span>
              </button>

              <button
                type="button"
                onClick={() => setMemoryType("story")}
                className={`py-3 px-2 rounded-xl text-xs md:text-sm font-bold border-2 transition-colors flex flex-col items-center gap-1 ${
                  memoryType === "story"
                    ? "border-[#1B3B36] bg-[#EAF3EE] text-[#1B3B36]"
                    : "border-[#D1CEC4] bg-white text-[#52504C] hover:bg-[#F8F6F0]"
                }`}
                style={{ minHeight: "48px" }}
              >
                <span className="text-lg" aria-hidden="true">📖</span>
                <span>Story</span>
              </button>
            </div>
          </div>

          {/* Caption (Strictly Required) */}
          <div>
            <label htmlFor="memory-caption" className="block text-sm font-semibold text-[#1C1C1A] mb-1">
              Caption / Memory Description <span className="text-[#C85A32]">*</span>
            </label>
            <textarea
              id="memory-caption"
              rows={3}
              required
              placeholder="e.g. Rongali Bihu festival harvest celebration at ancestral home in Tezpur"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-[#1B3B36] text-base outline-hidden"
            />
          </div>

          {/* People & Year in 2 cols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="memory-people" className="block text-xs font-semibold text-[#52504C] mb-1">
                People (comma separated)
              </label>
              <input
                id="memory-people"
                type="text"
                placeholder="Grandmother, Ranjit"
                value={peopleInput}
                onChange={(e) => setPeopleInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D1CEC4] text-sm outline-hidden"
                style={{ minHeight: "44px" }}
              />
            </div>

            <div>
              <label htmlFor="memory-year" className="block text-xs font-semibold text-[#52504C] mb-1">
                Approximate Year
              </label>
              <input
                id="memory-year"
                type="number"
                placeholder="1985"
                min={1920}
                max={2026}
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D1CEC4] text-sm outline-hidden"
                style={{ minHeight: "44px" }}
              />
            </div>
          </div>

          {/* File Selection Placeholder */}
          {memoryType !== "story" && (
            <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#D1CEC4] flex items-center justify-between">
              <span className="text-xs text-[#52504C]">
                {fileName ? `File: ${fileName}` : `Select ${memoryType === "photo" ? "Photo (.jpg, .png)" : "Audio (.mp3, .wav)"}`}
              </span>
              <button
                type="button"
                onClick={() => setFileName(`bihu_memory_${Date.now()}.${memoryType === "photo" ? "jpg" : "mp3"}`)}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D1CEC4] text-xs font-semibold text-[#1B3B36] hover:bg-[#F2EFE9]"
              >
                {fileName ? "Change" : "Choose File"}
              </button>
            </div>
          )}

          {/* Approval Status Toggle */}
          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D1CEC4] flex items-center justify-between">
            <div>
              <span className="font-semibold text-xs text-[#1C1C1A] block">
                Approve for Reminiscence Activities
              </span>
              <span className="text-[11px] text-[#52504C] block">
                Approved memories appear in personalized matching cards and gentle questions
              </span>
            </div>
            <input
              type="checkbox"
              id="memory-approved"
              checked={isApproved}
              onChange={(e) => setIsApproved(e.target.checked)}
              className="w-5 h-5 rounded accent-[#1B3B36] cursor-pointer"
            />
          </div>

          {/* Upload Progress Bar for 3G / Slow Network Feedback */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#52504C] font-semibold">
                <span>{uploadProgress < 100 ? "Uploading asset..." : "Saved!"}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#E5E5E0] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1B3B36] h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#D1CEC4] text-sm font-semibold text-[#52504C] hover:bg-[#F2EFE9]"
              style={{ minHeight: "44px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !caption.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#1B3B36] hover:bg-[#2D6A4F] text-white text-sm font-bold shadow-xs transition-colors disabled:opacity-50"
              style={{ minHeight: "44px" }}
            >
              {isUploading ? "Saving..." : "Save Memory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
