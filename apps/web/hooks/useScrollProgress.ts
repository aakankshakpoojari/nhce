"use client";

import { useEffect, useRef } from "react";

/**
 * Returns a ref containing { progress: 0-1, velocity: px/frame }
 * driven by window scroll position.
 *
 * @param scrollHeight - Number of viewport heights that map to 0→1 progress.
 *                       Default 4 means 400vh of scrolling = full progress.
 */
export function useScrollProgress(scrollHeight = 4) {
  const state = useRef({ progress: 0, velocity: 0 });

  useEffect(() => {
    let lastScroll = 0;

    const handler = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * scrollHeight;
      state.current.progress = Math.min(scrollY / maxScroll, 1);
      state.current.velocity = scrollY - lastScroll;
      lastScroll = scrollY;
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [scrollHeight]);

  return state;
}
