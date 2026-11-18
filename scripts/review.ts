/**
 * Weekly review of form submissions. Reads Tally CSV exports from data/submissions/
 * and prints each submission next to the matching ecosystem CSV row, so changes can
 * be approved by hand. This script never writes to the CSVs.
 *
 *   npm run review
 *   npm run review -- --file data/submissions/corrections-2026-11-15.csv
 */
import fs from "node:fs";
import { CHAIN } from "../src/lib/chain";
import path from "node:path";
import type { RawRow } from "../src/lib/parse";
import { normalizeName } from "../src/lib/mapping";
import { findFile, readCsv } from "./lib/csv";
import { SUBMISSIONS } from "./lib/paths";

/**
 * Tally question labels for each field, read from the live forms on Nov 18 2026: Submit a project
 * (tally.so/r/rDOr1l) and Suggest a correction (tally.so/r/jeo9Yx, with hidden fields `project` and `page`).
 * A column matches when its label equals a candidate or starts with one, ignoring case and curly quotes.
 * Starts-with, not contains: the contact question mentions "X handle" and the evidence question "explorer".
 */
export const TALLY_FIELDS: Record<string, string[]> = {
  "Project/Company Name": ["project name", "project", "project/company name", "name"],
  Website: ["website", "url"],
  "X Handle": ["x handle", "twitter"],
  "Sector/Category": ["sector", "category"],
  "Native Chain": ["native chain"],
  Description: ["what does the project do", "short description", "description"],
  Contracts: ["contract addresses", "contract address", "contracts"],
  Evidence: ["evidence link", "evidence url", "evidence", "source url"],
  Contact: ["your contact", "contact", "email"],
  Field: ["what's wrong", "which field is wrong", "which field"],
  "Correct value": ["what should it say instead", "correct value", "correction"],
  Page: ["page"],
  Submitted: ["submitted at"],
};

/** What each "What's wrong?" answer on the correction form covers in the ecosystem CSV. */
export const CORRECTION_COLUMNS: Record<string, string[]> = {
  Name: ["Project/Company Name"],
  Website: ["Website"],
  Sector: ["Sector/Category", "Subcategory"],
  "Native chain": ["Native Chain", "Native Chain Detail"],
  Description: ["Description"],
  Status: ["Status"],
  "X handle": ["X Handle"],
  "Contract address": [],
  "Funding or investors": ["Funding Type", "Investors / Backers", "Amount Raised", "Funding Source URL"],
  Token: ["Token"],
  "Security or incident info": ["Security Risk Level", "Audits", "Incidents", "Red Flags", "Security Source URL"],
  "Traction or onchain data": ["Traction Tier", "Other Traction Signal", "Traction Source"],
  "Project is defunct or rebranded": ["Status", "Project/Company Name"],
  Other: [],
};

/** Where an answer is checked outside the ecosystem CSV. */
const CORRECTION_ELSEWHERE: Record<string, string> = {
  "Contract address": "data/contracts.csv",
};

export interface Submission {
  kind: "new" | "correction";
  values: Record<string, string>;
  raw: RawRow;
}

const label = (x: string) => x.trim().toLowerCase().replace(/[\u2018\u2019]/g, "'");

function findValue(row: RawRow, candidates: string[]): string {
  const keys = Object.keys(row);
  for (const match of [(k: string, c: string) => label(k) === c, (k: string, c: string) => label(k).startsWith(c)]) {
    for (const c of candidates) {
      const k = keys.find((x) => match(x, c));
      if (k && (row[k] ?? "").trim()) return (row[k] ?? "").trim();
    }
  }
  return "";
}

/** Dropdown answers carry a note in brackets ("Arbitrum native (Arbitrum One, Nova or an Orbit chain)"); the CSV has the bare value. */
export function csvValue(answer: string): string {
  return answer.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

export function parseSubmission(row: RawRow): Submission {
  const values: Record<string, string> = {};
  for (const [col, cands] of Object.entries(TALLY_FIELDS)) values[col] = findValue(row, cands);
  values["Native Chain"] = csvValue(values["Native Chain"]);
  const kind = values.Field || values["Correct value"] ? "correction" : "new";
  return { kind, values, raw: row };
}

export interface FieldDiff {
  field: string;
  submitted: string;
  current: string | null;
  changed: boolean;
}

/** Side-by-side of a submission against the current CSV row (null when the project is new). */
export function diffSubmission(sub: Submission, current: RawRow | null): FieldDiff[] {
  if (sub.kind === "correction") {
    const answer = sub.values.Field;
    const submitted = sub.values["Correct value"];
    const columns = CORRECTION_COLUMNS[answer] ?? (current && answer in current ? [answer] : []);
    if (!columns.length) {
      const where = CORRECTION_ELSEWHERE[answer];
      return [{ field: `${answer || "(unspecified field)"}${where ? ` (check ${where})` : ""}`, submitted, current: null, changed: true }];
    }
    return columns.map((c) => {
      const cur = current ? (current[c] ?? "") : null;
      return { field: c, submitted, current: cur, changed: cur !== submitted };
    });
  }
  return ["Project/Company Name", "Website", "X Handle", "Sector/Category", "Native Chain", "Description"].map((f) => {
    const cur = current ? (current[f] ?? "") : null;
    const submitted = sub.values[f];
    return { field: f, submitted, current: cur, changed: cur !== submitted && Boolean(submitted) };
  });
}

function main() {
  const fileArg = process.argv.indexOf("--file");
  const files = fileArg >= 0 ? [path.resolve(process.argv[fileArg + 1])] : fs.existsSync(SUBMISSIONS) ? fs.readdirSync(SUBMISSIONS).filter((f) => f.endsWith(".csv")).map((f) => path.join(SUBMISSIONS, f)) : [];
  if (!files.length) {
    console.log(`\nNo submission files. Export Tally responses as CSV into ${path.relative(process.cwd(), SUBMISSIONS)}/ and run again.\n`);
    return;
  }
  const projects = readCsv(findFile(`${CHAIN.filePrefix}-ecosystem-`, ".csv"));
  const byExact = new Map(projects.map((r) => [(r["Project/Company Name"] ?? "").toLowerCase(), r]));
  const byNorm = new Map(projects.map((r) => [normalizeName(r["Project/Company Name"] ?? ""), r]));
  let n = 0;
  for (const file of files) {
    console.log(`\n=== ${path.relative(process.cwd(), file)}`);
    for (const row of readCsv(file)) {
      const sub = parseSubmission(row);
      const name = sub.values["Project/Company Name"];
      const current = byExact.get(name.toLowerCase()) ?? byNorm.get(normalizeName(name)) ?? null;
      n += 1;
      console.log(`\n#${n} ${sub.kind === "correction" ? "CORRECTION" : "NEW PROJECT"} · ${name || "(no project name)"}${current ? "" : sub.kind === "correction" ? "  !! no matching row" : "  (not in the CSV yet)"}${sub.values.Page ? `  · from ${sub.values.Page}` : ""}`);
      if (sub.kind === "correction") console.log(`   what's wrong: ${sub.values.Field || "(not given)"}`);
      if (sub.values.Submitted) console.log(`   received: ${sub.values.Submitted}`);
      if (sub.values.Evidence) console.log(`   evidence: ${sub.values.Evidence}`);
      if (sub.values.Contact) console.log(`   contact:  ${sub.values.Contact}`);
      for (const d of diffSubmission(sub, current)) {
        const mark = d.changed ? "≠" : " ";
        console.log(`   ${mark} ${d.field.padEnd(22)} submitted: ${d.submitted || "—"}`);
        if (d.current !== null) console.log(`     ${"".padEnd(22)} current:   ${d.current || "—"}`);
      }
      if (sub.values.Contracts) console.log(`   contracts: ${sub.values.Contracts}`);
    }
  }
  console.log(`\n${n} submissions. Nothing was written: apply approved changes to the CSVs by hand, update data/expected.json if row counts changed, then commit.\n`);
}

if (require.main === module) main();
