/**
 * @file stablecoin.service.ts
 * @description Cross-Border Stablecoin Intelligence service.
 * Fetches stablecoin market data from a public market-data provider (CoinGecko)
 * through the backend, normalizes it into a clean Dracarys response shape, and
 * degrades gracefully: LIVE -> CACHED -> FALLBACK.
 *
 * Provider-specific logic lives entirely in this module — the controller and
 * frontend only ever see the normalized shape below.
 */

import { env } from '../config/env.config';

export type StablecoinDataStatus = 'LIVE' | 'CACHED' | 'FALLBACK';

/* ------------------------- Provider response shape ------------------------- */

interface CoinGeckoMarket {
  id?: unknown;
  symbol?: unknown;
  name?: unknown;
  current_price?: unknown;
  market_cap?: unknown;
  market_cap_rank?: unknown;
  total_volume?: unknown;
  price_change_percentage_24h?: unknown;
  last_updated?: unknown;
}

/* ----------------------- Dracarys-side metadata (static) ----------------------- */

export interface DracarysStablecoinMetadata {
  /** Target peg currency, e.g. "USD" or "EUR". */
  peg: string;
  /** USD value of the target peg, used for deviation math. Null when the peg is not USD. */
  pegTargetUsd: number | null;
  /** Networks the asset is commonly available on. */
  networks: string[];
  /** Dracarys assessment of the asset's relevance for cross-border settlement. */
  settlementRelevance: 'HIGH' | 'MEDIUM' | 'LOW';
  /** Dracarys settlement-readiness assessment — NOT a market-data-provider rating. */
  settlementReadiness: 'READY' | 'CONDITIONAL' | 'NOT_RECOMMENDED';
  notes?: string;
}

const DRACARYS_METADATA: Record<string, DracarysStablecoinMetadata> = {
  tether: {
    peg: 'USD',
    pegTargetUsd: 1,
    networks: ['Ethereum', 'Tron', 'BNB Chain', 'Solana', 'Avalanche'],
    settlementRelevance: 'HIGH',
    settlementReadiness: 'READY',
    notes: 'Most liquid stablecoin; widely accepted for payouts.',
  },
  'usd-coin': {
    peg: 'USD',
    pegTargetUsd: 1,
    networks: ['Ethereum', 'Solana', 'Base', 'Arbitrum', 'Polygon'],
    settlementRelevance: 'HIGH',
    settlementReadiness: 'READY',
    notes: 'Regulated issuer (Circle); preferred for cross-border settlement.',
  },
  dai: {
    peg: 'USD',
    pegTargetUsd: 1,
    networks: ['Ethereum'],
    settlementRelevance: 'MEDIUM',
    settlementReadiness: 'CONDITIONAL',
    notes: 'Decentralized, CDP-backed; less capital efficient at high volume.',
  },
  usds: {
    peg: 'USD',
    pegTargetUsd: 1,
    networks: ['Ethereum'],
    settlementRelevance: 'MEDIUM',
    settlementReadiness: 'CONDITIONAL',
    notes: 'Sky (ex-Maker) upgrade of DAI.',
  },
  usde: {
    peg: 'USD',
    pegTargetUsd: 1,
    networks: ['Ethereum'],
    settlementRelevance: 'MEDIUM',
    settlementReadiness: 'CONDITIONAL',
    notes: 'Yield-bearing (Ethena); verify liquidity depth before settlement.',
  },
  'first-digital-usd': {
    peg: 'USD',
    pegTargetUsd: 1,
    networks: ['Ethereum', 'BNB Chain'],
    settlementRelevance: 'MEDIUM',
    settlementReadiness: 'CONDITIONAL',
    notes: 'FDUSD; liquidity concentrated in the Binance ecosystem.',
  },
  paxos: {
    peg: 'USD',
    pegTargetUsd: 1,
    networks: ['Ethereum', 'Solana'],
    settlementRelevance: 'MEDIUM',
    settlementReadiness: 'READY',
    notes: 'PYUSD; PayPal ecosystem, regulated by NYDFS.',
  },
  truedai: {
    peg: 'USD',
    pegTargetUsd: 1,
    networks: ['Ethereum'],
    settlementRelevance: 'LOW',
    settlementReadiness: 'CONDITIONAL',
    notes: 'TUSD; thin on-chain liquidity.',
  },
  eurc: {
    peg: 'EUR',
    pegTargetUsd: null,
    networks: ['Ethereum', 'Avalanche'],
    settlementRelevance: 'MEDIUM',
    settlementReadiness: 'CONDITIONAL',
    notes: 'Euro-pegged; suited to EUR-denominated payouts.',
  },
};

/* ------------------------------ Normalized types ------------------------------ */

export interface StablecoinMarket {
  id: string;
  symbol: string;
  name: string;
  price: number | null;
  priceChange24h: number | null;
  marketCap: number | null;
  marketCapRank: number | null;
  volume24h: number | null;
  /** Provider-side last-updated timestamp. */
  lastUpdated: string | null;
  /**
   * Explicit deviation from the target peg, e.g. |price - 1| for USD-pegged
   * assets. Null when the peg target is not USD or price is unavailable.
   */
  pegDeviation: number | null;
  metadata: DracarysStablecoinMetadata | null;
}

export interface StablecoinSummary {
  trackedCount: number;
  totalMarketCap: number;
  totalVolume24h: number;
}

export interface StablecoinMarketsResponse {
  source: string;
  dataStatus: StablecoinDataStatus;
  lastUpdated: string;
  isFallback: boolean;
  coins: StablecoinMarket[];
  summary: StablecoinSummary;
}

/* ------------------------------ Cache & timing ------------------------------ */

const CACHE_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 8_000;

interface CacheEntry {
  data: StablecoinMarketsResponse;
  fetchedAt: number;
}

let liveCache: CacheEntry | null = null;

/* ------------------------------ Helpers ------------------------------ */

function toFinite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function sum(values: Array<number | null>): number {
  return values.reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } }).finally(() => clearTimeout(timer));
}

function normalizeCoin(raw: CoinGeckoMarket): StablecoinMarket | null {
  const id = isNonEmptyString(raw.id) ? raw.id : null;
  const symbol = isNonEmptyString(raw.symbol) ? raw.symbol.toUpperCase() : null;
  if (!id || !symbol) return null;

  const name = isNonEmptyString(raw.name) ? raw.name : symbol;
  const price = toFinite(raw.current_price);
  const metadata = DRACARYS_METADATA[id] ?? null;

  // Explicit peg-deviation calculation: distance from the target peg's USD value.
  const pegDeviation =
    price !== null && metadata?.pegTargetUsd !== null && metadata?.pegTargetUsd !== undefined
      ? Math.abs(price - metadata.pegTargetUsd)
      : null;

  return {
    id,
    symbol,
    name,
    price,
    priceChange24h: toFinite(raw.price_change_percentage_24h),
    marketCap: toFinite(raw.market_cap),
    marketCapRank: toFinite(raw.market_cap_rank),
    volume24h: toFinite(raw.total_volume),
    lastUpdated: isNonEmptyString(raw.last_updated) ? raw.last_updated : null,
    pegDeviation,
    metadata,
  };
}

function buildSummary(coins: StablecoinMarket[]): StablecoinSummary {
  return {
    trackedCount: coins.length,
    totalMarketCap: sum(coins.map((c) => c.marketCap)),
    totalVolume24h: sum(coins.map((c) => c.volume24h)),
  };
}

/* ------------------------------ Provider fetch ------------------------------ */

async function fetchLiveMarkets(): Promise<StablecoinMarketsResponse> {
  const url = `${env.STABLECOIN_API_BASE_URL}/coins/markets?vs_currency=usd&category=stablecoins&order=market_cap_desc&per_page=100&page=1&sparkline=false`;
  const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
  if (!res.ok) {
    throw new Error(`Market provider returned HTTP ${res.status}`);
  }

  const payload: unknown = await res.json();
  if (!Array.isArray(payload)) {
    throw new Error('Market provider returned an unexpected payload shape');
  }

  const coins = payload
    .map((raw) => normalizeCoin(raw as CoinGeckoMarket))
    .filter((coin): coin is StablecoinMarket => coin !== null);

  const fetchedAt = new Date().toISOString();
  return {
    source: 'coingecko',
    dataStatus: 'LIVE',
    lastUpdated: fetchedAt,
    isFallback: false,
    coins,
    summary: buildSummary(coins),
  };
}

/* ------------------------------ Fallback snapshot ------------------------------ */

/**
 * Static reference snapshot served only when both the live provider AND the
 * in-memory cache are unavailable. Approximate reference figures — the
 * frontend clearly labels this as fallback/stale, never as live data.
 */
function buildFallback(): StablecoinMarketsResponse {
  const snapshot = [
    { id: 'tether', symbol: 'USDT', name: 'Tether', price: 0.9999, priceChange24h: 0.03, marketCap: 183_360_000_000, marketCapRank: 3, volume24h: 71_170_000_000 },
    { id: 'usd-coin', symbol: 'USDC', name: 'USDC', price: 0.9999, priceChange24h: 0.01, marketCap: 74_300_000_000, marketCapRank: 6, volume24h: 20_030_000_000 },
    { id: 'usds', symbol: 'USDS', name: 'USDS', price: 0.9998, priceChange24h: 0.01, marketCap: 9_790_000_000, marketCapRank: 14, volume24h: 180_000_000 },
    { id: 'dai', symbol: 'DAI', name: 'Dai', price: 1.0, priceChange24h: 0.02, marketCap: 4_600_000_000, marketCapRank: 22, volume24h: 365_000_000 },
    { id: 'first-digital-usd', symbol: 'FDUSD', name: 'First Digital USD', price: 0.9999, priceChange24h: 0.01, marketCap: 2_050_000_000, marketCapRank: 33, volume24h: 4_200_000_000 },
    { id: 'paxos', symbol: 'PYUSD', name: 'PayPal USD', price: 0.9999, priceChange24h: 0.01, marketCap: 1_100_000_000, marketCapRank: 48, volume24h: 120_000_000 },
    { id: 'usde', symbol: 'USDe', name: 'USDe', price: 1.0, priceChange24h: 0.01, marketCap: 2_600_000_000, marketCapRank: 30, volume24h: 90_000_000 },
    { id: 'truedai', symbol: 'TUSD', name: 'TrueUSD', price: 0.9998, priceChange24h: 0.01, marketCap: 300_000_000, marketCapRank: 120, volume24h: 25_000_000 },
    { id: 'eurc', symbol: 'EURC', name: 'EURC', price: 1.083, priceChange24h: 0.05, marketCap: 130_000_000, marketCapRank: 180, volume24h: 10_000_000 },
  ];

  const coins: StablecoinMarket[] = snapshot.map((c) => {
    const metadata = DRACARYS_METADATA[c.id] ?? null;
    const pegDeviation =
      metadata?.pegTargetUsd !== null && metadata?.pegTargetUsd !== undefined
        ? Math.abs(c.price - metadata.pegTargetUsd)
        : null;
    return {
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      price: c.price,
      priceChange24h: c.priceChange24h,
      marketCap: c.marketCap,
      marketCapRank: c.marketCapRank,
      volume24h: c.volume24h,
      lastUpdated: null,
      pegDeviation,
      metadata,
    };
  });

  return {
    source: 'coingecko',
    dataStatus: 'FALLBACK',
    lastUpdated: new Date().toISOString(),
    isFallback: true,
    coins,
    summary: buildSummary(coins),
  };
}

/* ------------------------------ Public entry ------------------------------ */

/**
 * Returns stablecoin market data, degrading gracefully:
 * 1. fresh in-memory cache  -> LIVE
 * 2. successful provider hit -> LIVE (and cached)
 * 3. provider failure + cache -> CACHED (last successful snapshot)
 * 4. nothing available -> FALLBACK (static reference snapshot)
 */
export async function getStablecoinMarkets(): Promise<StablecoinMarketsResponse> {
  const now = Date.now();

  if (liveCache && now - liveCache.fetchedAt < CACHE_TTL_MS) {
    return liveCache.data;
  }

  try {
    const data = await fetchLiveMarkets();
    liveCache = { data, fetchedAt: Date.now() };
    return data;
  } catch {
    if (liveCache) {
      return { ...liveCache.data, dataStatus: 'CACHED' as const };
    }
    return buildFallback();
  }
}

export const stablecoinService = { getStablecoinMarkets };