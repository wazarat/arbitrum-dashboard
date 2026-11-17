# KPI reconciliation against DefiLlama (Milestone 2, Nov 17 2026)

Window Oct 18 to Nov 16 2026 (30 complete UTC days), TVL on Nov 16 2026. "Atlas" is the sum over projects that DefiLlama counts in its Arbitrum chain total. The build fails if any row misses by more than 1%.

| KPI | Atlas | DefiLlama | Gap |
|---|---|---|---|
| TVL (counted) | $1,296,169,150 | $1,299,113,061 | -0.23% |
| TVL double counted | $654,563,349 | $655,869,622 | -0.20% |
| 30-day DEX volume | $5,982,990,600 | $5,982,990,612 | -0.00% |
| 30-day fees | $19,744,455 | $19,746,094 | -0.01% |
| 30-day revenue | $4,431,748 | $4,433,391 | -0.04% |

## What it took

- **RWA and basis trading are outside Arbitrum's chain TVL.** DefiLlama's gross chain TVL ($1.955B) equals every listing except bridges, exchanges, the chain's own rows, RWA ($157M, almost all USD.AI) and Basis Trading ($21M), to within $1M. Both categories now carry the "outside-total" flag and stay out of the Overview sums (`src/lib/flags.ts`).
- **Negative days count as zero.** Hypernova, Overtime and Hegic report negative daily revenue. DefiLlama's 30-day totals equal the sum of their positive days exactly, so `sumWindow` now does the same (`src/lib/live.ts`). This closed a 9.5% revenue gap.
- **Listing history wins over the listing endpoint.** For Steakhouse Financial (+$6.3M), Gauntlet (+$5.6M) and Pendle V2, DefiLlama's listing endpoint carried later revisions for Nov 16 than their own histories, which agree with the chain series. The TVL check now reads each listing's history for the day (`src/lib/reconcile.ts`).
- **Chain income.** Arbitrum's own fees row (L2 gas, $524K fees and $516K revenue over 30 days) and the Nitro and Timeboost listings attach to the Arbitrum One row and stay out of app totals. DefiLlama's own chain totals also leave the chain row out.

## Excluded from the Atlas TVL total

| Reason | Listings | TVL |
|---|---|---|
| Exchange deposits | 39 | $1,498,638,381 |
| Double counted by DefiLlama | 223 | $667,336,858 |
| Bridge deposits | 55 | $383,699,636 |
| Outside DefiLlama's chain TVL (RWA and basis trading) | see build log | about $178M |
| Chain income | 3 | $271,584 |
