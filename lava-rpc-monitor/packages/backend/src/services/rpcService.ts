import axios, { AxiosError } from 'axios';
import {
  JsonRpcRequest,
  JsonRpcResponse,
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

async function sendJsonRpcRequest<TParams, TResult>(
  method: string,
  params: TParams
): Promise<RpcCallRecord<TResult>> {
  await waitForRateLimitPermission();

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
    const tenSecondsInMS = 10000;
    const response = await axios.post<JsonRpcResponse<TResult>>(
      LAVA_RPC_ENDPOINT,
      requestData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: tenSecondsInMS,
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

export async function getBlockNumber(): Promise<RpcCallRecord<EthBlockNumberResult>> {
  return sendJsonRpcRequest<EthBlockNumberParams, EthBlockNumberResult>(
    'eth_blockNumber',
    []
  );
}

export async function getChainId(): Promise<RpcCallRecord<EthChainIdResult>> {
  return sendJsonRpcRequest<EthChainIdParams, EthChainIdResult>(
    'eth_chainId',
    []
  );
}

export async function getSyncingStatus(): Promise<RpcCallRecord<EthSyncingResult>> {
  return sendJsonRpcRequest<EthSyncingParams, EthSyncingResult>(
    'eth_syncing',
    []
  );
}