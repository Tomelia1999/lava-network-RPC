
export interface JsonRpcRequest<TParams = any[]> {
  jsonrpc: "2.0";
  method: string;
  params?: TParams;
  id: number | string | null;
}

export interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: any;
}

export interface JsonRpcSuccessResponse<TResult = any> {
  jsonrpc: "2.0";
  result: TResult;
  id: number | string | null;
}

export interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  error: JsonRpcErrorObject;
  id: number | string | null;
}

export type JsonRpcResponse<TResult = any> =
  | JsonRpcSuccessResponse<TResult>
  | JsonRpcErrorResponse;

export type EthBlockNumberParams = [];

export type EthBlockNumberResult = string;

export type EthChainIdParams = [];

export type EthChainIdResult = string;

export type EthSyncingParams = [];

export interface EthSyncingResultObject {
  startingBlock: string;
  currentBlock: string;
  highestBlock: string;
}

export type EthSyncingResult = false | EthSyncingResultObject;

export interface RpcCallRecord<TResult = any> {
  method: string;
  startTime: number;
  endTime: number;
  isSuccess: boolean;
  statusCode?: number;
  error?: JsonRpcErrorObject | { message: string };
  result?: TResult;
}
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

export interface WebSocketBroadcastData extends RpcMetrics {
  timestamp: number;
} 