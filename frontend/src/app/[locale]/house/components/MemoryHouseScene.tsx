"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Volume2, VolumeX, X, Calendar, Users, Camera, Info } from "lucide-react";
import { HOUSE_MEMORIES, type HouseMemory } from "./MemoryHouseAlbumFallback";
import { BigButton } from "@/components/ui/BigButton";

interface MemoryHouseSceneProps {
  onFpsDrop: () => void;
  onExit: () => void;
}

// ── Particle Dust Cloud ──
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 180;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 20;
      pos[i + 1] = (Math.random() - 0.5) * 10;
      pos[i + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={0xE8A33D}
        transparent
        opacity={0.6}
      />
    </points>
  );
}

// ── Wireframe Architectural Hall ──
function WireframeHall() {
  return (
    <group>
      {/* Floor grid */}
      <gridHelper args={[24, 24, 0x2F6F6B, 0x1F4E4B]} position={[0, -2, 0]} />

      {/* Wireframe Hall Arches */}
      {[-6, -3, 0, 3, 6].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(10, 4, 0.1)]} />
            <lineBasicMaterial color={0x2F6F6B} transparent opacity={0.3} />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

// ── Floating Framed Memory ──
function FramedMemory({
  memory,
  position,
  onSelect,
}: {
  memory: HouseMemory;
  position: [number, number, number];
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[2.2, 1.6, 0.1]} />
      <meshStandardMaterial
        color={hovered ? 0xE8A33D : 0x1F4E4B}
        emissive={hovered ? 0xE8A33D : 0x2F6F6B}
        emissiveIntensity={hovered ? 0.5 : 0.2}
        roughness={0.4}
      />
    </mesh>
  );
}

// ── Camera Controller & FPS Monitor ──
function SceneController({
  onFpsDrop,
  onSelectMemory,
  cameraPos,
}: {
  onFpsDrop: () => void;
  onSelectMemory: (mem: HouseMemory) => void;
  cameraPos: { x: number; y: number; z: number };
}) {
  const lastTimeRef = useRef(performance.now());
  const framesRef = useRef(0);
  const lowFpsCountRef = useRef(0);

  useFrame((state) => {
    // Smooth camera interpolation towards cameraPos
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, cameraPos.x, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, cameraPos.y, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, cameraPos.z, 0.05);
    state.camera.lookAt(0, 0, cameraPos.z - 4);

    // FPS Health Check
    framesRef.current += 1;
    const now = performance.now();
    if (now - lastTimeRef.current >= 1000) {
      const fps = (framesRef.current * 1000) / (now - lastTimeRef.current);
      if (fps < 40) {
        lowFpsCountRef.current += 1;
        if (lowFpsCountRef.current >= 2) {
          onFpsDrop();
        }
      } else {
        lowFpsCountRef.current = 0;
      }
      framesRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 4, 0]} intensity={1.5} color={0xF9F6F0} />
      <ParticleField />
      <WireframeHall />

      {/* Floating Framed Memory Panels */}
      <FramedMemory
        memory={HOUSE_MEMORIES[0]}
        position={[-3, 0.5, -2]}
        onSelect={() => onSelectMemory(HOUSE_MEMORIES[0])}
      />
      <FramedMemory
        memory={HOUSE_MEMORIES[1]}
        position={[3, 0.5, -2]}
        onSelect={() => onSelectMemory(HOUSE_MEMORIES[1])}
      />
      <FramedMemory
        memory={HOUSE_MEMORIES[2]}
        position={[-3, 0.5, -5]}
        onSelect={() => onSelectMemory(HOUSE_MEMORIES[2])}
      />
      <FramedMemory
        memory={HOUSE_MEMORIES[3]}
        position={[3, 0.5, -5]}
        onSelect={() => onSelectMemory(HOUSE_MEMORIES[3])}
      />
    </>
  );
}

export function MemoryHouseScene({ onFpsDrop, onExit }: MemoryHouseSceneProps) {
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0.5, z: 4 });
  const [selectedMemory, setSelectedMemory] = useState<HouseMemory | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") {
        setCameraPos((prev) => ({ ...prev, z: Math.max(prev.z - 1, -4) }));
      } else if (e.key === "ArrowDown" || e.key === "s") {
        setCameraPos((prev) => ({ ...prev, z: Math.min(prev.z + 1, 6) }));
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        setCameraPos((prev) => ({ ...prev, x: Math.max(prev.x - 0.8, -3) }));
      } else if (e.key === "ArrowRight" || e.key === "d") {
        setCameraPos((prev) => ({ ...prev, x: Math.min(prev.x + 0.8, 3) }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const moveForward = () => setCameraPos((prev) => ({ ...prev, z: Math.max(prev.z - 1, -4) }));
  const moveBackward = () => setCameraPos((prev) => ({ ...prev, z: Math.min(prev.z + 1, 6) }));
  const moveLeft = () => setCameraPos((prev) => ({ ...prev, x: Math.max(prev.x - 0.8, -3) }));
  const moveRight = () => setCameraPos((prev) => ({ ...prev, x: Math.min(prev.x + 0.8, 3) }));

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative w-full h-[85vh] bg-[var(--ink)] text-[var(--bg)] overflow-hidden rounded-[var(--radius-card)] border-2 border-[var(--primary)] shadow-2xl">
      {/* ── 3D Canvas ── */}
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 60 }}
        dpr={Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1, 2)}
        onCreated={({ gl }) => {
          gl.setClearColor(0x1A1917);
        }}
      >
        <SceneController
          onFpsDrop={onFpsDrop}
          onSelectMemory={(m) => setSelectedMemory(m)}
          cameraPos={cameraPos}
        />
      </Canvas>

      {/* ── On-Screen Camera Touch Controls (56px Targets) ── */}
      <div
        className="absolute bottom-6 left-6 z-20 flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-card)] backdrop-blur-md border shadow-lg"
        style={{
          background: "rgba(26, 25, 23, 0.8)",
          borderColor: "rgba(255, 255, 255, 0.2)",
        }}
      >
        <button
          type="button"
          onClick={moveForward}
          className="w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-90 hover:bg-white/10 cursor-pointer"
          style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
          aria-label="Walk camera forward"
        >
          <ArrowUp size={24} />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={moveLeft}
            className="w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-90 hover:bg-white/10 cursor-pointer"
            style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
            aria-label="Pan camera left"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            type="button"
            onClick={moveBackward}
            className="w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-90 hover:bg-white/10 cursor-pointer"
            style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
            aria-label="Walk camera backward"
          >
            <ArrowDown size={24} />
          </button>
          <button
            type="button"
            onClick={moveRight}
            className="w-14 h-14 rounded-full border flex items-center justify-center transition-all active:scale-90 hover:bg-white/10 cursor-pointer"
            style={{ borderColor: "rgba(255, 255, 255, 0.3)" }}
            aria-label="Pan camera right"
          >
            <ArrowRight size={24} />
          </button>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">
          Walk Controls
        </span>
      </div>

      {/* ── Top HUD Strip ── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={onExit}
          className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold backdrop-blur-md hover:bg-white/10 cursor-pointer"
          style={{
            background: "rgba(26, 25, 23, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.25)",
            color: "var(--bg)",
          }}
        >
          <ArrowLeft size={16} />
          <span>Exit 3D House</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/20 bg-black/50">
          Click frames to inspect
        </span>
      </div>

      {/* ── Memory Detail Zoom Modal ── */}
      {selectedMemory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedMemory.title}
          className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
        >
          <div
            className="w-full max-w-lg rounded-[var(--radius-card)] p-6 md:p-8 space-y-6 border-2 shadow-2xl"
            style={{
              background: "var(--surface)",
              borderColor: "var(--accent)",
              color: "var(--ink)",
            }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border-soft)" }}>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-dark)]">
                Framed Memory Detail
              </span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsSpeaking(false);
                  setSelectedMemory(null);
                }}
                className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:bg-[var(--surface-2)] cursor-pointer"
                style={{ borderColor: "var(--border)" }}
                aria-label="Close memory detail"
              >
                <X size={20} />
              </button>
            </div>

            <div
              className="w-full aspect-video rounded-[var(--radius-md)] flex flex-col items-center justify-center border"
              style={{
                background: "var(--surface-2)",
                borderColor: "var(--border)",
              }}
            >
              <Camera size={44} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-bold text-[var(--ink-muted)] mt-2">
                Synthetic Framed Archive
              </span>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold">{selectedMemory.title}</h3>
              <div className="flex items-center gap-3 text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{selectedMemory.year}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users size={14} />
                  <span>{selectedMemory.people.join(", ")}</span>
                </span>
              </div>
              <p className="text-base leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                {selectedMemory.story}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <BigButton
                label={isSpeaking ? "Stop Reading" : "Listen to Story"}
                icon={isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
                variant="primary"
                size="large"
                className="w-full"
                onClick={() => handleSpeak(selectedMemory.story)}
              />

              <button
                type="button"
                onClick={() => setSelectedMemory(null)}
                className="w-full text-center py-2 text-sm font-semibold underline text-[var(--ink-soft)] cursor-pointer"
              >
                Return to 3D Hall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
