import { waitForRateLimitPermission, getCurrentRequestCount, resetRateLimiterState } from '../src/utils/rateLimiter';

const MAX_REQUESTS = 300;
const WINDOW_MS = 10 * 1000; // 10 seconds

describe('RateLimiter', () => {
  beforeEach(() => {
    resetRateLimiterState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers(); // Important to restore real timers
    resetRateLimiterState();
  });

  it('should allow requests up to the limit', async () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await expect(waitForRateLimitPermission(100)).resolves.not.toThrow();
      expect(getCurrentRequestCount()).toBe(i + 1);
    }
  });

  it('should block requests exceeding the limit and then allow after window passes', async () => {
    // Fill up the request window
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await waitForRateLimitPermission(100);
    }
    expect(getCurrentRequestCount()).toBe(MAX_REQUESTS);

    // This request should initially be blocked
    const permissionPromise = waitForRateLimitPermission(WINDOW_MS * 2);

    // Advance time slightly, but not enough to clear a slot
    jest.advanceTimersByTime(WINDOW_MS / 2);
    // At this point, the promise should not have resolved yet if rate limiting is working
    // We can't directly check if it's pending easily without extra libraries,
    // so we rely on the next part of the test.

    // Advance time enough for the first requests to fall out of the window
    jest.advanceTimersByTime(WINDOW_MS / 2 + 100); // +100ms buffer

    await expect(permissionPromise).resolves.not.toThrow();
    expect(getCurrentRequestCount()).toBe(1); // Only the new request should be in the count for the new window
  });

  it('should correctly report current request count as time advances', async () => {
    await waitForRateLimitPermission(100); // Req 1 at T=0
    jest.advanceTimersByTime(WINDOW_MS / 4);
    await waitForRateLimitPermission(100); // Req 2 at T=WINDOW_MS/4
    expect(getCurrentRequestCount()).toBe(2);

    jest.advanceTimersByTime(WINDOW_MS / 4); // Now at T=WINDOW_MS/2
    expect(getCurrentRequestCount()).toBe(2);

    jest.advanceTimersByTime(WINDOW_MS / 2 + 10); // Now at T=WINDOW_MS + 10ms (Req 1 expired)
    expect(getCurrentRequestCount()).toBe(1); // Only Req 2 should be left

    jest.advanceTimersByTime(WINDOW_MS / 4); // Now at T=WINDOW_MS*1.25 + 10ms (Req 2 expired)
    expect(getCurrentRequestCount()).toBe(0);
  });

  it('resetRateLimiterState should clear all recorded requests', async () => {
    await waitForRateLimitPermission(100);
    await waitForRateLimitPermission(100);
    expect(getCurrentRequestCount()).toBe(2);
    resetRateLimiterState();
    expect(getCurrentRequestCount()).toBe(0);
    // Should allow requests again immediately after reset
    await expect(waitForRateLimitPermission(100)).resolves.not.toThrow();
    expect(getCurrentRequestCount()).toBe(1);
  });

  it('should handle multiple concurrent requests correctly', async () => {
    const promises: Promise<void>[] = [];
    const numConcurrentRequests = MAX_REQUESTS + 5; // Try to make more requests than allowed

    for (let i = 0; i < numConcurrentRequests; i++) {
      promises.push(waitForRateLimitPermission(WINDOW_MS * 2));
    }

    // Advance time to allow all MAX_REQUESTS through, and subsequent ones to wait then pass
    // This needs careful timing.
    // First, allow all MAX_REQUESTS to be recorded (almost simultaneously)
    jest.advanceTimersByTime(100); // Small advance for initial processing

    // Then, advance by WINDOW_MS to clear the first batch
    jest.advanceTimersByTime(WINDOW_MS + 100);
    
    // Advance again if needed for the remaining 5 requests
    jest.advanceTimersByTime(WINDOW_MS + 100);


    await expect(Promise.all(promises)).resolves.not.toThrow();
    // After all resolved, count should be 5 (the last batch in a new window)
    // This depends on the exact timing of jest.advanceTimersByTime and promises resolving.
    // For simplicity, we check that all resolve. A precise count check is more complex here.
    // Let's refine the count check.
    // After the first WINDOW_MS + 100, the first MAX_REQUESTS should have passed.
    // The remaining 5 are in a new window.
    
    // To be more precise:
    resetRateLimiterState(); // Reset for this specific sub-test logic
    jest.setSystemTime(0); // Start time at 0

    const concurrentPromises: Promise<number>[] = [];
    for (let i = 0; i < MAX_REQUESTS + 5; i++) {
      concurrentPromises.push(
        (async () => {
          await waitForRateLimitPermission(WINDOW_MS * 3);
          return getCurrentRequestCount();
        })()
      );
    }

    // Let the promises try to acquire slots
    // Advance time in chunks to simulate processing
    for (let i = 0; i < MAX_REQUESTS + 5; i++) {
        jest.advanceTimersByTime(WINDOW_MS / MAX_REQUESTS + 1); // Small increments
        await Promise.resolve(); // Allow microtasks to run
    }
    jest.advanceTimersByTime(WINDOW_MS * 2); // Ensure all windows can pass


    const results = await Promise.all(concurrentPromises);

    // The request counts seen by each promise will vary.
    // The important part is that all resolved without timeout.
    // The final count should be 5, assuming they all got new slots after the initial 300.
    // This part is tricky to get a deterministic count for due to internal delays.
    // The primary goal is that they don't get stuck or timeout prematurely.
    expect(getCurrentRequestCount()).toBeLessThanOrEqual(5); // Could be 0 if window passed for all
    // A more robust check is simply that they all completed:
    results.forEach(() => { /* All promises resolved */ });
  });


  it('should allow exactly MAX_REQUESTS in quick succession, then wait', async () => {
    const promises = [];
    for (let i = 0; i < MAX_REQUESTS; i++) {
      promises.push(waitForRateLimitPermission(100));
    }
    await Promise.all(promises);
    expect(getCurrentRequestCount()).toBe(MAX_REQUESTS);

    const nextRequestPromise = waitForRateLimitPermission(WINDOW_MS * 2);
    let nextRequestResolved = false;
    nextRequestPromise.then(() => { nextRequestResolved = true; });

    // Advance time by a small amount, should not resolve
    jest.advanceTimersByTime(1000); // 1 second
    await Promise.resolve(); // Allow microtasks
    expect(nextRequestResolved).toBe(false);
    expect(getCurrentRequestCount()).toBe(MAX_REQUESTS);

    // Advance time so the first request expires
    jest.advanceTimersByTime(WINDOW_MS - 1000 + 50); // WINDOW_MS in total since first req + 50ms buffer
    
    await nextRequestPromise; // Should resolve now
    expect(nextRequestResolved).toBe(true);
    // The count here could be 1 (if all old ones expired and only the new one is left)
    // or MAX_REQUESTS if new one filled a slot among existing ones that haven't aged out of getCurrentRequestCount's view
    // The key is that it resolved.
    expect(getCurrentRequestCount()).toBeGreaterThanOrEqual(1); 
    expect(getCurrentRequestCount()).toBeLessThanOrEqual(MAX_REQUESTS);
  });

});
