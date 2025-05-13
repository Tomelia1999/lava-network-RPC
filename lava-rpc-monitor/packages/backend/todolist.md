# Backend To-Do List: `eth_syncing` Integration

This list outlines the tasks for integrating the `eth_syncing` RPC method into the backend.

## 1. `packages/backend/src/types.ts`
- [ ] Add `EthSyncingParams` type (`[]`).
- [ ] Add `EthSyncingResultObject` interface (`{ startingBlock, currentBlock, highestBlock }`).
- [ ] Add `EthSyncingResult` union type (`EthSyncingResultObject | false`).
- [ ] Make `RpcCallRecord` generic (`RpcCallRecord<TResult = any>`).
- [ ] Update `RpcMetrics` interface to include `syncingStatus: EthSyncingResult | null;`.
- [ ] Ensure `WebSocketBroadcastData` implicitly includes `syncingStatus` by extending `RpcMetrics`.

## 2. `packages/backend/src/services/rpcService.ts`
- [ ] Add `getSyncingStatus(): Promise<RpcCallRecord<EthSyncingResult>>` function.
- [ ] Update imports to include `EthSyncingParams`, `EthSyncingResult`.
- [ ] Modify `sendJsonRpcRequest` to support generic result types.
- [ ] Update `testRpcService` to include a call to `getSyncingStatus()`.

## 3. `packages/backend/src/services/metricsService.ts`
- [ ] **Modify `collectMetrics` function:**
    - [ ] Call `getSyncingStatus()` from `rpcService`.
    - [ ] Integrate `syncingStatusRecord.result` into the `currentMetrics.syncingStatus` field.
    - [ ] Add the `syncingStatusRecord` to the `currentMetrics.callRecords` array.
- [ ] **Update `activeMetrics` initialization:**
    - [ ] Ensure `syncingStatus` field is initialized to `null` in `activeMetrics`.

## 4. `packages/backend/src/services/websocketService.ts`
- [ ] **Review and Verify:**
    - [ ] Confirm that the broadcasted data via WebSockets correctly includes the `syncingStatus` field from the updated `WebSocketBroadcastData` type.
    - [ ] No structural changes are expected if `RpcMetrics` (or `WebSocketBroadcastData`) is already being broadcast.

## 5. Testing
- [ ] Add unit tests for `getSyncingStatus` in `rpcService.ts`.
- [ ] Add/update unit tests for `metricsService.ts` to cover the new `syncingStatus` metric collection.
- [ ] Perform integration testing to ensure the `eth_syncing` data flows correctly from RPC call to WebSocket broadcast. 