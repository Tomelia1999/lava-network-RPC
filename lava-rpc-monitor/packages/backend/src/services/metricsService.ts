import {
  getBlockNumber,
  getChainId,
  getSyncingStatus
} from './rpcService';
import { RpcCallRecord, RpcMetrics, EthSyncingResult, JsonRpcErrorObject } from '../types';
import { broadcastMetrics } from './websocketService';

const MAX_RECORDS = 100;
const POLLING_INTERVAL_MS = 5000;

const callRecords: RpcCallRecord<any>[] = [];
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
  syncingStatus: null,
  callRecords: [],
};


function addCallRecord(record: RpcCallRecord<any>): void {
  callRecords.push(record);
  if (callRecords.length > MAX_RECORDS) {
    callRecords.shift();
  }
}

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
      lastBlockNumber: latestMetrics.lastBlockNumber, 
      lastChainId: latestMetrics.lastChainId,
      syncingStatus: latestMetrics.syncingStatus, 
      callRecords: [],
    };
    broadcastMetrics(getLatestMetrics());
    return;
  }

  let successfulCalls = 0;
  let totalResponseTime = 0;
  const errors: string[] = [];

  let currentBlockNumber: string | null = latestMetrics.lastBlockNumber;
  let currentChainId: string | null = latestMetrics.lastChainId;
  let currentSyncingStatus: EthSyncingResult | null = latestMetrics.syncingStatus;

  for (const record of callRecords) {
    if (record.isSuccess) {
      successfulCalls++;
      totalResponseTime += (record.endTime - record.startTime);
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
    syncingStatus: currentSyncingStatus,
    callRecords: [...callRecords].reverse(),
  };
  
  broadcastMetrics(getLatestMetrics());
}

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
        console.error('MetricsService: Unexpected error during an RPC call in polling cycle:', result.reason);
      }
    });

  } catch (error) {
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

  performPollingCycle().finally(() => {
    if (!pollingIntervalId) {
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

export function getLatestMetrics(): RpcMetrics {
  return { ...latestMetrics, callRecords: [...latestMetrics.callRecords] };
}

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
} 