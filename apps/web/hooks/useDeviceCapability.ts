"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "high" | "medium" | "low";

/**
 * Detects device GPU capability and returns a tier for graceful degradation.
 * - high: Full Three.js + post-processing (bloom, vignette, CA)
 * - medium: Three.js without post-processing
 * - low: CSS-only fallback (no WebGL)
 */
export function useDeviceCapability(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>("high");

  useEffect(() => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const cores = navigator.hardwareConcurrency || 2;

    // Check for WebGL 2 support
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    const hasWebGL2 = !!gl;

    if (!hasWebGL2 || (isMobile && cores <= 4)) {
      setTier("low");
    } else if (isMobile && cores <= 6) {
      setTier("medium");
    } else {
      setTier("high");
    }
  }, []);

  return tier;
}
