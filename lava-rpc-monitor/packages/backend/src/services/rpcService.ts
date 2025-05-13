import axios, { AxiosError } from 'axios';
import {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcErrorResponse,
  EthBlockNumberParams,
  EthBlockNumberResult,
  EthChainIdParams,
  EthChainIdResult,
  EthSyncingParams,
  EthSyncingResult,
  RpcCallRecord
} from '../types';
import { waitForRateLimitPermission } from '../utils/rateLimiter';

const LAVA_RPC_ENDPOINT = 'https://eth1.lava.build';

let requestId = 1;

/**
 * Sends a JSON-RPC request to the specified endpoint.
 * @param method The RPC method name.
 * @param params The parameters for the RPC method.
 * @returns A Promise that resolves to the RpcCallRecord.
 */
async function sendJsonRpcRequest<TParams, TResult>(
  method: string,
  params: TParams
): Promise<RpcCallRecord<TResult>> {
  await waitForRateLimitPermission(); // Wait for permission before proceeding

  const requestData: JsonRpcRequest<TParams> = {
    jsonrpc: '2.0',
    method,
    params,
    id: requestId++,
  };

  const startTime = Date.now();
  let callRecord: Partial<RpcCallRecord<TResult>> = {
    method,
    startTime,
  };

  try {
    const response = await axios.post<JsonRpcResponse<TResult>>(
      LAVA_RPC_ENDPOINT,
      requestData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000, // 10-second timeout
      }
    );

    callRecord.endTime = Date.now();
    callRecord.statusCode = response.status;

    const responseData = response.data;
    if (responseData && 'result' in responseData && responseData.result !== undefined) {
      callRecord.isSuccess = true;
      callRecord.result = responseData.result;
    } else if (responseData && 'error' in responseData && responseData.error) {
      callRecord.isSuccess = false;
      callRecord.error = responseData.error;
    } else {
      // Should not happen with a compliant JSON-RPC server
      callRecord.isSuccess = false;
      callRecord.error = { message: 'Invalid JSON-RPC response structure' };
    }
  } catch (error) {
    callRecord.endTime = Date.now();
    callRecord.isSuccess = false;
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      callRecord.statusCode = axiosError.response?.status;
      const errorResponseData = axiosError.response?.data;

      if (errorResponseData && 
          typeof errorResponseData === 'object' && 
          'error' in errorResponseData) {
            const nestedError = (errorResponseData as any).error;
            if (nestedError && 
                typeof nestedError === 'object' && 
                ('message' in nestedError || 'code' in nestedError)) {
              callRecord.error = nestedError;
            } else {
              callRecord.error = { message: axiosError.message };
            }
      } else {
        callRecord.error = { message: axiosError.message };
      }
    } else if (error instanceof Error) {
      callRecord.error = { message: error.message };
    } else {
      callRecord.error = { message: 'An unknown error occurred' };
    }
  }
  return callRecord as RpcCallRecord<TResult>;
}

/**
 * Fetches the latest block number.
 */
export async function getBlockNumber(): Promise<RpcCallRecord<EthBlockNumberResult>> {
  return sendJsonRpcRequest<EthBlockNumberParams, EthBlockNumberResult>(
    'eth_blockNumber',
    []
  );
}

/**
 * Fetches the current chain ID.
 */
export async function getChainId(): Promise<RpcCallRecord<EthChainIdResult>> {
  return sendJsonRpcRequest<EthChainIdParams, EthChainIdResult>(
    'eth_chainId',
    []
  );
}

/**
 * Fetches the syncing status of the Ethereum node.
 */
export async function getSyncingStatus(): Promise<RpcCallRecord<EthSyncingResult>> {
  return sendJsonRpcRequest<EthSyncingParams, EthSyncingResult>(
    'eth_syncing',
    []
  );
}

// Example Usage (can be removed or kept for local testing):
/*
async function testRpcService() {
  console.log('Fetching block number...');
  const blockNumberRecord = await getBlockNumber();
  console.log('Block Number Record:', blockNumberRecord);
  if (blockNumberRecord.isSuccess) {
    console.log('Block Number:', parseInt(blockNumberRecord.result, 16));
  }

  console.log('\nFetching chain ID...');
  const chainIdRecord = await getChainId();
  console.log('Chain ID Record:', chainIdRecord);
  if (chainIdRecord.isSuccess) {
    console.log('Chain ID:', parseInt(chainIdRecord.result, 16));
  }
}

testRpcService();
*/ 