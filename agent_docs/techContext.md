# Tech Context: Lava RPC Monitor Backend

## Technologies Used

*   **Programming Language**: TypeScript (version ^5.0.0)
*   **Runtime Environment**: Node.js (version ^20.0.0 implied by `@types/node`)
*   **Package Manager**: npm (implied by `package.json` and monorepo structure if applicable to the whole project)
*   **HTTP Client**: `axios` (version ^1.6.0)
*   **WebSocket Library**: `ws` (version ^8.18.2)
*   **Testing Framework**: Jest (version ^29.7.0)
    *   `ts-jest` (version ^29.1.2) for TypeScript support in Jest.
*   **TypeScript Compiler**: `tsc` (via `typescript` package)

## Development Setup

1.  **Prerequisites**: Node.js and npm installed.
2.  **Installation**: Dependencies are installed via `npm install` (likely from the monorepo root, then linking packages).
3.  **Compilation**: TypeScript code in `src/` is compiled to JavaScript in `dist/` using the `npm run build` command (`tsc -p tsconfig.json`).
4.  **Running the Service**: The compiled service is started using `npm run start` (`node dist/index.js`).
5.  **Running Tests**: Tests are executed using `npm run test` (`NODE_OPTIONS=--max-old-space-size=4096 jest`).

## Technical Constraints

*   **Target RPC Endpoint**: The service is specifically designed to monitor `https://eth1.lava.build`.
*   **Real-time Updates**: Requires WebSocket communication for delivering metrics promptly to clients.
*   **Rate Limiting**: Must adhere to self-imposed or external rate limits when querying the RPC endpoint to prevent being blocked or overloading the service.
*   **Node.js Environment**: The backend is constrained to the Node.js runtime and its capabilities.
*   The `README.md` mentions a placeholder for "Express.js (or similar for basic routing if needed)". If HTTP routes beyond WebSockets are required, this would be a consideration.

# Tech Context

## Technologies Used

*   **Programming Languages:**
    *   TypeScript (for both backend and frontend)
    *   JavaScript (as the compilation target for TypeScript)
*   **Backend:**
    *   Node.js (runtime environment)
    *   `axios` (or `node-fetch`) for making HTTP/JSON-RPC requests to the Lava RPC endpoint.
    *   `ws` (or `socket.io`) for WebSocket server implementation.
    *   Jest (for unit testing).
*   **Frontend:**
    *   React (JavaScript library for building user interfaces)
    *   Native Browser WebSocket API (or `socket.io-client`) for WebSocket client implementation.
    *   Jest and React Testing Library (for unit and component testing).
*   **Monorepo Management:**
    *   NPM Workspaces
*   **Containerization & Orchestration:**
    *   Docker
    *   Docker Compose
*   **Development Tools:**
    *   ESLint (linter)
    *   Prettier (code formatter) - *Assumed, good practice*
    *   Git (version control) - *Assumed*

## Development Setup

1.  **Prerequisites:**
    *   Node.js (LTS version recommended)
    *   NPM (usually comes with Node.js)
    *   Docker Desktop (or Docker engine and CLI for Linux)
2.  **Clone Repository:** Obtain the project source code.
3.  **Install Dependencies:**
    *   Navigate to the root directory of the monorepo (`lava-rpc-monitor/`).
    *   Run `npm install`. This will install dependencies for the root project and all workspaces (`packages/backend`, `packages/frontend`) due to NPM workspace configuration.
4.  **Running for Development:**
    *   **Backend:** Can be run directly using `npm run start --workspace=@lava-rpc-monitor/backend` (assuming a `start` script is defined in `packages/backend/package.json` that runs the compiled TypeScript, e.g., `node dist/index.js` or uses `ts-node` for development).
    *   **Frontend:** Can be started using `npm run start --workspace=@lava-rpc-monitor/frontend` (assuming `create-react-app` or Vite setup which provides a development server).
    *   **Using Docker Compose (Recommended for integrated testing):**
        *   From the root directory: `docker-compose up --build`.
        *   This will build and run both backend and frontend containers.
        *   Backend WebSocket server typically on `ws://localhost:8080`.
        *   Frontend UI typically on `http://localhost:3000`.
5.  **Running Tests:**
    *   **Backend Tests:** `npm test --workspace=@lava-rpc-monitor/backend`
    *   **Frontend Tests:** `npm test --workspace=@lava-rpc-monitor/frontend`
    *   To run all tests: Potentially a root-level script `npm test` that orchestrates tests in all workspaces.

## Technical Constraints

*   **Lava RPC Endpoint:** `https://eth1.lava.build` is the fixed target for monitoring.
*   **Rate Limit:** Must adhere to a maximum of 300 requests per 10-second window when communicating with the Lava RPC endpoint.
*   **Real-time Updates:** The frontend must display metrics that update in real-time via WebSockets.
*   **Browser Compatibility:** Frontend should be compatible with modern web browsers (specific versions not defined but generally latest Chrome, Firefox, Safari, Edge).
*   **Stateless Services (Primarily):** The backend services are largely stateless, recalculating metrics or passing them through. No persistent database is planned for V1.

**Development Setup Overview:**
1.  Install Node.js (which includes npm).
2.  Install Docker Desktop.
3.  Clone the monorepo.
4.  Run `npm install` at the root to install dependencies for all workspaces.
5.  Use `docker-compose up --build` to start the services (backend, frontend).

**Technical Constraints & External Dependencies:**
-   **Lava Network RPC Endpoint:** `https://eth1.lava.build` (must use JSON-RPC protocol).
-   **Rate Limit:** Strict adherence to 300 requests per 10 seconds for the Lava RPC endpoint.
-   Internet connectivity required for fetching data from the RPC and for package installations. 