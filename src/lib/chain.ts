/**
 * Everything specific to the chain this atlas covers, in one place.
 * Scripts and the app read these instead of repeating the chain's keys.
 */
export const CHAIN = {
  /** Display name and the key DefiLlama uses in chainTvls, stablecoins and yields. */
  name: "Arbitrum",
  /** Lowercase path segment for DefiLlama overview endpoints. */
  llamaOverview: "arbitrum",
  /** Path segment for /v2/historicalChainTvl and /lite/charts. */
  llamaChainPath: "Arbitrum",
  llamaChainRow: "arbitrum",
  chainId: 42161,
  geckoNetwork: "arbitrum",
  morphoChainId: 42161,
  blockscoutGateway: "https://api.blockscout.com/42161/api/v2",
  /** Public Blockscout stats service (daily lines and counters). */
  blockscoutStats: "https://arbitrum.blockscout.com/stats-service/api/v1",
  explorer: "https://arbitrum.blockscout.com",
  growthepieKey: "arbitrum",
  nativeLabel: "Arbitrum native",
  /** DefiLlama stablecoins page for the chain. */
  llamaStablecoinsUrl: "https://defillama.com/stablecoins/arbitrum",
  /** GeckoTerminal token page prefix. */
  geckoTokenUrl: "https://www.geckoterminal.com/arbitrum/tokens/",
  /** Arbitrum One mainnet launch, Aug 31 2021. Chain history before it is left off charts. */
  mainnet: "2021-08-31",
  /** Default start of the timeline; earlier events sit behind Show earlier events. */
  timelineStart: "2025-01-01",
  /** User-Agent for every fetch; no personal contact details. */
  userAgent: "arbitrum-atlas/1.0 (+https://arbitrum.canhav.com)",
  /** File prefix of the committed research CSVs in data/. */
  filePrefix: "arbitrum",
  /** Ecosystem CSV column holding the snapshot TVL. */
  tvlColumn: "TVL on Arbitrum (USD)",
  /** Funding rounds CSV column marking chain-related rounds. */
  relatedColumn: "Arbitrum Related",
} as const;

export const NOT_AFFILIATED = "Independent research by CanHav Research, not affiliated with Arbitrum, Offchain Labs or the Arbitrum Foundation";

/** CanHav Research is itself a row in this atlas (an Open House London award winner). It gets a disclosure note and is never featured. */
export const PUBLISHER = "CanHav Research";
export const isPublisher = (p: { name: string }) => p.name === PUBLISHER;
export const PUBLISHER_NOTE = "CanHav Research is the publisher of this atlas.";

/** Orbit chains and Open House teams that build on Robinhood Chain name it in Native Chain Detail. */
export const buildsOnRobinhoodChain = (p: { chainDetail: string | null }) => /robinhood chain/i.test(p.chainDetail ?? "");

/**
 * Rows whose supply on Arbitrum is counted on another row. DefiLlama lists Tether's Arbitrum supply as USDT (id 1),
 * which is the USDT0 token, so the USDT0 row carries it and Tether shows this note instead (owner decision, Nov 17 2026).
 */
export const SUPPLY_COUNTED_ON: Record<string, string> = { Tether: "USDT0" };
export function supplyNote(p: { name: string }): string | null {
  const other = SUPPLY_COUNTED_ON[p.name];
  return other ? `Tether's supply on Arbitrum is the ${other} token, so it is counted on the ${other} row.` : null;
}
