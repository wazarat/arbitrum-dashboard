import { describe, expect, it } from "vitest";
import { csvValue, diffSubmission, parseSubmission } from "../scripts/review";

/** Column headers as Tally exports them, copied from the live forms (Nov 18 2026). */
const SUBMIT = {
  "Submission ID": "abc",
  "Submitted at": "2026-11-20 09:00:00",
  "Project name": "Example DEX",
  Website: "https://example.xyz",
  "X handle": "",
  Sector: "DEXs & Liquidity",
  "Native chain": "Arbitrum native (Arbitrum One, Nova or an Orbit chain)",
  "What does the project do? (one or two sentences)": "A DEX on Arbitrum One.",
  "Contract addresses on Arbitrum One or an Orbit chain (one per line)": "0x0000000000000000000000000000000000000001",
  "Evidence link (announcement, docs or explorer page showing it is on Arbitrum)": "https://example.xyz/docs",
  "Your contact (X handle or email, optional)": "@someone",
};

const CORRECT = {
  "Submission ID": "def",
  "Submitted at": "2026-11-20 10:00:00",
  project: "GMX",
  page: "https://arbitrum.canhav.com/explorer/?project=gmx",
  "What’s wrong?": "Funding or investors",
  "What should it say instead?": "Raised $9M seed",
  "Evidence link (where we can verify the correction)": "https://example.com/news",
  "Your contact (X handle or email, optional)": "",
};

describe("Tally submit form", () => {
  const sub = parseSubmission(SUBMIT);
  it("reads every question by its live label", () => {
    expect(sub.kind).toBe("new");
    expect(sub.values["Project/Company Name"]).toBe("Example DEX");
    expect(sub.values.Description).toBe("A DEX on Arbitrum One.");
    expect(sub.values.Contracts).toContain("0x");
    expect(sub.values.Evidence).toBe("https://example.xyz/docs");
    expect(sub.values.Contact).toBe("@someone");
    expect(sub.values.Submitted).toBe("2026-11-20 09:00:00");
  });
  it("leaves a blank X handle blank instead of taking the contact or evidence answer", () => {
    expect(sub.values["X Handle"]).toBe("");
  });
  it("compares the native chain answer without the note in brackets", () => {
    expect(sub.values["Native Chain"]).toBe("Arbitrum native");
    expect(csvValue("Other EVM")).toBe("Other EVM");
  });
});

describe("Tally correction form", () => {
  const sub = parseSubmission(CORRECT);
  it("is a correction for the hidden project, with the page it came from", () => {
    expect(sub.kind).toBe("correction");
    expect(sub.values["Project/Company Name"]).toBe("GMX");
    expect(sub.values.Page).toContain("project=gmx");
    expect(sub.values.Field).toBe("Funding or investors");
    expect(sub.values["Correct value"]).toBe("Raised $9M seed");
  });
  it("shows every CSV column the answer covers next to the submitted value", () => {
    const row = { "Project/Company Name": "GMX", "Funding Type": "Not disclosed", "Investors / Backers": "", "Amount Raised": "", "Funding Source URL": "" };
    const d = diffSubmission(sub, row);
    expect(d.map((x) => x.field)).toEqual(["Funding Type", "Investors / Backers", "Amount Raised", "Funding Source URL"]);
    expect(d[0]).toMatchObject({ current: "Not disclosed", submitted: "Raised $9M seed", changed: true });
  });
  it("points a contract correction at contracts.csv", () => {
    const d = diffSubmission(parseSubmission({ ...CORRECT, "What’s wrong?": "Contract address" }), { "Project/Company Name": "GMX" });
    expect(d).toHaveLength(1);
    expect(d[0].field).toContain("data/contracts.csv");
  });
});
