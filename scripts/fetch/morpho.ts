/** Morpho's free GraphQL API: markets on Arbitrum (chain 42161), with unlisted and broken markets logged and never summed. */
import path from "node:path";
import type { MorphoMarketRecord, MorphoTotalsRow } from "../../src/lib/history-types";
import { HISTORY } from "../lib/paths";
import { appendDated, readJson, writeJsonStable } from "../lib/store";
import type { Ctx, RunResult } from "./context";
import { createClient } from "./http";
import { CHAIN } from "../../src/lib/chain";

export const MORPHO_URL = "https://api.morpho.org/graphql";
export const MARKETS_PAGE = 500;
/** One page of markets on the chain. The chain has more than one page of them, so the fetcher pages until a short page. */
export const marketsQuery = (skip = 0) => `{ markets(first: ${MARKETS_PAGE}, skip: ${skip}, where: { chainId_in: [${CHAIN.morphoChainId}] }) { items { marketId listed lltv loanAsset { symbol address } collateralAsset { symbol address } state { supplyAssetsUsd borrowAssetsUsd collateralAssetsUsd supplyApy } } } }`;
export const MARKETS_QUERY = marketsQuery(0);

/** Lending supply, borrowed and collateral posted across every market, the three figures the lending pop-up shows side by side. */
export function morphoTotals(markets: MorphoMarket[]): { supplyUsd: number; borrowUsd: number; collateralUsd: number } {
  const sum = (k: "supplyUsd" | "borrowUsd" | "collateralUsd") => Math.round(markets.reduce((a, m) => a + (m[k] ?? 0), 0));
  return { supplyUsd: sum("supplyUsd"), borrowUsd: sum("borrowUsd"), collateralUsd: sum("collateralUsd") };
}

export interface MorphoMarket {
  marketId: string;
  lltv: number | null;
  loan: { symbol: string; address: string } | null;
  collateral: { symbol: string; address: string } | null;
  supplyUsd: number | null;
  borrowUsd: number | null;
  collateralUsd: number | null;
  supplyApy?: number | null;
  /** Morpho's own listing flag; unlisted markets are left out of totals. Absent in older fixtures. */
  listed?: boolean | null;
}

export function parseMarkets(json: { data?: { markets?: { items?: Array<Record<string, unknown>> } }; errors?: unknown[] }): MorphoMarket[] {
  if (json.errors?.length && !json.data) throw new Error(`Morpho GraphQL: ${JSON.stringify(json.errors).slice(0, 200)}`);
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : v === null || v === undefined ? null : Number.isFinite(Number(v)) ? Number(v) : null);
  const asset = (a: unknown) => {
    const o = a as { symbol?: string; address?: string } | null;
    return o?.address ? { symbol: o.symbol ?? "", address: o.address.toLowerCase() } : null;
  };
  return (json.data?.markets?.items ?? []).map((m) => {
    const state = (m.state as Record<string, unknown> | null) ?? null;
    return {
      marketId: String(m.marketId ?? m.uniqueKey ?? ""),
      lltv: m.lltv === undefined || m.lltv === null ? null : Number(m.lltv) / 1e18,
      loan: asset(m.loanAsset),
      collateral: asset(m.collateralAsset),
      supplyUsd: state ? num(state.supplyAssetsUsd) : null,
      borrowUsd: state ? num(state.borrowAssetsUsd) : null,
      collateralUsd: state ? num(state.collateralAssetsUsd) : null,
      supplyApy: state ? num(state.supplyApy) : null,
      listed: typeof m.listed === "boolean" ? m.listed : null,
    };
  });
}

/** Supply APY above this (a fraction, so 500%) only happens in a broken or abandoned market. */
export const MAX_SANE_SUPPLY_APY = 5;

/**
 * Markets whose numbers cannot be real, or that Morpho itself does not list. On Arbitrum on Nov 17 2026 one unlisted
 * market (USDC against K) reported $33.0B of supply at 100% utilization and 36 others carried red warnings. Counting
 * listed markets only gives $141.0M borrowed against DefiLlama's $141.1M. Unlisted and broken markets are stored for
 * the record but never summed.
 */
export function isBrokenMarket(m: Pick<MorphoMarket, "supplyUsd" | "collateralUsd" | "supplyApy" | "listed">): boolean {
  if (m.listed === false) return true;
  if ((m.supplyApy ?? 0) > MAX_SANE_SUPPLY_APY) return true;
  return m.collateralUsd === null && (m.supplyUsd ?? 0) > 1_000_000;
}

export async function run(ctx: Ctx): Promise<RunResult> {
  const client = createClient({ name: "morpho", minIntervalMs: 1000 });
  const markets: MorphoMarket[] = [];
  for (let page = 0; page < 10; page++) {
    const batch = parseMarkets(await client.postJson(MORPHO_URL, { query: marketsQuery(page * MARKETS_PAGE) }));
    markets.push(...batch);
    if (batch.length < MARKETS_PAGE) break;
  }
  // The API can return the same market on two pages; keep one reading per id.
  const unique = Array.from(new Map(markets.map((m) => [m.marketId, m])).values());
  const broken = unique.filter(isBrokenMarket);
  const brokenIds = new Set(broken.map((m) => m.marketId));
  const file = path.join(HISTORY, "morpho", "markets.json");
  const store = readJson<Record<string, MorphoMarketRecord>>(file, {});
  for (const m of unique) {
    const rec = store[m.marketId] ?? { marketId: m.marketId, lltv: m.lltv, loan: m.loan, collateral: m.collateral, lookAlike: false, series: [] };
    rec.lltv = m.lltv;
    rec.loan = m.loan;
    rec.collateral = m.collateral;
    // Broken markets carry the same flag as look-alike collateral, so the build never sums them.
    rec.lookAlike = brokenIds.has(m.marketId);
    rec.series = appendDated(rec.series, [ctx.today, m.supplyUsd, m.borrowUsd, m.collateralUsd]);
    store[m.marketId] = rec;
  }
  const totals = morphoTotals(unique.filter((m) => !brokenIds.has(m.marketId)));
  const totalsFile = path.join(HISTORY, "morpho", "totals.json");
  if (!ctx.dryRun) {
    writeJsonStable(totalsFile, appendDated(readJson<MorphoTotalsRow[]>(totalsFile, []), [ctx.today, totals.supplyUsd, totals.borrowUsd, totals.collateralUsd]));
    writeJsonStable(file, store);
  }
  const brokenSupply = broken.reduce((t, m) => t + (m.supplyUsd ?? 0), 0);
  const notes = [`${unique.length} markets on ${CHAIN.name}, ${broken.length} unlisted or broken markets left out of totals ($${(brokenSupply / 1e9).toFixed(2)}B of reported supply)`];
  return { rows: unique.length, calls: client.stats().calls, notes };
}
