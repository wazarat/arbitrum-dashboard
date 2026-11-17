# Arbitrum ecosystem, traction and funding (Nov 17, 2026)

Companion to `claude/arbitrum-ecosystem-2026-11-17.csv` (now 992 projects, same 29 columns) and `claude/arbitrum-funding-rounds-2026-11-17.csv` (393 rounds, 100 of them Arbitrum-related). Traction is from the DefiLlama API pulled Nov 17, 2026. Funding comes from DefiLlama per-protocol raises, Arbitrum Foundation posts, AGV announcements and the shared rows of the Robinhood and Base rounds files.

## What changed in the CSV
- **28 program rows added.** Open House winners from NYC, London and Singapore, Mentorship cohort 1 winners and two AGV portfolio games, all with status `Hackathon project` or `Building`. CanHav Research is in the list (Best Agentic 2nd prize, Founder House London).
- **Carbon** replaces the placeholder "Carbon (perp DEX)" row. It is the perp DEX that moved from Base to Arbitrum and won the Mentorship Demo Day.
- **Funding filled for 243 projects** from 393 rounds, 231 projects in all. DefiLlama-mapped projects with no raise on record now show `Not disclosed` (195). The other 554 stay `Not researched`.
- **Security re-scored** with the Base rubric (see the funding and security memo). 20 High, 135 Medium, 159 Low and 34 Unknown.
- **Duplicate names fixed.** Reya and SparkPoint had both a portal row and an Orbit row. The Orbit rows are now "Reya Chain" and "SparkPoint Chain".

## Traction

Chain level
- DefiLlama Arbitrum chain TVL is $1.30B. Summing the list gives $2.26B even after excluding curators, because bridge balances (Hyperliquid, Aster, edgeX, LayerZero) and Spark deposits count per protocol but not in the chain figure. Use the chain figure for headline TVL.
- 30d DEX volume is $5.98B across 160 DefiLlama listings, and 30d fees are $19.7M across 416.
- Arbitrum itself earned $0.52M in 30d chain fees.

Leaders (30 days)
- **DEXs.** Uniswap $3.97B volume (66% of Arbitrum), $2.56M fees. Aerodrome's Slipstream deployment $563M. Fluid DEX $418M. Metric $393M with under $0.5M TVL. PancakeSwap $163M. Camelot, the largest native DEX, did $68M.
- **Lending.** Aave $412M TVL and $1.03M fees. Morpho $194M. Fluid $153M. Compound $55M. Dolomite is the largest native lender at $18M.
- **Perps.** GMX $184M TVL and $1.35M fees, still the top native. Bridge balances for Hyperliquid ($80M), Aster ($52M) and edgeX ($46M) sit on Arbitrum. AZverse holds $50M. Perps volume needs a paid DefiLlama key, so the column is blank for perps.
- **Stablecoins and yield.** USD.AI $157M TVL and $2.67M fees, the second-largest fee earner. Spark Savings $338M. Pendle $43M.
- **Fee leaders outside DeFi.** Aethir earned $5.5M in 30d fees from node licenses and rewards, the most of any project on Arbitrum. Hypernova (trading app) $1.43M. Spiko (tokenized T-bills) $0.97M. Lava (bitcoin-backed loans) $0.70M.
- **Prediction markets.** Overtime $226K fees. Rain claims a $100M liquidity commitment for its V2, but DefiLlama shows negligible traction for it so far.

Native vs imported
- Arbitrum-native projects are 16% of the list (162 rows, including Orbit chains and program teams). They hold 18% of TVL, 22% of fees and 22% of revenue, but only 2% of DEX volume.
- Native Tier 1 and 2 projects are GMX, USD.AI, Camelot, Dolomite, Ostium, Aark, EVEDEX, D2 Finance and Antarctic.

## Funding

Arbitrum-related rounds since Jan 2025
- 67 rounds disclosed about $188M, excluding acquisitions and the Rain token treasury deal.
- **Largest.** Variational $50M Series A (Dragonfly; May 2026). Ostium $20M Series A plus $4M strategic (General Catalyst, Jump; Dec 2025). USD.AI $13M Series A (Framework; Aug 2025) and $4M from Bullish. Dinari $12.7M Series A. Antarctic $7M. Bleap $6M seed (Blossom; Jan 2026). Rho $4M seed (CoinFund). Golden Tides $3.5M (Krafton, AGV). Reya $3M token sale.
- **Token treasury.** Enlivex (Nasdaq) committed about $212M to buy RAIN tokens, logged as `Corporate token treasury` and kept out of totals.

Arbitrum programs
- **Open House 2026.** 32 teams won about $0.8M across NYC, London, Singapore and the Mentorship Demo Day. The biggest awards were Tilt Protocol ($100K Founder-in-Residence plus $15K), Kustodia, Liquida, Saffron, Atoma and Hyperloop Finance ($60K each). Robinhood Chain co-funded awards in every city.
- **Arbitrum Gaming Ventures.** The first cohort (May 2025) backed Wildcard, Hyve, T-Rex, Xai and Proof of Play. Later deals include extra mile ($1.5M seed), Xross Road, Golden Tides and Chance.
- **DRIP Season 1** (Sep 2025 to Feb 2026, up to 24M ARB) funded looping on Aave, Morpho, Fluid, Euler, Dolomite and Silo. Each has an `Incentive program` row with no amount, because ARB went to users through Merkl.
- **Tandem**, the Offchain Labs venture arm, invested in Camelot. Entropy Advisors holds a $2.47M DAO service contract.

Backers
- Program funders lead the Arbitrum-related list (Arbitrum Foundation, Open House, AGV, DRIP, Robinhood Chain). Coinbase Ventures appears in 5 Arbitrum-related rounds, then Dragonfly, GSR, Big Brain Holdings and OKX Ventures with 3 each.

Natives with no priced round
- GMX, EVEDEX, Ramses, Zyberswap, Sperax, Jones, Plutus, Stryke and Premia show `Not disclosed`, meaning DefiLlama has no raise on record. Most launched tokens without a priced VC round.

## Gaps
- 554 rows are still `Not researched`. They are mostly portal-only infrastructure, wallets and analytics vendors outside DefiLlama raises.
- The NYC Buildathon prize split ($15K, $10K, $5K) came from the Foundation blog. Shared third prizes in London and Singapore have no per-team amount.
- 4 rounds are prior knowledge and need re-verifying.
- Perps volume and open interest are not in this pass.

## Next steps
1. Verify the 340 Low-confidence native rows, starting with the portal-only DeFi projects.
2. Pull open interest from DefiLlama `/overview/open-interest/arbitrum` in the dashboard pipeline.
3. Check DRIP Season 2. Entropy paused incentives after Season 1 ended on Feb 18, 2026 and targeted a mid to late April restart, which this pass did not confirm.
4. Build arbitrum.canhav.com from `claude/arbitrum-atlas-claude-code-prompt-2026-11-17.md`.
