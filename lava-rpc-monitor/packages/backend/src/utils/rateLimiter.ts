const MAX_REQUESTS = 300;
const TEN_SECOND_WINDOW_MS = 10 * 1000;

const requestTimestamps: number[] = [];

function isRequestAllowed(): boolean {
  const now = Date.now();

  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - TEN_SECOND_WINDOW_MS) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length < MAX_REQUESTS) {
    requestTimestamps.push(now);
    return true;
  }

  return false;
}

export async function waitForRateLimitPermission(maxWaitTimeMs: number = TEN_SECOND_WINDOW_MS * 2): Promise<void> {
  const startTime = Date.now();
  while (!isRequestAllowed()) {
    if (Date.now() - startTime > maxWaitTimeMs) {
      throw new Error(
        `Rate limiter timed out after ${maxWaitTimeMs / 1000}s. Max ${MAX_REQUESTS} requests per ${TEN_SECOND_WINDOW_MS / 1000}s.`
      );
    }
    let delay = 100;
    if (requestTimestamps.length >= MAX_REQUESTS) {
      const timeUntilNextSlot = (requestTimestamps[0] + TEN_SECOND_WINDOW_MS) - Date.now() + 50;
      delay = Math.max(100, timeUntilNextSlot);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

export function getCurrentRequestCount(): number {
  const now = Date.now();
  return requestTimestamps.filter(ts => ts > now - TEN_SECOND_WINDOW_MS).length;
}

export function resetRateLimiterState(): void {
  requestTimestamps.length = 0;
}

// Example usage (can be removed or kept for local testing):
//npx ts-node --project ./tsconfig.json src/utils/rateLimiter.ts | cat
/*
async function testRateLimiter() {
  console.log(`Rate limiter: Max ${MAX_REQUESTS} requests per ${TEN_SECOND_WINDOW_MS / 1000} seconds.`);

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
    } catch (error: any) {
      if (error instanceof Error) {
        console.error(`Request ${i} failed:`, error.message);
      } else {
        console.error(`Request ${i} failed:`, String(error));
      }
      break; // Stop test if timeout occurs
    }
  }
  resetRateLimiterState();
  console.log("Rate limiter test finished and state reset.");
}

testRateLimiter(); 
*/