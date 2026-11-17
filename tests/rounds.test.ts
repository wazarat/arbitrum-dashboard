import { describe, expect, it } from "vitest";
import { aggregateInvestors, investorId, makeResolver, quarterOf, roundBucket, splitInvestors, toRound } from "@/lib/rounds";

const resolve = makeResolver([
  { id: "lighter", name: "Lighter" },
  { id: "ondo-global-markets", name: "Ondo Global Markets" },
  { id: "equalfi", name: "EqualFi" },
]);

describe("rounds", () => {
  it("parses a round with blanks as null and splits investors", () => {
    const r = toRound(
      { Project: "Lighter", "Round Type": "Series round", Date: "2025-11-11", "Amount (USD)": "68000000", "Amount Note": "At $1.5B valuation", "Lead Investors": "Founders Fund; Ribbit Capital", "Other Investors": "Haun Ventures; Robinhood", "Arbitrum Related": "Yes", Confidence: "Sourced", "Source URL": "https://x" },
      2,
      resolve,
    );
    expect(r.projectId).toBe("lighter");
    expect(r.amount).toBe(68_000_000);
    expect(r.leadInvestors).toEqual(["Founders Fund", "Ribbit Capital"]);
    expect(r.otherInvestors).toEqual(["Haun Ventures", "Robinhood"]);
    expect(r.related).toBe(true);
    expect(r.bucket).toBe("Series rounds");
    const u = toRound({ Project: "Camelot", "Round Type": "Strategic investment", Date: "", "Amount (USD)": "", "Lead Investors": "Tandem (Offchain Labs)", Confidence: "Prior knowledge (re-verify)" }, 3, resolve);
    expect(u.date).toBeNull();
    expect(u.amount).toBeNull();
    expect(u.projectId).toBeNull();
    expect(u.confidence).toBe("Prior knowledge (re-verify)");
    expect(u.bucket).toBe("Strategic");
  });
  it("resolves aliases and normalized names", () => {
    expect(toRound({ Project: "Ondo Global Markets", "Round Type": "Series A" }, 1, resolve).projectId).toBe("ondo-global-markets");
    expect(toRound({ Project: "EqualFi (EqualIndex)", "Round Type": "Program award" }, 1, resolve).projectId).toBe("equalfi");
    expect(splitInvestors("Undisclosed")).toEqual([]);
    expect(investorId("Tandem (Offchain Labs)")).toBe("tandem");
    expect(roundBucket("Token sale")).toBe("Token sale");
    expect(roundBucket("Ecosystem incentive")).toBe("Programs and awards");
    expect(quarterOf("2026-08-14")).toBe("2026 Q3");
  });
  it("aggregates investors with led counts and disclosed totals", () => {
    const rows = [
      toRound({ Project: "Lighter", "Round Type": "Series round", Date: "2025-11-11", "Amount (USD)": "68000000", "Lead Investors": "Founders Fund", "Other Investors": "Robinhood", "Arbitrum Related": "Yes" }, 1, resolve),
      toRound({ Project: "Arcus", "Round Type": "Strategic", Date: "2026-07-01", "Lead Investors": "Robinhood Crypto", "Arbitrum Related": "Yes" }, 2, resolve),
      toRound({ Project: "Allium", "Round Type": "Series A", Date: "2024-07-01", "Amount (USD)": "16500000", "Lead Investors": "Founders Fund; Founders Fund" }, 3, resolve),
    ];
    const inv = aggregateInvestors(rows);
    const ff = inv.find((i) => i.id === "founders-fund")!;
    expect(ff.deals).toBe(2);
    expect(ff.led).toBe(3);
    expect(ff.totalDisclosed).toBe(84_500_000);
    expect(ff.relatedDeals).toBe(1);
    expect(ff.projects.map((p) => p.name)).toEqual(["Lighter", "Allium"]);
    expect(inv[0].id).toBe("founders-fund");
  });
});

describe("investor aliases", () => {
  it("merges spellings of one firm and keeps different funds apart", async () => {
    const { aggregateInvestors, canonicalInvestor } = await import("@/lib/rounds");
    expect(canonicalInvestor("Andreessen Horowitz")).toBe("a16z crypto");
    expect(canonicalInvestor("a16z")).toBe("a16z crypto");
    expect(canonicalInvestor("Binance Labs")).toBe("YZi Labs");
    expect(canonicalInvestor("Paradigm Capital")).toBe("Paradigm");
    expect(canonicalInvestor("Coinbase")).toBe("Coinbase");
    expect(canonicalInvestor("Coinbase Ventures")).toBe("Coinbase Ventures");
    expect(canonicalInvestor("Binance Labs")).toBe("YZi Labs");
    expect(canonicalInvestor("a16z")).toBe("a16z crypto");
    expect(canonicalInvestor("Andreessen Horowitz")).toBe("a16z crypto");
    expect(canonicalInvestor("Paradigm Capital")).toBe("Paradigm");
    expect(canonicalInvestor("Lightspeed Faction")).toBe("Lightspeed Faction");
    const base = { projectId: null, roundType: "Seed", bucket: "Seed and angel" as const, date: null, amount: null, amountNote: null, related: false, confidence: "Sourced" as const, sourceUrl: null };
    const inv = aggregateInvestors([
      { ...base, id: "a", project: "A", leadInvestors: ["a16z"], otherInvestors: ["Lightspeed Faction"] },
      { ...base, id: "b", project: "B", leadInvestors: ["Andreessen Horowitz"], otherInvestors: ["Lightspeed Venture Partners"] },
    ]);
    expect(inv.find((i) => i.name === "a16z crypto")?.deals).toBe(2);
    expect(inv.filter((i) => i.name.startsWith("Lightspeed")).map((i) => i.deals)).toEqual([1, 1]);
  });
});

describe("Arbitrum investor aliases", () => {
  it("merges every Open House and Founder House city into one investor", async () => {
    const { canonicalInvestor } = await import("@/lib/rounds");
    for (const n of ["Arbitrum Open House London", "Arbitrum Founder House London", "Arbitrum Open House NYC", "Arbitrum Founder House NYC", "Arbitrum Founder House Singapore", " arbitrum founder house singapore "]) expect(canonicalInvestor(n), n).toBe("Arbitrum Open House");
    expect(canonicalInvestor("Arbitrum")).toBe("Arbitrum Foundation");
    expect(canonicalInvestor("Arbitrum Foundation")).toBe("Arbitrum Foundation");
    expect(canonicalInvestor("Arbitrum DAO (DRIP)")).toBe("Arbitrum DAO");
    expect(canonicalInvestor("Arbitrum DAO")).toBe("Arbitrum DAO");
    expect(canonicalInvestor("Arbitrum Gaming Ventures")).toBe("Arbitrum Gaming Ventures");
    expect(canonicalInvestor("Arbitrum Mentorship Program")).toBe("Arbitrum Mentorship Program");
  });

  it("keeps Tandem apart from Offchain Labs and Robinhood Chain apart from Robinhood Markets", async () => {
    const { aggregateInvestors, canonicalInvestor } = await import("@/lib/rounds");
    expect(canonicalInvestor("Tandem (Offchain Labs)")).toBe("Tandem (Offchain Labs)");
    expect(canonicalInvestor("Offchain Labs")).toBe("Offchain Labs");
    expect(canonicalInvestor("Robinhood Chain")).toBe("Robinhood Chain");
    expect(canonicalInvestor("Robinhood Markets")).toBe("Robinhood Markets");
    const base = { projectId: null, roundType: "Seed", bucket: "Seed and angel" as const, date: null, amount: 1_000_000, amountNote: null, related: true, confidence: "Sourced" as const, sourceUrl: null };
    const inv = aggregateInvestors([
      { ...base, id: "a", project: "A", leadInvestors: ["Arbitrum Founder House London"], otherInvestors: ["Robinhood Chain", "Tandem (Offchain Labs)"] },
      { ...base, id: "b", project: "B", leadInvestors: ["Arbitrum Open House NYC", "Arbitrum Founder House NYC"], otherInvestors: ["Robinhood Markets", "Offchain Labs"] },
      { ...base, id: "c", project: "C", leadInvestors: ["Arbitrum", "Arbitrum DAO (DRIP)"], otherInvestors: ["Arbitrum Foundation", "Arbitrum DAO"] },
    ]);
    const by = (n: string) => inv.find((i) => i.name === n);
    // Two city spellings on one round count as one deal, led twice.
    expect(by("Arbitrum Open House")).toMatchObject({ deals: 2, led: 3, totalDisclosed: 2_000_000, relatedDeals: 2 });
    expect(by("Arbitrum Foundation")).toMatchObject({ deals: 1, led: 1 });
    expect(by("Arbitrum DAO")).toMatchObject({ deals: 1, led: 1 });
    for (const n of ["Tandem (Offchain Labs)", "Offchain Labs", "Robinhood Chain", "Robinhood Markets"]) expect(by(n)?.deals, n).toBe(1);
    expect(new Set(inv.map((i) => i.id)).size).toBe(inv.length);
  });

  it("merges the Arbitrum names on the real rounds", async () => {
    const { investors } = await import("@/lib/data");
    const names = investors.map((i) => i.name);
    expect(names).toContain("Arbitrum Open House");
    expect(names.filter((n) => /^arbitrum (open|founder) house\s/i.test(n))).toEqual([]);
    expect(names).not.toContain("Arbitrum");
    expect(names).not.toContain("Arbitrum DAO (DRIP)");
    expect(names).toContain("Tandem (Offchain Labs)");
  });
});

describe("raises", () => {
  it("keeps a corporate token treasury purchase off every raised total", async () => {
    const { aggregateInvestors, isRaise, NOT_A_RAISE } = await import("@/lib/rounds");
    expect([...NOT_A_RAISE]).toEqual(["Corporate token treasury"]);
    expect(isRaise({ roundType: "Corporate token treasury" })).toBe(false);
    expect(isRaise({ roundType: "Seed" })).toBe(true);
    const base = { projectId: "rain", project: "Rain", bucket: "Strategic" as const, date: "2026-01-01", amountNote: null, related: false, confidence: "Sourced" as const, sourceUrl: null, otherInvestors: [] };
    const inv = aggregateInvestors([
      { ...base, id: "t", roundType: "Corporate token treasury", amount: 212_000_000, leadInvestors: ["Enlivex Therapeutics"] },
      { ...base, id: "s", roundType: "Series A", amount: 10_000_000, leadInvestors: ["Enlivex Therapeutics"] },
    ]);
    // The deal still counts; only the money raised leaves the purchase out.
    expect(inv[0]).toMatchObject({ name: "Enlivex Therapeutics", deals: 2, totalDisclosed: 10_000_000 });
  });

  it("leaves Rain's $212M treasury purchase out of Enlivex's disclosed total on the real rounds", async () => {
    const { investors, rounds } = await import("@/lib/data");
    const rain = rounds.filter((r) => r.project === "Rain" && r.roundType === "Corporate token treasury");
    expect(rain).toHaveLength(1);
    expect(rain[0].amount).toBe(212_000_000);
    const enlivex = investors.find((i) => i.name === "Enlivex Therapeutics")!;
    expect(enlivex.rounds).toContain(rain[0].id);
    expect(enlivex.totalDisclosed).toBe(rounds.filter((r) => enlivex.rounds.includes(r.id) && r.roundType !== "Corporate token treasury").reduce((a, r) => a + (r.amount ?? 0), 0));
    expect(enlivex.totalDisclosed).toBeLessThan(212_000_000);
  });
});
