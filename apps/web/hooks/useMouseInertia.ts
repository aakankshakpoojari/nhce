"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks normalized mouse position (-1 to 1) with spring-damped inertia.
 * The ref-based approach avoids React re-renders — consumers read values
 * inside requestAnimationFrame or R3F's useFrame.
 */
export function useMousePosition() {
  const position = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      position.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      position.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return position;
}
