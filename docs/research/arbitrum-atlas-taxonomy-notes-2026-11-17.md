# Arbitrum Atlas ecosystem list and taxonomy (Nov 17, 2026)

Companion to `claude/arbitrum-ecosystem-2026-11-17.csv` (992 projects after the funding pass added 28 program rows). Same 29-column schema as the Base file, with `TVL on Base (USD)` renamed to `TVL on Arbitrum (USD)`. Traction, funding and security are covered in `claude/arbitrum-traction-funding-2026-11-17.md` and `claude/arbitrum-funding-security-2026-11-17.md`.

## Sources
1. **Arbitrum portal (current).** The live portal data (portal-data.arbitrum.io, generated Nov 2, 2026) lists 800 projects, 39 Orbit chains and flags 27 projects as Arbitrum native. The full records came from the last committed snapshot in the OffchainLabs/arbitrum-portal repo (Jul 29, 2025, 1,015 projects). The 332 projects the portal has since dropped were removed, and the 117 added since were pulled from the live file. Dropped projects come back only when DefiLlama still shows Arbitrum traction (Camelot, Balancer, Odos, Radiant, Premia, Synapse and others).
2. **DefiLlama.** API pulled Nov 17, 2026. Arbitrum chain DeFi TVL is $1.30B, 30d DEX volume $5.98B and 30d fees $19.7M. Protocols were grouped by parent. Any parent with $100K+ Arbitrum TVL, $1M+ 30d volume or $10K+ 30d fees became a row, plus 14 legacy Arbitrum natives below that bar (Vela, Buffer, Y2K, Chronos, Arbswap and others). The other 535 listings are in `claude/arbitrum-defillama-to-verify-2026-11-17.csv`. The 363 matched listings are in `claude/arbitrum-defillama-map-2026-11-17.csv`.
3. **Web research.** Arbitrum Foundation programs (Open House, DRIP, Audit Program, Stylus), Arbitrum Gaming Ventures deals (Wildcard, Hyve, T-Rex, Xai, Proof of Play, Golden Tides, Chance), and 2026 launches such as Kustodia, PYUSD AI financing and the Carbon perp DEX move from Base.
4. **Prior knowledge.** 5 rows tagged `Prior knowledge (not re-verified)` (Offchain Labs, Arbiscan, Treasure, Vertex, Pirate Nation). Verify these first.

## Taxonomy
The Base sectors are kept, with one Arbitrum-specific addition.
- **Orbit Chains & Rollup Infrastructure** is new. It holds the 39 Orbit chains from the portal (split into L2 and L3), RaaS providers (Caldera, Conduit, AltLayer, Gelato, Zeeve) and the core network (Arbitrum One, Nova, Stylus, Offchain Labs). Robinhood Chain sits here as an Orbit L2, which links this atlas to robinhood.canhav.com.
- **Memecoins & Community** is dropped because the portal lists no memecoins. **Other** holds only two program teams (Fangorn and LayerV) whose product is not described by their source.
- New subcategories are Orbit chains (L2), Orbit chains (L3), Rollup-as-a-Service and tooling, Core protocol and network, and Perps infrastructure.
- USD.AI is under Stablecoins (USDai), Pendle under Yield, Boros under Perps > Structured products, and Bankr under AI Agents > Agent launchpads, matching the Base file.

| Sector | Projects | Arbitrum native | Subcategories (count) |
|---|---|---|---|
| Infrastructure & Dev Tools | 109 | 4 | RPC and nodes (33), Dev tools and accounts (25), Oracles (19), DePIN, storage and compute (15), Data and indexing (9), Explorers (6), Token tools and lockers (2) |
| DEXs & Liquidity | 101 | 14 | AMM DEXs (63), Liquidity management (20), DEX aggregators and routing (17), Hooks and DEX infrastructure (1) |
| Wallets & Custody | 82 | 0 | Wallets (67), Smart wallets and account abstraction (7), Custody and wallet infrastructure (5), Hardware wallets (2), Multisig (1) |
| Yield & Asset Management | 77 | 15 | Vaults and yield aggregators (30), Yield tokenization and strategies (16), Asset management (12), Vault curators (7), Liquid staking and restaking (7), Savings and yield apps (3), Leveraged yield (2) |
| NFTs, Gaming & Collectibles | 67 | 13 | Games (36), NFT marketplaces and tools (11), NFT creator tools (8), NFT collections and art (8), Gaming infrastructure (4) |
| Perps, Options & Derivatives | 65 | 25 | Perps (39), Options (14), Structured products and leverage (10), Perps infrastructure (2) |
| Bridges & Interoperability | 62 | 2 | Bridges (49), Interoperability protocols (8), Bridge aggregators (3), Wrapped assets (2) |
| Stablecoins & Payments | 56 | 8 | Stablecoins (23), Payments (23), Consumer finance apps (6), Payroll, streaming and vesting (3), Stablecoin infrastructure (1) |
| Data & Analytics | 55 | 0 | Data and analytics (38), Tax and accounting (11), Portfolio trackers (6) |
| Orbit Chains & Rollup Infrastructure | 52 | 40 | Orbit chains (L3) (20), Orbit chains (L2) (18), Rollup-as-a-Service and tooling (10), Core protocol and network (4) |
| Lending & Credit | 48 | 9 | Lending markets (31), CDPs (7), Fixed-rate and term lending (5), Lending tools and automation (3), Unsecured and credit-scored lending (1), Private and institutional credit (1) |
| RWA & Tokenized Assets | 41 | 9 | Real-world apps (12), Tokenized treasuries and funds (9), Tokenization infrastructure and marketplaces (9), Tokenized stocks (4), Real estate (3), Commodities (2), RWA yield and investment (2) |
| Exchanges & On/Off-Ramps | 36 | 0 | On and off-ramps (23), Centralized exchanges (13) |
| AI Agents | 33 | 5 | Agent platforms (15), Trading and yield agents (8), Decentralized AI networks (3), Agent infrastructure and data (3), Consumer and social agents (2), Agent launchpads (1), Agent payments and wallets (1) |
| Security, Risk & Compliance | 33 | 4 | Security and audits (15), Privacy (10), Risk monitoring (4), Compliance (2), Insurance (1), Wallet security (1) |
| Social & Identity | 27 | 4 | Social apps (13), Identity and reputation (7), Quests and growth (6), Music (1) |
| DAOs, Governance & Public Goods | 16 | 1 | DAO and governance tools (13), Public goods and impact (2), DAOs and communities (1) |
| Prediction Markets | 10 | 1 | Prediction markets (10) |
| Trading Tools & Bots | 9 | 1 | Trading terminals and bots (9) |
| Launchpads | 6 | 1 | Token launchpads (4), Launchpad tools and infrastructure (1), Token sale platforms (1) |
| Ecosystem, Funding & Education | 5 | 4 | Ecosystem programs (3), Funds and accelerators (1), Education and community (1) |
| Other | 2 | 2 | Unknown (2) |

## Field rules
- **Native Chain.** Arbitrum native, Other EVM, Other non-EVM, or Centralized / off-chain. High confidence comes from the portal native flag, a manual list (GMX, Camelot, Dolomite, Radiant, Jones, Umami, Plutus, Stryke, Rysk, Ostium, Variational, USD.AI, Aark and others) or Orbit chain status. Medium means DefiLlama shows Arbitrum as the only or primary chain, or the category implies off-chain. All 340 Low-confidence rows are portal listings defaulted to Other EVM and need checking. The 28 program rows are Arbitrum native at Medium confidence, with Robinhood Chain builders noted in the detail.
- **Traction Tier.** Same CanHav thresholds as Base. Tier 1 is TVL $50M+, volume $500M+ or fees $1M+. Tier 2 is TVL $2M+, volume $50M+ or fees $100K+. Counts are 17 Tier 1, 41 Tier 2, 193 Tier 3, 69 negligible and 672 not tracked.
- **CEXs** carry Arbitrum reserves in Other Traction Signal, not TVL. **Curators** (Steakhouse, Gauntlet and others) overlap Morpho, Euler and Silo, so leave them out of totals.
- **Shared listings.** Where two portal entries map to one DefiLlama parent (Umami, Vendor and Exit Tech under BonsaiDAO, for example), only the best name match keeps the numbers. The other is flagged in Other Traction Signal.
- **Security.** Filled from DefiLlama audits and the hacks list for the 348 DefiLlama-matched rows, using the Base rubric (see the funding and security memo). Not researched for the rest.
- **Status.** Mainnet when the portal marks it live or DefiLlama shows activity. Unknown when the portal says not live. Building for testnet or in-development Orbit chains and AGV games. Hackathon project for Open House teams. Defunct or Inactive with a reason (Vertex, Lodestar, Radiant, Vela, Buffer, Y2K).

## Traction snapshot
- Summing the list gives $2.26B TVL against the $1.30B chain figure, because bridge balances (LayerZero, Hyperliquid, Aster, edgeX) and Spark deposits are counted by protocol but not by chain. Use the chain figure for headline TVL.
- **Leaders.** Aave $412M TVL and $1.03M fees. Spark $338M. Morpho $194M. GMX $184M TVL and $1.35M fees. USD.AI $157M TVL and $2.67M fees. Fluid $153M. Uniswap $4.0B of the $6.0B DEX volume (66%). Aerodrome's Slipstream deployment did $563M. Aethir earned the most fees on Arbitrum at $5.5M (node licenses and rewards).
- **Arbitrum natives** are 14% of the list. They hold 18% of TVL and 22% of fees but only 2% of DEX volume. Native Tier 1 and 2 projects are GMX, USD.AI, Camelot, Dolomite, Ostium, Aark, EVEDEX, D2 Finance and Antarctic.
- **Ecosystem shifts.** Camelot, Balancer, Radiant and Odos were dropped from the portal. Vertex shut down in 2025. New growth is in RWA perps (Ostium), AI credit (USD.AI), perp DEXs on their own chains (edgeX, EVEDEX) and DRIP-backed lending.
- **Notable incidents since Nov 2024.** GMX $42M (Jul 2025), Ostium $23.75M key compromise (Jul 2026) and Kelp $293M (Apr 2026), per DefiLlama.

## Next passes
1. Verify the 340 Low-confidence native rows and the 5 prior-knowledge rows.
2. Classify the 535 DefiLlama long-tail listings.
3. Perps volume and open interest (volume needs a DefiLlama Pro key or protocol APIs).
4. Add descriptions for the rows that have none, and X handles where missing.
5. Done in the Nov 17 funding pass. Funding rounds CSV, traction and funding summary, funding and security memo, and the Claude Code prompt.
