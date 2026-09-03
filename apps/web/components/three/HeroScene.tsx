"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Preload } from "@react-three/drei";
import LogoGroup from "./LogoGroup";
import NetworkScene from "./NetworkScene";
import Particles from "./Particles";
import PostProcessingEffects from "./PostProcessing";
import { useMousePosition } from "@/hooks/useMouseInertia";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import HeroFallback from "./HeroFallback";

const FONT_URL = "/fonts/helvetiker_bold.typeface.json";

/**
 * Main R3F Canvas for the immersive 3D hero.
 * Renders the full-screen Three.js scene behind the HTML UI.
 *
 * Architecture:
 *  - PerspectiveCamera at z=6, FOV 45
 *  - Environment map for metallic reflections
 *  - LogoGroup (mouse + scroll reactive)
 *  - NetworkScene (scroll-driven financial network)
 *  - Particles ($ energy core)
 *  - PostProcessing (bloom, vignette) — high tier only
 *
 * Device tiers:
 *  - high → full 3D + effects
 *  - medium → 3D without post-processing
 *  - low → CSS fallback (no WebGL)
 */
export default function HeroScene() {
  const tier = useDeviceCapability();
  const mouse = useMousePosition();
  const scroll = useScrollProgress(4);

  if (tier === "low") {
    return <HeroFallback />;
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, tier === "high" ? 2 : 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {/* Deep dark background matching fintech palette */}
      <color attach="background" args={["#080C0B"]} />
      <fog attach="fog" args={["#080C0B", 10, 28]} />

      <Suspense fallback={null}>
        {/* Lighting rig */}
        <ambientLight intensity={0.12} color="#F4F5F2" />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.75}
          color="#F4F5F2"
          castShadow={false}
        />
        <spotLight
          position={[-4, 4, 3]}
          intensity={0.35}
          angle={0.6}
          penumbra={0.6}
          color="#84CC16"
        />
        {/* Subtle fill from below for cinematic feel */}
        <pointLight
          position={[0, -3, 2]}
          intensity={0.15}
          color="#132A18"
        />

        {/* HDR environment for metallic reflections */}
        <Environment preset="city" environmentIntensity={0.25} />

        {/* Core 3D elements */}
        <LogoGroup mouse={mouse} scroll={scroll} fontUrl={FONT_URL} />
        <NetworkScene scroll={scroll} />
        <Particles mouse={mouse} scroll={scroll} />

        {/* Post-processing — high tier only */}
        {tier === "high" && <PostProcessingEffects />}

        <Preload all />
      </Suspense>
    </Canvas>
  );
}
