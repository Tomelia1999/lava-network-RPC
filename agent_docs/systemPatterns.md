# System Patterns: Lava RPC Monitor Backend

## How the System is Built

The backend system for the Lava RPC Monitor is built as a Node.js application using TypeScript. It follows a service-oriented pattern, with distinct modules for different responsibilities:

*   **`rpcService.ts`**: Handles communication with the external Lava RPC endpoint, including request dispatch and a rate-limiting mechanism.
*   **`metricsService.ts`**: Responsible for processing data from `rpcService` and calculating key performance metrics (e.g., success rate, response time).
*   **`websocketService.ts`**: Manages WebSocket connections and broadcasts the calculated metrics to connected clients.
*   **`index.ts`**: Acts as the main entry point, likely initializing and coordinating these services.
*   **`types.ts`**: Centralizes TypeScript type definitions for the application, promoting consistency and type safety.

Compilation from TypeScript to JavaScript (`dist` directory) is handled by `tsc`.

## Key Technical Decisions

1.  **TypeScript**: Chosen for its static typing benefits, leading to more robust and maintainable code, especially as the project scales.
2.  **Node.js**: Selected as the runtime environment, suitable for I/O-bound operations like network requests and WebSocket communication.
3.  **Service-Oriented Architecture**: The backend logic is modularized into services, which promotes separation of concerns and testability.
4.  **WebSockets (`ws` library)**: Used for real-time, bidirectional communication of metrics to clients, providing immediate updates.
5.  **`axios`**: Employed for making HTTP requests to the Lava RPC endpoint, a popular and promise-based HTTP client.
6.  **Jest**: The chosen framework for unit testing, integrated with `ts-jest` for TypeScript support.

## Architecture Patterns

*   **Polling**: The `rpcService` likely uses a polling pattern to periodically query the Lava RPC endpoint for new data or status updates.
*   **Observer Pattern (Implied)**: `websocketService` effectively acts as a subject in an observer pattern, where connected clients are observers receiving updates from `metricsService` (which in turn observes `rpcService` data).
*   **Rate Limiting**: A specific pattern/algorithm is implemented (and tested in `rateLimiter.test.ts`) to control the flow of outgoing requests to the RPC endpoint. 