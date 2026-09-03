"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

interface ScrollOrbProps {
    /** 0 -> 1 progress through the whole Mechanics section, from the parent's useScroll() */
    progress: MotionValue<number>;
}

// Each ellipse in the wireframe sphere spins at a slightly different rate/axis so the
// group reads as a single rotating 3D orb rather than flat concentric rings.
const RINGS = [
    { rx: 220, ry: 90, tiltDeg: 12, speed: 1.0, color: "#84CC16" },
    { rx: 220, ry: 90, tiltDeg: -28, speed: 1.35, color: "#22C55E" },
    { rx: 220, ry: 90, tiltDeg: 58, speed: 0.75, color: "#84CC16" },
    { rx: 220, ry: 90, tiltDeg: -70, speed: 1.6, color: "#BEF264" },
    { rx: 220, ry: 90, tiltDeg: 90, speed: 0.55, color: "#22C55E" },
];

// Decorative dial ring segments (static — only the wireframe sphere inside rotates)
const DIAL_ARCS = [
    { color: "#84CC16", from: 0, to: 70 },
    { color: "#F59E0B", from: 78, to: 130 },
    { color: "#22C55E", from: 150, to: 210 },
    { color: "#3B82F6", from: 225, to: 275 },
    { color: "#84CC16", from: 290, to: 350 },
];

function polarToXY(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, fromDeg: number, toDeg: number) {
    const start = polarToXY(cx, cy, r, fromDeg);
    const end = polarToXY(cx, cy, r, toDeg);
    const largeArc = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function ScrollOrb({ progress }: ScrollOrbProps) {
    // Horizontal-axis spin: full rotation(s) of the whole orb group tied directly to scroll.
    const rotateY = useTransform(progress, [0, 1], [0, 540]);
    // Vertical-axis tilt: gentle back-and-forth tied to the same scroll progress, not time.
    const rotateX = useTransform(progress, [0, 0.5, 1], [-18, 18, -18]);
    // Slow outer dial creep, subtle, so the whole instrument doesn't feel static.
    const dialRotate = useTransform(progress, [0, 1], [0, 25]);

    return (
        <div
            className="relative mx-auto flex h-[420px] w-[420px] max-w-full items-center justify-center"
            style={{ perspective: 1200 }}
        >
            {/* Static-ish outer dial */}
            <motion.svg
                viewBox="0 0 400 400"
                className="absolute inset-0 h-full w-full"
                style={{ rotate: dialRotate }}
            >
                <circle cx="200" cy="200" r="188" fill="none" stroke="var(--surface-border)" strokeWidth="1.5" />
                <circle cx="200" cy="200" r="196" fill="none" stroke="var(--surface-border)" strokeWidth="1" opacity={0.5} />
                {/* Tick marks */}
                {Array.from({ length: 72 }).map((_, i) => {
                    const deg = i * 5;
                    const inner = polarToXY(200, 200, 178, deg);
                    const outer = polarToXY(200, 200, i % 6 === 0 ? 166 : 172, deg);
                    return (
                        <line
                            key={i}
                            x1={inner.x}
                            y1={inner.y}
                            x2={outer.x}
                            y2={outer.y}
                            stroke="var(--surface-border)"
                            strokeWidth={i % 6 === 0 ? 1.5 : 0.75}
                        />
                    );
                })}
                {/* Colored dial arcs */}
                {DIAL_ARCS.map((arc, i) => (
                    <path
                        key={i}
                        d={arcPath(200, 200, 188, arc.from, arc.to)}
                        fill="none"
                        stroke={arc.color}
                        strokeWidth={4}
                        strokeLinecap="round"
                        opacity={0.9}
                    />
                ))}
            </motion.svg>

            {/* Rotating wireframe sphere, driven by scroll progress on both axes */}
            <motion.div
                className="relative h-[300px] w-[300px]"
                style={{
                    rotateY,
                    rotateX,
                    transformStyle: "preserve-3d",
                }}
            >
                <svg viewBox="-160 -140 320 280" className="h-full w-full overflow-visible">
                    {RINGS.map((ring, i) => (
                        <RotatingEllipse key={i} ring={ring} progress={progress} />
                    ))}
                    {/* Core glow */}
                    <circle r="10" fill="#84CC16" opacity={0.9} />
                </svg>
            </motion.div>

            {/* Ambient glow behind everything */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(132,204,22,0.18), transparent 70%)" }}
            />
        </div>
    );
}

function RotatingEllipse({
    ring,
    progress,
}: {
    ring: (typeof RINGS)[number];
    progress: MotionValue<number>;
}) {
    const rotateDeg = useTransform(progress, [0, 1], [ring.tiltDeg, ring.tiltDeg + 360 * ring.speed]);
    const transform = useTransform(rotateDeg, (d) => `rotate(${d}deg)`);
    return (
        <motion.ellipse
            cx={0}
            cy={0}
            rx={ring.rx}
            ry={ring.ry}
            fill="none"
            stroke={ring.color}
            strokeWidth={1.5}
            opacity={0.75}
            style={{ transform, transformOrigin: "0px 0px" }}
        />
    );
}