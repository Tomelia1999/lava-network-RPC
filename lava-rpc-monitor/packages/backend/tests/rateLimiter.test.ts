import { waitForRateLimitPermission, getCurrentRequestCount, resetRateLimiterState } from '../src/utils/rateLimiter';

const MAX_REQUESTS = 300;
const WINDOW_MS = 10 * 1000;

describe('RateLimiter', () => {
  beforeEach(() => {
    resetRateLimiterState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    resetRateLimiterState();
  });

  it('should allow requests up to the limit', async () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await expect(waitForRateLimitPermission(100)).resolves.not.toThrow();
      expect(getCurrentRequestCount()).toBe(i + 1);
    }
  });

  it('should block requests exceeding the limit and then allow after window passes', async () => {
    for (let i = 0; i < MAX_REQUESTS; i++) {
      await waitForRateLimitPermission(100);
    }
    expect(getCurrentRequestCount()).toBe(MAX_REQUESTS);

    const permissionPromise = waitForRateLimitPermission(WINDOW_MS * 2);

    jest.advanceTimersByTime(WINDOW_MS / 2);
    jest.advanceTimersByTime(WINDOW_MS / 2 + 100);

    await expect(permissionPromise).resolves.not.toThrow();
    expect(getCurrentRequestCount()).toBe(1);
  });

  it('should correctly report current request count as time advances', async () => {
    await waitForRateLimitPermission(100);
    jest.advanceTimersByTime(WINDOW_MS / 4);
    await waitForRateLimitPermission(100);
    expect(getCurrentRequestCount()).toBe(2);

    jest.advanceTimersByTime(WINDOW_MS / 4);
    expect(getCurrentRequestCount()).toBe(2);

    jest.advanceTimersByTime(WINDOW_MS / 2 + 10);
    expect(getCurrentRequestCount()).toBe(1);

    jest.advanceTimersByTime(WINDOW_MS / 4);
    expect(getCurrentRequestCount()).toBe(0);
  });

  it('resetRateLimiterState should clear all recorded requests', async () => {
    await waitForRateLimitPermission(100);
    await waitForRateLimitPermission(100);
    expect(getCurrentRequestCount()).toBe(2);
    resetRateLimiterState();
    expect(getCurrentRequestCount()).toBe(0);
    await expect(waitForRateLimitPermission(100)).resolves.not.toThrow();
    expect(getCurrentRequestCount()).toBe(1);
  });

  it('should handle multiple concurrent requests correctly', async () => {
    const promises: Promise<void>[] = [];
    const numConcurrentRequests = MAX_REQUESTS + 5;

    for (let i = 0; i < numConcurrentRequests; i++) {
      promises.push(waitForRateLimitPermission(WINDOW_MS * 2));
    }

    jest.advanceTimersByTime(100);
    jest.advanceTimersByTime(WINDOW_MS + 100);
    
    jest.advanceTimersByTime(WINDOW_MS + 100);


    await expect(Promise.all(promises)).resolves.not.toThrow();
    resetRateLimiterState();
    jest.setSystemTime(0);

    const concurrentPromises: Promise<number>[] = [];
    for (let i = 0; i < MAX_REQUESTS + 5; i++) {
      concurrentPromises.push(
        (async () => {
          await waitForRateLimitPermission(WINDOW_MS * 3);
          return getCurrentRequestCount();
        })()
      );
    }

    for (let i = 0; i < MAX_REQUESTS + 5; i++) {
        jest.advanceTimersByTime(WINDOW_MS / MAX_REQUESTS + 1);
        await Promise.resolve();
    }
    jest.advanceTimersByTime(WINDOW_MS * 2);


    const results = await Promise.all(concurrentPromises);

    expect(getCurrentRequestCount()).toBeLessThanOrEqual(5);
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

    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(nextRequestResolved).toBe(false);
    expect(getCurrentRequestCount()).toBe(MAX_REQUESTS);

    jest.advanceTimersByTime(WINDOW_MS - 1000 + 50);
    await nextRequestPromise;
    expect(nextRequestResolved).toBe(true);
    expect(getCurrentRequestCount()).toBeGreaterThanOrEqual(1); 
    expect(getCurrentRequestCount()).toBeLessThanOrEqual(MAX_REQUESTS);
  });

});
