# Backend To-Do List: `eth_syncing` Integration

This list outlines the tasks for integrating the `eth_syncing` RPC method into the backend.

## 1. `packages/backend/src/types.ts`
- [x] Add `EthSyncingParams` type (`[]`).
- [x] Add `EthSyncingResultObject` interface (`{ startingBlock, currentBlock, highestBlock }`).
- [x] Add `EthSyncingResult` union type (`EthSyncingResultObject | false`).
- [x] Make `RpcCallRecord` generic (`RpcCallRecord<TResult = any>`).
- [x] Update `RpcMetrics` interface to include `syncingStatus: EthSyncingResult | null;`.
- [x] Ensure `WebSocketBroadcastData` implicitly includes `syncingStatus` by extending `RpcMetrics`.

## 2. `packages/backend/src/services/rpcService.ts`
- [x] Add `getSyncingStatus(): Promise<RpcCallRecord<EthSyncingResult>>` function.
- [x] Update imports to include `EthSyncingParams`, `EthSyncingResult`.
- [x] Modify `sendJsonRpcRequest` to support generic result types.
- [ ] Update `testRpcService` to include a call to `getSyncingStatus()`.

## 3. `packages/backend/src/services/metricsService.ts`
- [x] **Modify `collectMetrics` function:**
    - [x] Call `getSyncingStatus()` from `rpcService`.
    - [x] Integrate `syncingStatusRecord.result` into the `currentMetrics.syncingStatus` field.
    - [x] Add the `syncingStatusRecord` to the `currentMetrics.callRecords` array.
- [x] **Update `activeMetrics` initialization:**
    - [x] Ensure `syncingStatus` field is initialized to `null` in `activeMetrics`.

## 4. `packages/backend/src/services/websocketService.ts`
- [ ] **Review and Verify:**
    - [ ] Confirm that the broadcasted data via WebSockets correctly includes the `syncingStatus` field from the updated `WebSocketBroadcastData` type.
    - [ ] No structural changes are expected if `RpcMetrics` (or `WebSocketBroadcastData`) is already being broadcast.

## 5. Testing
- [ ] Add unit tests for `getSyncingStatus` in `rpcService.ts`.
- [ ] Add/update unit tests for `metricsService.ts` to cover the new `syncingStatus` metric collection.
- [ ] Perform integration testing to ensure the `eth_syncing` data flows correctly from RPC call to WebSocket broadcast. 