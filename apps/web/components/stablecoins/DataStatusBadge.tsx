"use client";

import type { StablecoinDataStatus } from "@/lib/api";

const STATUS_STYLES: Record<
  StablecoinDataStatus,
  { label: string; badge: string; dot: string }
> = {
  LIVE: {
    label: "LIVE",
    badge: "bg-moss/10 text-moss border-moss/30",
    dot: "bg-moss",
  },
  CACHED: {
    label: "CACHED",
    badge: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    dot: "bg-[#F59E0B]",
  },
  FALLBACK: {
    label: "FALLBACK / STALE",
    badge: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
    dot: "bg-[#EF4444]",
  },
};

export default function DataStatusBadge({ status }: { status: StablecoinDataStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot} ${status === "LIVE" ? "animate-pulse" : ""}`} />
      {style.label}
    </span>
  );
}