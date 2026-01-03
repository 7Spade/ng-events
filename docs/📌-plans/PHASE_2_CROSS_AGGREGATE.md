# Phase 2: Cross-Aggregate Process & Saga Orchestration

**Status**: 🚧 In Progress (2A Complete, 2B-2D Pending)  
**Date**: 2026-01-03  
**Total Complexity**: ★★★☆☆ (15/25 points)  
**Estimated Duration**: 16-22 hours

## Executive Summary

Phase 2 extends the single-aggregate vertical slice from Phase 1 to handle **cross-aggregate workflows** using Process Managers and Sagas. This phase introduces orchestration patterns for long-running business processes that span multiple aggregates, with proper failure compensation and eventual consistency.

### Key Objectives

1. **Process Orchestration**: Coordinate workflows across Account → Workspace → Membership → ModuleRegistry
2. **Failure Compensation**: Implement rollback/forward recovery for failed workflows
3. **Event Versioning**: Support schema evolution with upcasters for backward compatibility
4. **Projection Rebuild**: Enable projection reconstruction from event streams

### Phase 2 Sub-Phases

| Phase | Focus | Complexity | Status |
|-------|-------|-----------|---------|
| **2A** | Process/Saga Skeleton | ★★☆☆☆ (2/5) | ✅ Complete |
| **2B** | Failure Compensation & State Machine | ★★★☆☆ (3/5) | 📋 Planned |
| **2C** | Event Versioning & Upcaster | ★★★☆☆ (3/5) | 📋 Planned |
| **2D** | Projection Rebuild Flow | ★★★★☆ (4/5) | 📋 Planned |

**Total**: 12/20 complexity points, 3/4 phases remaining

---

## Why Phase 2 Now?

**Phase 1 Foundation Complete** ✅:
- Single aggregate (Workspace) fully operational
- Event Sourcing pattern validated
- CQRS separation working
- Multi-tenant isolation enforced
- E2E testing infrastructure ready

**Phase 2 Requirements** 🎯:
- Real-world workflows span multiple aggregates
- Account creation requires Workspace + Membership setup
- Failures need graceful compensation
- Events evolve over time (versioning needed)
- Projections must be rebuildable

**Business Value**:
```
Without Phase 2:
❌ Manual coordination between aggregates
❌ No automated rollback on failures
❌ Breaking changes when events evolve
❌ Cannot rebuild projections if corrupted

With Phase 2:
✅ Automated workflow orchestration
✅ Automatic compensation on failures
✅ Backward-compatible event evolution
✅ Self-healing projection rebuilds
```

---

## Phase 2A: Process/Saga Skeleton ✅ COMPLETE

**Complexity**: ★★☆☆☆ (2/5)  
**Duration**: 2-3 hours  
**Status**: ✅ Complete

### Achievements

1. **ProcessBase Abstract Class**
   - Lifecycle state machine (Pending → Running → Completed/Failed → Compensating → Compensated)
   - Event-driven orchestration via `react(event: DomainEvent)`
   - Command emission with causality tracking
   - Protected hooks for lifecycle events

2. **ProcessState Enum**
   - 6 states with helper functions (`isTerminalState`, `canCompensate`)
   - Clear state transitions documented

3. **ProcessCommand Interface**
   - Structured command format with metadata
   - Factory for command creation
   - Causality chain propagation

4. **Example Processes**
   - `CreateAccountProcess`: Account → Workspace → Membership
   - `JoinWorkspaceProcess`: Invitation → Membership → Notification
   - Both with compensation logic

### Key Patterns Established

```typescript
// Event-driven orchestration
Command → Aggregate → Event → Process.react() → Command → ...

// Causality tracking
event.metadata.causedBy → links to previous event
event.metadata.correlationId → workflow identifier

// Idempotent handling
stepCompleted: Set<string> → prevents duplicate processing
```

### Validation Results

- ✅ 76/76 automated checks passed (100%)
- ✅ Test suite covering lifecycle, events, compensation
- ✅ Two working example processes
- ✅ Documentation complete

**Details**: See [`PHASE_2A_PROCESS_SAGA.md`](./PHASE_2A_PROCESS_SAGA.md)

---

## Phase 2B: Failure Compensation & State Machine 📋 PLANNED

**Complexity**: ★★★☆☆ (3/5)  
**Duration**: 4-6 hours  
**Status**: 📋 Planned  
**Dependencies**: Phase 2A complete ✅

### Objectives

1. **Process Persistence**
   - Store process state in Firestore
   - Snapshot mechanism for recovery
   - Process repository pattern

2. **Advanced State Machine**
   - Timeout handling per process
   - Retry policies for failed steps
   - Compensation strategies (rollback vs forward recovery)

3. **Process Manager**
   - Process registry (event type → process mapping)
   - Process lifecycle management
   - Process query interface (by correlation ID, state, aggregate)

4. **Integration with Event Bus**
   - Wire processes to EventStore
   - Command dispatcher for process-emitted commands
   - Dead letter queue for failed commands

### Deliverables

**Files to Create**:
```
packages/
├── core-engine/
│   ├── processes/
│   │   ├── ProcessRepository.ts       (interface)
│   │   ├── ProcessManager.ts          (orchestration)
│   │   ├── ProcessTimeout.ts          (timeout handling)
│   │   ├── RetryPolicy.ts             (retry strategy)
│   │   └── CompensationStrategy.ts    (rollback patterns)
│   └── event-bus/
│       ├── EventBus.ts                (publish/subscribe)
│       └── CommandDispatcher.ts       (command routing)
└── platform-adapters/
    └── processes/
        └── FirestoreProcessRepository.ts  (persistence)
```

**Test Files**:
```
packages/core-engine/processes/
├── ProcessManager.spec.ts
├── ProcessTimeout.spec.ts
└── RetryPolicy.spec.ts
```

**Validation Script**:
```bash
scripts/validate-phase-2b.js  (60+ automated checks)
```

### Success Criteria

- [ ] Process state persisted to Firestore at `processes/{processType}/{processId}`
- [ ] Process resumes from snapshot after restart
- [ ] Timeout triggers compensation after configurable duration
- [ ] Retry policy executes N retries with exponential backoff
- [ ] Process Manager dispatches events to registered processes
- [ ] Command dispatcher routes process commands to handlers
- [ ] Dead letter queue captures failed commands for manual intervention
- [ ] 60+ validation checks pass at 100%

**Details**: See [`PHASE_2B_COMPENSATION.md`](./PHASE_2B_COMPENSATION.md)

---

## Phase 2C: Event Versioning & Upcaster 📋 PLANNED

**Complexity**: ★★★☆☆ (3/5)  
**Duration**: 4-6 hours  
**Status**: 📋 Planned  
**Dependencies**: Phase 2B complete

### Objectives

1. **Event Schema Versioning**
   - Version field in event data (`version: 1, 2, 3, ...`)
   - Backward-compatible serialization
   - Migration path documentation

2. **Event Upcaster**
   - Transform old event versions to current schema
   - Upcaster chain for multi-version migrations
   - Registration system for versioned events

3. **Schema Evolution Patterns**
   - Adding fields (non-breaking)
   - Renaming fields (breaking)
   - Removing fields (breaking)
   - Type changes (breaking)

4. **Testing & Validation**
   - Test old events replay correctly
   - Test upcaster transformations
   - Test mixed-version event streams

### Deliverables

**Files to Create**:
```
packages/
├── core-engine/
│   └── event-store/
│       ├── EventUpcaster.ts           (interface)
│       ├── EventVersionRegistry.ts    (version mapping)
│       └── EventMigration.ts          (migration helpers)
└── account-domain/
    └── workspace/
        └── events/
            ├── upcasters/
            │   ├── WorkspaceCreatedUpcaster_v1_to_v2.ts
            │   └── WorkspaceArchivedUpcaster_v1_to_v2.ts
            └── WorkspaceCreated.ts    (updated with v2 schema)
```

**Example Upcaster**:
```typescript
// V1: { ownerId, name, createdAt }
// V2: { ownerId, name, status, createdAt }

class WorkspaceCreatedUpcaster_v1_to_v2 implements EventUpcaster {
  fromVersion = 1;
  toVersion = 2;
  
  upcast(oldData: WorkspaceCreatedDataV1): WorkspaceCreatedDataV2 {
    return {
      ...oldData,
      status: 'initializing', // Add default for new field
    };
  }
}
```

**Test Files**:
```
packages/account-domain/workspace/events/__tests__/
├── WorkspaceCreatedUpcaster.spec.ts
└── MixedVersionReplay.spec.ts
```

**Validation Script**:
```bash
scripts/validate-phase-2c.js  (50+ automated checks)
```

### Success Criteria

- [ ] Event classes include version constant
- [ ] EventStore applies upcasters during deserialization
- [ ] Old events (v1) replay as current schema (v2+)
- [ ] Upcaster chain handles multi-step migrations (v1 → v2 → v3)
- [ ] Documentation for schema evolution best practices
- [ ] 50+ validation checks pass at 100%

**Details**: See [`PHASE_2C_EVENT_VERSIONING.md`](./PHASE_2C_EVENT_VERSIONING.md)

---

## Phase 2D: Projection Rebuild Flow 📋 PLANNED

**Complexity**: ★★★★☆ (4/5)  
**Duration**: 6-8 hours  
**Status**: 📋 Planned  
**Dependencies**: Phase 2C complete

### Objectives

1. **Projection Rebuild API**
   - Rebuild single projection from event stream
   - Rebuild all projections for aggregate type
   - Rebuild with filter (by date, user, workspace)

2. **Rebuild Strategies**
   - Full rebuild (delete + replay all events)
   - Incremental rebuild (from last checkpoint)
   - Parallel rebuild (multiple projections)

3. **Rebuild Monitoring**
   - Progress tracking (events processed / total)
   - Performance metrics (events/sec)
   - Error handling (skip vs abort)

4. **Admin UI Integration**
   - Angular admin page for rebuild operations
   - Real-time progress display
   - Rebuild history and logs

### Deliverables

**Files to Create**:
```
packages/
├── core-engine/
│   └── projections/
│       ├── ProjectionRebuilder.ts     (interface)
│       ├── RebuildStrategy.ts         (full/incremental)
│       ├── RebuildProgress.ts         (tracking)
│       └── RebuildMonitor.ts          (metrics)
├── platform-adapters/
│   └── projections/
│       ├── FirestoreProjectionRebuilder.ts
│       └── RebuildJobRepository.ts    (persistence)
└── ui-angular/
    └── src/app/admin/
        └── projection-rebuild/
            ├── projection-rebuild.component.ts
            ├── projection-rebuild.component.html
            └── projection-rebuild.service.ts
```

**Rebuild Process**:
```typescript
// Full rebuild example
const rebuilder = new FirestoreProjectionRebuilder();

// 1. Delete existing projection
await rebuilder.clear('workspace');

// 2. Replay all events
const progress = await rebuilder.rebuild('workspace', {
  strategy: 'full',
  onProgress: (processed, total) => {
    console.log(`Rebuilt ${processed}/${total} events`);
  },
});

// 3. Verify rebuild success
console.log(`Rebuild complete: ${progress.eventsProcessed} events in ${progress.durationMs}ms`);
```

**Test Files**:
```
packages/core-engine/projections/__tests__/
├── ProjectionRebuilder.spec.ts
├── RebuildStrategy.spec.ts
└── RebuildProgress.spec.ts

packages/platform-adapters/projections/__tests__/
└── FirestoreProjectionRebuilder.e2e.spec.ts
```

**Validation Script**:
```bash
scripts/validate-phase-2d.js  (70+ automated checks)
```

### Success Criteria

- [ ] Rebuild API can reconstruct any projection from events
- [ ] Full rebuild strategy deletes and replays all events
- [ ] Incremental rebuild resumes from last checkpoint
- [ ] Progress tracking shows real-time rebuild status
- [ ] Admin UI displays rebuild operations and history
- [ ] Error handling captures and logs failed events
- [ ] Performance benchmark: 1000+ events/sec on local Firestore
- [ ] 70+ validation checks pass at 100%

**Details**: See [`PHASE_2D_PROJECTION_REBUILD.md`](./PHASE_2D_PROJECTION_REBUILD.md)

---

## Phase 2 Architecture Overview

### Cross-Aggregate Workflow Pattern

```
User Action (Command)
    ↓
AccountAggregate.create()
    ↓
AccountCreatedEvent
    ↓
ProcessManager.dispatch(event)
    ↓
CreateAccountProcess.react(event)
    ↓
CreateWorkspaceCommand (emitted)
    ↓
WorkspaceAggregate.create()
    ↓
WorkspaceCreatedEvent
    ↓
CreateAccountProcess.react(event)
    ↓
CreateMembershipCommand (emitted)
    ↓
MembershipAggregate.create()
    ↓
MembershipCreatedEvent
    ↓
CreateAccountProcess.react(event)
    ↓
Process.complete()
```

### Failure Compensation Pattern

```
Process Running
    ↓
WorkspaceAggregate fails to create
    ↓
Process.fail("Workspace creation failed")
    ↓
Process.compensate()
    ↓
DeleteAccountCommand (reverse order)
    ↓
Account marked inactive
    ↓
Process.state = Compensated
```

### Event Versioning Pattern

```
EventStore.load(aggregateId)
    ↓
Read events: [WorkspaceCreatedV1, WorkspaceArchivedV1]
    ↓
EventUpcaster applies transformations
    ↓
[WorkspaceCreatedV2, WorkspaceArchivedV2]
    ↓
Workspace.fromEvents(upcastedEvents)
    ↓
Aggregate reconstructed with current schema
```

### Projection Rebuild Pattern

```
Admin triggers rebuild
    ↓
ProjectionRebuilder.clear('workspace')
    ↓
EventStore.getEvents('Workspace')
    ↓
Replay events through ProjectionBuilder
    ↓
WorkspaceProjectionBuilder.handleEvent(event)
    ↓
Projection updated in Firestore
    ↓
Progress: 1000/1000 events (100%)
```

---

## Phase 2 Success Criteria

### Overall Phase 2 Completion

- [ ] All 4 sub-phases (2A-2D) complete
- [ ] Process orchestration validated across 3+ aggregates
- [ ] Failure compensation tested with rollback scenarios
- [ ] Event versioning tested with v1 → v2 → v3 migrations
- [ ] Projection rebuild tested with full and incremental strategies
- [ ] 250+ total validation checks pass at 100%
- [ ] E2E test suite covers all Phase 2 patterns
- [ ] Documentation complete for all sub-phases

### Integration with Phase 1

- [ ] Workspace aggregate events support versioning
- [ ] Projection rebuild works with existing Workspace projections
- [ ] Process Manager integrates with existing EventStore
- [ ] Command dispatcher routes to existing command handlers

---

## Dependencies & Prerequisites

**Phase 1 Requirements** (All Complete ✅):
- Phase 1A: Value Objects ✅
- Phase 1B: Aggregate with Event Sourcing ✅
- Phase 1C: Domain Events with Serialization ✅
- Phase 1D: Infrastructure Layer (EventStore + Repository) ✅
- Phase 1E: Projection Layer ✅
- Phase 1F: Angular Services ✅
- Phase 1G: E2E Validation and Testing ✅

**External Dependencies**:
- Firebase Firestore SDK (for persistence)
- RxJS (for event streams)
- TypeScript 5.x (for type safety)

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Process state corruption | High | Snapshot + audit trail |
| Event upcaster bugs | High | Comprehensive test coverage |
| Projection rebuild failures | Medium | Retry + error logging |
| Performance degradation | Medium | Batch processing + indexing |
| Complexity explosion | Medium | Clear separation of concerns |

---

## Next Steps

**Immediate** (Phase 2B):
1. Review Phase 2B detailed plan
2. Implement process persistence
3. Add timeout and retry mechanisms
4. Wire processes to event bus
5. Create validation script

**After Phase 2 Complete**:
- **Phase 3**: Authorization, multi-workspace, security model
- **Phase 4**: Platform operability and monitoring
- **Phase 5**: Production-grade scaling and developer experience

---

## References

- [Phase 1 Vertical Slice Overview](../../PHASE_1_VERTICAL_SLICE.md)
- [Phase 2A: Process/Saga Skeleton](./PHASE_2A_PROCESS_SAGA.md)
- [Phase 2B: Compensation (Planned)](./PHASE_2B_COMPENSATION.md)
- [Phase 2C: Event Versioning (Planned)](./PHASE_2C_EVENT_VERSIONING.md)
- [Phase 2D: Projection Rebuild (Planned)](./PHASE_2D_PROJECTION_REBUILD.md)
- [Workspace Implementation Plan](../../WORKSPACE_IMPLEMENTATION_PLAN.md)
- [Event Sourcing Patterns](../02-paradigm/)
- [Process Manager Pattern](../05-process-layer/)

---

**Phase 2 Status**: 🚧 25% Complete (2A done, 2B-2D pending)  
**Next**: Phase 2B - Failure Compensation & State Machine

// END OF FILE
