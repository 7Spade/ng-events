/**
 * Retry Policy
 *
 * Implements retry strategies with exponential backoff for failed process operations.
 * Supports max attempts, configurable delays, and circuit breaker pattern.
 *
 * Phase 2B: Failure Compensation / State Machine
 */

/**
 * Retry configuration options
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   */
  maxAttempts: number;

  /**
   * Initial delay in milliseconds
   */
  initialDelay: number;

  /**
   * Maximum delay in milliseconds (cap for exponential backoff)
   */
  maxDelay: number;

  /**
   * Multiplier for exponential backoff (e.g., 2 = double each time)
   */
  backoffMultiplier: number;

  /**
   * Jitter factor (0-1) to randomize delays and prevent thundering herd
   */
  jitterFactor?: number;
}

/**
 * Retry Policy
 *
 * Configures retry behavior for failed process operations.
 * Uses exponential backoff with optional jitter.
 */
export class RetryPolicy {
  private config: RetryConfig;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private circuitBreakerThreshold: number = 10; // Open circuit after 10 consecutive failures

  /**
   * Constructor
   *
   * @param config - Retry configuration
   */
  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxAttempts: config?.maxAttempts ?? 3,
      initialDelay: config?.initialDelay ?? 1000,
      maxDelay: config?.maxDelay ?? 30000,
      backoffMultiplier: config?.backoffMultiplier ?? 2,
      jitterFactor: config?.jitterFactor ?? 0.1,
    };
  }

  /**
   * Calculate next retry delay using exponential backoff
   *
   * Formula: min(initialDelay * (backoffMultiplier ^ attemptNumber), maxDelay)
   * With optional jitter to prevent thundering herd
   *
   * @param attemptNumber - Current attempt number (0-based)
   * @returns Delay in milliseconds
   */
  getNextRetryDelay(attemptNumber: number): number {
    const baseDelay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attemptNumber),
      this.config.maxDelay
    );

    // Apply jitter if configured
    if (this.config.jitterFactor && this.config.jitterFactor > 0) {
      const jitter = baseDelay * this.config.jitterFactor * Math.random();
      return Math.floor(baseDelay + jitter);
    }

    return baseDelay;
  }

  /**
   * Check if should retry based on attempt number and error type
   *
   * @param attemptNumber - Current attempt number (1-based)
   * @param error - Error that occurred
   * @returns True if should retry, false otherwise
   */
  shouldRetry(attemptNumber: number, error: Error): boolean {
    // Check max attempts
    if (attemptNumber >= this.config.maxAttempts) {
      return false;
    }

    // Check circuit breaker
    if (this.isCircuitOpen()) {
      return false;
    }

    // Don't retry for certain error types (can be extended)
    if (this.isNonRetryableError(error)) {
      return false;
    }

    return true;
  }

  /**
   * Configure retry settings
   *
   * @param config - Partial configuration to override
   */
  configure(config: Partial<RetryConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Check if circuit breaker is open
   *
   * Circuit opens after consecutive failures exceed threshold.
   * Prevents retry attempts when system is degraded.
   *
   * @returns True if circuit is open, false otherwise
   */
  isCircuitOpen(): boolean {
    return this.failureCount >= this.circuitBreakerThreshold;
  }

  /**
   * Record a failure for circuit breaker tracking
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  /**
   * Record a success for circuit breaker tracking
   *
   * Resets failure count (half-open → closed transition)
   */
  recordSuccess(): void {
    this.failureCount = 0;
  }

  /**
   * Reset circuit breaker
   *
   * Forces circuit back to closed state
   */
  resetCircuitBreaker(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  /**
   * Get current retry configuration
   *
   * @returns Current config (immutable copy)
   */
  getConfig(): Readonly<RetryConfig> {
    return { ...this.config };
  }

  /**
   * Get failure count for circuit breaker
   *
   * @returns Current failure count
   */
  getFailureCount(): number {
    return this.failureCount;
  }

  /**
   * Check if error is non-retryable
   *
   * Can be overridden in subclasses for custom logic
   *
   * @param error - Error to check
   * @returns True if error should not be retried
   */
  protected isNonRetryableError(error: Error): boolean {
    // Examples of non-retryable errors
    const nonRetryableMessages = [
      'validation failed',
      'invalid input',
      'unauthorized',
      'forbidden',
      'not found',
    ];

    const errorMessage = error.message.toLowerCase();
    return nonRetryableMessages.some((msg) => errorMessage.includes(msg));
  }
}

// END OF FILE
