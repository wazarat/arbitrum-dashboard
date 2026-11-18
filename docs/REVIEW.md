# Weekly review of submissions and corrections

Submissions arrive through two Tally forms and never change the data automatically. Once a week, export the responses, run the review script, and apply what you approve by hand.

## The two forms

The share links are set in the Vercel project and in `.env.local` locally:

```
NEXT_PUBLIC_TALLY_SUBMIT_URL=https://tally.so/r/rDOr1l
NEXT_PUBLIC_TALLY_CORRECT_URL=https://tally.so/r/jeo9Yx
```

While either variable is missing its button is hidden rather than broken.

`TALLY_FIELDS` in `scripts/review.ts` maps each question to a CSV column by its label, matching the whole label or its start. The labels below are the live ones (checked Nov 18 2026). If you reword a question, keep its opening words, or add the new wording to `TALLY_FIELDS`. `tests/review.test.ts` holds the exported headers and fails if the mapping drifts.

**Submit a project** (button in the header and on the Explorer page, open to everyone).

| Question | Type | Maps to |
|---|---|---|
| Project name | short text, required | Project/Company Name |
| Website | URL | Website |
| X handle | short text | X Handle |
| Sector | dropdown | Sector/Category, the 22 sectors: DEXs & Liquidity · Lending & Credit · Perps, Options & Derivatives · Yield & Asset Management · Stablecoins & Payments · RWA & Tokenized Assets · Orbit Chains & Rollup Infrastructure · Infrastructure & Dev Tools · Bridges & Interoperability · Wallets & Custody · NFTs, Gaming & Collectibles · AI Agents · Social & Identity · Data & Analytics · Security, Risk & Compliance · Exchanges & On/Off-Ramps · Launchpads · Prediction Markets · Trading Tools & Bots · DAOs, Governance & Public Goods · Ecosystem, Funding & Education · Other |
| Native chain | dropdown | Native Chain. "Arbitrum native (Arbitrum One, Nova or an Orbit chain)" is read as `Arbitrum native`. The others are Other EVM · Other non-EVM · Centralized / off-chain |
| What does the project do? (one or two sentences) | long text | Description |
| Contract addresses on Arbitrum One or an Orbit chain (one per line) | long text | printed for `data/contracts.csv` |
| Evidence link (announcement, docs or explorer page showing it is on Arbitrum) | URL, required | printed |
| Your contact (X handle or email, optional) | short text | printed |

**Suggest a correction** (button inside the project pop-up only). The pop-up opens the form with two hidden fields prefilled from the URL, `project` (the project name) and `page` (the Atlas URL the reader was on).

| Question | Type | Maps to |
|---|---|---|
| What's wrong? | dropdown | the CSV columns in `CORRECTION_COLUMNS`. Name · Website · Sector (with Subcategory) · Native chain (with Native Chain Detail) · Description · Status · X handle · Contract address (`data/contracts.csv`) · Funding or investors (Funding Type, Investors / Backers, Amount Raised, Funding Source URL) · Token · Security or incident info (Security Risk Level, Audits, Incidents, Red Flags, Security Source URL) · Traction or onchain data (Traction Tier, Other Traction Signal, Traction Source) · Project is defunct or rebranded (Status, Project/Company Name) · Other |
| What should it say instead? | long text, required | shown next to each column's current value |
| Evidence link (where we can verify the correction) | URL, required | printed |
| Your contact (X handle or email, optional) | short text | printed |

## The weekly loop

1. In Tally, open each form, then Submissions, Export, CSV. Save the files into `data/submissions/` (for example `submit-2026-11-24.csv` and `corrections-2026-11-24.csv`). The folder is git-ignored, because the exports can hold contact details. Delete the files once processed.
2. Run the review:

   ```bash
   npm run review
   ```

   Each submission prints next to the current CSV row. `≠` marks a field whose submitted value differs from the current one, `NEW PROJECT` means no row matched by name, and `!! no matching row` means a correction names a project the CSV does not have.
3. Open the evidence link. Apply approved changes by editing the files in `data/`:
   - corrections go to the matching row in `arbitrum-ecosystem-*.csv`;
   - new projects become a new row (keep the 29 columns; blanks mean no data, never 0; `Discovered Via` is `Community submission`);
   - contract addresses go to `data/contracts.csv`, only from the issuer's docs, DefiLlama or the project's own channels, never by name or symbol (the spoof guard in `src/lib/token-guard.ts` checks USDC and USDC.e against their own addresses);
   - a new DefiLlama listing goes to `data/defillama-map.csv` (one row per slug; an empty Project means reviewed and ignored);
   - an Orbit chain listed by DefiLlama goes to `data/orbit-chain-map.csv`;
   - funding rounds go to `data/arbitrum-funding-rounds-*.csv` (one row per round, investors separated by `;`, Project spelled exactly as in the ecosystem CSV, `Arbitrum Related` set when the round names Arbitrum, the Foundation, the DAO or one of its programs).
4. If counts changed, update `data/expected.json` (projects, sectors, subcategories, tier counts, rounds, Arbitrum-related rounds). Run `npm run data` and `npm test`; the build fails loudly on any mismatch.
5. Commit with your own git identity and push after `git pull --rebase` (the daily refresh also commits to `main`). Vercel redeploys from `main`.

The review script only prints. Nothing from a form is applied without a person reading it.
