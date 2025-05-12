import { getBlockNumber, getChainId } from './rpcService';
import { RpcCallRecord, RpcMetrics, JsonRpcErrorObject } from '../types';
import { broadcastMetrics } from './websocketService';

const MAX_RECORDS = 100; // Keep records for the last 100 calls
const POLLING_INTERVAL_MS = 5000; // Poll every 5 seconds

const callRecords: RpcCallRecord[] = [];
let latestMetrics: RpcMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  successRate: 0,
  averageResponseTimeMs: 0,
  errorMessages: [],
  lastBlockNumber: null,
  lastChainId: null,
};

let pollingIntervalId: NodeJS.Timeout | null = null;

/**
 * Adds a new RPC call record and ensures the store doesn't exceed MAX_RECORDS.
 * @param record The RpcCallRecord to add.
 */
function addCallRecord(record: RpcCallRecord): void {
  callRecords.push(record);
  if (callRecords.length > MAX_RECORDS) {
    callRecords.shift(); // Remove the oldest record
  }
}

/**
 * Calculates RPC metrics based on the stored call records.
 */
function calculateMetrics(): void {
  const numRecords = callRecords.length;
  if (numRecords === 0) {
    latestMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      successRate: 0,
      averageResponseTimeMs: 0,
      errorMessages: [],
      lastBlockNumber: latestMetrics.lastBlockNumber, // Retain last known good values
      lastChainId: latestMetrics.lastChainId,
    };
    return;
  }

  let successfulCalls = 0;
  let totalResponseTime = 0;
  const errors: string[] = [];
  let currentBlockNumber: string | null = latestMetrics.lastBlockNumber ?? null;
  let currentChainId: string | null = latestMetrics.lastChainId ?? null;

  for (const record of callRecords) {
    if (record.isSuccess) {
      successfulCalls++;
      totalResponseTime += (record.endTime - record.startTime);
      if (record.method === 'eth_blockNumber') {
        if (typeof record.result === 'string') {
          const strResult: string = record.result; // Explicit intermediate variable
          currentBlockNumber = strResult;
        }
      }
      if (record.method === 'eth_chainId') {
        if (typeof record.result === 'string') {
          const strResult: string = record.result; // Explicit intermediate variable
          currentChainId = strResult;
        }
      }
    } else if (record.error) {
      const errorMessage = typeof record.error.message === 'string' ? record.error.message : JSON.stringify(record.error);
      if (errors.length < 10) { // Keep last 10 error messages
        errors.push(`[${record.method}]: ${errorMessage}`);
      }
    }
  }

  const failedCalls = numRecords - successfulCalls;
  const successRate = numRecords > 0 ? (successfulCalls / numRecords) * 100 : 0;
  const avgResponseTime = successfulCalls > 0 ? totalResponseTime / successfulCalls : 0;

  latestMetrics = {
    totalRequests: numRecords,
    successfulRequests: successfulCalls,
    failedRequests: failedCalls,
    successRate: parseFloat(successRate.toFixed(1)),
    averageResponseTimeMs: parseFloat(avgResponseTime.toFixed(0)),
    errorMessages: errors.reverse(), // Show newest errors first
    lastBlockNumber: currentBlockNumber,
    lastChainId: currentChainId,
  };
  
  // Broadcast the newly calculated metrics
  broadcastMetrics(getLatestMetrics());
}

/**
 * Performs a polling cycle: calls RPC methods, adds records, and recalculates metrics.
 */
async function performPollingCycle(): Promise<void> {
  console.log(`MetricsService: Performing polling cycle at ${new Date().toISOString()}`);
  try {
    const blockNumberRecord = await getBlockNumber();
    addCallRecord(blockNumberRecord);
    if(blockNumberRecord.isSuccess && typeof blockNumberRecord.result === 'string') {
        // latestMetrics.lastBlockNumber = blockNumberRecord.result; // This direct update is handled by calculateMetrics
    }

    const chainIdRecord = await getChainId();
    addCallRecord(chainIdRecord);
    if(chainIdRecord.isSuccess && typeof chainIdRecord.result === 'string') {
        // latestMetrics.lastChainId = chainIdRecord.result; // This direct update is handled by calculateMetrics
    }

  } catch (error) {
    console.error('MetricsService: Error during polling RPC calls:', error);
    // This error should ideally be from rpcService which already creates a record
    // If it's an unexpected error *before* rpcService is called, we might log it differently
  }
  calculateMetrics();
  // console.log('MetricsService: Latest Metrics:', latestMetrics);
}

/**
 * Starts the metrics polling.
 */
export function startMetricsService(): void {
  if (pollingIntervalId) {
    console.warn('MetricsService is already running.');
    return;
  }
  console.log(`MetricsService: Starting polling every ${POLLING_INTERVAL_MS}ms.`);
  // Perform an initial poll immediately, then set interval
  performPollingCycle().finally(() => {
    pollingIntervalId = setInterval(performPollingCycle, POLLING_INTERVAL_MS);
  });
}

/**
 * Stops the metrics polling.
 */
export function stopMetricsService(): void {
  if (pollingIntervalId) {
    clearInterval(pollingIntervalId);
    pollingIntervalId = null;
    console.log('MetricsService: Stopped polling.');
  } else {
    console.warn('MetricsService is not running.');
  }
}

/**
 * Gets the latest calculated RPC metrics.
 * @returns The current RpcMetrics.
 */
export function getLatestMetrics(): RpcMetrics {
  return { ...latestMetrics }; // Return a copy
}

/**
 * Clears all stored call records and resets metrics.
 * Primarily for testing purposes.
 */
export function resetMetricsState(): void {
  callRecords.length = 0;
  latestMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    successRate: 0,
    averageResponseTimeMs: 0,
    errorMessages: [],
    lastBlockNumber: null,
    lastChainId: null,
  };
  console.log('MetricsService: State reset.');
  // Optionally broadcast reset state if websocket service is running
  // broadcastMetrics(getLatestMetrics()); 
} 