"use client";

import React, { useEffect, useRef } from "react";
import { useMousePosition } from "@/hooks/useMouseInertia";

/**
 * A lightweight 2D canvas that renders an interactive grid of "doodle lines".
 * The lines subtly point toward the user's cursor (magnetic effect).
 * Engineered for performance: simple math, single canvas context, no complex physics.
 */
export default function MagneticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useMousePosition();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    const SPACING = 40; // spacing between lines
    const LINE_LENGTH = 10;
    const MAGNETIC_RADIUS = 300;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / SPACING);
      rows = Math.ceil(height / SPACING);
    };

    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Determine base color based on theme (assuming dark mode uses dark bg)
      // For simplicity, we use a semi-transparent moss green
      ctx.strokeStyle = "rgba(132, 204, 22, 0.15)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      // Current mouse coords in px
      // The hook normalizes mouse to -1..1, we need to convert back to px
      const mx = ((mouse.current.x + 1) / 2) * width;
      const my = ((1 - (mouse.current.y + 1) / 2)) * height;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cx = i * SPACING + SPACING / 2;
          const cy = j * SPACING + SPACING / 2;

          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Base angle: random noise or just pointing down-right
          // We'll just have them point down-right by default (Math.PI / 4)
          let angle = Math.PI / 4;

          if (dist < MAGNETIC_RADIUS) {
            // Magnetic effect: angle points towards mouse
            const targetAngle = Math.atan2(dy, dx);
            // Influence based on distance
            const influence = 1 - (dist / MAGNETIC_RADIUS);
            
            // Simple interpolation
            // We use simple math: lerp between base angle and target angle
            // (Note: this doesn't handle angle wrap-around perfectly but looks fine for this effect)
            angle = angle + (targetAngle - angle) * influence;
            
            // Highlight color for affected lines
            ctx.strokeStyle = `rgba(132, 204, 22, ${0.15 + influence * 0.3})`;
          } else {
            ctx.strokeStyle = "rgba(132, 204, 22, 0.15)";
          }

          // Draw the line
          ctx.beginPath();
          ctx.moveTo(
            cx - Math.cos(angle) * LINE_LENGTH, 
            cy - Math.sin(angle) * LINE_LENGTH
          );
          ctx.lineTo(
            cx + Math.cos(angle) * LINE_LENGTH, 
            cy + Math.sin(angle) * LINE_LENGTH
          );
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
