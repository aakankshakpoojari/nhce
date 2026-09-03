"use client";

import { useEffect, useState, useRef } from "react";

/**
 * CSS-only fallback hero for low-capability devices (no WebGL).
 * Shows the W$ branding with CSS 3D transforms and parallax.
 */
export default function HeroFallback() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const smoothed = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * -15,
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let raf: number;
    const animate = () => {
      smoothed.current.x += (mousePos.x - smoothed.current.x) * 0.04;
      smoothed.current.y += (mousePos.y - smoothed.current.y) * 0.04;
      const el = document.getElementById("hero-fallback-logo");
      if (el) {
        el.style.transform = `perspective(1000px) rotateX(${smoothed.current.y}deg) rotateY(${smoothed.current.x}deg)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [mousePos]);

  return (
    <div
      className="absolute inset-0 w-full h-full flex items-center justify-center"
      style={{ background: "#080C0B" }}
    >
      <div
        id="hero-fallback-logo"
        className="flex items-center gap-4 select-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        <span
          className="text-[10rem] sm:text-[14rem] font-black tracking-tighter leading-none"
          style={{ color: "#E0E0DE" }}
        >
          W
        </span>
        <span
          className="text-[10rem] sm:text-[14rem] font-black tracking-tighter leading-none font-mono"
          style={{
            color: "#84CC16",
            textShadow: "0 0 60px rgba(132, 204, 22, 0.5), 0 0 120px rgba(132, 204, 22, 0.2)",
          }}
        >
          $
        </span>
      </div>
    </div>
  );
}
