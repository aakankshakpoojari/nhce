"use client";

import React, { useState, useRef, ReactNode } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

interface KineticTiltCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

/**
 * Lusion.co Inspired Kinetic Tilt Card Component
 * Implements mouse-tracking 3D rotation (rotateX, rotateY), spring inertia physics,
 * and liquid radial cursor glow.
 */
export default function KineticTiltCard({
  children,
  className = "",
  glowColor = "rgba(132, 204, 22, 0.25)",
}: KineticTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for smooth 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics matching Lusion specification (stiffness: 100, damping: 15, mass: 0.8)
  const springConfig = { stiffness: 100, damping: 15, mass: 0.8 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center normalized [-0.5, 0.5]
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normalizedX = mouseX / width - 0.5;
    const normalizedY = mouseY / height - 0.5;

    x.set(normalizedX);
    y.set(normalizedY);

    setMousePosition({ x: mouseX, y: mouseY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={`relative overflow-hidden rounded-3xl bg-surface border border-surface-border transition-colors duration-300 ${className}`}
    >
      {/* Liquid cursor spotlight overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 80%)`,
          }}
        />
      )}

      {/* Card Content */}
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}
