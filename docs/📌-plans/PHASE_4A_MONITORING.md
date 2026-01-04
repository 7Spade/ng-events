# Phase 4A: Adapter Health & System Monitoring

## 📋 Overview

### Objectives
實作完整的系統監控機制，包含 Adapter 健康檢查、效能指標收集、與錯誤追蹤，確保系統可觀測性與可維運性。

**核心目標：**
1. Health check endpoints for all adapters
2. Performance metrics collection
3. Error rate tracking and alerting
4. System resource monitoring
5. Real-time dashboard integration

### Success Criteria
- [ ] HealthCheck interface 完整定義
- [ ] 5+ adapter health checks 實作
- [ ] Metrics collector 完成
- [ ] Dashboard integration 完成
- [ ] 40+ test cases (unit + integration)
- [ ] Validation script with 30+ checks
- [ ] All checks pass at 100%

### Complexity Estimate
- **Total**: 10/10
- **Infrastructure**: 4/10 (health check system)
- **Metrics**: 3/10 (collection & aggregation)
- **Dashboard**: 2/10 (UI integration)
- **Testing**: 1/10

### Dependencies
- **Requires**: Phase 2D (Projection infrastructure), Phase 3C (Authorization)
- **Blocks**: Phase 4B (Error taxonomy), Phase 5C (Observability)

---

## 🎯 Phase 4A Implementation

### Step 1: HealthCheck Interface

```typescript
// packages/core-engine/monitoring/HealthCheck.ts

export enum HealthStatus {
  Healthy = 'healthy',
  Degraded = 'degraded',
  Unhealthy = 'unhealthy',
}

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  responseTime: number; // milliseconds
}

export interface HealthCheck {
  /**
   * Unique name for this health check
   */
  getName(): string;

  /**
   * Execute health check
   */
  check(): Promise<HealthCheckResult>;

  /**
   * Get check interval in milliseconds
   */
  getInterval(): number;
}
```

### Step 2: BaseHealthCheck

```typescript
// packages/core-engine/monitoring/BaseHealthCheck.ts

export abstract class BaseHealthCheck implements HealthCheck {
  protected abstract name: string;
  protected abstract interval: number;

  getName(): string {
    return this.name;
  }

  getInterval(): number {
    return this.interval;
  }

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const details = await this.performCheck();
      const responseTime = Date.now() - startTime;
      
      const status = this.evaluateStatus(details, responseTime);
      
      return {
        name: this.name,
        status,
        details,
        timestamp: new Date(),
        responseTime,
      };
    } catch (error) {
      return {
        name: this.name,
        status: HealthStatus.Unhealthy,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  protected abstract performCheck(): Promise<Record<string, unknown>>;

  protected evaluateStatus(
    details: Record<string, unknown>,
    responseTime: number
  ): HealthStatus {
    // Default: healthy if no errors
    return HealthStatus.Healthy;
  }
}
```

### Step 3: Firestore Health Check

```typescript
// packages/infrastructure/firestore/FirestoreHealthCheck.ts

export class FirestoreHealthCheck extends BaseHealthCheck {
  protected name = 'firestore';
  protected interval = 30000; // 30 seconds

  constructor(private firestore: Firestore) {
    super();
  }

  protected async performCheck(): Promise<Record<string, unknown>> {
    // Test connection with lightweight query
    const testRef = this.firestore.collection('_health').doc('test');
    await testRef.set({ timestamp: Date.now() }, { merge: true });
    const snapshot = await testRef.get();
    
    return {
      connected: snapshot.exists,
      lastCheck: new Date().toISOString(),
    };
  }

  protected evaluateStatus(
    details: Record<string, unknown>,
    responseTime: number
  ): HealthStatus {
    if (!details.connected) {
      return HealthStatus.Unhealthy;
    }
    if (responseTime > 5000) {
      return HealthStatus.Degraded;
    }
    return HealthStatus.Healthy;
  }
}
```

### Step 4: EventStore Health Check

```typescript
// packages/core-engine/event-store/EventStoreHealthCheck.ts

export class EventStoreHealthCheck extends BaseHealthCheck {
  protected name = 'event-store';
  protected interval = 30000;

  constructor(private eventStore: FirestoreEventStore) {
    super();
  }

  protected async performCheck(): Promise<Record<string, unknown>> {
    const testAggregateId = '_health_check';
    const testEvent = {
      id: generateId(),
      aggregateId: testAggregateId,
      aggregateType: '_health',
      eventType: 'HealthCheckPerformed',
      data: { timestamp: Date.now() },
      metadata: {
        causedBy: 'system',
        causedByUser: 'system',
        causedByAction: 'health.check',
        timestamp: new Date().toISOString(),
        blueprintId: 'system',
      },
    };

    // Test write
    await this.eventStore.appendEvents(testAggregateId, '_health', [testEvent]);
    
    // Test read
    const events = await this.eventStore.getEvents(testAggregateId, '_health');
    
    return {
      writeSuccess: true,
      readSuccess: events.length > 0,
      eventCount: events.length,
    };
  }

  protected evaluateStatus(
    details: Record<string, unknown>,
    responseTime: number
  ): HealthStatus {
    if (!details.writeSuccess || !details.readSuccess) {
      return HealthStatus.Unhealthy;
    }
    if (responseTime > 3000) {
      return HealthStatus.Degraded;
    }
    return HealthStatus.Healthy;
  }
}
```

### Step 5: Repository Health Check

```typescript
// packages/core-engine/monitoring/RepositoryHealthCheck.ts

export class WorkspaceRepositoryHealthCheck extends BaseHealthCheck {
  protected name = 'workspace-repository';
  protected interval = 60000; // 1 minute

  constructor(private repository: WorkspaceRepository) {
    super();
  }

  protected async performCheck(): Promise<Record<string, unknown>> {
    // Test query operations
    const startTime = Date.now();
    const count = await this.repository.count();
    const queryTime = Date.now() - startTime;

    return {
      accessible: true,
      totalWorkspaces: count,
      queryResponseTime: queryTime,
    };
  }

  protected evaluateStatus(
    details: Record<string, unknown>,
    responseTime: number
  ): HealthStatus {
    if (!details.accessible) {
      return HealthStatus.Unhealthy;
    }
    if (responseTime > 5000) {
      return HealthStatus.Degraded;
    }
    return HealthStatus.Healthy;
  }
}
```

### Step 6: Projection Health Check

```typescript
// packages/core-engine/monitoring/ProjectionHealthCheck.ts

export class ProjectionHealthCheck extends BaseHealthCheck {
  protected name = 'projections';
  protected interval = 60000;

  constructor(
    private firestore: Firestore,
    private projectionTypes: string[]
  ) {
    super();
  }

  protected async performCheck(): Promise<Record<string, unknown>> {
    const results: Record<string, number> = {};

    for (const type of this.projectionTypes) {
      const snapshot = await this.firestore
        .collection(`projections/${type}`)
        .limit(1)
        .get();
      results[type] = snapshot.size;
    }

    return {
      projectionTypes: this.projectionTypes,
      counts: results,
    };
  }

  protected evaluateStatus(
    details: Record<string, unknown>,
    responseTime: number
  ): HealthStatus {
    if (responseTime > 10000) {
      return HealthStatus.Degraded;
    }
    return HealthStatus.Healthy;
  }
}
```

### Step 7: Saga Health Check

```typescript
// packages/core-engine/sagas/SagaHealthCheck.ts

export class SagaHealthCheck extends BaseHealthCheck {
  protected name = 'saga-orchestrator';
  protected interval = 60000;

  constructor(private sagaOrchestrator: SagaOrchestrator) {
    super();
  }

  protected async performCheck(): Promise<Record<string, unknown>> {
    const stats = await this.sagaOrchestrator.getStats();
    
    return {
      activeSagas: stats.activeSagas,
      completedSagas: stats.completedSagas,
      failedSagas: stats.failedSagas,
      pendingCompensations: stats.pendingCompensations,
    };
  }

  protected evaluateStatus(
    details: Record<string, unknown>,
    responseTime: number
  ): HealthStatus {
    const failedRatio = (details.failedSagas as number) / 
                        ((details.completedSagas as number) + (details.failedSagas as number));
    
    if (failedRatio > 0.1) { // >10% failure rate
      return HealthStatus.Degraded;
    }
    
    if ((details.pendingCompensations as number) > 100) {
      return HealthStatus.Degraded;
    }
    
    return HealthStatus.Healthy;
  }
}
```

### Step 8: HealthCheckRegistry

```typescript
// packages/core-engine/monitoring/HealthCheckRegistry.ts

export class HealthCheckRegistry {
  private checks: Map<string, HealthCheck> = new Map();
  private results: Map<string, HealthCheckResult> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  register(check: HealthCheck): void {
    const name = check.getName();
    this.checks.set(name, check);
    
    // Start periodic checks
    this.startPeriodicCheck(check);
  }

  unregister(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
    }
    this.checks.delete(name);
    this.results.delete(name);
  }

  async checkAll(): Promise<HealthCheckResult[]> {
    const promises = Array.from(this.checks.values()).map(check => 
      check.check()
    );
    const results = await Promise.all(promises);
    
    // Update cached results
    results.forEach(result => {
      this.results.set(result.name, result);
    });
    
    return results;
  }

  async checkOne(name: string): Promise<HealthCheckResult | null> {
    const check = this.checks.get(name);
    if (!check) return null;
    
    const result = await check.check();
    this.results.set(name, result);
    return result;
  }

  getLatestResults(): HealthCheckResult[] {
    return Array.from(this.results.values());
  }

  getOverallStatus(): HealthStatus {
    const results = this.getLatestResults();
    
    if (results.some(r => r.status === HealthStatus.Unhealthy)) {
      return HealthStatus.Unhealthy;
    }
    
    if (results.some(r => r.status === HealthStatus.Degraded)) {
      return HealthStatus.Degraded;
    }
    
    return HealthStatus.Healthy;
  }

  private startPeriodicCheck(check: HealthCheck): void {
    const name = check.getName();
    const interval = setInterval(async () => {
      try {
        const result = await check.check();
        this.results.set(name, result);
      } catch (error) {
        console.error(`Health check failed for ${name}:`, error);
      }
    }, check.getInterval());
    
    this.intervals.set(name, interval);
    
    // Run initial check
    check.check().then(result => {
      this.results.set(name, result);
    });
  }
}
```

### Step 9: MetricsCollector

```typescript
// packages/core-engine/monitoring/MetricsCollector.ts

export interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export class MetricsCollector {
  private metrics: Metric[] = [];
  private readonly maxMetrics = 10000;

  recordMetric(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    this.metrics.push({
      name,
      value,
      timestamp: new Date(),
      tags,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(
    name?: string,
    since?: Date
  ): Metric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }

    if (since) {
      filtered = filtered.filter(m => m.timestamp >= since);
    }

    return filtered;
  }

  getAverageValue(name: string, windowMinutes: number): number {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);
    const metrics = this.getMetrics(name, since);
    
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  clearMetrics(name?: string): void {
    if (name) {
      this.metrics = this.metrics.filter(m => m.name !== name);
    } else {
      this.metrics = [];
    }
  }
}
```

### Step 10: Health Check API Endpoint

```typescript
// packages/backend-functions/src/health/health.endpoint.ts

import { onRequest } from 'firebase-functions/v2/https';

export const healthCheck = onRequest(async (req, res) => {
  const registry = getHealthCheckRegistry();
  
  if (req.query.check) {
    // Check specific component
    const result = await registry.checkOne(req.query.check as string);
    if (!result) {
      res.status(404).json({ error: 'Health check not found' });
      return;
    }
    res.json(result);
  } else {
    // Check all components
    const results = await registry.checkAll();
    const overallStatus = registry.getOverallStatus();
    
    const statusCode = 
      overallStatus === HealthStatus.Healthy ? 200 :
      overallStatus === HealthStatus.Degraded ? 200 :
      503;
    
    res.status(statusCode).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results,
    });
  }
});
```

---

## 🧪 Testing Strategy

### Health Check Tests

```typescript
describe('BaseHealthCheck', () => {
  it('should return healthy status on success', async () => {
    const check = new TestHealthCheck();
    const result = await check.check();
    
    expect(result.status).toBe(HealthStatus.Healthy);
    expect(result.name).toBe('test-check');
    expect(result.responseTime).toBeGreaterThan(0);
  });

  it('should return unhealthy status on error', async () => {
    const check = new FailingHealthCheck();
    const result = await check.check();
    
    expect(result.status).toBe(HealthStatus.Unhealthy);
    expect(result.message).toBeDefined();
  });

  it('should measure response time accurately', async () => {
    const check = new SlowHealthCheck(100); // 100ms delay
    const result = await check.check();
    
    expect(result.responseTime).toBeGreaterThanOrEqual(100);
    expect(result.responseTime).toBeLessThan(150);
  });
});

describe('FirestoreHealthCheck', () => {
  it('should detect healthy Firestore connection', async () => {
    const firestore = createMockFirestore();
    const check = new FirestoreHealthCheck(firestore);
    
    const result = await check.check();
    
    expect(result.status).toBe(HealthStatus.Healthy);
    expect(result.details?.connected).toBe(true);
  });

  it('should detect degraded performance', async () => {
    const firestore = createSlowFirestore(6000); // 6s response
    const check = new FirestoreHealthCheck(firestore);
    
    const result = await check.check();
    
    expect(result.status).toBe(HealthStatus.Degraded);
  });
});
```

### Registry Tests

```typescript
describe('HealthCheckRegistry', () => {
  let registry: HealthCheckRegistry;

  beforeEach(() => {
    registry = new HealthCheckRegistry();
  });

  it('should register and execute health checks', async () => {
    const check = new TestHealthCheck();
    registry.register(check);
    
    const results = await registry.checkAll();
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('test-check');
  });

  it('should return overall healthy status', async () => {
    registry.register(new TestHealthCheck());
    registry.register(new AnotherHealthCheck());
    
    await registry.checkAll();
    const status = registry.getOverallStatus();
    
    expect(status).toBe(HealthStatus.Healthy);
  });

  it('should return degraded if any check is degraded', async () => {
    registry.register(new TestHealthCheck());
    registry.register(new DegradedHealthCheck());
    
    await registry.checkAll();
    const status = registry.getOverallStatus();
    
    expect(status).toBe(HealthStatus.Degraded);
  });

  it('should run periodic checks', async () => {
    const check = new TestHealthCheck();
    registry.register(check);
    
    await new Promise(resolve => setTimeout(resolve, check.getInterval() + 100));
    
    const results = registry.getLatestResults();
    expect(results).toHaveLength(1);
  });
});
```

---

## ✅ Validation Script

```javascript
// scripts/validate-phase-4a.js

const checks = [
  {
    file: 'packages/core-engine/monitoring/HealthCheck.ts',
    patterns: [
      'enum HealthStatus',
      'interface HealthCheckResult',
      'interface HealthCheck',
    ],
  },
  {
    file: 'packages/core-engine/monitoring/HealthCheckRegistry.ts',
    patterns: [
      'class HealthCheckRegistry',
      'register',
      'checkAll',
      'getOverallStatus',
    ],
  },
  {
    file: 'packages/infrastructure/firestore/FirestoreHealthCheck.ts',
    patterns: [
      'class FirestoreHealthCheck',
      'performCheck',
      'evaluateStatus',
    ],
  },
  {
    file: 'packages/core-engine/event-store/EventStoreHealthCheck.ts',
    patterns: [
      'class EventStoreHealthCheck',
      'writeSuccess',
      'readSuccess',
    ],
  },
  {
    file: 'packages/core-engine/monitoring/MetricsCollector.ts',
    patterns: [
      'class MetricsCollector',
      'recordMetric',
      'getMetrics',
      'getAverageValue',
    ],
  },
];

// Execute validation logic...
```

---

## 📊 Success Metrics

- ✅ 5+ adapter health checks implemented
- ✅ Health check registry operational
- ✅ Metrics collection active
- ✅ 40+ test cases passing
- ✅ Validation script at 100%
- ✅ Dashboard integration complete

**Phase 4A Complete**: Comprehensive monitoring foundation! 🎉
