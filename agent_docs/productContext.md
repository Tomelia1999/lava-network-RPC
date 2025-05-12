# Product Context: Lava RPC Monitor Backend

## Why This Project Exists

This project, the backend service for the Lava RPC Monitor, exists to provide real-time monitoring and metrics for the Lava Network RPC endpoint (`https://eth1.lava.build`). It aims to give insights into the health, performance, and reliability of the RPC service.

## What Problems It Solves

1.  **Lack of Visibility**: Provides users and developers with visibility into the operational status of the Lava RPC endpoint.
2.  **Performance Tracking**: Tracks key performance indicators (KPIs) such as success rate, response time, and error occurrences.
3.  **Reliability Assessment**: Helps in assessing the reliability of the RPC service over time by collecting and exposing metrics.
4.  **Proactive Issue Detection**: By monitoring metrics, it can help in the early detection of potential issues with the RPC service.

## How It Should Work

The backend service is designed to:

1.  **Poll RPC Endpoint**: Periodically send requests to `https://eth1.lava.build` to check its status and gather performance data.
2.  **Calculate Metrics**: Process the responses (or lack thereof) from the RPC endpoint to calculate:
    *   Success rate of requests.
    *   Average response time.
    *   Counts of different types of errors.
3.  **Implement Rate Limiting**: Manage the frequency of requests sent to the Lava RPC endpoint to avoid overloading it or getting rate-limited itself.
4.  **Serve Metrics via WebSockets**: Expose the calculated metrics to connected clients (e.g., a frontend dashboard) in real-time using a WebSocket server.
5.  **Maintain Type Safety**: Utilize TypeScript for robust and maintainable code.
6.  **Be Testable**: Core components should be covered by unit or integration tests. 