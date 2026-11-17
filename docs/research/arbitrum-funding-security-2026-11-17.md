# Arbitrum ecosystem, funding sweep and security pass (Nov 17, 2026)

Companion to `claude/arbitrum-ecosystem-2026-11-17.csv` (992 projects, 29 columns) and `claude/arbitrum-funding-rounds-2026-11-17.csv` (393 rounds). It follows `arbitrum-traction-funding-2026-11-17.md`.

## What changed in the CSV
- **Funding** is filled for 243 projects. 282 rounds came from DefiLlama per-protocol raises, 107 from sourced research (Foundation posts, AGV, press and the Robinhood and Base rounds files), and 4 are prior knowledge.
- **Arbitrum-native projects with traction (59).** All are checked. 18 are VC-backed, 3 token-funded and 1 program-funded. 37 show `Not disclosed`, meaning no round exists in DefiLlama raises as of Nov 17.
- **Security** is filled for 348 projects (those matched to DefiLlama). Counts are 159 Low, 135 Medium, 20 High and 34 Unknown. The other 644 are `Not researched`.

## Security rubric
Same as the Base memo. It uses DefiLlama data only and is not a code review.
- **High.** Exploit losses since Nov 2024 of $250K or more on Arbitrum, or $5M or more on any chain.
- **Medium.** Any other recorded incident, a risk curator, or no audit listed with traction.
- **Low.** Audited per DefiLlama and no incidents listed.
- **Unknown.** No audit data and no traction.

## Chain level (L2BEAT, Offchain Labs and the Arbitrum status page)
- **Stage 1 optimistic rollup** on L2BEAT. BoLD permissionless validation is live on Arbitrum One and Nova, so anyone can challenge a state root.
- **Security Council.** It can upgrade instantly in an emergency. Regular upgrades wait about 17 days 8 hours, the longest delay of the major L2s. The Council handled the Kelp rsETH exploit recovery in Apr 2026.
- **ZK settlement is coming.** Offchain Labs announced on Aug 20, 2026 that Arbitrum blocks can now be ZK proven inside BoLD, aiming to cut withdrawals from 7 days to hours while keeping fraud proofs. The prover work comes from the Aug 2025 Succinct partnership.
- **Upgrades.** ArbOS Dia shipped in Jan 2026. ArbOS Elara (96KB contracts and protocol-level compliance) activated on Aug 20, 2026.
- **Nova.** Offchain Labs flagged a change to Nova in Jun 2026, and the Security Council paused new Stylus activations on Nova on Oct 2, 2026.
- **Sequencer.** The status page shows 100% uptime for the Arbitrum One validator, feed and batch poster from May to Oct 2026. The last major mainnet outage was the Dec 2023 inscriptions surge. Arbitrum Sepolia testnet stalled for about 5 hours on Mar 23, 2026.
- **Security Program.** The Arbitrum Audit Program (launched Aug 1, 2025) is being extended as the broader Arbitrum Security Program for 12 more months.

## Incidents touching Arbitrum (DefiLlama hacks)
- 53 incidents since Nov 2024 involved Arbitrum, 36 of them in 2026. 30 were Arbitrum-only, losing about $117M.
- The most common types are access control (12), key compromise (10), protocol logic (8), oracle manipulation (6) and front-end and infrastructure (5).

Notable incidents
- **Kelp**, Apr 18, 2026, $293M cross-chain message spoofing on two chains including Arbitrum.
- **Balancer V2**, Nov 2025, $128M rounding exploit across six chains.
- **GMX V1**, Jul 9, 2025, $42M reentrancy on Arbitrum only. GMX V2 was not affected.
- **AFX Bridge**, Jul 2026, $24.2M validator key compromise on Arbitrum only.
- **Ostium**, Jul 15, 2026, $23.75M private key compromise on Arbitrum only.
- **Abracadabra**, Mar 2025, $13M liquidation logic flaw on Arbitrum only.
- **Garden** ($11.4M, Oct 2025) and **UXLINK** ($11.3M, Sep 2025).
- **Exchanges.** Binance (Oct 29, 2026, about $6.36B hot wallet theft across 7 chains), Phemex ($85M), Nobitex ($82M), BtcTurk ($48M) and Mercado Bitcoin ($40M, Nov 2026) all touched Arbitrum wallets.

High-risk rows (20)
- Garden, Balancer, ACryptoS, Yearn, Matcha, 1inch, Binance, Bitget, Bybit, DxSale, Abracadabra, Silo, Summer.fi, GMX, Ostium, IPOR, Premia, Trust Wallet, Kelp and Stake DAO.
- GMX, Ostium and Premia are the only Arbitrum-native ones. Most others are multichain protocols or exchanges whose losses touched Arbitrum along with other chains.

## Funding findings
- Arbitrum-related rounds since Jan 2025 disclosed about $188M across 67 rounds, led by Variational ($50M), Ostium ($24M) and USD.AI ($17M).
- Program money is broad but small. Open House paid about $0.8M to 32 teams, AGV made nine disclosed investments, and DRIP ARB went to users rather than protocols.
- Robinhood Chain co-funded awards in all three Open House cities, so several winners (Tilt, Bond.Credit, Saffron, Agama, Hyperloop, Fables) build on Robinhood Chain rather than Arbitrum One.

## Gaps
- 554 rows have no funding research and 644 have no security data. Audit status should be checked against project docs before it is shown as a rating.
- 4 rounds are prior knowledge and need re-verifying (carried from the Base file).
