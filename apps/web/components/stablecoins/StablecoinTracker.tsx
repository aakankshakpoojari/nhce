"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, RefreshCw, Search, Activity, Layers, Banknote } from "lucide-react";
import { apiErrorMessage } from "@/hooks/useApiFetch";
import {
  fetchStablecoinMarkets,
  formatRelative,
  type StablecoinMarket,
  type StablecoinMarketsResponse,
} from "@/lib/api";
import DataStatusBadge from "./DataStatusBadge";
import StablecoinTable from "./StablecoinTable";

const POLL_INTERVAL_MS = 60_000;

function formatCompactUsd(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

const STATUS_BANNERS: Record<
  StablecoinMarketsResponse["dataStatus"],
  { title: string; body: string; tone: string }
> = {
  LIVE: {
    title: "Live market data",
    body: "Streamed from CoinGecko through the Dracarys API.",
    tone: "border-moss/30 bg-moss/5",
  },
  CACHED: {
    title: "Provider temporarily unreachable — showing last snapshot",
    body: "The market provider could not be reached. Values below are the most recent successful snapshot and may be stale.",
    tone: "border-[#F59E0B]/30 bg-[#F59E0B]/5",
  },
  FALLBACK: {
    title: "Fallback reference snapshot — not live data",
    body: "Neither the market provider nor a cached snapshot was available. Values are static reference approximations and should not be used for settlement decisions.",
    tone: "border-[#EF4444]/30 bg-[#EF4444]/5",
  },
};

export default function StablecoinTracker() {
  const [data, setData] = useState<StablecoinMarketsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Initial load + manual refresh (state updates only after await).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchStablecoinMarkets();
        if (!cancelled) {
          setData(res.data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Conservative silent background refresh — matches the backend cache TTL,
  // so the provider is hit at most once per minute, never on a tight loop.
  useEffect(() => {
    let stopped = false;
    const id = setInterval(async () => {
      try {
        const res = await fetchStablecoinMarkets();
        if (!stopped) setData(res.data);
      } catch {
        // Keep the last known data; the backend itself degrades to CACHED/FALLBACK.
      }
    }, POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const filteredCoins: StablecoinMarket[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!data) return [];
    if (!q) return data.coins;
    return data.coins.filter(
      (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
    );
  }, [data, query]);

  const banner = data ? STATUS_BANNERS[data.dataStatus] : null;

  return (
    <main className="flex-1 w-full mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-moss font-semibold flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            Cross-Border Settlement Layer
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Stablecoin Intelligence
          </h1>
          <p className="text-muted text-sm max-w-2xl">
            Live stablecoin market data powering Dracarys cross-border settlement. Monitor price
            stability, liquidity, and settlement-readiness for the assets backing global payouts.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-moss hover:bg-[#BEF264] disabled:opacity-60 text-background font-semibold text-xs uppercase tracking-wider transition shrink-0 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && !data ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-moss" />
          <p className="text-sm font-mono">Fetching stablecoin market data…</p>
        </div>
      ) : error && !data ? (
        /* Error state — should be rare: the backend degrades gracefully. */
        <div className="flex flex-col items-center justify-center py-24 bg-surface border border-[#EF4444]/30 rounded-2xl space-y-4 px-6 text-center">
          <AlertCircle className="w-10 h-10 text-[#EF4444]" />
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Could not load market data</h3>
            <p className="text-sm text-muted">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-5 py-2.5 rounded-xl bg-moss hover:bg-[#BEF264] text-background font-semibold text-xs uppercase tracking-wider transition"
          >
            Try Again
          </button>
        </div>
      ) : data ? (
        <>
          {/* Data status + summary */}
          <div className="space-y-4">
            {banner && (
              <div className={`rounded-2xl border px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${banner.tone}`}>
                <DataStatusBadge status={data.dataStatus} />
                <div className="text-sm">
                  <span className="font-semibold text-foreground">{banner.title}</span>
                  <span className="text-muted block sm:inline sm:ml-1">{banner.body}</span>
                </div>
                <span className="sm:ml-auto text-[11px] font-mono text-muted shrink-0">
                  Updated {formatRelative(data.lastUpdated)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface border border-surface-border rounded-2xl p-6">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
                  <Layers className="w-3.5 h-3.5 text-moss" />
                  Stablecoins Tracked
                </div>
                <div className="text-3xl font-black text-foreground tracking-tight font-mono">
                  {data.summary.trackedCount}
                </div>
              </div>
              <div className="bg-surface border border-surface-border rounded-2xl p-6">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
                  <Banknote className="w-3.5 h-3.5 text-moss" />
                  Total Market Cap
                </div>
                <div className="text-3xl font-black text-foreground tracking-tight font-mono">
                  {formatCompactUsd(data.summary.totalMarketCap)}
                </div>
              </div>
              <div className="bg-surface border border-surface-border rounded-2xl p-6">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-muted mb-2">
                  <Activity className="w-3.5 h-3.5 text-moss" />
                  Total 24h Volume
                </div>
                <div className="text-3xl font-black text-foreground tracking-tight font-mono">
                  {formatCompactUsd(data.summary.totalVolume24h)}
                </div>
              </div>
            </div>
          </div>

          {/* Search + table */}
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or symbol…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-moss/50 transition"
              />
            </div>

            {filteredCoins.length > 0 ? (
              <StablecoinTable coins={filteredCoins} />
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 bg-surface border border-surface-border rounded-2xl space-y-3 px-6 text-center">
                <Search className="w-8 h-8 text-muted" />
                <h3 className="text-base font-bold text-foreground">No stablecoins match “{query}”</h3>
                <p className="text-xs text-muted">Try a different name or symbol.</p>
              </div>
            )}
          </div>

          {/* Footnotes */}
          <div className="rounded-2xl bg-background/60 border border-surface-border px-5 py-4 space-y-1.5 text-[11px] text-muted">
            <p>
              <span className="font-mono text-foreground">Peg deviation</span> is computed as{" "}
              <span className="font-mono">|current price − target peg|</span> (USD target for
              USD-pegged assets).
            </p>
            <p>
              <span className="font-mono text-foreground">Settlement readiness</span> is a Dracarys
              assessment of settlement suitability — it is not a market-data-provider rating.
            </p>
            <p className="font-mono">
              Source: CoinGecko public API · proxied through Dracarys API ({data.source})
            </p>
          </div>
        </>
      ) : null}
    </main>
  );
}