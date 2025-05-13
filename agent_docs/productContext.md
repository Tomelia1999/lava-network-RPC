# Product Context: Lava RPC Monitor Backend

## Product Context

### Why This Project Exists

This project serves as a home assignment for a Blockchain Engineer challenge. Its primary purpose is to assess the candidate's ability to build a functional monitoring tool according to specified requirements.

### What Problems It Solves

The tool addresses the need to monitor the health and performance of a public RPC endpoint, specifically the Lava Network RPC endpoint (`https://eth1.lava.build`). It aims to provide real-time insights into:
- RPC node health
- Request success rates
- API response times
- Occurrence of errors

### How It Should Work

The tool should:
1.  Send JSON-RPC requests to `https://eth1.lava.build`.
2.  Monitor and track metrics: success rate, response time, and errors.
3.  Display these metrics in real-time on a user interface.
4.  Adhere to a rate limit of 300 requests per 10 seconds by implementing appropriate throttling.
5.  Be containerized using Docker (and Docker Compose) for easy deployment and scalability.

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