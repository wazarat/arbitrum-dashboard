import { describe, expect, it } from "vitest";
import { parseChainHistory, parseChains, parseOrbitMap } from "../scripts/fetch/llama-chains";
import { supplyNote } from "@/lib/chain";
import { headlineTierInput, isMeasured } from "@/lib/sector-metrics";
import { recomputeTier } from "@/lib/tier";
import { tractionReasons } from "@/lib/traction";
import { BRIDGED_USDC_E, CIRCLE_USDC_NATIVE, guardToken } from "@/lib/token-guard";
import { mkProject } from "./fixtures/project";

const END = "2026-11-16";
const orbit = (v: number) =>
  mkProject({ name: "Orbit L2", sector: "Orbit Chains & Rollup Infrastructure", subcategory: "Orbit chains (L2)", sectorMetrics: { orbitTvl: { v, asOf: END } } });

describe("Orbit chain TVL from DefiLlama's chain list", () => {
  it("reads current TVL per chain name and a chain's history", () => {
    const now = parseChains([{ name: "Robinhood Chain", tvl: 991_470_000 }, { name: "ReyaChain", tvl: 9_790_000 }, { name: "Broken" }]);
    expect(now.get("Robinhood Chain")).toBe(991_470_000);
    expect(now.has("Broken")).toBe(false);
    expect(parseChainHistory([{ date: 1794787200, tvl: 1010487108.4 }])).toEqual([["2026-11-16", 1010487108]]);
  });

  it("maps CSV rows to DefiLlama chain names and drops blank rows", () => {
    expect(parseOrbitMap([{ Project: "Reya Chain", "DefiLlama chain": "ReyaChain" }, { Project: "", "DefiLlama chain": "X" }])).toEqual([{ project: "Reya Chain", chain: "ReyaChain" }]);
  });
});

describe("Orbit traction and tiers", () => {
  it("counts $1M of chain TVL as traction and ranks it like TVL", () => {
    expect(tractionReasons(orbit(1_160_000))).toContain("orbit");
    expect(tractionReasons(orbit(5_000))).not.toContain("orbit");
    expect(recomputeTier({ ...headlineTierInput(orbit(1_010_000_000)), fees: null, revenue: null })).toBe("Tier 1 - Leader");
    expect(recomputeTier({ ...headlineTierInput(orbit(9_780_000)), fees: null, revenue: null })).toBe("Tier 2 - Strong");
  });

  it("reads a chain under $1M as Tracked, negligible, never a tier", () => {
    expect(recomputeTier({ ...headlineTierInput(orbit(5_152)), fees: null, revenue: null })).toBe("Tracked, negligible");
  });

  it("measures Orbit chain rows only", () => {
    expect(isMeasured({ sector: "Orbit Chains & Rollup Infrastructure", subcategory: "Orbit chains (L3)" })).toBe(true);
    expect(isMeasured({ sector: "Orbit Chains & Rollup Infrastructure", subcategory: "Core protocol and network" })).toBe(false);
  });
});

describe("supply counted on another row", () => {
  it("tells Tether readers its Arbitrum supply sits on USDT0", () => {
    expect(supplyNote({ name: "Tether" })).toContain("USDT0");
    expect(supplyNote({ name: "USDT0" })).toBeNull();
  });
});

describe("USDC spoof guard on Arbitrum", () => {
  const row = (address: string, symbol: string) => ({ project: "USDC", address, role: "stablecoin", symbol, decimals: 6, name: null });
  it("accepts native USDC and bridged USDC.e at their own addresses", () => {
    expect(guardToken(row(CIRCLE_USDC_NATIVE, "USDC"), undefined)).toEqual([]);
    expect(guardToken(row(BRIDGED_USDC_E, "USDC.e"), undefined)).toEqual([]);
  });
  it("rejects a USDC or USDC.e anywhere else, and a USDC with the wrong decimals", () => {
    expect(guardToken(row("0x0000000000000000000000000000000000000001", "USDC"), undefined).join(" ")).toContain("copy");
    expect(guardToken(row(CIRCLE_USDC_NATIVE, "USDC.e"), undefined).join(" ")).toContain("copy");
    expect(guardToken({ ...row(CIRCLE_USDC_NATIVE, "USDC"), decimals: 18 }, undefined).join(" ")).toContain("decimals");
  });
});
