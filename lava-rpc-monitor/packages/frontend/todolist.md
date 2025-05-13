# Frontend To-Do List: `eth_syncing` Integration

This list outlines the tasks for integrating and displaying the `eth_syncing` RPC method data on the frontend.

## 1. Frontend Type Definitions (e.g., `packages/frontend/src/types/apiTypes.ts`)
- [ ] **Define/Update `WebSocketBroadcastData` (or a similar interface):**
    - [ ] Ensure it mirrors `packages/backend/src/types.ts:WebSocketBroadcastData`.
    - [ ] Include `syncingStatus: EthSyncingResultObject | false | null;`.
    - [ ] Include `lastBlockNumber: string | null;` (foundational).
    - [ ] Include `lastChainId: string | null;` (foundational).
- [ ] **Define `EthSyncingResultObject` interface:**
    - [ ] Create `interface EthSyncingResultObject { startingBlock: string; currentBlock: string; highestBlock: string; }`.
    - [ ] (Consider creating a shared types package between backend and frontend in the future to avoid duplication).

## 2. UI Components (e.g., in `packages/frontend/src/App.tsx` or dedicated components)
- [ ] **Display `syncingStatus` Metric:**
    - [ ] Retrieve `syncingStatus` from the WebSocket data stream.
    - [ ] **Conditional Rendering Logic:**
        - [ ] If `syncingStatus` is `false`, display "Status: Synced".
        - [ ] If `syncingStatus` is an object (`EthSyncingResultObject`):
            - [ ] Parse `currentBlock` and `highestBlock` (hex strings) to numbers (e.g., `parseInt(hex, 16)`).
            - [ ] Display "Status: Syncing (Block: {parsedCurrentBlock} / {parsedHighestBlock})".
            - [ ] Consider displaying `startingBlock` as well if useful.
        - [ ] If `syncingStatus` is `null` (or initially before data arrives), display "Syncing Status: N/A" or a loading indicator.
- [ ] **Review Existing Displays:**
    - [ ] Ensure `lastBlockNumber` and `lastChainId` are still correctly parsed (hex to decimal) and displayed.

## 3. WebSocket Client Service (e.g., `packages/frontend/src/services/websocketClient.ts`)
- [ ] **Data Deserialization & Typing:**
    - [ ] Ensure the WebSocket client correctly deserializes the incoming `WebSocketBroadcastData` payload.
    - [ ] Apply the updated frontend type definitions (from step 1) for proper type checking and IntelliSense when handling the received data.

## 4. Styling and UX
- [ ] Ensure the new `syncingStatus` display is visually consistent with other metrics.
- [ ] Consider how to best present the syncing progress (e.g., a progress bar if `startingBlock`, `currentBlock`, and `highestBlock` are all available and indicate active syncing).

## 5. Testing
- [ ] Add unit tests for any new parsing or display logic functions.
- [ ] Perform UI testing to verify the correct display of all syncing states (`false`, object, `null`).
- [ ] Test with live data (if possible) or mock WebSocket messages representing different `eth_syncing` responses. 