/**
 * Generic JSON-RPC Request Structure
 */
export interface JsonRpcRequest<TParams = any[]> {
  jsonrpc: "2.0";
  method: string;
  params?: TParams;
  id: number | string | null;
}

/**
 * Generic JSON-RPC Error Object Structure
 */
export interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: any;
}

/**
 * Generic JSON-RPC Success Response Structure
 */
export interface JsonRpcSuccessResponse<TResult = any> {
  jsonrpc: "2.0";
  result: TResult;
  id: number | string | null;
}

/**
 * Generic JSON-RPC Error Response Structure
 */
export interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  error: JsonRpcErrorObject;
  id: number | string | null;
}

/**
 * Union type for any JSON-RPC Response
 */
export type JsonRpcResponse<TResult = any> =
  | JsonRpcSuccessResponse<TResult>
  | JsonRpcErrorResponse;

// -----------------------------------------------------------------------------
// Specific RPC Method Parameter and Result Types
// -----------------------------------------------------------------------------

/**
 * Parameters for `eth_blockNumber`
 * This method usually takes no parameters.
 */
export type EthBlockNumberParams = [];

/**
 * Result type for `eth_blockNumber` (hex string)
 */
export type EthBlockNumberResult = string;

/**
 * Parameters for `eth_chainId`
 * This method usually takes no parameters.
 */
export type EthChainIdParams = [];

/**
 * Result type for `eth_chainId` (hex string)
 */
export type EthChainIdResult = string;

// New types for eth_syncing
export type EthSyncingParams = [];

export interface EthSyncingResultObject {
  startingBlock: string;
  currentBlock: string;
  highestBlock: string;
}

// eth_syncing can return false OR an object
export type EthSyncingResult = false | EthSyncingResultObject;

// -----------------------------------------------------------------------------
// Metrics Data Structures
// -----------------------------------------------------------------------------

/**
 * Structure for a single RPC call attempt record
 */
export interface RpcCallRecord<TResult = any> {
  method: string;
  startTime: number; // Unix timestamp (ms)
  endTime: number;   // Unix timestamp (ms)
  isSuccess: boolean;
  statusCode?: number; // HTTP status code, if applicable
  error?: JsonRpcErrorObject | { message: string }; // RPC error or other error
  result?: TResult;
}

/**
 * Structure for aggregated metrics
 */
export interface RpcMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number | null;
  averageResponseTimeMs: number | null;
  errorMessages: string[];
  lastBlockNumber: string | null;
  lastChainId: string | null;
  syncingStatus: EthSyncingResult | null;
  callRecords: RpcCallRecord<any>[];
}

/**
 * Data broadcasted via WebSocket
 */
export interface WebSocketBroadcastData extends RpcMetrics {
  timestamp: number; // Unix timestamp (ms) of when this data was generated
} 