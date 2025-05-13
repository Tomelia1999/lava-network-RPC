# System Patterns: Lava RPC Monitor Backend

## System Patterns

### How the System is Built

The system is a monitoring tool comprised of:
-   **Backend**: A Node.js application responsible for sending JSON-RPC requests to the Lava Network RPC endpoint (`https://eth1.lava.build`). It likely uses libraries like `axios` or `node-fetch` for these HTTP requests.
-   **Frontend**: A web application built with a JavaScript framework (e.g., React, Vue) that displays the monitored data in real-time.
-   **Containerization**: The entire application (backend and frontend) is containerized using Docker and orchestrated with Docker Compose for ease of deployment and scalability.

### Key Technical Decisions

-   **RPC Communication**: Uses JSON-RPC to interact with the blockchain endpoint.
-   **Rate Limiting**: A mechanism is implemented to ensure that requests to the public RPC endpoint do not exceed 300 requests per 10 seconds.
-   **Technology Stack**: Node.js for the backend, a modern JavaScript framework for the frontend, and Docker for containerization.

### Architecture Patterns

-   **Client-Server Architecture**: The frontend acts as a client, consuming data provided by the backend server.
-   **Real-time Data Display**: The frontend is expected to update an_user interface in real-time with metrics from the backend.
-   **Microservices (Potentially)**: While not explicitly stated, the separation of backend and frontend, containerized by Docker Compose, hints at a microservice-like structure, where each part can be developed, deployed, and scaled independently.

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