"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useMemoraStore } from "@/lib/store/useMemoraStore";
import { MemoryHouseAlbumFallback } from "./components/MemoryHouseAlbumFallback";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

// Lazy-load the heavy 3D R3F Canvas component to keep it isolated from the shared bundle
const MemoryHouseScene = dynamic(
  () => import("./components/MemoryHouseScene").then((mod) => mod.MemoryHouseScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-[var(--radius-card)] bg-[var(--surface)] border border-[var(--border)]">
        <SkeletonLoader variant="card" className="w-full max-w-md h-64" />
        <span className="text-sm font-bold text-[var(--ink-soft)]">
          Constructing Architectural Memory Hall…
        </span>
      </div>
    ),
  }
);

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function MemoryHousePage() {
  const { calmMode } = useMemoraStore();
  const [mounted, setMounted] = useState(false);
  const [forceFallbackReason, setForceFallbackReason] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    if (calmMode) {
      setForceFallbackReason("Calm Mode active");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setForceFallbackReason("Reduced motion preference");
      return;
    }

    const isSaveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (isSaveData) {
      setForceFallbackReason("Save-Data data saver active");
      return;
    }

    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    if (typeof deviceMemory === "number" && deviceMemory <= 4) {
      setForceFallbackReason("Low memory device detected");
      return;
    }

    if (!checkWebGLSupport()) {
      setForceFallbackReason("WebGL hardware acceleration not supported");
      return;
    }
  }, [calmMode]);

  // SSR or initial hydration fallback
  if (!mounted) {
    return <MemoryHouseAlbumFallback reason="Loading environment…" />;
  }

  if (forceFallbackReason || calmMode) {
    return (
      <MemoryHouseAlbumFallback
        reason={forceFallbackReason || "Calm Mode"}
        onRetry3D={() => setForceFallbackReason(null)}
      />
    );
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 space-y-6">
      <MemoryHouseScene
        onFpsDrop={() => setForceFallbackReason("Frame rate dipped below 40 FPS")}
        onExit={() => setForceFallbackReason("User exited 3D View")}
      />
    </div>
  );
}
