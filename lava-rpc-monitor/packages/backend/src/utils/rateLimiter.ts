const MAX_REQUESTS = 300;
const WINDOW_MS = 10 * 1000; // 10 seconds

const requestTimestamps: number[] = [];

/**
 * Checks if a new request is allowed based on the rate limit.
 * If allowed, it records the current request timestamp.
 * @returns True if the request is allowed, false otherwise.
 */
function isRequestAllowed(): boolean {
  const now = Date.now();

  // Remove timestamps older than the current window
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - WINDOW_MS) {
    requestTimestamps.shift();
  }

  // Check if the number of requests in the current window exceeds the limit
  if (requestTimestamps.length < MAX_REQUESTS) {
    requestTimestamps.push(now);
    return true;
  }

  return false;
}

/**
 * Awaits until a request is allowed by the rate limiter.
 * This function will pause execution if the rate limit has been reached,
 * and resume once a slot is available.
 * It also includes a maximum wait time to prevent indefinite blocking.
 */
export async function waitForRateLimitPermission(maxWaitTimeMs: number = WINDOW_MS * 2): Promise<void> {
  const startTime = Date.now();
  while (!isRequestAllowed()) {
    if (Date.now() - startTime > maxWaitTimeMs) {
      throw new Error(
        `Rate limiter timed out after ${maxWaitTimeMs / 1000}s. Max ${MAX_REQUESTS} requests per ${WINDOW_MS / 1000}s.`
      );
    }
    // Calculate remaining time in the current oldest window slot + a small buffer
    let delay = 100; // Default small delay
    if (requestTimestamps.length >= MAX_REQUESTS) {
      const timeUntilNextSlot = (requestTimestamps[0] + WINDOW_MS) - Date.now() + 50; // 50ms buffer
      delay = Math.max(100, timeUntilNextSlot); // Ensure at least 100ms delay
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Gets the approximate number of requests made in the current window.
 * Useful for monitoring, not for enforcement.
 */
export function getCurrentRequestCount(): number {
  const now = Date.now();
  // Filter timestamps to the current window without modifying the main array
  return requestTimestamps.filter(ts => ts > now - WINDOW_MS).length;
}

/**
 * Resets the rate limiter state. Primarily for testing purposes.
 */
export function resetRateLimiterState(): void {
  requestTimestamps.length = 0;
}

// Example usage (can be removed or kept for local testing):
/*
async function testRateLimiter() {
  console.log(`Rate limiter: Max ${MAX_REQUESTS} requests per ${WINDOW_MS / 1000} seconds.`);

  for (let i = 1; i <= 305; i++) {
    try {
      console.time(`Request ${i} wait`);
      await waitForRateLimitPermission(5000); // Max 5s wait for this test
      console.timeEnd(`Request ${i} wait`);
      console.log(`Request ${i} allowed. Current count: ${getCurrentRequestCount()}`);
      // Simulate some work
      if (i % 50 === 0 && i < MAX_REQUESTS) {
         await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate a pause in requests
         console.log("Simulating a 2s pause in requests...")
      }
    } catch (error) {
      console.error(`Request ${i} failed:`, error.message);
      break; // Stop test if timeout occurs
    }
  }
  resetRateLimiterState();
  console.log("Rate limiter test finished and state reset.");
}

testRateLimiter();
*/ 