"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Post-processing effects for the premium 3D scene.
 * Bloom makes the green emissives glow, vignette adds cinematic framing.
 * Only rendered on high-tier devices for performance.
 */
export default function PostProcessingEffects() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.75}
        intensity={0.5}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette darkness={0.35} offset={0.3} />
    </EffectComposer>
  );
}
