"use client";

import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { motion, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import LogoGroup from "@/components/three/LogoGroup";
import KineticTiltCard from "@/components/ui/KineticTiltCard";

const FONT_URL = "/fonts/helvetiker_bold.typeface.json";

export default function MechanicsSection() {
  const containerRef = useRef<HTMLElement>(null);
  const scrollRef = useRef({ progress: 0, velocity: 0 });
  
  // Track scroll progress of this specific section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    scrollRef.current.progress = latest;
  });

  // Dummy mouse ref for LogoGroup
  const mouseRef = useRef({ x: 0, y: 0 });

  // Opacities for the 3 steps based on scroll progress
  // Step 1: 0 to 0.33
  const step1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.33], [1, 1, 0.2]);
  const step1Y = useTransform(scrollYProgress, [0, 0.2, 0.33], [0, 0, -20]);
  
  // Step 2: 0.33 to 0.66
  const step2Opacity = useTransform(scrollYProgress, [0.2, 0.33, 0.53, 0.66], [0.2, 1, 1, 0.2]);
  const step2Y = useTransform(scrollYProgress, [0.2, 0.33, 0.53, 0.66], [20, 0, 0, -20]);
  
  // Step 3: 0.66 to 1.0
  const step3Opacity = useTransform(scrollYProgress, [0.53, 0.66, 1], [0.2, 1, 1]);
  const step3Y = useTransform(scrollYProgress, [0.53, 0.66, 1], [20, 0, 0]);

  return (
    <section ref={containerRef} id="how-it-works" className="relative w-full h-[300vh] bg-background">
      
      {/* Sticky Container for the Split Layout */}
      <div className="sticky top-0 h-screen w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center overflow-hidden">
        
        {/* Left Column: 3D Canvas */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
            >
              <Environment preset="city" />
              <LogoGroup mouse={mouseRef} scroll={scrollRef} fontUrl={FONT_URL} />
            </Canvas>
          </div>
        </div>

        {/* Right Column: Scroll-driven Steps */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full relative flex flex-col justify-center">
          
          <div className="mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-moss font-semibold">
              Simplified Smart Contracts
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mt-2">
              How W3HIRE Works in 3 Steps
            </h2>
          </div>

          <div className="relative h-[400px] w-full max-w-md">
            {/* STEP 1 */}
            <motion.div 
              style={{ opacity: step1Opacity, y: step1Y }}
              className="absolute inset-0"
            >
              <KineticTiltCard className="p-8 space-y-4 h-full border-moss/20 bg-surface/80 backdrop-blur-md">
                <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss font-mono text-xl font-bold flex items-center justify-center shadow-inner">
                  1
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Client Locks Funds
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  The project budget is deposited into a secure, neutral digital escrow before any work begins. 
                  This ensures 100% payment guarantee for the freelancer, eliminating default risk.
                </p>
              </KineticTiltCard>
            </motion.div>

            {/* STEP 2 */}
            <motion.div 
              style={{ opacity: step2Opacity, y: step2Y }}
              className="absolute inset-0 pointer-events-none"
            >
              <KineticTiltCard className="p-8 space-y-4 h-full border-moss/20 bg-surface/80 backdrop-blur-md">
                <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-moss font-mono text-xl font-bold flex items-center justify-center shadow-inner pointer-events-auto">
                  2
                </div>
                <h3 className="text-2xl font-bold text-foreground pointer-events-auto">
                  Talent Delivers
                </h3>
                <p className="text-sm text-muted leading-relaxed pointer-events-auto">
                  The freelancer completes the agreed-upon milestones with absolute certainty that the money is guaranteed.
                  Code, design, or audit deliverables are submitted on-chain or off-chain.
                </p>
              </KineticTiltCard>
            </motion.div>

            {/* STEP 3 */}
            <motion.div 
              style={{ opacity: step3Opacity, y: step3Y }}
              className="absolute inset-0 pointer-events-none"
            >
              <KineticTiltCard className="p-8 space-y-4 h-full border-[#22C55E]/40 bg-surface/80 backdrop-blur-md glow-green pointer-events-auto">
                <div className="w-12 h-12 rounded-2xl bg-background border border-surface-border text-[#22C55E] font-mono text-xl font-bold flex items-center justify-center shadow-inner">
                  3
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Protocol Pays Instantly
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Upon client approval or successful dispute resolution, the smart contract automatically releases funds 
                  directly to the freelancer's wallet. Zero banking delays.
                </p>
              </KineticTiltCard>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
