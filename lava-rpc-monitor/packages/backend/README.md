# Backend Service - Lava RPC Monitor

This package contains the Node.js backend service for the Lava Network RPC Monitoring Tool.

## Responsibilities

-   Polling the Lava RPC endpoint (`https://eth1.lava.build`).
-   Calculating metrics (success rate, response time, error counts).
-   Serving these metrics to connected clients via a WebSocket server.
-   Implementing rate limiting for RPC requests.

## Tech Stack

-   Node.js
-   TypeScript
-   Express.js (or similar for basic routing if needed)
-   `ws` library (for WebSockets)
-   `axios` (or `node-fetch` for HTTP requests)
-   Jest (for testing)

## Getting Started

(Detailed setup and running instructions to be added)

```bash
# From the root directory (lava-rpc-monitor)
npm install
# To run this specific package (example, adjust based on final scripts)
npm run start -w @lava-rpc-monitor/backend
```

## Running Tests

(Detailed testing instructions to be added)

```bash
# From the root directory (lava-rpc-monitor)
npm run test -w @lava-rpc-monitor/backend
``` 