"use client";

import React, { useState, useEffect } from "react";
import { useMemoraStore } from "@/lib/store/useMemoraStore";
import { LandingAlbumView } from "./LandingAlbumView";
import { LandingGalleryView } from "./LandingGalleryView";
import { EntryChoiceModal } from "./EntryChoiceModal";

export function HomeClientContainer() {
  const { displayMode, calmMode, setDisplayMode } = useMemoraStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before hydration, render the calm editorial Album view
  if (!mounted) {
    return <LandingAlbumView />;
  }

  const isGallery = displayMode === "gallery" && !calmMode;

  return (
    <>
      <EntryChoiceModal />
      {isGallery ? (
        <LandingGalleryView onToggleAlbum={() => setDisplayMode("album")} />
      ) : (
        <LandingAlbumView onToggleGallery={() => setDisplayMode("gallery")} />
      )}
    </>
  );
}
