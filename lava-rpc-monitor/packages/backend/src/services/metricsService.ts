import {
  getBlockNumber,
  getChainId,
  getSyncingStatus // Added for eth_syncing
} from './rpcService';
import { RpcCallRecord, RpcMetrics, EthSyncingResult, JsonRpcErrorObject } from '../types'; // Ensured EthSyncingResult is here
import { broadcastMetrics } from './websocketService';

const MAX_RECORDS = 100; // Keep records for the last 100 calls
const POLLING_INTERVAL_MS = 5000; // Poll every 5 seconds

const callRecords: RpcCallRecord<any>[] = []; // Made RpcCallRecord generic
let pollingIntervalId: NodeJS.Timeout | null = null;

let latestMetrics: RpcMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  successRate: 0,
  averageResponseTimeMs: 0,
  errorMessages: [],
  lastBlockNumber: null,
  lastChainId: null,
  syncingStatus: null, // Added for eth_syncing
  callRecords: [],
};

/**
 * Adds a new RPC call record and ensures the store doesn't exceed MAX_RECORDS.
 * @param record The RpcCallRecord to add.
 */
function addCallRecord(record: RpcCallRecord<any>): void { // Made RpcCallRecord generic
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
    // Preserve last known good values for block number, chain ID, and syncing status if no new records
    latestMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      successRate: 0,
      averageResponseTimeMs: 0,
      errorMessages: [],
      lastBlockNumber: latestMetrics.lastBlockNumber, 
      lastChainId: latestMetrics.lastChainId,
      syncingStatus: latestMetrics.syncingStatus, // Retain last known good value for syncingStatus
      callRecords: [],
    };
    broadcastMetrics(getLatestMetrics()); // Broadcast even if reset or no records
    return;
  }

  let successfulCalls = 0;
  let totalResponseTime = 0;
  const errors: string[] = [];
  // Initialize with latest known good values, to be updated if new data comes in
  let currentBlockNumber: string | null = latestMetrics.lastBlockNumber;
  let currentChainId: string | null = latestMetrics.lastChainId;
  let currentSyncingStatus: EthSyncingResult | null = latestMetrics.syncingStatus;

  for (const record of callRecords) {
    if (record.isSuccess) {
      successfulCalls++;
      totalResponseTime += (record.endTime - record.startTime);
      // Update specific metrics based on method type
      if (record.method === 'eth_blockNumber' && typeof record.result === 'string') {
        currentBlockNumber = record.result;
      }
      if (record.method === 'eth_chainId' && typeof record.result === 'string') {
        currentChainId = record.result;
      }
      if (record.method === 'eth_syncing') {
        currentSyncingStatus = record.result as EthSyncingResult; 
      }
    } else if (record.error) {
      const errorObj = record.error as JsonRpcErrorObject; 
      const errorMessage = typeof errorObj.message === 'string' ? errorObj.message : JSON.stringify(errorObj);
      if (errors.length < 10) { 
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
    errorMessages: errors.length > 0 ? errors.reverse() : [], 
    lastBlockNumber: currentBlockNumber,
    lastChainId: currentChainId,
    syncingStatus: currentSyncingStatus, // Added for eth_syncing
    callRecords: [...callRecords].reverse(), // Return a reversed copy for chronological display (newest first)
  };
  
  broadcastMetrics(getLatestMetrics());
}

/**
 * Performs a polling cycle: calls RPC methods, adds records, and recalculates metrics.
 */
async function performPollingCycle(): Promise<void> {
  console.log(`MetricsService: Performing polling cycle at ${new Date().toISOString()}`);
  try {
    // Using Promise.allSettled to ensure all calls are made even if some fail
    const results = await Promise.allSettled([
      getBlockNumber(),
      getChainId(),
      getSyncingStatus() // Added for eth_syncing
    ]);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        addCallRecord(result.value);
      } else {
        // This case should ideally be handled by sendJsonRpcRequest creating an error record.
        // However, if an unexpected error occurs before that, log it.
        console.error('MetricsService: Unexpected error during an RPC call in polling cycle:', result.reason);
        // We might want to create a placeholder error record here if sendJsonRpcRequest didn't
      }
    });

  } catch (error) {
    // This catch is for errors in Promise.allSettled itself, which is unlikely.
    console.error('MetricsService: Error during overall polling cycle execution:', error);
  }
  calculateMetrics();
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
    if (!pollingIntervalId) { // Ensure interval is not set multiple times if start is called rapidly
        pollingIntervalId = setInterval(performPollingCycle, POLLING_INTERVAL_MS);
    }
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
  return { ...latestMetrics, callRecords: [...latestMetrics.callRecords] }; // Return a deep copy for callRecords
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
    syncingStatus: null, // Added for eth_syncing
    callRecords: [],
  };
  console.log('MetricsService: State reset.');
  // Optionally broadcast reset state if needed, e.g., for immediate UI update
  // broadcastMetrics(getLatestMetrics()); 
} 