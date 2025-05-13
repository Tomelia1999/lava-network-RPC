/**
 * Structure for the object returned by `eth_syncing` when the node is syncing.
 * Mirrors the backend type.
 */
export interface EthSyncingResultObject {
  startingBlock: string; // Hex QUANTITY
  currentBlock: string;  // Hex QUANTITY
  highestBlock: string;  // Hex QUANTITY
  // Optional, Geth-specific fields can be added here if needed
}

/**
 * Represents the full data structure received via WebSocket from the backend.
 * This should be kept in sync with `packages/backend/src/types.ts:WebSocketBroadcastData`
 */
export interface WebSocketBroadcastData {
  // Foundational metrics (always include)
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number | null;
  averageResponseTimeMs: number | null;
  errorMessages: string[];
  lastBlockNumber: string | null; // Hex string
  lastChainId: string | null;   // Hex string
  callRecords: any[]; // Or a more specific type if you define RpcCallRecord on frontend
  timestamp: number; // Unix timestamp (ms) of when this data was generated

  // Metrics added in this integration phase
  syncingStatus: EthSyncingResultObject | false | null;

  // Placeholders for other metrics from the full plan (eth_gasPrice, net_peerCount)
  // These will be string | null as they are hex strings from backend initially
  currentGasPrice: string | null;
  peerCount: string | null;
} 