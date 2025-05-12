# Unit Testing Guidelines for Lava RPC Monitor Backend

## Overview

This document outlines the unit testing strategy for the Lava RPC Monitor backend service. The testing approach focuses on ensuring reliability, performance, and correctness of the core functionalities while maintaining high test coverage.

## Testing Requirements

### 1. RPC Service Tests (`rpcService.test.ts`)

#### Basic RPC Methods
- [ ] Test successful `eth_blockNumber` calls
  - Verify correct block number retrieval
  - Validate response format
  - Check error handling for invalid responses

- [ ] Test successful `eth_chainId` calls
  - Verify correct chain ID retrieval
  - Validate response format
  - Check error handling for invalid responses

#### Error Handling
- [ ] Test network error scenarios
  - Connection timeouts
  - Network unreachable
  - DNS resolution failures

- [ ] Test invalid response handling
  - Malformed JSON responses
  - Missing required fields
  - Invalid data types

#### Response Time Tracking
- [ ] Test response time measurement
  - Verify accurate timing of requests
  - Check timing precision
  - Validate timing data structure

### 2. Rate Limiter Tests (`rateLimiter.test.ts`)

#### Rate Limit Enforcement
- [ ] Test request limit compliance
  - Verify exactly 300 requests allowed in 10-second window
  - Test request blocking when limit exceeded
  - Validate window reset after 10 seconds

#### Concurrent Request Handling
- [ ] Test concurrent request scenarios
  - Multiple simultaneous requests
  - Request queue management
  - Rate limit accuracy under load

#### Edge Cases
- [ ] Test boundary conditions
  - Requests at window boundaries
  - Requests during window transitions
  - System clock adjustments

### 3. Metrics Service Tests (`metricsService.test.ts`)

#### Success Rate Calculation
- [ ] Test success rate metrics
  - Calculate correct success percentage
  - Handle edge cases (0 requests, all failures)
  - Validate calculation precision

#### Response Time Metrics
- [ ] Test response time calculations
  - Average response time
  - Response time distribution
  - Percentile calculations
  - Outlier detection

#### Error Tracking
- [ ] Test error categorization
  - Network errors
  - RPC errors
  - Timeout errors
  - Invalid response errors

#### Data Aggregation
- [ ] Test metric aggregation
  - Time-based aggregation
  - Rolling averages
  - Historical data management

### 4. WebSocket Service Tests (`websocketService.test.ts`)

#### Connection Management
- [ ] Test client connections
  - New connection handling
  - Connection termination
  - Connection limits
  - Reconnection handling

#### Data Broadcasting
- [ ] Test metric broadcasting
  - Real-time updates
  - Data format validation
  - Broadcast to multiple clients
  - Message queue management

#### Error Handling
- [ ] Test WebSocket errors
  - Connection failures
  - Message parsing errors
  - Client disconnections
  - Server-side errors

### 5. Integration Tests

#### End-to-End Flow
- [ ] Test complete monitoring flow
  - RPC requests → Metrics calculation → WebSocket broadcast
  - Rate limit compliance throughout flow
  - Error propagation and handling

#### Load Testing
- [ ] Test system under load
  - High request volumes
  - Multiple client connections
  - Extended operation periods
  - Resource usage monitoring

## Testing Best Practices

### 1. Test Structure
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Group related tests using `describe` blocks
- Use appropriate test isolation

### 2. Mocking Strategy
- Mock external dependencies (RPC endpoint, WebSocket clients)
- Use Jest's timer mocks for time-dependent tests
- Implement realistic mock responses
- Reset mocks between tests

### 3. Test Coverage
- Aim for >80% code coverage
- Focus on critical business logic
- Include edge cases and error scenarios
- Test both success and failure paths

### 4. Performance Considerations
- Keep tests fast and efficient
- Use appropriate timeouts
- Avoid unnecessary async operations
- Clean up resources after tests

### 5. Error Testing
- Test all error scenarios
- Verify error messages and types
- Check error recovery mechanisms
- Validate error logging

## Implementation Guidelines

### 1. Test File Organization
```typescript
// Example structure for service tests
import { Service } from '../src/services/service';

describe('Service', () => {
  let service: Service;
  
  beforeEach(() => {
    // Setup
  });
  
  afterEach(() => {
    // Cleanup
  });
  
  describe('Feature', () => {
    it('should behave in expected way', () => {
      // Test implementation
    });
  });
});
```

### 2. Mocking Examples
```typescript
// Example RPC endpoint mock
jest.mock('axios', () => ({
  post: jest.fn()
}));

// Example WebSocket mock
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn()
};
```

### 3. Async Testing
```typescript
// Example async test
it('should handle async operation', async () => {
  const result = await service.asyncOperation();
  expect(result).toBeDefined();
});
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- rpcService.test.ts

# Run tests in watch mode
npm test -- --watch
```

## Continuous Integration

- Run tests on every pull request
- Enforce minimum coverage thresholds
- Block merges on test failures
- Generate coverage reports

## Maintenance

- Review and update tests with new features
- Remove obsolete tests
- Refactor tests for better maintainability
- Keep test documentation up to date 