# Frontend Application - Lava RPC Monitor

This package contains the React/TypeScript frontend application for the Lava Network RPC Monitoring Tool.

## Responsibilities

-   Connecting to the backend WebSocket server.
-   Receiving real-time metrics data.
-   Displaying metrics such as block number, chain ID, success rate, average response time, and error logs.
-   Providing a visual status indicator for RPC health.

## Tech Stack

-   React
-   TypeScript
-   WebSocket API (native or `socket.io-client`)
-   Jest & React Testing Library (for testing)
-   (Styling solution: CSS Modules, Styled Components, or Tailwind CSS - TBD)

## Getting Started

(Detailed setup and running instructions to be added. This will likely involve running a development server.)

```bash
# From the root directory (lava-rpc-monitor)
npm install
# To run this specific package (example, adjust based on final scripts)
npm run start -w @lava-rpc-monitor/frontend
```

## Running Tests

(Detailed testing instructions to be added)

```bash
# From the root directory (lava-rpc-monitor)
npm run test -w @lava-rpc-monitor/frontend
```
