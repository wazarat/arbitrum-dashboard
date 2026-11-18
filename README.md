# Arbitrum Ecosystem Atlas

Interactive research dashboard over 992 projects in the Arbitrum ecosystem, in 22 sectors, including the Orbit chains built on the Arbitrum stack: where traction, money and risk sit, and how it changes day by day. Independent research by CanHav Research, not affiliated with Arbitrum, Offchain Labs or the Arbitrum Foundation.

It is the fourth CanHav atlas, after robinhood.canhav.com, near.canhav.com and base.canhav.com, and follows the shared UI contract in `docs/ATLAS-UI.md`. Live at https://arbitrum.canhav.com.

Built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui restyled with the CanHav tokens, Recharts, TanStack Table, Papa Parse and nuqs. Vercel serves the app natively, so gated data stays server-side. All fetching happens in scripts and the scheduled job, never in the browser.

## Run it

```bash
npm install
npm run dev          # builds the data from data/ (and data/history once it exists), then starts next dev
npm run build        # builds and validates the data, then next build
npm test             # unit tests on saved fixtures, never live calls
npm run lint
npm run check:copy   # copy rules from docs/ATLAS-UI.md, no colons or em dashes in UI strings
npm run screenshots  # Playwright, every page at 1440 and 390 px in dark and light
npm run review       # print Tally submissions next to the current CSV rows
```

Copy `.env.example` to `.env.local` for the optional keys. Nothing is required to build. With no keys the app builds and runs with the login wall off and the keyed fetchers skipped.

Every chain-specific key (DefiLlama chain names, chain id 42161, GeckoTerminal network, Morpho chain, Blockscout URLs, growthepie key, CSV column names, User-Agent) lives in `src/lib/chain.ts`.

## How the data fits together

The ecosystem CSV is the source of truth for who is listed. Live data only adds metrics. New DefiLlama, GeckoTerminal or Arbitrum portal finds go to a "Newly detected" review list and are never added automatically.

```
data/
  arbitrum-ecosystem-2026-11-17.csv             992 projects, 29 columns
  arbitrum-funding-rounds-2026-11-17.csv        393 rounds, 100 Arbitrum related
  arbitrum-defillama-map-2026-11-17.csv         363-row seed map to DefiLlama ids and slugs
  arbitrum-defillama-to-verify-2026-11-17.csv   535 DefiLlama listings below the inclusion bar
  arbitrum-events-*.csv                         dated events for the timeline
  arbitrum-sector-leaders-*.csv                 curated leaders for the unmeasured sectors
  analyst-notes.md                              the Analyst notes on the Overview
  expected.json                                 snapshot validation, exact counts and sums
  defillama-map.csv                             reviewed project to DefiLlama slug map (one row per slug)
  gecko-dex-map.csv                             GeckoTerminal dex ids per DEX row
  stablecoin-map.csv                            DefiLlama stablecoin ids per row (Tether's Arbitrum supply sits on USDT0)
  contracts.csv                                 verified token and contract addresses, each with a source
  orbit-chain-map.csv                           Orbit chain rows to DefiLlama chain names
  submissions/                                  Tally exports for the weekly review, git-ignored
docs/
  ATLAS-UI.md                                   shared UI contract, wins on look and behaviour
  REVIEW.md                                     the two Tally forms and the weekly review loop
  reference/robinhood-sector-metrics-spec.md    pattern for the sector metrics
  research/                                     the three research memos and the chain risk draft
  reports/                                      KPI reconciliation and traction audit (Nov 17 2026)
  screenshots/                                  every page at 1440 and 390 px in dark and light
```

`npm run data` (also run before `dev` and `build`) reads only committed files and fails the build on any difference from `data/expected.json`, an unresolved funding round, or a gated field in the public set.

The KPIs read the daily history. A project with no live series falls back to its Nov 17 research snapshot figure, labelled as such, and a build with no history at all sums the snapshot, leaving out vault curators, capital allocators, liquid staking, token lockers, exchange wallets and bridge balances, so nothing is counted twice.

CanHav Research is itself a row in the atlas (an Open House London award winner). Its project modal carries a disclosure note, and it is never featured in insights, leaders or presets.

## History store and the daily refresh

```
data/history/
  _meta.json             last run, per-source status, newly detected protocols
  chain.json             DefiLlama chain series
  blockscout.json        Blockscout stats lines (active accounts, new accounts, operational transactions, verified contracts)
  growthepie.json        chain activity cross-check (active addresses, transactions, smart wallets over 7 days)
  defillama/             per-protocol TVL, volume, fees, revenue, open interest series, flags (protocols.json), adapter checks, Orbit chain TVL (orbit-chains.json), hacks
  contracts/, tokens/    per-contract activity, token holders and supply from the Blockscout gateway
  morpho/                markets (unlisted and broken ones flagged) and vaults
  stablecoins/, yields/, gecko/   sector inputs
```

The store is append-only by date. Each run re-fetches the trailing 7 days and overwrites them, so DefiLlama's revisions land, and a stable JSON writer means a rerun with no new data writes the same bytes.

- `npm run refresh` fetches the latest days from every source. Flags are `--backfill` (full history), `--only a,b` (named sources), `--strict` (fail on any source error) and `--dry-run` (write nothing).
- A source that fails keeps its last good data, records the error in `_meta.json`, and the run carries on. A missing secret skips its source.
- `.github/workflows/refresh.yml` runs daily at 05:23 UTC and on demand (with a `backfill` input), then builds, tests and commits `data/history` as `data: refresh YYYY-MM-DD` under the owner's name and the `GIT_AUTHOR_EMAIL` repository variable.
- To rerun a backfill, use Run workflow on the Actions tab with backfill ticked, or `npm run refresh -- --backfill` locally and commit `data/history`.
- After changing a TVL flag rule in `src/lib/flags.ts`, `npx tsx scripts/reflag.ts` re-applies it to the stored protocol list without fetching.

The build reconciles the counted projects against DefiLlama's chain totals for TVL, double-counted TVL, 30-day volume, fees and revenue, and fails on a gap above 1%, printing the top 10 contributors. Arbitrum's own chain fees row (L2 gas paid by users) and the Arbitrum Nitro and Timeboost listings attach to the Arbitrum One row as chain income and never count toward app totals.

## Data sources and their free limits

| Source | Used for | Limits |
|---|---|---|
| DefiLlama `api.llama.fi` | Per-protocol TVL with borrowed, staking, pool2 and vesting, chain TVL, Orbit chain TVL (`/v2/chains`), DEX volume, fees and revenue overviews, aggregators, bridge aggregators, open interest, options, active users, hacks | No key, one request a second |
| DefiLlama stablecoins and yields | Stablecoin supply on Arbitrum per coin, yield pools and lending rates | No key |
| Morpho GraphQL `api.morpho.org/graphql` | Markets and vaults on chain 42161 | No key. Unlisted markets, and markets with an absurd APY or unpriced collateral, are dropped and logged |
| GeckoTerminal `api.geckoterminal.com` | DEX venue pools, token volume, liquidity and holders on network `arbitrum` | No key, about one call every 7 seconds in practice |
| Blockscout stats `arbitrum.blockscout.com/stats-service` | Daily active accounts, new accounts, operational transactions, verified contracts | No key |
| Blockscout gateway `api.blockscout.com/42161` | Token holders, supply and transfers | Free key (`BLOCKSCOUT_API_KEY`) |
| growthepie `api.growthepie.com` | Cross-check for daily active addresses and transactions | No key |
| Arbitrum portal `portal-data.arbitrum.io` | Directory and Orbit chain listings, for the Newly detected list only | No key |

### Deferred (paid)

These return HTTP 402 or need a paid plan and are not used.

- DefiLlama `/raises`, `/emissions`, `/overview/derivatives` (perps volume), `/summary/derivatives/*`, `/oracles`, `/chainAssets`, `/parentProtocols`, and `bridges.llama.fi`
- GeckoTerminal category endpoints
- Dune API, Token Terminal, Artemis, Nansen, RootData, CryptoRank, Flipside, the Arbiscan Pro API and the X API

## Deployment

The Vercel project `arbitrum-dashboard` deploys `main` to production on every push. `NEXT_PUBLIC_SIBLING_ATLAS_URLS` and the two Tally form links are set there. `NEXT_PUBLIC_SITE_URL=https://arbitrum.canhav.com` is set for production, so canonical URLs, Open Graph URLs and the sitemap use the domain. The Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`) are set for production only, from the same Clerk application as canhav.com, so preview deploys run with the wall off.

## Login wall

With the Clerk keys present the wall is on. Overview, Methodology and the footer pages are public. Sectors, Traction, Funding, Explorer and the hidden pages show placeholder shapes under a "Log in for free access" pop-up, and Clerk opens in modal mode and returns the reader to the tab or action they clicked. Compare shows a comparison already in the URL, and Add to compare asks for a login. The project pop-up shows its header, Overview and Traction to everyone, and the rest after login. Gated data reaches the browser only from `/api/data/gated/` for a signed-in reader (401 otherwise, `Cache-Control: private`), and `scripts/check-public-bundle.mjs` fails the build if a gated investor name shows up in `.next/static` or the prerendered pages. Without keys the app builds and runs with the wall off and logs one warning. The rules sit in `src/lib/gate.ts`, and `npm run screenshots:auth` tests them (set `E2E_BASE_URL` to test a deployed site).

Clerk production keys only answer on the Clerk application's own domain (canhav.com and its subdomains). On `*.vercel.app` hosts Clerk routes its scripts and API calls through `/__clerk/` on the site itself (the proxy matcher lets those through), and the production instance answers those calls with "Invalid host". So the `*.vercel.app` hosts show the public pages normally and the gated pages as placeholders with no way to log in, while `/api/data/gated/` refuses every request. One login covers every canhav.com atlas.

## Reviewing submissions

`npm run review` prints each exported Tally response next to the current CSV row, and never writes to the data. The forms, their fields and the weekly loop are in [docs/REVIEW.md](docs/REVIEW.md).

## Pointing arbitrum.canhav.com at the Vercel project

This is done (Nov 18 2026). To repeat it for another host:

1. In Vercel, open the project, then Settings, Domains, and add the domain.
2. At the DNS host for canhav.com (Namecheap), add the CNAME record Vercel shows for the subdomain. For `arbitrum` it is `90b643f8136a2aaf.vercel-dns-016.com.`
3. Set `NEXT_PUBLIC_SITE_URL` to the new origin in the Vercel project and redeploy, so canonical URLs, Open Graph URLs and the sitemap use the domain.
