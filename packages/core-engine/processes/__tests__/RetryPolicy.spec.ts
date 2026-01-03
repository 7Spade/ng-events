/**
 * Retry Policy Tests
 *
 * Tests retry logic, exponential backoff, circuit breaker, and error classification.
 *
 * Phase 2B: Failure Compensation / State Machine
 */

import { RetryPolicy } from '../RetryPolicy';

describe('RetryPolicy', () => {
  describe('Exponential Backoff', () => {
    it('should calculate delays with exponential backoff', () => {
      const policy = new RetryPolicy({
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitterFactor: 0, // No jitter for predictable testing
      });

      // Attempt 0: 1000ms
      expect(policy.getNextRetryDelay(0)).toBe(1000);

      // Attempt 1: 2000ms (1000 * 2^1)
      expect(policy.getNextRetryDelay(1)).toBe(2000);

      // Attempt 2: 4000ms (1000 * 2^2)
      expect(policy.getNextRetryDelay(2)).toBe(4000);

      // Attempt 3: 8000ms (1000 * 2^3)
      expect(policy.getNextRetryDelay(3)).toBe(8000);

      // Attempt 4: 10000ms (capped at maxDelay)
      expect(policy.getNextRetryDelay(4)).toBe(10000);
    });

    it('should respect maxDelay cap', () => {
      const policy = new RetryPolicy({
        initialDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2,
        jitterFactor: 0,
      });

      // Attempt 3 would be 8000ms, but capped at 5000ms
      const delay = policy.getNextRetryDelay(3);
      expect(delay).toBe(5000);
    });

    it('should apply jitter when configured', () => {
      const policy = new RetryPolicy({
        initialDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitterFactor: 0.2, // 20% jitter
      });

      const delay = policy.getNextRetryDelay(1);
      // Base delay: 2000ms, jitter range: 0-400ms
      expect(delay).toBeGreaterThanOrEqual(2000);
      expect(delay).toBeLessThanOrEqual(2400);
    });
  });

  describe('shouldRetry', () => {
    it('should retry within maxAttempts', () => {
      const policy = new RetryPolicy({ maxAttempts: 3 });
      const error = new Error('Temporary failure');

      expect(policy.shouldRetry(1, error)).toBe(true);
      expect(policy.shouldRetry(2, error)).toBe(true);
    });

    it('should not retry after maxAttempts', () => {
      const policy = new RetryPolicy({ maxAttempts: 3 });
      const error = new Error('Temporary failure');

      expect(policy.shouldRetry(3, error)).toBe(false);
      expect(policy.shouldRetry(4, error)).toBe(false);
    });

    it('should not retry non-retryable errors', () => {
      const policy = new RetryPolicy({ maxAttempts: 3 });

      expect(policy.shouldRetry(1, new Error('validation failed'))).toBe(false);
      expect(policy.shouldRetry(1, new Error('invalid input'))).toBe(false);
      expect(policy.shouldRetry(1, new Error('unauthorized'))).toBe(false);
      expect(policy.shouldRetry(1, new Error('forbidden'))).toBe(false);
      expect(policy.shouldRetry(1, new Error('not found'))).toBe(false);
    });

    it('should not retry when circuit is open', () => {
      const policy = new RetryPolicy({ maxAttempts: 5 });

      // Record 10 failures to open circuit
      for (let i = 0; i < 10; i++) {
        policy.recordFailure();
      }

      expect(policy.isCircuitOpen()).toBe(true);
      expect(policy.shouldRetry(1, new Error('Any error'))).toBe(false);
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after threshold failures', () => {
      const policy = new RetryPolicy();

      expect(policy.isCircuitOpen()).toBe(false);

      // Record 9 failures - circuit still closed
      for (let i = 0; i < 9; i++) {
        policy.recordFailure();
      }
      expect(policy.isCircuitOpen()).toBe(false);
      expect(policy.getFailureCount()).toBe(9);

      // 10th failure opens circuit
      policy.recordFailure();
      expect(policy.isCircuitOpen()).toBe(true);
      expect(policy.getFailureCount()).toBe(10);
    });

    it('should reset circuit on success', () => {
      const policy = new RetryPolicy();

      // Record failures
      policy.recordFailure();
      policy.recordFailure();
      policy.recordFailure();
      expect(policy.getFailureCount()).toBe(3);

      // Success resets count
      policy.recordSuccess();
      expect(policy.getFailureCount()).toBe(0);
      expect(policy.isCircuitOpen()).toBe(false);
    });

    it('should reset circuit manually', () => {
      const policy = new RetryPolicy();

      // Open circuit
      for (let i = 0; i < 10; i++) {
        policy.recordFailure();
      }
      expect(policy.isCircuitOpen()).toBe(true);

      // Manual reset
      policy.resetCircuitBreaker();
      expect(policy.isCircuitOpen()).toBe(false);
      expect(policy.getFailureCount()).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const policy = new RetryPolicy();
      const config = policy.getConfig();

      expect(config.maxAttempts).toBe(3);
      expect(config.initialDelay).toBe(1000);
      expect(config.maxDelay).toBe(30000);
      expect(config.backoffMultiplier).toBe(2);
      expect(config.jitterFactor).toBe(0.1);
    });

    it('should accept custom configuration', () => {
      const policy = new RetryPolicy({
        maxAttempts: 5,
        initialDelay: 500,
        maxDelay: 60000,
        backoffMultiplier: 3,
        jitterFactor: 0.2,
      });

      const config = policy.getConfig();
      expect(config.maxAttempts).toBe(5);
      expect(config.initialDelay).toBe(500);
      expect(config.maxDelay).toBe(60000);
      expect(config.backoffMultiplier).toBe(3);
      expect(config.jitterFactor).toBe(0.2);
    });

    it('should allow runtime configuration', () => {
      const policy = new RetryPolicy();

      policy.configure({
        maxAttempts: 10,
        initialDelay: 2000,
      });

      const config = policy.getConfig();
      expect(config.maxAttempts).toBe(10);
      expect(config.initialDelay).toBe(2000);
      // Other values unchanged
      expect(config.backoffMultiplier).toBe(2);
    });

    it('should return immutable config copy', () => {
      const policy = new RetryPolicy();
      const config = policy.getConfig();

      // Attempt to modify (TypeScript prevents this, but test runtime)
      (config as any).maxAttempts = 999;

      // Original config unchanged
      expect(policy.getConfig().maxAttempts).toBe(3);
    });
  });
});

// END OF FILE
