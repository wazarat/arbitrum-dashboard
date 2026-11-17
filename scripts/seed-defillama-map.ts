/**
 * Seeds data/defillama-map.csv (Project, DefiLlama slug, Notes): one row per DefiLlama slug, from the
 * research seed file data/arbitrum-defillama-map-*.csv, which already lists each project's slugs.
 * OVERRIDES replace a project's slugs where the seed's parent id holds more than that project
 * (plan-mode mapping check, Nov 17 2026). Existing rows in defillama-map.csv are kept, so hand edits win.
 *
 *   npm run seed:map            # prints the mapping report and writes the file
 *   npm run seed:map -- --dry   # report only
 */
import path from "node:path";
import { CHAIN } from "../src/lib/chain";
import { parseMapRows, type MapRow } from "../src/lib/mapping";
import { findFile, readCsv, readCsvOrEmpty, writeCsv } from "./lib/csv";
import { DATA } from "./lib/paths";

/**
 * Project -> slugs, replacing the seed. Each one checked against DefiLlama on Nov 17 2026.
 * - Aerodrome: only Aero Slipstream holds Arbitrum TVL ($4.26M); Aero Basic lists Arbitrum at $0.
 * - Penpie: parent#magpie-ecosystem also holds Radpie ($4.64M) and Wompie, which have no row here.
 * - Toros Finance: parent#dhedge returns HTTP 400 and also holds Chamber Vaults and Flat Money V2.
 * - Variational: largest open interest on Arbitrum, missing from the seed.
 * - Arbitrum Bridge and Arbitrum Foundation both pointed at parent#arbitrum-foundation. The bridge keeps its
 *   own slug; Nitro, Timeboost and the chain's fees row are chain income on the Arbitrum One row.
 */
export const OVERRIDES: Record<string, string[]> = {
  "Aerodrome (Aero)": ["aero-slipstream"],
  Penpie: ["penpie"],
  "Toros Finance": ["toros", "toros-options"],
  Variational: ["variational"],
  "Arbitrum Bridge": ["arbitrum-bridge"],
  "Arbitrum Foundation": [],
  "Arbitrum One": ["arbitrum", "arbitrum-nitro", "arbitrum-timeboost"],
};

export function seedRows(seed: Array<Record<string, string | undefined>>): MapRow[] {
  const rows: MapRow[] = [];
  const seen = new Set<string>();
  const push = (project: string, slug: string, notes: string) => {
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    rows.push({ project, slug, notes });
  };
  for (const [project, slugs] of Object.entries(OVERRIDES)) for (const s of slugs) push(project, s, "override, plan-mode mapping check Nov 17 2026");
  for (const r of seed) {
    const project = (r["Project"] ?? "").trim();
    if (!project || project in OVERRIDES) continue;
    const id = (r["DefiLlama id"] ?? "").trim();
    const note = [`seed ${id}`, (r["Notes"] ?? "").replace(/^.*DefiLlama category /, "category ").replace(/^CEX reserves only, not TVL; /, "CEX reserves only; ")].filter(Boolean).join("; ");
    for (const s of (r["DefiLlama slugs"] ?? "").split(";").map((x) => x.trim())) push(project, s, note);
  }
  return rows;
}

function main() {
  const dry = process.argv.includes("--dry");
  const seed = readCsv(findFile(`${CHAIN.filePrefix}-defillama-map-`, ".csv"));
  const mapFile = path.join(DATA, "defillama-map.csv");
  const existing = parseMapRows(readCsvOrEmpty(mapFile));
  const have = new Set(existing.map((r) => r.slug));
  const rows = [...existing, ...seedRows(seed).filter((r) => !have.has(r.slug))];
  rows.sort((a, b) => (a.project ?? "").localeCompare(b.project ?? "") || a.slug.localeCompare(b.slug));
  const projects = new Set(rows.filter((r) => r.project).map((r) => r.project));
  console.log(`\nDefiLlama map: ${rows.length} slug rows across ${projects.size} projects (${existing.length} kept from the existing file)`);
  for (const [p, s] of Object.entries(OVERRIDES)) console.log(`  override ${p.padEnd(22)} ${s.length ? s.join(", ") : "(no slug)"}`);
  if (dry) return;
  writeCsv(mapFile, rows.map((r) => ({ Project: r.project ?? "", "DefiLlama slug": r.slug, Notes: r.notes ?? "" })), ["Project", "DefiLlama slug", "Notes"]);
  console.log(`  wrote ${path.relative(process.cwd(), mapFile)}\n`);
}

main();
