"use client";

import type { StablecoinMarket, StablecoinMetadata } from "@/lib/api";

const READINESS_STYLES: Record<StablecoinMetadata["settlementReadiness"], string> = {
  READY: "bg-moss/10 text-moss border-moss/30",
  CONDITIONAL: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
  NOT_RECOMMENDED: "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
};

const READINESS_LABELS: Record<StablecoinMetadata["settlementReadiness"], string> = {
  READY: "Ready",
  CONDITIONAL: "Conditional",
  NOT_RECOMMENDED: "Not Recommended",
};

const RELEVANCE_LABELS: Record<StablecoinMetadata["settlementRelevance"], string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

/* ------------------------------ Formatters ------------------------------ */

function formatPrice(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

function formatCompact(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null): { text: string; tone: string } | null {
  if (value === null || Number.isNaN(value)) return null;
  const sign = value > 0 ? "+" : "";
  return {
    text: `${sign}${value.toFixed(2)}%`,
    tone: value >= 0 ? "text-[#22C55E]" : "text-[#EF4444]",
  };
}

function formatDeviation(value: number | null, peg: string | undefined): string {
  if (value === null || Number.isNaN(value)) return "—";
  const formatted = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 4 }).format(value);
  return `±$${formatted} vs ${peg ?? "peg"}`;
}

function formatRank(value: number | null): string {
  return value === null ? "—" : `#${value}`;
}

function formatTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------ Row pieces ------------------------------ */

function AssetCell({ coin }: { coin: StablecoinMarket }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-full bg-moss/10 border border-moss/20 flex items-center justify-center text-moss font-mono text-[11px] font-bold shrink-0">
        {coin.symbol.slice(0, 4)}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-foreground truncate">{coin.name}</div>
        <div className="text-[11px] font-mono text-muted uppercase tracking-wider">{coin.symbol}</div>
      </div>
    </div>
  );
}

function ReadinessCell({ metadata }: { metadata: StablecoinMetadata | null }) {
  if (!metadata) return <span className="text-xs text-muted">—</span>;
  const tone = READINESS_STYLES[metadata.settlementReadiness];
  const label = READINESS_LABELS[metadata.settlementReadiness];
  return (
    <div className="flex flex-col items-start gap-1">
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border ${tone}`}>
        {label}
      </span>
      <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
        {RELEVANCE_LABELS[metadata.settlementRelevance]} relevance
      </span>
    </div>
  );
}

function NetworksCell({ metadata }: { metadata: StablecoinMetadata | null }) {
  if (!metadata || metadata.networks.length === 0) return <span className="text-xs text-muted">—</span>;
  const shown = metadata.networks.slice(0, 3);
  const extra = metadata.networks.length - shown.length;
  return (
    <div className="flex flex-wrap gap-1 max-w-[180px]">
      {shown.map((n) => (
        <span
          key={n}
          className="px-1.5 py-0.5 rounded bg-background border border-surface-border text-[10px] font-mono text-muted"
        >
          {n}
        </span>
      ))}
      {extra > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-muted">+{extra}</span>}
    </div>
  );
}

function PriceChangeCell({ value }: { value: number | null }) {
  const pct = formatPercent(value);
  if (!pct) return <span className="text-xs font-mono text-muted">—</span>;
  return <span className={`text-xs font-mono font-semibold ${pct.tone}`}>{pct.text}</span>;
}

/* ------------------------------ Table ------------------------------ */

export default function StablecoinTable({ coins }: { coins: StablecoinMarket[] }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-surface border border-surface-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-surface-border bg-background/40">
              {["Asset", "Price", "24h", "Market Cap", "Volume 24h", "Peg", "Networks", "Settlement"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/70">
            {coins.map((coin) => (
              <tr key={coin.id} className="hover:bg-background/40 transition-colors">
                <td className="px-5 py-4">
                  <AssetCell coin={coin} />
                </td>
                <td className="px-5 py-4 text-sm font-mono text-foreground">{formatPrice(coin.price)}</td>
                <td className="px-5 py-4">
                  <PriceChangeCell value={coin.priceChange24h} />
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-mono text-foreground">{formatCompact(coin.marketCap)}</div>
                  <div className="text-[10px] font-mono text-muted">Rank {formatRank(coin.marketCapRank)}</div>
                </td>
                <td className="px-5 py-4 text-sm font-mono text-foreground">{formatCompact(coin.volume24h)}</td>
                <td className="px-5 py-4">
                  <div className="text-xs font-mono text-foreground">{coin.metadata?.peg ?? "—"}</div>
                  <div className="text-[10px] font-mono text-muted">
                    {formatDeviation(coin.pegDeviation, coin.metadata?.peg)}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <NetworksCell metadata={coin.metadata} />
                </td>
                <td className="px-5 py-4">
                  <ReadinessCell metadata={coin.metadata} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {coins.map((coin) => (
          <div key={coin.id} className="bg-surface border border-surface-border rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <AssetCell coin={coin} />
              <div className="text-right">
                <div className="text-base font-mono font-bold text-foreground">{formatPrice(coin.price)}</div>
                <PriceChangeCell value={coin.priceChange24h} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-background/60 border border-surface-border p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted">Market Cap</div>
                <div className="font-mono text-foreground mt-0.5">{formatCompact(coin.marketCap)}</div>
                <div className="text-[10px] font-mono text-muted">Rank {formatRank(coin.marketCapRank)}</div>
              </div>
              <div className="rounded-xl bg-background/60 border border-surface-border p-3">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted">Volume 24h</div>
                <div className="font-mono text-foreground mt-0.5">{formatCompact(coin.volume24h)}</div>
                <div className="text-[10px] font-mono text-muted">Updated {formatTime(coin.lastUpdated)}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-muted">
                {coin.metadata?.peg ?? "—"} peg · {formatDeviation(coin.pegDeviation, coin.metadata?.peg)}
              </div>
              <ReadinessCell metadata={coin.metadata} />
            </div>
            <NetworksCell metadata={coin.metadata} />
          </div>
        ))}
      </div>
    </>
  );
}