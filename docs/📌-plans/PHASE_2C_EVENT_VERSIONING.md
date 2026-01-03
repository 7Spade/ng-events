# Phase 2C: Event Versioning & Upcaster

**Status**: 📋 Planned  
**Date**: 2026-01-03  
**Complexity**: ★★★☆☆ (3/5)  
**Estimated Duration**: 4-6 hours  
**Dependencies**: Phase 2B Complete

## Executive Summary

Phase 2C implements **event schema versioning** and **event upcasters** to support backward-compatible evolution of domain events over time. This enables the system to handle old event versions during replay while maintaining a single current schema in aggregates.

### Why Event Versioning?

**The Problem** ❌:
```
Time T0: WorkspaceCreated event stored with schema v1
  { ownerId, name, createdAt }

Time T1: Business requirement changes, need "status" field
  New event schema v2: { ownerId, name, status, createdAt }

Time T2: Replay events to reconstruct aggregate
  Old events (v1) incompatible with current schema (v2)
  → Aggregate reconstruction fails
  → Data loss or errors
```

**The Solution** ✅:
```
Time T2: Replay with Upcaster
  1. EventStore reads old event (v1)
  2. Upcaster detects version = 1
  3. Upcaster transforms v1 → v2 (adds default status)
  4. Aggregate receives v2 event
  → Aggregate reconstruction succeeds
  → Backward compatibility maintained
```

### Key Benefits

1. **No Data Migration Required**: Old events stay as-is in storage
2. **Backward Compatibility**: System handles all event versions
3. **Continuous Evolution**: Add fields, rename, refactor without breaking
4. **Safe Deployments**: New code reads old events transparently
5. **Audit Trail Intact**: Original events preserved for compliance

---

## Architecture Overview

### Event Versioning Flow

```
┌────────────────────────────────────────────────────────────┐
│                    EventStore.getEvents()                   │
│                 Retrieve events for aggregate               │
└──────────────┬─────────────────────────────────────────────┘
               ↓
┌────────────────────────────────────────────────────────────┐
│             Raw Events from Firestore                       │
│  [                                                          │
│    { eventType: "WorkspaceCreated", version: 1, ... },     │
│    { eventType: "WorkspaceArchived", version: 1, ... },    │
│    { eventType: "WorkspaceCreated", version: 2, ... }      │
│  ]                                                          │
└──────────────┬─────────────────────────────────────────────┘
               ↓
┌────────────────────────────────────────────────────────────┐
│              EventVersionRegistry                           │
│       Determine current version for each event type         │
│       WorkspaceCreated: current = v2                        │
│       WorkspaceArchived: current = v1                       │
└──────────────┬─────────────────────────────────────────────┘
               ↓
┌────────────────────────────────────────────────────────────┐
│              EventUpcaster Chain                            │
│                                                             │
│  For each event:                                            │
│    if (event.version < currentVersion)                      │
│      Apply upcaster: v1 → v2 → v3 → ... → current          │
│    else                                                     │
│      No transformation needed                               │
└──────────────┬─────────────────────────────────────────────┘
               ↓
┌────────────────────────────────────────────────────────────┐
│              Upcasted Events (Current Schema)               │
│  [                                                          │
│    { eventType: "WorkspaceCreated", version: 2, ... },     │
│    { eventType: "WorkspaceArchived", version: 1, ... },    │
│    { eventType: "WorkspaceCreated", version: 2, ... }      │
│  ]                                                          │
└──────────────┬─────────────────────────────────────────────┘
               ↓
┌────────────────────────────────────────────────────────────┐
│                Aggregate.fromEvents()                       │
│           Reconstruct aggregate with current schema         │
│              All events now compatible                      │
└────────────────────────────────────────────────────────────┘
```

---

## Component 1: Event Version Metadata

### Versioned Event Interface

**Location**: `packages/core-engine/events/DomainEvent.ts` (update)

```typescript
/**
 * Domain event with version metadata.
 * All events must include version for schema evolution.
 */
export interface DomainEvent<TData = any> {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;  // ← NEW: Event schema version
  data: TData;
  metadata: CausalityMetadata;
  occurredAt: string;
}
```

### Versioned Event Pattern

**Example**: `packages/account-domain/workspace/events/WorkspaceCreated.ts` (updated)

```typescript
// V1 Schema (original)
interface WorkspaceCreatedDataV1 {
  version: 1;
  ownerId: string;
  name: string;
  createdAt: string;
}

// V2 Schema (added status field)
interface WorkspaceCreatedDataV2 {
  version: 2;
  ownerId: string;
  name: string;
  status: 'initializing' | 'active' | 'suspended';  // NEW FIELD
  createdAt: string;
}

// Current schema (always latest)
export type WorkspaceCreatedData = WorkspaceCreatedDataV2;

/**
 * WorkspaceCreated domain event.
 * Current version: 2
 */
export class WorkspaceCreatedEvent implements DomainEvent<WorkspaceCreatedData> {
  // Version constant
  static readonly CURRENT_VERSION = 2;
  
  private constructor(
    public readonly id: string,
    public readonly aggregateId: string,
    public readonly aggregateType: string,
    public readonly eventType: string,
    public readonly version: number,
    public readonly data: WorkspaceCreatedData,
    public readonly metadata: CausalityMetadata,
    public readonly occurredAt: string
  ) {}
  
  static create(params: {
    aggregateId: string;
    data: Omit<WorkspaceCreatedData, 'version'>;
    metadata: CausalityMetadata;
  }): WorkspaceCreatedEvent {
    return new WorkspaceCreatedEvent(
      generateId(),
      params.aggregateId,
      'Workspace',
      'WorkspaceCreated',
      WorkspaceCreatedEvent.CURRENT_VERSION,  // Always use current version
      { ...params.data, version: WorkspaceCreatedEvent.CURRENT_VERSION },
      params.metadata,
      new Date().toISOString()
    );
  }
  
  toData(): WorkspaceCreatedData {
    return {
      version: this.version,
      ...this.data,
    };
  }
  
  static fromData(
    id: string,
    aggregateId: string,
    data: WorkspaceCreatedData | WorkspaceCreatedDataV1,  // Accept old versions
    metadata: CausalityMetadata,
    occurredAt: string
  ): WorkspaceCreatedEvent {
    // Note: Upcaster will transform old data before this is called
    return new WorkspaceCreatedEvent(
      id,
      aggregateId,
      'Workspace',
      'WorkspaceCreated',
      data.version,
      data as WorkspaceCreatedData,
      metadata,
      occurredAt
    );
  }
}
```

---

## Component 2: Event Upcaster Interface

### EventUpcaster Interface

**Location**: `packages/core-engine/event-store/EventUpcaster.ts`

```typescript
/**
 * Event upcaster transforms old event versions to current schema.
 * Implements single-step transformation (e.g., v1 → v2).
 */
export interface EventUpcaster<TOldData = any, TNewData = any> {
  /**
   * Source version (what this upcaster transforms FROM).
   */
  readonly fromVersion: number;
  
  /**
   * Target version (what this upcaster transforms TO).
   */
  readonly toVersion: number;
  
  /**
   * Event type this upcaster applies to.
   */
  readonly eventType: string;
  
  /**
   * Transform old event data to new schema.
   * Must be pure function (no side effects).
   */
  upcast(oldData: TOldData): TNewData;
}

/**
 * Example WorkspaceCreated upcaster (v1 → v2).
 */
export class WorkspaceCreatedUpcaster_v1_to_v2 implements EventUpcaster<WorkspaceCreatedDataV1, WorkspaceCreatedDataV2> {
  readonly fromVersion = 1;
  readonly toVersion = 2;
  readonly eventType = 'WorkspaceCreated';
  
  upcast(oldData: WorkspaceCreatedDataV1): WorkspaceCreatedDataV2 {
    return {
      version: 2,
      ownerId: oldData.ownerId,
      name: oldData.name,
      status: 'initializing',  // Default value for new field
      createdAt: oldData.createdAt,
    };
  }
}
```

### Upcaster Chain Pattern

For multi-step migrations (v1 → v2 → v3):

```typescript
/**
 * Upcaster chain applies multiple transformations in sequence.
 */
export class UpcasterChain {
  /**
   * Apply upcasters from source version to target version.
   * Automatically chains intermediate upcasters.
   */
  upcast<TData>(
    eventType: string,
    data: any,
    fromVersion: number,
    toVersion: number,
    upcasters: EventUpcaster[]
  ): TData {
    let currentData = data;
    let currentVersion = fromVersion;
    
    while (currentVersion < toVersion) {
      // Find upcaster for next step
      const nextUpcaster = upcasters.find(
        u => u.eventType === eventType &&
             u.fromVersion === currentVersion &&
             u.toVersion === currentVersion + 1
      );
      
      if (!nextUpcaster) {
        throw new Error(
          `No upcaster found for ${eventType} v${currentVersion} → v${currentVersion + 1}`
        );
      }
      
      // Apply transformation
      currentData = nextUpcaster.upcast(currentData);
      currentVersion++;
    }
    
    return currentData as TData;
  }
}
```

---

## Component 3: Event Version Registry

### EventVersionRegistry Interface

**Location**: `packages/core-engine/event-store/EventVersionRegistry.ts`

```typescript
/**
 * Registry maps event types to their current versions and upcasters.
 * Centralized management of event schema evolution.
 */
export class EventVersionRegistry {
  private currentVersions = new Map<string, number>();
  private upcasters = new Map<string, EventUpcaster[]>();
  
  /**
   * Register current version for event type.
   */
  registerVersion(eventType: string, version: number): void {
    this.currentVersions.set(eventType, version);
  }
  
  /**
   * Register upcaster for event type.
   * Upcasters stored in sorted order (v1→v2, v2→v3, ...).
   */
  registerUpcaster(upcaster: EventUpcaster): void {
    if (!this.upcasters.has(upcaster.eventType)) {
      this.upcasters.set(upcaster.eventType, []);
    }
    
    this.upcasters.get(upcaster.eventType)!.push(upcaster);
    
    // Sort by fromVersion for chain application
    this.upcasters.get(upcaster.eventType)!.sort((a, b) => a.fromVersion - b.fromVersion);
  }
  
  /**
   * Get current version for event type.
   */
  getCurrentVersion(eventType: string): number {
    const version = this.currentVersions.get(eventType);
    
    if (version === undefined) {
      throw new Error(`No version registered for event type: ${eventType}`);
    }
    
    return version;
  }
  
  /**
   * Get all upcasters for event type.
   */
  getUpcasters(eventType: string): EventUpcaster[] {
    return this.upcasters.get(eventType) || [];
  }
  
  /**
   * Check if event needs upcasting.
   */
  needsUpcast(eventType: string, eventVersion: number): boolean {
    const currentVersion = this.getCurrentVersion(eventType);
    return eventVersion < currentVersion;
  }
}
```

### Registry Configuration

**Location**: `packages/platform-adapters/event-store/EventVersionConfiguration.ts`

```typescript
import { EventVersionRegistry } from '@core-engine/event-store/EventVersionRegistry';
import { WorkspaceCreatedEvent } from '@account-domain/workspace/events/WorkspaceCreated';
import { WorkspaceCreatedUpcaster_v1_to_v2 } from '@account-domain/workspace/events/upcasters/WorkspaceCreatedUpcaster_v1_to_v2';

/**
 * Configure event version registry.
 * Called during application initialization.
 */
export function configureEventVersions(registry: EventVersionRegistry): void {
  // Register current versions
  registry.registerVersion('WorkspaceCreated', WorkspaceCreatedEvent.CURRENT_VERSION);
  registry.registerVersion('WorkspaceArchived', 1);  // Still on v1
  
  // Register upcasters
  registry.registerUpcaster(new WorkspaceCreatedUpcaster_v1_to_v2());
  
  // Add more registrations as events evolve...
}
```

---

## Component 4: EventStore Integration

### FirestoreEventStore with Upcasting

**Location**: `packages/platform-adapters/event-store/FirestoreEventStore.ts` (update)

```typescript
import { EventStore } from '@core-engine/event-store/EventStore';
import { EventVersionRegistry } from '@core-engine/event-store/EventVersionRegistry';
import { UpcasterChain } from '@core-engine/event-store/UpcasterChain';

/**
 * Firestore EventStore with automatic event upcasting.
 */
export class FirestoreEventStore implements EventStore {
  private upcasterChain = new UpcasterChain();
  
  constructor(
    private readonly firestore: Firestore,
    private readonly versionRegistry: EventVersionRegistry
  ) {}
  
  async getEvents(
    aggregateType: string,
    aggregateId: string
  ): Promise<DomainEvent[]> {
    // 1. Retrieve raw events from Firestore
    const eventsRef = collection(
      this.firestore,
      'events',
      aggregateType,
      aggregateId,
      'events'
    );
    
    const querySnapshot = await getDocs(
      query(eventsRef, orderBy('occurredAt', 'asc'))
    );
    
    // 2. Deserialize and upcast events
    const events: DomainEvent[] = [];
    
    for (const docSnap of querySnapshot.docs) {
      const rawData = docSnap.data();
      const eventType = rawData.eventType;
      const eventVersion = rawData.version || 1;  // Default to v1 if missing
      
      // 3. Check if upcasting needed
      const currentVersion = this.versionRegistry.getCurrentVersion(eventType);
      
      let eventData = rawData.data;
      
      if (eventVersion < currentVersion) {
        // Apply upcaster chain
        const upcasters = this.versionRegistry.getUpcasters(eventType);
        eventData = this.upcasterChain.upcast(
          eventType,
          eventData,
          eventVersion,
          currentVersion,
          upcasters
        );
      }
      
      // 4. Deserialize event with current schema
      const event = this.deserializeEvent(
        rawData.id,
        rawData.aggregateId,
        rawData.eventType,
        eventData,
        rawData.metadata,
        rawData.occurredAt
      );
      
      events.push(event);
    }
    
    return events;
  }
  
  private deserializeEvent(
    id: string,
    aggregateId: string,
    eventType: string,
    data: any,
    metadata: any,
    occurredAt: string
  ): DomainEvent {
    // Use event registry to find event class
    const eventClass = this.eventRegistry.get(eventType);
    
    if (!eventClass) {
      throw new Error(`Unknown event type: ${eventType}`);
    }
    
    // Call fromData with upcasted data
    return eventClass.fromData(id, aggregateId, data, metadata, occurredAt);
  }
}
```

---

## Schema Evolution Patterns

### Pattern 1: Adding Optional Field (Non-Breaking)

**Before (v1)**:
```typescript
interface TaskCreatedDataV1 {
  version: 1;
  title: string;
  assigneeId: string;
  createdAt: string;
}
```

**After (v2)** - Add priority field:
```typescript
interface TaskCreatedDataV2 {
  version: 2;
  title: string;
  assigneeId: string;
  priority?: 'low' | 'medium' | 'high';  // NEW: Optional field
  createdAt: string;
}
```

**Upcaster**:
```typescript
class TaskCreatedUpcaster_v1_to_v2 implements EventUpcaster {
  fromVersion = 1;
  toVersion = 2;
  eventType = 'TaskCreated';
  
  upcast(oldData: TaskCreatedDataV1): TaskCreatedDataV2 {
    return {
      version: 2,
      ...oldData,
      priority: undefined,  // Leave optional field undefined
    };
  }
}
```

### Pattern 2: Adding Required Field (Breaking - Needs Default)

**Before (v1)**:
```typescript
interface AccountCreatedDataV1 {
  version: 1;
  email: string;
  displayName: string;
}
```

**After (v2)** - Add accountType (required):
```typescript
interface AccountCreatedDataV2 {
  version: 2;
  email: string;
  displayName: string;
  accountType: 'personal' | 'business';  // NEW: Required field
}
```

**Upcaster**:
```typescript
class AccountCreatedUpcaster_v1_to_v2 implements EventUpcaster {
  fromVersion = 1;
  toVersion = 2;
  eventType = 'AccountCreated';
  
  upcast(oldData: AccountCreatedDataV1): AccountCreatedDataV2 {
    return {
      version: 2,
      ...oldData,
      accountType: 'personal',  // Safe default for old events
    };
  }
}
```

### Pattern 3: Renaming Field (Breaking)

**Before (v1)**:
```typescript
interface PaymentProcessedDataV1 {
  version: 1;
  totalAmount: number;  // OLD NAME
  currency: string;
}
```

**After (v2)** - Rename to `amount`:
```typescript
interface PaymentProcessedDataV2 {
  version: 2;
  amount: number;  // NEW NAME
  currency: string;
}
```

**Upcaster**:
```typescript
class PaymentProcessedUpcaster_v1_to_v2 implements EventUpcaster {
  fromVersion = 1;
  toVersion = 2;
  eventType = 'PaymentProcessed';
  
  upcast(oldData: PaymentProcessedDataV1): PaymentProcessedDataV2 {
    return {
      version: 2,
      amount: oldData.totalAmount,  // Map old field to new field
      currency: oldData.currency,
    };
  }
}
```

### Pattern 4: Type Change (Breaking - Needs Conversion)

**Before (v1)** - Status as string:
```typescript
interface IssueCreatedDataV1 {
  version: 1;
  title: string;
  status: string;  // Any string value
}
```

**After (v2)** - Status as enum:
```typescript
type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface IssueCreatedDataV2 {
  version: 2;
  title: string;
  status: IssueStatus;  // Restricted to enum values
}
```

**Upcaster**:
```typescript
class IssueCreatedUpcaster_v1_to_v2 implements EventUpcaster {
  fromVersion = 1;
  toVersion = 2;
  eventType = 'IssueCreated';
  
  upcast(oldData: IssueCreatedDataV1): IssueCreatedDataV2 {
    // Map legacy status strings to new enum
    const statusMap: Record<string, IssueStatus> = {
      'new': 'open',
      'active': 'in_progress',
      'done': 'resolved',
      'archived': 'closed',
    };
    
    const mappedStatus = statusMap[oldData.status.toLowerCase()] || 'open';
    
    return {
      version: 2,
      title: oldData.title,
      status: mappedStatus,
    };
  }
}
```

---

## Testing Strategy

### Unit Tests - Event Upcasters

**Location**: `packages/account-domain/workspace/events/__tests__/WorkspaceCreatedUpcaster.spec.ts`

```typescript
import { WorkspaceCreatedUpcaster_v1_to_v2 } from '../upcasters/WorkspaceCreatedUpcaster_v1_to_v2';

describe('WorkspaceCreatedUpcaster_v1_to_v2', () => {
  let upcaster: WorkspaceCreatedUpcaster_v1_to_v2;
  
  beforeEach(() => {
    upcaster = new WorkspaceCreatedUpcaster_v1_to_v2();
  });
  
  it('should transform v1 to v2 with default status', () => {
    const v1Data = {
      version: 1,
      ownerId: 'acc-123',
      name: 'Test Workspace',
      createdAt: '2026-01-01T00:00:00Z',
    };
    
    const v2Data = upcaster.upcast(v1Data);
    
    expect(v2Data).toEqual({
      version: 2,
      ownerId: 'acc-123',
      name: 'Test Workspace',
      status: 'initializing',  // Default added
      createdAt: '2026-01-01T00:00:00Z',
    });
  });
  
  it('should preserve all original fields', () => {
    const v1Data = {
      version: 1,
      ownerId: 'acc-456',
      name: 'Another Workspace',
      createdAt: '2026-01-02T12:00:00Z',
    };
    
    const v2Data = upcaster.upcast(v1Data);
    
    expect(v2Data.ownerId).toBe(v1Data.ownerId);
    expect(v2Data.name).toBe(v1Data.name);
    expect(v2Data.createdAt).toBe(v1Data.createdAt);
  });
});
```

### Integration Tests - Mixed Version Replay

**Location**: `packages/account-domain/workspace/__tests__/MixedVersionReplay.e2e.spec.ts`

```typescript
import { FirestoreEventStore } from '@platform-adapters/event-store/FirestoreEventStore';
import { Workspace } from '../aggregates/Workspace';

describe('Workspace Aggregate - Mixed Version Event Replay', () => {
  it('should reconstruct aggregate from v1 and v2 events', async () => {
    // Setup: EventStore with version registry and upcasters
    const eventStore = new FirestoreEventStore(firestore, versionRegistry);
    
    // Simulate mixed version events in Firestore
    await eventStore.appendEvents([
      // Old v1 event
      {
        id: 'evt-001',
        aggregateId: 'ws-123',
        eventType: 'WorkspaceCreated',
        version: 1,
        data: {
          version: 1,
          ownerId: 'acc-789',
          name: 'Legacy Workspace',
          createdAt: '2026-01-01T00:00:00Z',
        },
        metadata: { /* ... */ },
        occurredAt: '2026-01-01T00:00:00Z',
      },
      // New v2 event
      {
        id: 'evt-002',
        aggregateId: 'ws-123',
        eventType: 'WorkspaceArchived',
        version: 1,
        data: {
          version: 1,
          archivedBy: 'acc-789',
          archivedAt: '2026-01-15T10:00:00Z',
        },
        metadata: { /* ... */ },
        occurredAt: '2026-01-15T10:00:00Z',
      },
    ]);
    
    // Load events (should upcast v1 → v2)
    const events = await eventStore.getEvents('Workspace', 'ws-123');
    
    // Verify upcasting occurred
    expect(events[0].version).toBe(2);  // v1 upcasted to v2
    expect(events[0].data.status).toBe('initializing');  // Default added
    
    // Reconstruct aggregate
    const workspace = Workspace.fromEvents(events);
    
    // Verify aggregate state correct
    expect(workspace.getId()).toBe('ws-123');
    expect(workspace.getOwnerId()).toBe('acc-789');
    expect(workspace.isArchived()).toBe(true);
  });
});
```

---

## File Structure Summary

```
packages/
├── core-engine/
│   └── event-store/
│       ├── EventUpcaster.ts                (new interface)
│       ├── EventVersionRegistry.ts         (new registry)
│       ├── UpcasterChain.ts                (new chain logic)
│       ├── EventUpcaster.spec.ts           (new tests)
│       ├── EventVersionRegistry.spec.ts    (new tests)
│       └── UpcasterChain.spec.ts           (new tests)
├── platform-adapters/
│   └── event-store/
│       ├── FirestoreEventStore.ts          (updated with upcasting)
│       ├── EventVersionConfiguration.ts    (new config)
│       └── FirestoreEventStore.spec.ts     (updated tests)
└── account-domain/
    └── workspace/
        └── events/
            ├── WorkspaceCreated.ts         (updated with versioning)
            ├── upcasters/
            │   ├── WorkspaceCreatedUpcaster_v1_to_v2.ts  (new)
            │   └── index.ts
            └── __tests__/
                ├── WorkspaceCreatedUpcaster.spec.ts       (new)
                └── MixedVersionReplay.e2e.spec.ts         (new)
```

**Total New Files**: 10  
**Updated Files**: 3

---

## Validation Script

**Location**: `scripts/validate-phase-2c.js`

### Validation Categories (50+ checks)

1. **File Structure** (8 checks)
2. **Event Version Metadata** (8 checks)
3. **EventUpcaster Interface** (8 checks)
4. **EventVersionRegistry** (8 checks)
5. **UpcasterChain** (8 checks)
6. **EventStore Integration** (10 checks)
7. **Test Coverage** (10 checks)

### Running Validation

```bash
node scripts/validate-phase-2c.js
```

Expected output:
```
✅ All 50+ checks passed! Phase 2C is complete.
```

---

## Success Criteria

- [ ] Event classes include version constant and field
- [ ] EventUpcaster interface defined with fromVersion, toVersion, eventType
- [ ] EventVersionRegistry manages current versions and upcasters
- [ ] UpcasterChain applies multi-step transformations
- [ ] FirestoreEventStore automatically upcasts during deserialization
- [ ] Old events (v1) successfully replay as current schema (v2+)
- [ ] Test coverage ≥85% for upcasters and chain
- [ ] Documentation includes schema evolution patterns
- [ ] 50+ validation checks pass at 100%

---

## Next Steps - Phase 2D

**Phase 2D: Projection Rebuild Flow** (★★★★☆)

**Objectives**:
1. Projection rebuild API
2. Full and incremental rebuild strategies
3. Progress monitoring
4. Admin UI integration

**Estimated Effort**: 6-8 hours

---

## References

- [Phase 2 Overview](./PHASE_2_CROSS_AGGREGATE.md)
- [Phase 2B: Compensation](./PHASE_2B_COMPENSATION.md)
- [Phase 2D: Projection Rebuild (Next)](./PHASE_2D_PROJECTION_REBUILD.md)
- [Event Sourcing Best Practices](../../02-paradigm/)

---

**Phase 2C Status**: 📋 Planned - Ready for Implementation  
**Next**: Phase 2D - Projection Rebuild Flow

// END OF FILE
