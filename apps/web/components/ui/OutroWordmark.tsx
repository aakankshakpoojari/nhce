"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function OutroWordmark() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });
  
  const text = "W3HIRE";
  const letters = text.split("");

  return (
    <section 
      ref={containerRef}
      className="w-full pt-10 pb-20 overflow-hidden flex justify-center items-center bg-background"
    >
      <div className="flex justify-center items-center group">
        {letters.map((char, index) => (
          <motion.span
            key={index}
            initial={{ y: 100, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 100, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 12,
              stiffness: 100,
              delay: index * 0.08,
            }}
            className="text-[15vw] md:text-[18vw] font-black tracking-tighter uppercase transition-colors duration-300 hover:text-moss text-foreground/90 group-hover:text-foreground/30 hover:!text-moss cursor-default leading-none"
          >
            {char}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
