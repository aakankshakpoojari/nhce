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

    let grid: { angle: number }[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / SPACING);
      rows = Math.ceil(height / SPACING);
      
      // Initialize grid state for smooth memory
      const newGrid = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          newGrid.push({ angle: Math.PI / 4 });
        }
      }
      grid = newGrid;
    };

    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      // Current mouse coords in px
      const mx = ((mouse.current.x + 1) / 2) * width;
      const my = ((1 - (mouse.current.y + 1) / 2)) * height;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const index = i * rows + j;
          if (!grid[index]) continue;
          const cell = grid[index];

          const cx = i * SPACING + SPACING / 2;
          const cy = j * SPACING + SPACING / 2;

          const dx = mx - cx;
          const dy = my - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Base angle: pointing down-right
          let targetAngle = Math.PI / 4;
          let influence = 0;

          if (dist < MAGNETIC_RADIUS) {
            // Antigravity effect: tails point AWAY from the mouse
            targetAngle = Math.atan2(dy, dx) + Math.PI; 
            influence = Math.pow(1 - (dist / MAGNETIC_RADIUS), 1.5);
          }

          // Calculate shortest rotation path
          let diff = targetAngle - cell.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;

          // Smooth interpolation (spring physics)
          const ease = influence > 0 ? 0.06 : 0.02;
          cell.angle += diff * ease;

          // Dynamic length based on antigravity force
          const currentLength = LINE_LENGTH + (influence * 12);

          // Highlight color for affected lines
          ctx.strokeStyle = `rgba(132, 204, 22, ${0.15 + influence * 0.4})`;

          // Draw the line tail
          ctx.beginPath();
          ctx.moveTo(
            cx - Math.cos(cell.angle) * currentLength, 
            cy - Math.sin(cell.angle) * currentLength
          );
          ctx.lineTo(
            cx + Math.cos(cell.angle) * currentLength, 
            cy + Math.sin(cell.angle) * currentLength
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
