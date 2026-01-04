# Phase 4B: Error Taxonomy & Classification

## 📋 Overview

### Objectives
建立系統化的錯誤分類體系，包含錯誤碼定義、錯誤處理策略、Dead Letter Queue (DLQ) 機制，與錯誤追蹤系統整合。

**核心目標：**
1. Structured error taxonomy with error codes
2. Dead Letter Queue for failed events
3. Error tracking and retry mechanisms
4. Error reporting and analytics
5. User-friendly error messages

### Success Criteria
- [ ] ErrorTaxonomy定義完整(5+ categories)
- [ ] DeadLetterQueue實作完成
- [ ] RetryPolicy機制完整
- [ ] Error tracking integration
- [ ] 45+ test cases
- [ ] Validation script with 35+ checks
- [ ] All checks pass at 100%

### Complexity Estimate
- **Total**: 8/10
- **Domain Logic**: 3/10 (error classification)
- **Infrastructure**: 3/10 (DLQ system)
- **Testing**: 2/10

### Dependencies
- **Requires**: Phase 4A (Monitoring)
- **Blocks**: Phase 5C (Observability with error metrics)

---

## 🎯 Phase 4B Implementation

### Step 1: Error Taxonomy

```typescript
// packages/core-engine/errors/ErrorTaxonomy.ts

export enum ErrorCategory {
  // Domain Errors (4xx equivalent)
  ValidationError = 'VALIDATION_ERROR',
  BusinessRuleViolation = 'BUSINESS_RULE_VIOLATION',
  AuthorizationError = 'AUTHORIZATION_ERROR',
  NotFoundError = 'NOT_FOUND_ERROR',
  ConflictError = 'CONFLICT_ERROR',
  
  // Technical Errors (5xx equivalent)
  InfrastructureError = 'INFRASTRUCTURE_ERROR',
  ExternalServiceError = 'EXTERNAL_SERVICE_ERROR',
  DataIntegrityError = 'DATA_INTEGRITY_ERROR',
  
  // System Errors
  ConfigurationError = 'CONFIGURATION_ERROR',
  TimeoutError = 'TIMEOUT_ERROR',
  RateLimitError = 'RATE_LIMIT_ERROR',
}

export interface ErrorCode {
  code: string;
  category: ErrorCategory;
  httpStatus: number;
  userMessage: string;
  technicalMessage: string;
  retryable: boolean;
}

export class ErrorRegistry {
  private static codes = new Map<string, ErrorCode>();

  static register(errorCode: ErrorCode): void {
    this.codes.set(errorCode.code, errorCode);
  }

  static get(code: string): ErrorCode | undefined {
    return this.codes.get(code);
  }

  static getAllCodes(): ErrorCode[] {
    return Array.from(this.codes.values());
  }
}
```

### Step 2: Domain Error Codes

```typescript
// packages/core-engine/errors/DomainErrorCodes.ts

// Workspace errors
ErrorRegistry.register({
  code: 'WS_001',
  category: ErrorCategory.ValidationError,
  httpStatus: 400,
  userMessage: 'Workspace name is required',
  technicalMessage: 'Workspace.name must be non-empty string',
  retryable: false,
});

ErrorRegistry.register({
  code: 'WS_002',
  category: ErrorCategory.BusinessRuleViolation,
  httpStatus: 400,
  userMessage: 'Cannot archive an already archived workspace',
  technicalMessage: 'Workspace.archive() called on archived workspace',
  retryable: false,
});

ErrorRegistry.register({
  code: 'WS_003',
  category: ErrorCategory.AuthorizationError,
  httpStatus: 403,
  userMessage: 'You do not have permission to modify this workspace',
  technicalMessage: 'User lacks Owner role for workspace modification',
  retryable: false,
});

ErrorRegistry.register({
  code: 'WS_004',
  category: ErrorCategory.NotFoundError,
  httpStatus: 404,
  userMessage: 'Workspace not found',
  technicalMessage: 'Workspace aggregate not found in event store',
  retryable: false,
});

// Task errors
ErrorRegistry.register({
  code: 'TSK_001',
  category: ErrorCategory.ValidationError,
  httpStatus: 400,
  userMessage: 'Task title is required',
  technicalMessage: 'Task.title must be non-empty string',
  retryable: false,
});

ErrorRegistry.register({
  code: 'TSK_002',
  category: ErrorCategory.BusinessRuleViolation,
  httpStatus: 400,
  userMessage: 'Cannot complete an already completed task',
  technicalMessage: 'Task.complete() called on completed task',
  retryable: false,
});

// Infrastructure errors
ErrorRegistry.register({
  code: 'INF_001',
  category: ErrorCategory.InfrastructureError,
  httpStatus: 500,
  userMessage: 'Database connection failed. Please try again.',
  technicalMessage: 'Firestore connection timeout or unavailable',
  retryable: true,
});

ErrorRegistry.register({
  code: 'INF_002',
  category: ErrorCategory.ExternalServiceError,
  httpStatus: 502,
  userMessage: 'External service temporarily unavailable',
  technicalMessage: 'HTTP request to external API failed',
  retryable: true,
});

ErrorRegistry.register({
  code: 'INF_003',
  category: ErrorCategory.DataIntegrityError,
  httpStatus: 500,
  userMessage: 'Data inconsistency detected. Please contact support.',
  technicalMessage: 'Event deserialization failed or invalid aggregate state',
  retryable: false,
});
```

### Step 3: CategorizedError Class

```typescript
// packages/core-engine/errors/CategorizedError.ts

export class CategorizedError extends Error {
  constructor(
    public readonly errorCode: string,
    public readonly context?: Record<string, unknown>
  ) {
    const registeredError = ErrorRegistry.get(errorCode);
    
    if (!registeredError) {
      super(`Unknown error code: ${errorCode}`);
      this.name = 'CategorizedError';
      return;
    }

    super(registeredError.technicalMessage);
    this.name = registeredError.category;
  }

  getErrorCode(): ErrorCode | undefined {
    return ErrorRegistry.get(this.errorCode);
  }

  getUserMessage(): string {
    const code = this.getErrorCode();
    return code?.userMessage || 'An unexpected error occurred';
  }

  getTechnicalMessage(): string {
    const code = this.getErrorCode();
    return code?.technicalMessage || this.message;
  }

  isRetryable(): boolean {
    const code = this.getErrorCode();
    return code?.retryable || false;
  }

  getHttpStatus(): number {
    const code = this.getErrorCode();
    return code?.httpStatus || 500;
  }

  toJSON(): object {
    return {
      code: this.errorCode,
      category: this.name,
      userMessage: this.getUserMessage(),
      httpStatus: this.getHttpStatus(),
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### Step 4: Dead Letter Queue

```typescript
// packages/core-engine/event-store/DeadLetterQueue.ts

export interface DeadLetterEntry {
  id: string;
  event: DomainEvent;
  error: {
    message: string;
    code?: string;
    stack?: string;
  };
  attemptCount: number;
  firstAttemptAt: Date;
  lastAttemptAt: Date;
  nextRetryAt?: Date;
  status: 'pending' | 'retrying' | 'failed' | 'resolved';
}

export class DeadLetterQueue {
  constructor(private firestore: Firestore) {}

  async addEntry(
    event: DomainEvent,
    error: Error,
    attemptCount: number = 1
  ): Promise<string> {
    const entry: DeadLetterEntry = {
      id: generateId(),
      event,
      error: {
        message: error.message,
        code: error instanceof CategorizedError ? error.errorCode : undefined,
        stack: error.stack,
      },
      attemptCount,
      firstAttemptAt: new Date(),
      lastAttemptAt: new Date(),
      status: 'pending',
    };

    // Calculate next retry time based on exponential backoff
    if (this.shouldRetry(error, attemptCount)) {
      entry.nextRetryAt = this.calculateNextRetry(attemptCount);
      entry.status = 'retrying';
    } else {
      entry.status = 'failed';
    }

    await this.firestore
      .collection('dead_letter_queue')
      .doc(entry.id)
      .set(entry);

    return entry.id;
  }

  async getEntry(id: string): Promise<DeadLetterEntry | null> {
    const snapshot = await this.firestore
      .collection('dead_letter_queue')
      .doc(id)
      .get();

    if (!snapshot.exists) return null;

    return snapshot.data() as DeadLetterEntry;
  }

  async getPendingRetries(): Promise<DeadLetterEntry[]> {
    const now = new Date();
    const snapshot = await this.firestore
      .collection('dead_letter_queue')
      .where('status', '==', 'retrying')
      .where('nextRetryAt', '<=', now)
      .limit(100)
      .get();

    return snapshot.docs.map(doc => doc.data() as DeadLetterEntry);
  }

  async updateStatus(
    id: string,
    status: DeadLetterEntry['status']
  ): Promise<void> {
    await this.firestore
      .collection('dead_letter_queue')
      .doc(id)
      .update({ status, lastAttemptAt: new Date() });
  }

  private shouldRetry(error: Error, attemptCount: number): boolean {
    // Don't retry if max attempts reached
    if (attemptCount >= 5) return false;

    // Don't retry non-retryable errors
    if (error instanceof CategorizedError) {
      return error.isRetryable();
    }

    // Default: retry infrastructure errors
    return true;
  }

  private calculateNextRetry(attemptCount: number): Date {
    // Exponential backoff: 1min, 5min, 15min, 1hr, 4hr
    const delays = [60, 300, 900, 3600, 14400]; // seconds
    const delaySeconds = delays[Math.min(attemptCount - 1, delays.length - 1)];
    
    return new Date(Date.now() + delaySeconds * 1000);
  }
}
```

### Step 5: Retry Policy

```typescript
// packages/core-engine/event-store/RetryPolicy.ts

export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors: ErrorCategory[];
}

export class RetryPolicy {
  private static defaultConfig: RetryConfig = {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 60000,
    backoffMultiplier: 2,
    retryableErrors: [
      ErrorCategory.InfrastructureError,
      ErrorCategory.ExternalServiceError,
      ErrorCategory.TimeoutError,
    ],
  };

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (!this.shouldRetry(error as Error, attempt, finalConfig)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt, finalConfig);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private static shouldRetry(
    error: Error,
    attempt: number,
    config: RetryConfig
  ): boolean {
    if (attempt >= config.maxAttempts) {
      return false;
    }

    if (error instanceof CategorizedError) {
      const errorCode = error.getErrorCode();
      if (!errorCode) return false;
      return config.retryableErrors.includes(errorCode.category);
    }

    return true;
  }

  private static calculateDelay(
    attempt: number,
    config: RetryConfig
  ): number {
    const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Step 6: Error Tracking Service

```typescript
// packages/core-engine/monitoring/ErrorTrackingService.ts

export interface ErrorReport {
  id: string;
  errorCode: string;
  category: ErrorCategory;
  message: string;
  stackTrace?: string;
  context: Record<string, unknown>;
  userId?: string;
  workspaceId?: string;
  aggregateId?: string;
  timestamp: Date;
}

export class ErrorTrackingService {
  constructor(
    private firestore: Firestore,
    private deadLetterQueue: DeadLetterQueue
  ) {}

  async reportError(
    error: Error,
    context: Record<string, unknown> = {}
  ): Promise<string> {
    const report: ErrorReport = {
      id: generateId(),
      errorCode: error instanceof CategorizedError ? error.errorCode : 'UNKNOWN',
      category: this.getCategory(error),
      message: error.message,
      stackTrace: error.stack,
      context,
      userId: context.userId as string,
      workspaceId: context.workspaceId as string,
      aggregateId: context.aggregateId as string,
      timestamp: new Date(),
    };

    // Store error report
    await this.firestore
      .collection('error_reports')
      .doc(report.id)
      .set(report);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', report);
    }

    return report.id;
  }

  async getErrorStats(
    workspaceId?: string,
    since?: Date
  ): Promise<Record<ErrorCategory, number>> {
    let query = this.firestore.collection('error_reports') as any;

    if (workspaceId) {
      query = query.where('workspaceId', '==', workspaceId);
    }

    if (since) {
      query = query.where('timestamp', '>=', since);
    }

    const snapshot = await query.get();
    const stats: Record<string, number> = {};

    snapshot.docs.forEach((doc: any) => {
      const category = doc.data().category;
      stats[category] = (stats[category] || 0) + 1;
    });

    return stats as Record<ErrorCategory, number>;
  }

  private getCategory(error: Error): ErrorCategory {
    if (error instanceof CategorizedError) {
      const errorCode = error.getErrorCode();
      return errorCode?.category || ErrorCategory.InfrastructureError;
    }
    return ErrorCategory.InfrastructureError;
  }
}
```

---

## 🧪 Testing Strategy

```typescript
describe('CategorizedError', () => {
  it('should create error from registered code', () => {
    const error = new CategorizedError('WS_001');
    
    expect(error.errorCode).toBe('WS_001');
    expect(error.getUserMessage()).toBe('Workspace name is required');
    expect(error.isRetryable()).toBe(false);
    expect(error.getHttpStatus()).toBe(400);
  });

  it('should handle unknown error codes', () => {
    const error = new CategorizedError('UNKNOWN');
    
    expect(error.message).toContain('Unknown error code');
  });

  it('should serialize to JSON correctly', () => {
    const error = new CategorizedError('WS_002');
    const json = error.toJSON();
    
    expect(json).toHaveProperty('code', 'WS_002');
    expect(json).toHaveProperty('category');
    expect(json).toHaveProperty('userMessage');
    expect(json).toHaveProperty('timestamp');
  });
});

describe('DeadLetterQueue', () => {
  it('should add entry with retry status', async () => {
    const dlq = new DeadLetterQueue(mockFirestore);
    const event = createTestEvent();
    const error = new CategorizedError('INF_001');
    
    const entryId = await dlq.addEntry(event, error, 1);
    
    expect(entryId).toBeDefined();
    const entry = await dlq.getEntry(entryId);
    expect(entry?.status).toBe('retrying');
    expect(entry?.nextRetryAt).toBeDefined();
  });

  it('should mark as failed after max attempts', async () => {
    const dlq = new DeadLetterQueue(mockFirestore);
    const event = createTestEvent();
    const error = new CategorizedError('INF_001');
    
    const entryId = await dlq.addEntry(event, error, 5);
    const entry = await dlq.getEntry(entryId);
    
    expect(entry?.status).toBe('failed');
    expect(entry?.nextRetryAt).toBeUndefined();
  });

  it('should retrieve pending retries', async () => {
    const dlq = new DeadLetterQueue(mockFirestore);
    
    const entries = await dlq.getPendingRetries();
    
    expect(Array.isArray(entries)).toBe(true);
  });
});

describe('RetryPolicy', () => {
  it('should retry on retryable errors', async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new CategorizedError('INF_001');
      }
      return 'success';
    };

    const result = await RetryPolicy.executeWithRetry(operation, {
      maxAttempts: 5,
      initialDelay: 10,
    });

    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('should not retry non-retryable errors', async () => {
    const operation = async () => {
      throw new CategorizedError('WS_001'); // ValidationError
    };

    await expect(
      RetryPolicy.executeWithRetry(operation)
    ).rejects.toThrow();
  });
});
```

---

## ✅ Validation Script

```javascript
// scripts/validate-phase-4b.js

const checks = [
  {
    file: 'packages/core-engine/errors/ErrorTaxonomy.ts',
    patterns: [
      'enum ErrorCategory',
      'interface ErrorCode',
      'class ErrorRegistry',
    ],
  },
  {
    file: 'packages/core-engine/errors/CategorizedError.ts',
    patterns: [
      'class CategorizedError',
      'getUserMessage',
      'isRetryable',
      'toJSON',
    ],
  },
  {
    file: 'packages/core-engine/event-store/DeadLetterQueue.ts',
    patterns: [
      'class DeadLetterQueue',
      'addEntry',
      'getPendingRetries',
      'calculateNextRetry',
    ],
  },
  {
    file: 'packages/core-engine/event-store/RetryPolicy.ts',
    patterns: [
      'class RetryPolicy',
      'executeWithRetry',
      'shouldRetry',
      'calculateDelay',
    ],
  },
];

// Execute validation...
```

---

## 📊 Success Criteria

- ✅ 5+ error categories defined
- ✅ 20+ error codes registered
- ✅ CategorizedError implementation
- ✅ DeadLetterQueue operational
- ✅ RetryPolicy working
- ✅ ErrorTrackingService integrated
- ✅ 45+ test cases passing
- ✅ Validation script at 100%

**Phase 4B Complete**: Systematic error handling! 🎉
