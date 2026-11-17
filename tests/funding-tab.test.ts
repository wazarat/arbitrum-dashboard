import { describe, expect, it } from "vitest";
import { roundsByQuarter, roundsQuarterNote, roundsQuarterTable } from "@/components/charts/rounds-over-time";
import { backerColumns } from "@/components/funding/backers-table";
import { submitSourceUrl } from "@/components/funding/rounds-table";
import { events, projects, rounds } from "@/lib/data";
import { FUNDING_DEFINITIONS, fundingSlices, projectsOfType, typesInBucket } from "@/lib/funding";
import { coFundedByRobinhoodChain, eventFlowType, filterFlow, FLOW_ALL, flowTypes, moneyFlow, openHouseCity, ROUND_FLOW_TYPE, ROUND_FLOW_TYPES, roundFlowType } from "@/lib/money-flow";
import { ROUND_BUCKETS } from "@/lib/rounds";
import type { EcosystemEvent, Round } from "@/lib/types";

const ev = (id: string, date: string, type: EcosystemEvent["type"], projectIds: string[] = []): EcosystemEvent => ({ id, date, type, title: id, projects: [], projectIds, amount: null, amountNote: null, detail: null, sourceUrl: null });
const round = (id: string, date: string | null, projectId: string, related = true): Round => ({
  id,
  project: projectId,
  projectId,
  roundType: "Prize",
  bucket: "Programs and awards",
  date,
  amount: 1000,
  amountNote: null,
  leadInvestors: ["Arbitrum Foundation"],
  otherInvestors: [],
  related,
  confidence: "Sourced",
  sourceUrl: null,
});

describe("Arbitrum money flow sources", () => {
  const r = (roundType: string, lead: string[], other: string[] = [], related = false) => ({ roundType, leadInvestors: lead, otherInvestors: other, related });
  it("types each round by where the money came from", () => {
    expect(roundFlowType(r("Program award", ["Arbitrum Founder House London"], [], true))).toBe("Open House");
    expect(roundFlowType(r("Prize", ["Arbitrum Open House NYC"]))).toBe("Open House");
    expect(roundFlowType(r("Program award", ["Arbitrum Mentorship Program"], [], true))).toBe("Mentorship Program");
    expect(roundFlowType(r("Seed", ["Arbitrum Gaming Ventures"], ["Pantera Capital"]))).toBe("Arbitrum Gaming Ventures");
    expect(roundFlowType(r("Seed", ["Pantera Capital"], ["Arbitrum Gaming Ventures"], true))).toBe("Arbitrum Gaming Ventures");
    expect(roundFlowType(r("Grant", ["Arbitrum DAO (DRIP)"]))).toBe("DRIP");
    expect(roundFlowType(r("Incentive program", ["Arbitrum DAO"], [], true))).toBe("DRIP");
    expect(roundFlowType(r("Strategic", ["Tandem (Offchain Labs)"], [], true))).toBe("Tandem");
    expect(roundFlowType(r("DAO service contract", ["Arbitrum DAO"], [], true))).toBe("DAO service contract");
    expect(roundFlowType(r("Seed", ["Paradigm"], [], true))).toBe(ROUND_FLOW_TYPE);
    expect(roundFlowType(r("Seed", ["Paradigm"]))).toBeNull();
  });
  it("counts an acquisition only when it is Arbitrum related", () => {
    expect(roundFlowType(r("Acquisition", ["Offchain Labs"], [], true))).toBe("Acquisition");
    expect(roundFlowType(r("Acquisition", ["Coinbase"]))).toBeNull();
    // An acquisition is typed as one even when an Arbitrum program is named on it.
    expect(roundFlowType(r("Acquisition", ["Arbitrum Gaming Ventures"], [], true))).toBe("Acquisition");
  });
  it("lists the round types in filter order", () => {
    expect([...ROUND_FLOW_TYPES]).toEqual(["Open House", "Mentorship Program", "Arbitrum Gaming Ventures", "DRIP", "Tandem", "DAO service contract", "Acquisition"]);
  });
  it("reads the Open House city from either spelling", () => {
    expect(openHouseCity({ leadInvestors: ["Arbitrum Founder House London"], otherInvestors: [] })).toBe("London");
    expect(openHouseCity({ leadInvestors: ["Arbitrum Foundation"], otherInvestors: ["Arbitrum Open House NYC"] })).toBe("NYC");
    expect(openHouseCity({ leadInvestors: ["Arbitrum Founder House Singapore"], otherInvestors: ["Robinhood Chain"] })).toBe("Singapore");
    expect(openHouseCity({ leadInvestors: ["Arbitrum Foundation"], otherInvestors: ["Robinhood Chain"] })).toBeNull();
    expect(openHouseCity({ leadInvestors: ["Arbitrum Open House"], otherInvestors: [] })).toBeNull();
  });
  it("marks Open House awards co-funded by Robinhood Chain, and only Robinhood Chain", () => {
    expect(coFundedByRobinhoodChain({ leadInvestors: ["Arbitrum Founder House Singapore"], otherInvestors: ["Robinhood Chain"] })).toBe(true);
    expect(coFundedByRobinhoodChain({ leadInvestors: [" robinhood chain "], otherInvestors: [] })).toBe(true);
    expect(coFundedByRobinhoodChain({ leadInvestors: ["Robinhood Markets"], otherInvestors: ["Robinhood Ventures"] })).toBe(false);
    expect(coFundedByRobinhoodChain({ leadInvestors: ["Arbitrum Foundation"], otherInvestors: [] })).toBe(false);
  });
  it("words an Open House award with its city, its backer under one name and the co-funder", () => {
    const [item] = moneyFlow([], [{ ...round("fables", "2026-11-02", "fables"), roundType: "Program award", leadInvestors: ["Arbitrum Founder House Singapore"], otherInvestors: ["Robinhood Chain"], amountNote: "Robinhood Chain Innovation Award" }]);
    expect(item.type).toBe("Open House");
    expect(item.detail).toBe("Open House Singapore. From Arbitrum Open House. Co-funded by Robinhood Chain. Robinhood Chain Innovation Award");
  });
  it("on the real data, types Arbitrum program rounds and drops unrelated acquisitions", () => {
    const types = new Set(rounds.map(roundFlowType));
    for (const t of ["Open House", "Arbitrum Gaming Ventures", "DRIP", "Tandem"]) expect(types.has(t), t).toBe(true);
    for (const x of rounds.filter((x) => /acqui/i.test(x.roundType) && !x.related)) expect(roundFlowType(x)).toBeNull();
  });
});

describe("money flow", () => {
  const items = moneyFlow(
    [ev("program", "2026-10-23", "Program", ["a"]), ev("incident", "2026-10-01", "Incident"), ev("funding", "2026-07-01", "Funding", ["arcus"])],
    [round("dup", "2026-07-20", "arcus"), round("prize", "2026-11-02", "atoma"), round("undated", null, "vexi"), round("unrelated", "2026-11-05", "x", false)],
  );

  it("adds related rounds, drops ones an event covers in the same month, and skips unrelated rounds", () => {
    expect(items.map((i) => i.id)).toEqual(["round-prize", "event-program", "event-funding", "round-undated"]);
    expect(items.find((i) => i.id === "round-prize")?.type).toBe(ROUND_FLOW_TYPE);
  });

  it("sorts newest first with undated items last", () => {
    const dates = items.map((i) => i.date);
    expect(dates.at(-1)).toBeNull();
    expect(dates.slice(0, -1)).toEqual([...dates.slice(0, -1)].sort().reverse());
  });

  it("offers each type with its count, never an empty one, and filters by it", () => {
    expect(flowTypes(items)).toEqual([
      { type: FLOW_ALL, count: 4 },
      { type: "Program", count: 1 },
      { type: "Funding", count: 1 },
      { type: ROUND_FLOW_TYPE, count: 2 },
    ]);
    expect(filterFlow(items, "Incentive")).toEqual([]);
    expect(filterFlow(items, FLOW_ALL)).toHaveLength(4);
  });

  it("on the real data, every related round appears once, as a round or inside an event", () => {
    const all = moneyFlow(events, rounds);
    expect(all.length).toBeGreaterThan(0);
    expect(new Set(all.map((i) => i.id)).size).toBe(all.length);
  });
});

describe("event flow types", () => {
  const ev = (type: "Program" | "Funding" | "Incentive", title: string, projects: string[]) => ({ type, title, projects });
  it("files events under the Arbitrum program they name", () => {
    expect(eventFlowType(ev("Program", "London Founder House awards $300K", ["Arbitrum Open House", "Liquida"]))).toBe("Open House");
    expect(eventFlowType(ev("Incentive", "DRIP Season 1 starts", ["Arbitrum DAO"]))).toBe("DRIP");
    expect(eventFlowType(ev("Program", "Mentorship Program cohort 1 Demo Day", ["Carbon"]))).toBe("Mentorship Program");
    expect(eventFlowType(ev("Program", "Arbitrum Gaming Ventures names first cohort", ["Arbitrum Gaming Ventures", "Xai"]))).toBe("Arbitrum Gaming Ventures");
    expect(eventFlowType(ev("Program", "Entropy Advisors starts first DAO service term", ["Entropy Advisors"]))).toBe("DAO service contract");
    expect(eventFlowType(ev("Program", "Arbitrum Audit Program launches", ["Arbitrum Foundation"]))).toBe("Program");
    // A raise stays a Funding item even when a program backed it.
    expect(eventFlowType(ev("Funding", "Golden Tides raises $3.5M", ["Golden Tides", "Arbitrum Gaming Ventures"]))).toBe("Funding");
  });
});

describe("funding type modal data", () => {
  it("lists the same projects the donut counts for each type", () => {
    for (const s of fundingSlices(projects)) {
      expect(projectsOfType(projects, s.name)).toHaveLength(s.value);
      expect(FUNDING_DEFINITIONS[s.name]).toBeTruthy();
    }
    expect(typesInBucket(projects, "Other")).toEqual(["Public company/subsidiary"]);
  });
});

describe("funding rounds table", () => {
  it("links a missing source to the correction form with project and page", () => {
    const url = new URL(submitSourceUrl("Pons", "https://tally.so/r/abc") as string);
    expect(url.searchParams.get("project")).toBe("Pons");
    expect(url.searchParams.get("page")).toBe("funding");
    expect(submitSourceUrl("Pons", null)).toBeNull();
  });
});

describe("disclosed backers table", () => {
  it("has no Token or Source column", () => {
    const headers = backerColumns(() => {}).map((c) => (typeof c.header === "string" ? c.header : (c as { id?: string }).id));
    expect(headers).toEqual(["Project", "Type", "Investors / backers", "Amount raised"]);
  });
});

describe("funding by quarter, the chart and table inside money flow", () => {
  const rows = roundsByQuarter(rounds);
  const table = roundsQuarterTable(rows);

  it("has one column per round type bucket between Quarter and Rounds, newest quarter first", () => {
    expect(table.columns[0].label).toBe("Quarter");
    expect(table.columns.at(-1)?.label).toBe("Rounds");
    expect(table.columns.slice(1, -1).map((c) => c.label)).toEqual([...ROUND_BUCKETS]);
    const quarters = table.rows.map((r) => r.quarter as string);
    expect(quarters).toEqual([...quarters].sort().reverse());
    expect(table.filename).toBe("rounds-by-quarter.csv");
  });

  it("counts every dated round once and sums only disclosed amounts", () => {
    const dated = rounds.filter((r) => r.date);
    expect(rows.reduce((a, r) => a + r.count, 0)).toBe(dated.length);
    const total = rows.reduce((a, r) => a + ROUND_BUCKETS.reduce((b, k) => b + (r[k] as number), 0), 0);
    expect(total).toBeCloseTo(dated.reduce((a, r) => a + (r.amount ?? 0), 0), 2);
  });

  it("states how many rounds stay out of the bars", () => {
    const undated = rounds.filter((r) => !r.date).length;
    const undisclosed = rounds.filter((r) => r.amount === null).length;
    expect(roundsQuarterNote(rounds)).toContain(`${undisclosed} rounds have no disclosed amount and ${undated} are undated`);
  });
});
