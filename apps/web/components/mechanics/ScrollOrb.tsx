"use client";

import { useEffect, useRef } from "react";
import { animate, onScroll, createScope } from "animejs";

interface ScrollOrbProps {
    /**
     * Kept for compatibility with the existing Mechanics section.
     * Anime.js ScrollObserver now controls the visual directly.
     */
    progress?: unknown;
}

const CURRENCIES = [
    { symbol: "₹", color: "#84CC16", orbit: 0, position: 0 },
    { symbol: "$", color: "#22C55E", orbit: 0, position: 120 },
    { symbol: "€", color: "#BEF264", orbit: 0, position: 240 },

    { symbol: "₿", color: "#F59E0B", orbit: 1, position: 60 },
    { symbol: "£", color: "#22C55E", orbit: 1, position: 180 },
    { symbol: "¥", color: "#3B82F6", orbit: 1, position: 300 },

    { symbol: "₹", color: "#22C55E", orbit: 2, position: 40 },
    { symbol: "$", color: "#84CC16", orbit: 2, position: 160 },
    { symbol: "€", color: "#F59E0B", orbit: 2, position: 280 },
];

const DIAL_ARCS = [
    { color: "#84CC16", from: 0, to: 48 },
    { color: "#22C55E", from: 58, to: 110 },
    { color: "#F59E0B", from: 125, to: 174 },
    { color: "#3B82F6", from: 190, to: 238 },
    { color: "#22C55E", from: 252, to: 310 },
    { color: "#84CC16", from: 325, to: 355 },
];

function polarToXY(
    cx: number,
    cy: number,
    r: number,
    deg: number
) {
    const rad = (deg * Math.PI) / 180;

    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
}

function arcPath(
    cx: number,
    cy: number,
    r: number,
    fromDeg: number,
    toDeg: number
) {
    const start = polarToXY(cx, cy, r, fromDeg);
    const end = polarToXY(cx, cy, r, toDeg);

    const largeArc = toDeg - fromDeg > 180 ? 1 : 0;

    return `
    M ${start.x} ${start.y}
    A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}
  `;
}

export default function ScrollOrb({ }: ScrollOrbProps) {
    const root = useRef<HTMLDivElement>(null);
    const scope = useRef<ReturnType<typeof createScope> | null>(null);

    useEffect(() => {
        if (!root.current) return;

        scope.current = createScope({ root }).add(() => {
            /*
             * ============================================================
             * MAIN ORBIT SYSTEM
             * ============================================================
             *
             * Anime.js ScrollObserver drives the entire visual.
             *
             * sync: 1 means:
             *
             * scroll progress  →  animation progress
             *
             * So if the user scrolls backwards, the entire orbital system
             * reverses naturally.
             */

            animate(".orbital-system", {
                rotate: "1turn",
                ease: "linear",

                autoplay: onScroll({
                    target: root.current!,
                    enter: "bottom top",
                    leave: "top bottom",
                    sync: 1,
                }),
            });

            /*
             * ============================================================
             * SECOND ORBIT
             * ============================================================
             */

            animate(".orbital-system-secondary", {
                rotate: "-1turn",
                ease: "linear",

                autoplay: onScroll({
                    target: root.current!,
                    enter: "bottom top",
                    leave: "top bottom",
                    sync: 1,
                }),
            });

            /*
             * ============================================================
             * THIRD ORBIT
             * ============================================================
             */

            animate(".orbital-system-tertiary", {
                rotate: "1.5turn",
                ease: "linear",

                autoplay: onScroll({
                    target: root.current!,
                    enter: "bottom top",
                    leave: "top bottom",
                    sync: 1,
                }),
            });

            /*
             * ============================================================
             * OUTER HUD
             * ============================================================
             */

            animate(".hud-rotation", {
                rotate: "0.18turn",
                ease: "linear",

                autoplay: onScroll({
                    target: root.current!,
                    enter: "bottom top",
                    leave: "top bottom",
                    sync: 1,
                }),
            });

            /*
             * ============================================================
             * INNER SCAN RING
             * ============================================================
             */

            animate(".scan-ring", {
                rotate: "-0.5turn",
                ease: "linear",

                autoplay: onScroll({
                    target: root.current!,
                    enter: "bottom top",
                    leave: "top bottom",
                    sync: 1,
                }),
            });

            /*
             * ============================================================
             * CURRENCY COUNTER ROTATION
             * ============================================================
             *
             * The orbital container rotates.
             * These rotate backwards so the currency symbols remain upright.
             */

            animate(".currency-counter", {
                rotate: "-1turn",
                ease: "linear",

                autoplay: onScroll({
                    target: root.current!,
                    enter: "bottom top",
                    leave: "top bottom",
                    sync: 1,
                }),
            });

            /*
             * ============================================================
             * CORE
             * ============================================================
             */

            animate(".reactor-core", {
                scale: [
                    { to: 1.18 },
                    { to: 0.92 },
                ],
                ease: "linear",

                autoplay: onScroll({
                    target: root.current!,
                    enter: "bottom top",
                    leave: "top bottom",
                    sync: 1,
                }),
            });
        });

        return () => {
            scope.current?.revert();
        };
    }, []);

    return (
        <div
            ref={root}
            className="
        relative
        mx-auto
        flex
        h-[520px]
        w-[520px]
        max-w-full
        items-center
        justify-center
      "
            style={{
                perspective: "1400px",
            }}
        >
            {/* ============================================================
          AMBIENT GLOW
      ============================================================ */}

            <div
                className="
          pointer-events-none
          absolute
          inset-[12%]
          rounded-full
          blur-[70px]
        "
                style={{
                    background:
                        "radial-gradient(circle, rgba(34,197,94,.18), rgba(132,204,22,.08), transparent 70%)",
                }}
            />

            {/* ============================================================
          OUTER HUD
      ============================================================ */}

            <div className="hud-rotation absolute inset-0">
                <svg
                    viewBox="0 0 520 520"
                    className="h-full w-full overflow-visible"
                >
                    {/* Outer border */}
                    <circle
                        cx="260"
                        cy="260"
                        r="247"
                        fill="none"
                        stroke="var(--surface-border)"
                        strokeWidth="1"
                    />

                    <circle
                        cx="260"
                        cy="260"
                        r="238"
                        fill="none"
                        stroke="var(--surface-border)"
                        strokeWidth="1.5"
                        opacity=".65"
                    />

                    {/* Colored arcs */}
                    {DIAL_ARCS.map((arc, i) => (
                        <path
                            key={i}
                            d={arcPath(
                                260,
                                260,
                                247,
                                arc.from,
                                arc.to
                            )}
                            fill="none"
                            stroke={arc.color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            opacity=".9"
                        />
                    ))}

                    {/* Tick system */}
                    {Array.from({ length: 120 }).map((_, i) => {
                        const deg = i * 3;

                        const major = i % 10 === 0;

                        const outer = polarToXY(
                            260,
                            260,
                            228,
                            deg
                        );

                        const inner = polarToXY(
                            260,
                            260,
                            major ? 211 : 218,
                            deg
                        );

                        return (
                            <line
                                key={i}
                                x1={inner.x}
                                y1={inner.y}
                                x2={outer.x}
                                y2={outer.y}
                                stroke="#22C55E"
                                strokeWidth={major ? 1.5 : 0.7}
                                opacity={major ? 0.8 : 0.35}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* ============================================================
          SECOND HUD RING
      ============================================================ */}

            <div className="scan-ring absolute inset-[7%]">
                <svg
                    viewBox="0 0 520 520"
                    className="h-full w-full"
                >
                    <circle
                        cx="260"
                        cy="260"
                        r="215"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="1"
                        strokeDasharray="2 9"
                        opacity=".35"
                    />

                    <circle
                        cx="260"
                        cy="260"
                        r="201"
                        fill="none"
                        stroke="var(--surface-border)"
                        strokeWidth="1"
                        opacity=".45"
                    />

                    <circle
                        cx="260"
                        cy="260"
                        r="190"
                        fill="none"
                        stroke="#84CC16"
                        strokeWidth="1"
                        strokeDasharray="1 14"
                        opacity=".25"
                    />

                    {/* Scanner segments */}
                    <path
                        d={arcPath(260, 260, 215, 20, 75)}
                        fill="none"
                        stroke="#84CC16"
                        strokeWidth="2"
                        opacity=".8"
                    />

                    <path
                        d={arcPath(260, 260, 215, 150, 205)}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        opacity=".75"
                    />

                    <path
                        d={arcPath(260, 260, 215, 265, 315)}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        opacity=".7"
                    />
                </svg>
            </div>

            {/* ============================================================
          CENTRAL ORBITAL CHAMBER
      ============================================================ */}

            <div
                className="
          relative
          h-[360px]
          w-[360px]
        "
                style={{
                    transformStyle: "preserve-3d",
                }}
            >
                {/* ========================================================
            GRID / PARTICLES
        ======================================================== */}

                <div className="absolute inset-[18%] overflow-hidden rounded-full">
                    <div
                        className="
              absolute
              inset-0
              opacity-30
            "
                        style={{
                            backgroundImage: `
                radial-gradient(
                  circle,
                  rgba(34,197,94,.8) 1px,
                  transparent 1px
                )
              `,
                            backgroundSize: "17px 17px",
                            maskImage:
                                "radial-gradient(circle, black 20%, transparent 72%)",
                            WebkitMaskImage:
                                "radial-gradient(circle, black 20%, transparent 72%)",
                        }}
                    />
                </div>

                {/* ========================================================
            ORBIT 1
        ======================================================== */}

                <div
                    className="
            orbital-system
            absolute
            inset-0
            rounded-full
          "
                    style={{
                        transformStyle: "preserve-3d",
                        transform: "rotateX(67deg) rotateZ(18deg)",
                    }}
                >
                    <div
                        className="
              absolute
              inset-[16%]
              rounded-full
              border
              border-lime-400/50
            "
                    />

                    <div
                        className="
              absolute
              inset-[16%]
              rounded-full
              border
              border-emerald-400/20
            "
                        style={{
                            transform: "scaleY(.35)",
                        }}
                    />

                    {/* Currencies */}
                    {CURRENCIES.filter(
                        (currency) => currency.orbit === 0
                    ).map((currency, i) => (
                        <Currency
                            key={i}
                            {...currency}
                        />
                    ))}
                </div>

                {/* ========================================================
            ORBIT 2
        ======================================================== */}

                <div
                    className="
            orbital-system-secondary
            absolute
            inset-[5%]
            rounded-full
          "
                    style={{
                        transformStyle: "preserve-3d",
                        transform:
                            "rotateX(67deg) rotateZ(-42deg)",
                    }}
                >
                    <div
                        className="
              absolute
              inset-[17%]
              rounded-full
              border
              border-emerald-400/35
            "
                        style={{
                            transform: "scaleY(.43)",
                        }}
                    />

                    {CURRENCIES.filter(
                        (currency) => currency.orbit === 1
                    ).map((currency, i) => (
                        <Currency
                            key={i}
                            {...currency}
                        />
                    ))}
                </div>

                {/* ========================================================
            ORBIT 3
        ======================================================== */}

                <div
                    className="
            orbital-system-tertiary
            absolute
            inset-[12%]
            rounded-full
          "
                    style={{
                        transformStyle: "preserve-3d",
                        transform:
                            "rotateX(72deg) rotateZ(75deg)",
                    }}
                >
                    <div
                        className="
              absolute
              inset-[20%]
              rounded-full
              border
              border-lime-300/25
            "
                        style={{
                            transform: "scaleY(.27)",
                        }}
                    />

                    {CURRENCIES.filter(
                        (currency) => currency.orbit === 2
                    ).map((currency, i) => (
                        <Currency
                            key={i}
                            {...currency}
                        />
                    ))}
                </div>

                {/* ========================================================
            CORE RINGS
        ======================================================== */}

                <div
                    className="
            absolute
            left-1/2
            top-1/2
            h-[145px]
            w-[145px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-emerald-400/30
          "
                />

                <div
                    className="
            absolute
            left-1/2
            top-1/2
            h-[110px]
            w-[110px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-lime-400/20
          "
                />

                <div
                    className="
            absolute
            left-1/2
            top-1/2
            h-[76px]
            w-[76px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            border
            border-emerald-300/30
          "
                />

                {/* ========================================================
            REACTOR CORE
        ======================================================== */}

                <div
                    className="
            reactor-core
            absolute
            left-1/2
            top-1/2
            h-[34px]
            w-[34px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
          "
                    style={{
                        background:
                            "radial-gradient(circle, #d9f99d 0%, #84cc16 35%, #22c55e 60%, transparent 72%)",
                        boxShadow:
                            "0 0 25px rgba(132,204,22,.8), 0 0 70px rgba(34,197,94,.4)",
                    }}
                />

                {/* Core point */}
                <div
                    className="
            absolute
            left-1/2
            top-1/2
            h-[6px]
            w-[6px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-lime-100
          "
                />
            </div>

            {/* ============================================================
          SMALL HUD MARKERS
      ============================================================ */}

            <div
                className="
          absolute
          left-[13%]
          top-[31%]
          h-1
          w-10
          bg-emerald-400/50
        "
            />

            <div
                className="
          absolute
          right-[13%]
          bottom-[30%]
          h-1
          w-14
          bg-lime-400/40
        "
            />

            <div
                className="
          absolute
          right-[17%]
          top-[24%]
          h-2
          w-2
          rounded-full
          bg-emerald-400
          shadow-[0_0_12px_rgba(34,197,94,.9)]
        "
            />

            <div
                className="
          absolute
          left-[18%]
          bottom-[25%]
          h-2
          w-2
          rounded-full
          bg-lime-400
          shadow-[0_0_12px_rgba(132,204,22,.9)]
        "
            />
        </div>
    );
}

/* ================================================================
   CURRENCY PARTICLE
   ================================================================ */

interface CurrencyProps {
    symbol: string;
    color: string;
    orbit: number;
    position: number;
}

function Currency({
    symbol,
    color,
    position,
}: CurrencyProps) {
    const angle = position;

    const radius = 42;

    const x =
        50 +
        radius * Math.cos((angle * Math.PI) / 180);

    const y =
        50 +
        radius * Math.sin((angle * Math.PI) / 180);

    return (
        <div
            className="
        absolute
        left-1/2
        top-1/2
        h-9
        w-9
        -translate-x-1/2
        -translate-y-1/2
      "
            style={{
                left: `${x}%`,
                top: `${y}%`,
            }}
        >
            <div className="currency-counter h-full w-full">
                <div
                    className="
            flex
            h-full
            w-full
            items-center
            justify-center
            rounded-full
            border
            bg-black/60
            text-sm
            font-semibold
            backdrop-blur-sm
          "
                    style={{
                        color,
                        borderColor: `${color}55`,
                        boxShadow: `0 0 14px ${color}33`,
                    }}
                >
                    {symbol}
                </div>
            </div>
        </div>
    );
}