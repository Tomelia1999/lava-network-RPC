import axios, { AxiosError, AxiosResponse } from 'axios';
import { getBlockNumber, getChainId } from '../src/services/rpcService';
import * as rateLimiter from '../src/utils/rateLimiter'; // Import to spy on
import { JsonRpcResponse, JsonRpcErrorObject, RpcCallRecord } from '../src/types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockWaitForRateLimitPermission = jest.fn(() => Promise.resolve());
jest.spyOn(rateLimiter, 'waitForRateLimitPermission').mockImplementation(mockWaitForRateLimitPermission);

const LAVA_RPC_ENDPOINT = 'https://eth1.lava.build';

describe('RPC Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBlockNumber', () => {
    it('should fetch block number successfully', async () => {
      const mockRpcResponse: JsonRpcResponse<string> = {
        jsonrpc: '2.0',
        id: 1,
        result: '0x123abc',
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockRpcResponse, status: 200 } as AxiosResponse);

      const result = await getBlockNumber();

      expect(mockWaitForRateLimitPermission).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        LAVA_RPC_ENDPOINT,
        expect.objectContaining({
          method: 'eth_blockNumber',
          params: [],
        }),
        expect.anything()
      );
      expect(result.isSuccess).toBe(true);
      expect(result.result).toBe('0x123abc');
      expect(result.method).toBe('eth_blockNumber');
      expect(result.error).toBeUndefined();
      expect(result.statusCode).toBe(200);
    });

    it('should handle JSON-RPC error for getBlockNumber', async () => {
      const mockError: JsonRpcErrorObject = { code: -32000, message: 'Test RPC error' };
      const mockRpcErrorResponse = {
        jsonrpc: '2.0',
        id: 1,
        error: mockError,
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockRpcErrorResponse, status: 200 } as AxiosResponse);

      const result = await getBlockNumber();

      expect(result.isSuccess).toBe(false);
      expect(result.error).toEqual(mockError);
      expect(result.result).toBeUndefined();
      expect(result.statusCode).toBe(200);
    });

    it('should handle network error (axios error) for getBlockNumber', async () => {
      const networkError = new Error('Network Failure') as AxiosError;
      networkError.isAxiosError = true;
      networkError.response = undefined;
      mockedAxios.post.mockRejectedValueOnce(networkError);

      const result = await getBlockNumber();

      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Network Failure');
      expect(result.statusCode).toBeUndefined();
    });

    it('should handle axios error with response for getBlockNumber', async () => {
        const errorDetail: JsonRpcErrorObject = { code: -32000, message: 'Server Error' };
        const errorMessage = 'Request failed with status code 500';
        const axiosError = new Error(errorMessage) as AxiosError;
        axiosError.isAxiosError = true;
        axiosError.response = {
            data: { error: errorDetail },
            status: 500,
            statusText: 'Internal Server Error',
            headers: {},
            config: {} as any,
        };
        mockedAxios.post.mockRejectedValueOnce(axiosError);

        const result = await getBlockNumber();
        console.log('result ->', result);
        expect(result.isSuccess).toBe(false);
        expect(result.error?.message).toEqual(errorMessage);
        expect(result.isSuccess).toBe(false);
    });

    it('should handle timeout error from axios for getBlockNumber', async () => {
        const timeoutError = new Error('timeout of 10000ms exceeded') as AxiosError;
        timeoutError.code = 'ECONNABORTED';
        timeoutError.isAxiosError = true;
        mockedAxios.post.mockRejectedValueOnce(timeoutError);

        const result = await getBlockNumber();
        expect(result.isSuccess).toBe(false);
        expect(result.error?.message).toContain('timeout of 10000ms exceeded');
        expect(result.statusCode).toBeUndefined();
    });

    it('should handle invalid JSON-RPC response structure', async () => {
        const invalidResponse = { jsonrpc: '2.0', id: 1, some_other_field: 'unexpected' };
        mockedAxios.post.mockResolvedValueOnce({ data: invalidResponse, status: 200 } as AxiosResponse);
        const result = await getBlockNumber();

        expect(result.isSuccess).toBe(false);
        expect(result.error?.message).toBe('Invalid JSON-RPC response structure');
        expect(result.statusCode).toBe(200);
    });
  });

  describe('getChainId', () => {
    it('should fetch chain ID successfully', async () => {
      const mockRpcResponse: JsonRpcResponse<string> = {
        jsonrpc: '2.0',
        id: 2,
        result: '0x1',
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockRpcResponse, status: 200 } as AxiosResponse);

      const result = await getChainId();

      expect(mockWaitForRateLimitPermission).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        LAVA_RPC_ENDPOINT,
        expect.objectContaining({
          method: 'eth_chainId',
          params: [],
        }),
        expect.anything()
      );
      expect(result.isSuccess).toBe(true);
      expect(result.result).toBe('0x1');
      expect(result.method).toBe('eth_chainId');
      expect(result.statusCode).toBe(200);
    });

    it('should handle JSON-RPC error for getChainId', async () => {
        const mockError: JsonRpcErrorObject = { code: -32001, message: 'Chain ID error' };
        const mockRpcErrorResponse = {
          jsonrpc: '2.0',
          id: 1,
          error: mockError,
        };
        mockedAxios.post.mockResolvedValueOnce({ data: mockRpcErrorResponse, status: 200 } as AxiosResponse);
  
        const result = await getChainId();
  
        expect(result.isSuccess).toBe(false);
        expect(result.error).toEqual(mockError);
        expect(result.statusCode).toBe(200);
      });
  });

  it('should increment request ID for subsequent calls', async () => {
    mockedAxios.post.mockResolvedValue({ data: { jsonrpc: '2.0', id: 0, result: '0x0' }, status: 200 });

    await getBlockNumber();
    const firstCallArgs = mockedAxios.post.mock.calls[0][1] as { id: number };
    const firstId = firstCallArgs.id;

    await getChainId();
    const secondCallArgs = mockedAxios.post.mock.calls[1][1] as { id: number };
    const secondId = secondCallArgs.id;

    expect(secondId).toBe(firstId + 1);

    await getBlockNumber();
    const thirdCallArgs = mockedAxios.post.mock.calls[2][1] as { id: number };
    const thirdId = thirdCallArgs.id;
    expect(thirdId).toBe(secondId + 1);
  });

}); 