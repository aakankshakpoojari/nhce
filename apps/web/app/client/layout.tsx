"use client";

import React, { useEffect } from "react";
import CustomCursor from "@/components/animations/CustomCursor";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Smooth mouse tracking with spring-damped inertia
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 60, damping: 20, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle ambient parallax offsets (-15px to +15px)
  const backgroundX = useTransform(smoothX, [-1, 1], [-18, 18]);
  const backgroundY = useTransform(smoothY, [-1, 1], [-18, 18]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normalizedX = (e.clientX / innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / innerHeight) * 2 - 1;
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen bg-transparent text-foreground flex flex-col selection:bg-moss selection:text-background font-sans overflow-x-hidden">
      {/* Shared Interactive Custom Cursor */}
      <CustomCursor />

      {/* Subtle Inertial Background Atmosphere */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          x: backgroundX,
          y: backgroundY,
        }}
      >
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-moss/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-[#22C55E]/5 rounded-full blur-[120px]" />
      </motion.div>

      {/* Page Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
