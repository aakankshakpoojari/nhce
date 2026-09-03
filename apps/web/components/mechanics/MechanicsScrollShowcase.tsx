"use client";

import { useRef, useEffect, useState } from "react";
import { useInView, motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import * as anime from "animejs";
import { animate, createTimeline } from "animejs";
import { CheckCircle2 } from "lucide-react";

export interface MechanicsStep {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    features?: string[];
}

interface MechanicsScrollShowcaseProps {
    steps: MechanicsStep[];
}

export default function MechanicsScrollShowcase({ steps }: MechanicsScrollShowcaseProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeStepId, setActiveStepId] = useState(steps[0]?.id);

    // Track the scroll progress of this specific section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    return (
        <section ref={containerRef} id="mechanics" className="relative w-full bg-background border-t border-surface-border">
            {/* STICKY CONTAINER */}
            <div className="sticky top-0 relative flex min-h-screen w-full items-center pointer-events-none overflow-hidden">
                <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-6 md:px-8 lg:px-12">

                    {/* LEFT: 3D Currency Orb (Scroll-driven rotation) */}
                    <div className="hidden h-full lg:w-[50%] items-center justify-center lg:flex pointer-events-auto relative">
                        <CurrencyOrb scrollProgress={scrollYProgress} />
                    </div>

                    {/* RIGHT: Content Layout matching reference design */}
                    <div className="flex min-h-screen w-full flex-col items-start justify-center py-16 lg:py-0 lg:min-h-0 lg:w-[50%] lg:pl-16 pointer-events-auto lg:-mt-32">
                        <StepStory step={steps.find(s => s.id === activeStepId) || steps[0]} />
                    </div>

                </div>
            </div>

            {/* INVISIBLE SCROLL TRIGGERS */}
            <div className="relative z-10 mx-auto -mt-[100vh] flex w-full max-w-7xl px-6 md:px-8 lg:px-12 pointer-events-none">
                <div className="hidden lg:w-[50%] lg:block" />
                <div className="flex w-full flex-col lg:w-[50%] lg:pl-16">
                    {steps.map((step, index) => (
                        <StepBlock
                            key={step.id}
                            step={step}
                            onVisible={() => setActiveStepId(step.id)}
                            isFirst={index === 0}
                            isLast={index === steps.length - 1}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

/* =========================================
   3D CURRENCY ORB COMPONENT
   ========================================= */
const CurrencyOrb = ({ scrollProgress }: { scrollProgress: any }) => {
    useEffect(() => {
        // anime.js logic for continuous "neutron" flow of currencies
        document.querySelectorAll('.orb-ring').forEach((ring) => {
            const orbits = ring.querySelectorAll('.currency-orbit');
            const step = 360 / orbits.length;

            orbits.forEach((orbit: any, i) => {
                // Distribute currencies evenly around the ring
                orbit.style.transform = `rotateZ(${step * i}deg)`;

                // Orbit around the center
                animate(orbit, {
                    rotateZ: `+=${360}`,
                    duration: 12000 + (Math.random() * 2000), // Slight variation for organic feel
                    loop: true,
                    easing: 'linear'
                });

                // Counter-rotate the symbol itself so it doesn't spin upside down
                const symbol = orbit.querySelector('.currency-symbol');
                if (symbol) {
                    animate(symbol, {
                        rotateZ: `-=${360}`,
                        duration: 12000 + (Math.random() * 2000),
                        loop: true,
                        easing: 'linear'
                    });
                }
            });
        });
    }, []);

    // Map scroll progress to horizontal and vertical 3D rotation
    const rotateX = useTransform(scrollProgress, [0, 1], [-20, 360]);
    const rotateY = useTransform(scrollProgress, [0, 1], [-45, 720]);

    return (
        <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center [perspective:1200px]">
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d"
                }}
                className="relative w-64 h-64 md:w-80 md:h-80"
            >
                {/* Glowing Center Nucleus */}
                <div
                    className="absolute inset-0 m-auto w-24 h-24 bg-moss/20 rounded-full blur-2xl"
                    style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}
                />

                {/* 3D Intersecting Rings with Different Currencies */}
                <OrbRing
                    rotateX={75} rotateY={0}
                    currencies={['$', '€', '£']}
                    color="border-moss/40"
                    size="w-full h-full"
                />
                <OrbRing
                    rotateX={-45} rotateY={45}
                    currencies={['₿', 'USDC', 'Ξ']}
                    color="border-surface-border"
                    size="w-[110%] h-[110%] -left-[5%] -top-[5%]"
                />
                <OrbRing
                    rotateX={0} rotateY={75}
                    currencies={['¥', '₹', 'DAI']}
                    color="border-moss/20"
                    size="w-[90%] h-[90%] left-[5%] top-[5%]"
                />
            </motion.div>
        </div>
    );
};

/* =========================================
   INDIVIDUAL 3D RING
   ========================================= */
const OrbRing = ({ rotateX, rotateY, currencies, color, size }: any) => {
    return (
        <div
            className={`orb-ring absolute ${size} rounded-full border border-dashed ${color}`}
            style={{
                transformStyle: "preserve-3d",
                transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
            }}
        >
            {currencies.map((symbol: string) => (
                <div
                    key={symbol}
                    className="currency-orbit absolute inset-0 rounded-full"
                    style={{ transformStyle: "preserve-3d" }}
                >
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <div className="currency-symbol w-10 h-10 rounded-full bg-surface border border-moss/30 text-moss flex items-center justify-center text-sm font-black shadow-[0_0_15px_rgba(132,204,22,0.2)] backdrop-blur-md">
                            {symbol}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

/* =========================================
   RIGHT SIDE CONTENT CARD
   ========================================= */
const StepStory = ({ step }: { step: MechanicsStep }) => {
    return (
        <div className="relative flex w-full max-w-xl flex-col justify-center min-h-[320px] sm:min-h-[400px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.97 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col justify-center"
                >
                    <p className="mb-4 md:mb-6 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-moss">
                        <span className="h-1.5 w-1.5 rounded-full bg-moss" />
                        {step.eyebrow}
                    </p>

                <h2 className="mb-6 md:mb-8 text-4xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
                    {step.title}
                </h2>

                <p className="mb-8 md:mb-10 text-base leading-relaxed text-muted sm:text-lg">
                    {step.description}
                </p>

                {step.features && step.features.length > 0 && (
                    <div className="mb-10 md:mb-12 border border-surface-border rounded-2xl bg-surface/50 p-6 backdrop-blur-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            {step.features.map((feature, i) => (
                                <div key={i} className="flex items-start gap-2.5">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-moss" strokeWidth={2.2} />
                                    <span className="text-[15px] font-medium text-foreground leading-tight">
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

/* =========================================
   SCROLL INTERSECTION OBSERVER
   ========================================= */
const StepBlock = ({ step, onVisible, isFirst, isLast }: any) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

    useEffect(() => {
        if (isInView) {
            onVisible();
        }
    }, [isInView, onVisible]);

    return (
        <div
            ref={ref}
            className={`flex min-h-[100vh] w-full flex-col justify-center 
        ${isFirst ? "pt-[10vh]" : ""}
        ${isLast ? "pb-[15vh]" : ""}`}
        />
    );
}