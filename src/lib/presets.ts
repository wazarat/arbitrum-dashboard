import { meta, projects } from "./data";

/** Named comparison sets from the brief; resolved by project name, missing names skipped. */
export const COMPARE_PRESETS: Array<{ name: string; projects: string[] }> = [
  { name: "DEXs", projects: ["Uniswap", "Aerodrome (Aero)", "Camelot", "PancakeSwap"] },
  { name: "Lending", projects: ["Aave", "Morpho", "Fluid", "Dolomite"] },
  // The four perps venues with the most open interest on the last refresh (scripts/build-data.ts); the brief's list until history exists.
  { name: "Perps", projects: meta.perpsPreset?.length ? meta.perpsPreset : ["GMX", "Ostium", "Variational", "edgeX"] },
  { name: "Yield", projects: ["Spark", "Pendle", "USD.AI"] },
  { name: "Orbit chains", projects: ["ApeChain", "Xai", "Robinhood Chain", "Reya Chain"] },
];

const byName = new Map(projects.map((p) => [p.name.toLowerCase(), p.id]));

export function resolvePreset(names: string[], lookup: Map<string, string> = byName): string[] {
  return names.map((n) => lookup.get(n.toLowerCase())).filter((id): id is string => Boolean(id));
}

/** Presets with at least two resolvable projects. */
export function availablePresets(lookup?: Map<string, string>) {
  return COMPARE_PRESETS.map((p) => ({ name: p.name, ids: resolvePreset(p.projects, lookup) })).filter((p) => p.ids.length >= 2);
}
