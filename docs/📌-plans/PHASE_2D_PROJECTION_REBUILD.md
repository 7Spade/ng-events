# Phase 2D: Projection Rebuild Flow

**Status**: 📋 Planned  
**Date**: 2026-01-03  
**Complexity**: ★★★★☆ (4/5)  
**Estimated Duration**: 6-8 hours  
**Dependencies**: Phase 2C Complete

## Executive Summary

Phase 2D implements **projection rebuild capabilities** to reconstruct read models from event streams. This enables recovery from projection corruption, schema migrations, and adds new projections to existing aggregates.

### Why Projection Rebuild?

**Scenarios Requiring Rebuild**:
1. **Projection Corruption**: Data inconsistency due to bugs or infrastructure issues
2. **Schema Migration**: Adding new fields or changing projection structure
3. **New Projections**: Adding additional read models for new query patterns
4. **Debugging**: Verifying projection logic against event history
5. **Compliance**: Recreating historical reports from immutable event log

**The Solution**:
```
EventStore (Source of Truth)
      ↓
  Replay All Events
      ↓
 Projection Builder
      ↓
Reconstructed Projection (Query-Optimized)
```

---

## Architecture Overview

### Rebuild Flow

```
┌──────────────────────────────────────────────────────────────┐
│                Admin UI: Trigger Rebuild                      │
│         User selects: workspace, strategy, options            │
└──────────────┬───────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│              ProjectionRebuilder.rebuild()                    │
│    Strategy: full | incremental | selective                  │
└──────────────┬───────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│            Clear Existing Projection (if full)                │
│     DELETE FROM projections/workspace/*                       │
└──────────────┬───────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│               EventStore.getEvents()                          │
│        Retrieve ALL events for aggregate type                 │
│       events/workspace/*/events/* (ordered by time)           │
└──────────────┬───────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│          Replay Events Through Projection Builder             │
│                                                               │
│  For each event:                                              │
│    1. Upcast to current version (Phase 2C)                    │
│    2. WorkspaceProjectionBuilder.handleEvent(event)           │
│    3. Update projection in Firestore                          │
│    4. Update progress counter                                 │
└──────────────┬───────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│                Rebuild Complete                               │
│     Projection: projections/workspace/{workspaceId}           │
│     Metrics: events processed, duration, errors               │
└──────────────────────────────────────────────────────────────┘
```

---

## Component 1: Projection Rebuilder Interface

**Location**: `packages/core-engine/projections/ProjectionRebuilder.ts`

```typescript
/**
 * Rebuild strategy configuration
 */
export interface RebuildStrategy {
  type: 'full' | 'incremental' | 'selective';
  
  /** For incremental: start from this timestamp */
  fromTimestamp?: string;
  
  /** For selective: filter by aggregate IDs */
  aggregateIds?: string[];
  
  /** Batch size for processing events */
  batchSize?: number;
  
  /** Progress callback (processed, total) */
  onProgress?: (processed: number, total: number) => void;
  
  /** Error handling: 'skip' | 'abort' */
  onError?: 'skip' | 'abort';
}

/**
 * Rebuild result with metrics
 */
export interface RebuildResult {
  success: boolean;
  eventsProcessed: number;
  eventsFailed: number;
  durationMs: number;
  errors: Array<{ eventId: string; error: string }>;
}

/**
 * ProjectionRebuilder interface
 */
export interface ProjectionRebuilder {
  /**
   * Rebuild projection(s) for aggregate type.
   * Returns metrics and error log.
   */
  rebuild(
    aggregateType: string,
    strategy: RebuildStrategy
  ): Promise<RebuildResult>;
  
  /**
   * Clear existing projections (for full rebuild).
   */
  clear(aggregateType: string): Promise<void>;
  
  /**
   * Get rebuild progress (for long-running operations).
   */
  getProgress(jobId: string): Promise<RebuildProgress>;
}

/**
 * Rebuild progress tracking
 */
export interface RebuildProgress {
  jobId: string;
  aggregateType: string;
  status: 'running' | 'completed' | 'failed';
  eventsProcessed: number;
  eventsTotal: number;
  startedAt: string;
  completedAt?: string;
  errors: Array<{ eventId: string; error: string }>;
}
```

---

## Component 2: FirestoreProjectionRebuilder

**Location**: `packages/platform-adapters/projections/FirestoreProjectionRebuilder.ts`

```typescript
import { Firestore, collection, getDocs, writeBatch, doc, deleteDoc } from 'firebase/firestore';
import { ProjectionRebuilder, RebuildStrategy, RebuildResult } from '@core-engine/projections/ProjectionRebuilder';
import { FirestoreEventStore } from '@platform-adapters/event-store/FirestoreEventStore';
import { ProjectionBuilder } from '@core-engine/projections/ProjectionBuilder';

/**
 * Firestore implementation of ProjectionRebuilder.
 */
export class FirestoreProjectionRebuilder implements ProjectionRebuilder {
  constructor(
    private readonly firestore: Firestore,
    private readonly eventStore: FirestoreEventStore,
    private readonly projectionBuilders: Map<string, ProjectionBuilder>
  ) {}
  
  async rebuild(
    aggregateType: string,
    strategy: RebuildStrategy
  ): Promise<RebuildResult> {
    const startTime = Date.now();
    const result: RebuildResult = {
      success: true,
      eventsProcessed: 0,
      eventsFailed: 0,
      durationMs: 0,
      errors: [],
    };
    
    try {
      // 1. Clear existing projections (if full rebuild)
      if (strategy.type === 'full') {
        await this.clear(aggregateType);
      }
      
      // 2. Get projection builder for aggregate type
      const builder = this.projectionBuilders.get(aggregateType);
      if (!builder) {
        throw new Error(`No projection builder registered for: ${aggregateType}`);
      }
      
      // 3. Get all events for aggregate type
      const events = await this.getEventsForRebuild(aggregateType, strategy);
      const totalEvents = events.length;
      
      // 4. Process events in batches
      const batchSize = strategy.batchSize || 100;
      
      for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize);
        
        for (const event of batch) {
          try {
            // Apply event to projection builder
            await builder.handleEvent(event);
            result.eventsProcessed++;
            
            // Progress callback
            if (strategy.onProgress) {
              strategy.onProgress(result.eventsProcessed, totalEvents);
            }
          } catch (error) {
            result.eventsFailed++;
            result.errors.push({
              eventId: event.id,
              error: error instanceof Error ? error.message : String(error),
            });
            
            // Error handling strategy
            if (strategy.onError === 'abort') {
              throw error;
            }
            // Otherwise skip and continue
          }
        }
      }
      
      result.success = result.eventsFailed === 0;
    } catch (error) {
      result.success = false;
      result.errors.push({
        eventId: 'REBUILD_PROCESS',
        error: error instanceof Error ? error.message : String(error),
      });
    }
    
    result.durationMs = Date.now() - startTime;
    return result;
  }
  
  async clear(aggregateType: string): Promise<void> {
    const projectionsRef = collection(this.firestore, 'projections', aggregateType);
    const snapshot = await getDocs(projectionsRef);
    
    const batch = writeBatch(this.firestore);
    snapshot.docs.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    
    await batch.commit();
  }
  
  private async getEventsForRebuild(
    aggregateType: string,
    strategy: RebuildStrategy
  ): Promise<DomainEvent[]> {
    // Get all events for aggregate type
    const allEvents = await this.eventStore.getAllEventsForType(aggregateType);
    
    // Apply filters based on strategy
    let filteredEvents = allEvents;
    
    if (strategy.type === 'incremental' && strategy.fromTimestamp) {
      filteredEvents = allEvents.filter(
        e => e.occurredAt >= strategy.fromTimestamp!
      );
    }
    
    if (strategy.type === 'selective' && strategy.aggregateIds) {
      filteredEvents = allEvents.filter(
        e => strategy.aggregateIds!.includes(e.aggregateId)
      );
    }
    
    return filteredEvents;
  }
  
  async getProgress(jobId: string): Promise<RebuildProgress> {
    // Load progress from Firestore rebuild jobs collection
    throw new Error('Not implemented - Phase 2D skeleton');
  }
}
```

---

## Component 3: Rebuild Job Management

**Location**: `packages/platform-adapters/projections/RebuildJobRepository.ts`

```typescript
/**
 * Persistent storage for rebuild jobs.
 * Tracks long-running rebuild operations.
 */
export class RebuildJobRepository {
  constructor(private readonly firestore: Firestore) {}
  
  /**
   * Create new rebuild job.
   * Returns job ID for tracking.
   */
  async createJob(params: {
    aggregateType: string;
    strategy: RebuildStrategy;
    initiatedBy: string;
  }): Promise<string> {
    const jobId = generateId();
    const jobData = {
      jobId,
      aggregateType: params.aggregateType,
      strategy: params.strategy,
      initiatedBy: params.initiatedBy,
      status: 'running',
      eventsProcessed: 0,
      eventsTotal: 0,
      startedAt: new Date().toISOString(),
      errors: [],
    };
    
    await setDoc(
      doc(this.firestore, 'rebuildJobs', jobId),
      jobData
    );
    
    return jobId;
  }
  
  /**
   * Update job progress.
   */
  async updateProgress(
    jobId: string,
    processed: number,
    total: number
  ): Promise<void> {
    await setDoc(
      doc(this.firestore, 'rebuildJobs', jobId),
      {
        eventsProcessed: processed,
        eventsTotal: total,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }
  
  /**
   * Complete job (success or failure).
   */
  async completeJob(
    jobId: string,
    result: RebuildResult
  ): Promise<void> {
    await setDoc(
      doc(this.firestore, 'rebuildJobs', jobId),
      {
        status: result.success ? 'completed' : 'failed',
        eventsProcessed: result.eventsProcessed,
        eventsFailed: result.eventsFailed,
        durationMs: result.durationMs,
        errors: result.errors,
        completedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }
  
  /**
   * Get job status.
   */
  async getJob(jobId: string): Promise<RebuildProgress | null> {
    const docSnap = await getDoc(doc(this.firestore, 'rebuildJobs', jobId));
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docSnap.data() as RebuildProgress;
  }
}
```

---

## Component 4: Admin UI Integration

**Location**: `packages/ui-angular/src/app/admin/projection-rebuild/`

### Angular Component

```typescript
import { Component } from '@angular/core';
import { ProjectionRebuildService } from './projection-rebuild.service';
import { RebuildStrategy } from '@core-engine/projections/ProjectionRebuilder';

@Component({
  selector: 'app-projection-rebuild',
  templateUrl: './projection-rebuild.component.html',
})
export class ProjectionRebuildComponent {
  aggregateTypes = ['workspace', 'account', 'membership', 'task', 'payment', 'issue'];
  selectedType = 'workspace';
  strategy: RebuildStrategy = {
    type: 'full',
    batchSize: 100,
    onError: 'skip',
  };
  
  isRebuilding = false;
  progress = 0;
  result: any = null;
  
  constructor(private rebuildService: ProjectionRebuildService) {}
  
  async startRebuild(): Promise<void> {
    this.isRebuilding = true;
    this.progress = 0;
    this.result = null;
    
    const strategyWithProgress: RebuildStrategy = {
      ...this.strategy,
      onProgress: (processed, total) => {
        this.progress = Math.round((processed / total) * 100);
      },
    };
    
    try {
      this.result = await this.rebuildService.rebuild(
        this.selectedType,
        strategyWithProgress
      );
    } catch (error) {
      this.result = { success: false, error };
    } finally {
      this.isRebuilding = false;
    }
  }
}
```

### Angular Template

```html
<div class="projection-rebuild-container">
  <h2>Projection Rebuild</h2>
  
  <div class="rebuild-form">
    <label>
      Aggregate Type:
      <select [(ngModel)]="selectedType" [disabled]="isRebuilding">
        <option *ngFor="let type of aggregateTypes" [value]="type">
          {{ type }}
        </option>
      </select>
    </label>
    
    <label>
      Strategy:
      <select [(ngModel)]="strategy.type" [disabled]="isRebuilding">
        <option value="full">Full Rebuild (Clear + Replay All)</option>
        <option value="incremental">Incremental (From Timestamp)</option>
        <option value="selective">Selective (Specific IDs)</option>
      </select>
    </label>
    
    <label>
      Batch Size:
      <input type="number" [(ngModel)]="strategy.batchSize" [disabled]="isRebuilding" />
    </label>
    
    <button (click)="startRebuild()" [disabled]="isRebuilding">
      {{ isRebuilding ? 'Rebuilding...' : 'Start Rebuild' }}
    </button>
  </div>
  
  <div *ngIf="isRebuilding" class="progress">
    <progress [value]="progress" max="100"></progress>
    <span>{{ progress }}%</span>
  </div>
  
  <div *ngIf="result" class="rebuild-result">
    <h3>Rebuild {{ result.success ? 'Completed' : 'Failed' }}</h3>
    <ul>
      <li>Events Processed: {{ result.eventsProcessed }}</li>
      <li>Events Failed: {{ result.eventsFailed }}</li>
      <li>Duration: {{ result.durationMs }}ms</li>
    </ul>
    
    <div *ngIf="result.errors.length > 0" class="errors">
      <h4>Errors:</h4>
      <ul>
        <li *ngFor="let error of result.errors">
          Event {{ error.eventId }}: {{ error.error }}
        </li>
      </ul>
    </div>
  </div>
</div>
```

---

## File Structure Summary

```
packages/
├── core-engine/
│   └── projections/
│       ├── ProjectionRebuilder.ts          (new interface)
│       ├── RebuildStrategy.ts              (new types)
│       └── ProjectionRebuilder.spec.ts     (new tests)
├── platform-adapters/
│   └── projections/
│       ├── FirestoreProjectionRebuilder.ts      (new implementation)
│       ├── RebuildJobRepository.ts              (new job tracking)
│       ├── FirestoreProjectionRebuilder.spec.ts (new tests)
│       └── FirestoreProjectionRebuilder.e2e.spec.ts (new E2E)
└── ui-angular/
    └── src/app/admin/
        └── projection-rebuild/
            ├── projection-rebuild.component.ts      (new UI)
            ├── projection-rebuild.component.html    (new template)
            ├── projection-rebuild.component.scss    (new styles)
            └── projection-rebuild.service.ts        (new service)
```

**Total New Files**: 12

---

## Testing Strategy

### Unit Tests

**ProjectionRebuilder Logic**:
```typescript
it('should rebuild projection from all events', async () => {
  const rebuilder = new FirestoreProjectionRebuilder(firestore, eventStore, builders);
  
  const result = await rebuilder.rebuild('workspace', { type: 'full' });
  
  expect(result.success).toBe(true);
  expect(result.eventsProcessed).toBeGreaterThan(0);
});
```

### E2E Tests

**Full Rebuild Workflow**:
```typescript
it('should clear and rebuild workspace projections', async () => {
  // Setup: Create workspace events
  await eventStore.appendEvents([...workspaceEvents]);
  
  // Execute: Full rebuild
  await rebuilder.rebuild('workspace', { type: 'full' });
  
  // Verify: Projections match event stream
  const projections = await getProjections('workspace');
  expect(projections.length).toBe(workspaceEvents.length);
});
```

---

## Validation Script

**Location**: `scripts/validate-phase-2d.js`

### Validation Categories (70+ checks)

1. **File Structure** (10 checks)
2. **ProjectionRebuilder Interface** (10 checks)
3. **FirestoreProjectionRebuilder** (15 checks)
4. **Rebuild Strategies** (10 checks)
5. **Progress Tracking** (10 checks)
6. **Admin UI Components** (10 checks)
7. **Test Coverage** (5 checks)

---

## Success Criteria

- [ ] ProjectionRebuilder interface defined
- [ ] FirestoreProjectionRebuilder implements full/incremental/selective rebuilds
- [ ] Rebuild clears existing projections (full strategy)
- [ ] Progress tracking works with callbacks
- [ ] Error handling (skip vs abort) implemented
- [ ] Admin UI allows triggering rebuilds
- [ ] Real-time progress display in UI
- [ ] Rebuild job persistence for audit trail
- [ ] Performance: 1000+ events/sec on local Firestore
- [ ] 70+ validation checks pass at 100%
- [ ] Test coverage ≥85%

---

## Performance Benchmarks

| Metric | Target | Notes |
|--------|--------|-------|
| Rebuild throughput | >1000 events/sec | Local Firestore |
| Batch processing | 100 events/batch | Configurable |
| Memory usage | <500MB | For 10K events |
| UI responsiveness | <100ms updates | Progress callback |

---

## Next Steps - Phase 3

**Phase 3: Authorization & Multi-Workspace Security**

**Objectives**:
1. Membership aggregate implementation
2. Query model + security rules
3. Permission-aware command guard
4. Multi-workspace isolation

**Estimated Effort**: 12-16 hours

---

## References

- [Phase 2 Overview](./PHASE_2_CROSS_AGGREGATE.md)
- [Phase 2C: Event Versioning](./PHASE_2C_EVENT_VERSIONING.md)
- [Phase 3: Authorization (Next)](./PHASE_3_AUTHORIZATION.md)

---

**Phase 2D Status**: 📋 Planned - Ready for Implementation  
**Phase 2 Complete After**: Phase 2D implementation

// END OF FILE
