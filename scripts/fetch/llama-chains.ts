/**
 * TVL of the Orbit chains DefiLlama lists, from its free chain list (/v2/chains) and, on a backfill, each chain's
 * history (/v2/historicalChainTvl/{name}). Which Atlas row a chain belongs to is set by hand in
 * data/orbit-chain-map.csv. These chains settle to Arbitrum but hold their own TVL, so nothing here enters
 * Arbitrum's chain totals.
 */
import path from "node:path";
import { dateOf } from "../../src/lib/dates";
import type { Series } from "../../src/lib/history-types";
import { readCsvOrEmpty } from "../lib/csv";
import { DATA, HISTORY } from "../lib/paths";
import { readJson, upsertSeries, writeJsonStable } from "../lib/store";
import type { Ctx, RunResult } from "./context";
import { createClient } from "./http";

export const ORBIT_FILE = path.join(HISTORY, "defillama", "orbit-chains.json");
const BASE = "https://api.llama.fi";

export interface OrbitMapRow {
  project: string;
  chain: string;
}

export function parseOrbitMap(rows: Array<Record<string, string | undefined>>): OrbitMapRow[] {
  return rows.map((r) => ({ project: (r["Project"] ?? "").trim(), chain: (r["DefiLlama chain"] ?? "").trim() })).filter((r) => r.project && r.chain);
}

/** Current TVL per chain name from /v2/chains. */
export function parseChains(json: Array<{ name?: string; tvl?: number }>): Map<string, number> {
  return new Map(json.filter((c) => c.name && typeof c.tvl === "number" && Number.isFinite(c.tvl)).map((c) => [c.name as string, c.tvl as number]));
}

/** /v2/historicalChainTvl/{name}: [{ date, tvl }] as a dated series. */
export function parseChainHistory(json: Array<{ date?: number; tvl?: number }>): Series {
  return json.filter((p) => typeof p.date === "number" && typeof p.tvl === "number").map((p) => [dateOf(p.date as number), Math.round(p.tvl as number)] as [string, number]);
}

export async function run(ctx: Ctx): Promise<RunResult> {
  const map = parseOrbitMap(readCsvOrEmpty(path.join(DATA, "orbit-chain-map.csv")));
  if (!map.length) return { rows: 0, calls: 0, notes: ["skipped: no rows in data/orbit-chain-map.csv"] };
  const client = createClient({ name: "llama-chains", minIntervalMs: 1000, timeoutMs: 120_000 });
  const store = readJson<Record<string, Series>>(ORBIT_FILE, {});
  const now = parseChains(await client.getJson(`${BASE}/v2/chains`));
  const notes: string[] = [];
  let rows = 0;
  for (const { chain } of map) {
    const v = now.get(chain);
    if (v === undefined) {
      notes.push(`${chain}: not in DefiLlama's chain list`);
      continue;
    }
    let incoming: Series = [[ctx.today, Math.round(v)]];
    if (ctx.mode === "backfill" || !store[chain]?.length) {
      try {
        incoming = parseChainHistory(await client.getJson(`${BASE}/v2/historicalChainTvl/${encodeURIComponent(chain)}`));
      } catch (e) {
        notes.push(`${chain} history: ${(e as Error).message.slice(0, 120)}`);
      }
    }
    store[chain] = upsertSeries(store[chain] ?? [], incoming, { today: ctx.today, allowToday: true, revisionDays: ctx.mode === "backfill" ? 10_000 : 7 });
    rows += incoming.length;
  }
  if (!ctx.dryRun) writeJsonStable(ORBIT_FILE, store);
  notes.unshift(`${map.length} Orbit chains mapped, ${Object.keys(store).length} with history`);
  return { rows, calls: client.stats().calls, notes };
}
