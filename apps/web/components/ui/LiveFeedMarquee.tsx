"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const RECENT_BOUNTIES = [
  { id: 1, title: "DeFi Yield Aggregator Contract", amount: "$12,500", role: "Smart Contract Dev" },
  { id: 2, title: "ZK-Rollup React Frontend", amount: "$8,200", role: "Frontend Eng" },
  { id: 3, title: "NFT Marketplace Audit", amount: "$4,500", role: "Security Auditor" },
  { id: 4, title: "Rust Substrate Node Setup", amount: "$15,000", role: "DevOps Eng" },
  { id: 5, title: "Cross-Chain Bridge SDK", amount: "$22,000", role: "Core Dev" },
  { id: 6, title: "Tokenomics Whitepaper Design", amount: "$3,000", role: "UI/UX Designer" },
];

// Tripled to ensure smooth looping
const MARQUEE_ITEMS = [...RECENT_BOUNTIES, ...RECENT_BOUNTIES, ...RECENT_BOUNTIES];

export default function LiveFeedMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, margin: "-20%" });
  const [phase, setPhase] = useState(0);
  const [isAssembled, setIsAssembled] = useState(false);

  useEffect(() => {
    if (isInView) {
      // Wait for the text to finish animating in (approx 0.8s) before starting cards
      const timer = setTimeout(() => {
        setIsAssembled(true);
      }, 1000); 
      return () => clearTimeout(timer);
    } else {
      setIsAssembled(false);
    }
  }, [isInView]);

  // Request Animation Frame to drive a sweeping color change over the text
  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    const duration = 10000; // 10 seconds per sweep

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = time - startTime;
      const progress = (elapsed % duration) / duration;
      setPhase(progress);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const headingText = "LIVE FEED";
  const letters = headingText.split("");

  return (
    <section 
      ref={containerRef}
      className="relative w-full py-48 md:py-64 overflow-hidden border-y border-surface-border text-foreground my-24 flex flex-col justify-center"
    >
      {/* Background Text: Bright initially, dims as cards flow in */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 transition-all duration-[2000ms] ease-out ${
          isAssembled ? "opacity-40" : "opacity-100"
        }`}
      >
        <div className="flex justify-center overflow-hidden">
          {letters.map((char, index) => {
            const letterProgress = index / letters.length;
            const distance = Math.abs(phase - letterProgress);
            const isHot = distance < 0.1 || distance > 0.9;
            
            return (
              <motion.span
                key={index}
                initial={{ y: "100%", opacity: 0 }}
                animate={isInView ? { y: "0%", opacity: 1 } : { y: "100%", opacity: 0 }}
                transition={{ 
                  type: "spring", 
                  damping: 15, 
                  stiffness: 100, 
                  delay: index * 0.05 
                }}
                className={`text-[6rem] sm:text-[10rem] md:text-[15rem] leading-none font-black tracking-tighter uppercase transition-colors duration-300 ${
                  char === " " ? "w-8 md:w-20" : ""
                } ${isHot ? "text-moss drop-shadow-[0_0_40px_rgba(132,204,22,0.8)]" : "text-surface-border"}`}
              >
                {char}
              </motion.span>
            );
          })}
        </div>
      </div>

      {/* Foreground Marquee Row */}
      <div 
        className="relative z-10 flex flex-col justify-center pointer-events-auto transition-transform duration-[10000ms] ease-linear"
        style={{
          transform: isAssembled ? "translateX(0)" : "translateX(100vw)",
          opacity: isAssembled ? 1 : 0,
          transitionProperty: "transform, opacity",
          transitionDuration: isAssembled ? "10000ms, 2000ms" : "0ms, 0ms",
        }}
      >
        <div className={`flex w-[300%] ${isAssembled ? 'animate-[w3-marquee-left_40s_linear_infinite]' : ''} items-center`}>
          {MARQUEE_ITEMS.map((item, idx) => {
            const yOffset = idx % 3 === 0 ? "translate-y-12" : idx % 3 === 1 ? "-translate-y-8" : "translate-y-4";
            
            return (
              <div 
                key={`r1-${idx}`} 
                className={`flex-shrink-0 w-[280px] md:w-[350px] mx-6 p-5 md:p-6 rounded-2xl border-2 border-surface-border bg-surface/80 backdrop-blur-xl hover:border-moss/50 transition-colors shadow-2xl cursor-pointer ${yOffset}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs md:text-sm font-mono text-moss px-3 py-1 rounded-full bg-moss/10">{item.role}</span>
                  <span className="font-bold text-lg text-[#22C55E] font-mono">{item.amount}</span>
                </div>
                <h4 className="text-base md:text-lg font-bold text-foreground">{item.title}</h4>
                <div className="mt-4 flex items-center justify-between text-xs text-muted font-mono">
                  <span>Escrowed</span>
                  <span>Just now</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`relative z-20 mt-32 flex justify-center w-full transition-all duration-1000 ${isAssembled ? "opacity-100" : "opacity-0"}`}>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="group flex items-center gap-2 px-8 py-4 bg-moss hover:bg-[#BEF264] text-background shadow-xl shadow-moss/20 font-bold rounded-full transition-all hover:-translate-y-1"
        >
          Explore All Bounties
          <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </motion.button>
      </div>
    </section>
  );
}
