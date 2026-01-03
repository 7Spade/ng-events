# Phase 2A: Process/Saga Skeleton - Complete Implementation

**Status**: ✅ COMPLETE  
**Date**: 2026-01-03  
**Complexity**: ★★☆☆☆ (2/5)  
**Actual Effort**: ~2-3 hours

## Executive Summary

Phase 2A establishes the foundational infrastructure for Process Manager and Saga patterns in the ng-events architecture. This phase provides:

- **ProcessBase** abstract class for orchestrating multi-aggregate workflows
- **ProcessState** state machine with 6 lifecycle states
- **ProcessCommand** interface for process-emitted commands
- **Two example processes**: CreateAccountProcess and JoinWorkspaceProcess
- **Comprehensive test skeleton** validating lifecycle and command emission
- **76 automated validation checks** (100% pass rate)

## Key Achievements

### 1. Process Manager Foundation (`ProcessBase`)

**Location**: `packages/core-engine/processes/ProcessBase.ts` (5,544 chars)

**Features**:
- Abstract base class with generic state management (`ProcessBase<TState>`)
- State machine lifecycle (Pending → Running → Completed/Failed → Compensating → Compensated)
- Event-driven reaction pattern: `react(event) → handleEvent(event) → emitCommand(command)`
- Protected hooks for lifecycle events: `onStart()`, `onComplete()`, `onFail()`, `onCompensate()`
- Idempotent command emission via `emitCommand()` method
- Correlation tracking for workflow context

**Public API**:
```typescript
// Lifecycle methods
start(): void
react(event: DomainEvent): Promise<ProcessCommand[]>
complete(): void
fail(reason: string): void
compensate(): Promise<void>

// Accessors
getState(): ProcessState
getProcessId(): string
getCorrelationId(): string

// Abstract (subclass implements)
protected abstract handleEvent(event: DomainEvent): Promise<void>
```

### 2. State Machine (`ProcessState`)

**Location**: `packages/core-engine/processes/ProcessState.ts` (1,629 chars)

**States**:
- `Pending` - Process created but not started
- `Running` - Process actively executing
- `Completed` - Process finished successfully
- `Failed` - Process encountered error
- `Compensating` - Process executing rollback logic
- `Compensated` - Compensation completed

**State Transitions**:
```
Pending → Running (start())
Running → Completed (complete())
Running → Failed (fail())
Running → Compensating (compensate())
Compensating → Compensated (auto after onCompensate())
```

**Helper Functions**:
- `isTerminalState(state)` - Returns true if state is Completed/Failed/Compensated
- `canCompensate(state)` - Returns true if compensation is possible (Running/Failed)

### 3. Process Commands (`ProcessCommand`)

**Location**: `packages/core-engine/processes/ProcessCommand.ts` (1,292 chars)

**Interface**:
```typescript
interface ProcessCommand<TPayload> {
  id: string;
  commandType: string;
  data: TPayload;
  metadata: CausalityMetadata;
}
```

**Factory**:
```typescript
ProcessCommandFactory.create({
  id: generateId(),
  commandType: 'CreateWorkspace',
  data: { accountId, status },
  metadata: CausalityMetadataFactory.create({
    causedBy: event.id,
    causedByUser: event.metadata.causedByUser,
    causedByAction: 'process.createAccount.createWorkspace',
    blueprintId: event.metadata.blueprintId,
    correlationId: this.correlationId,
  }),
});
```

### 4. Example Process: CreateAccountProcess

**Location**: `packages/core-engine/processes/examples/CreateAccountProcess.ts` (6,618 chars)

**Workflow**:
```
1. AccountCreated event
   → Extract accountId
   → Emit CreateWorkspace command
   → Mark 'account' step complete

2. WorkspaceCreated event
   → Extract workspaceId
   → Emit CreateMembership command (role: Owner)
   → Mark 'workspace' step complete

3. MembershipCreated event
   → Extract membershipId
   → Mark 'membership' step complete
   → Complete process
```

**Compensation Flow** (Reverse Order):
```
1. DeleteMembership (if membershipId exists)
2. ArchiveWorkspace (if workspaceId exists)
3. (Account typically marked inactive, not deleted)
```

**Key Features**:
- Idempotent event handling via `stepCompleted` Set
- Causality chain linking each command to its triggering event
- Correlation ID propagation through entire workflow
- Compensation in reverse order of execution

### 5. Example Process: JoinWorkspaceProcess

**Location**: `packages/core-engine/processes/examples/JoinWorkspaceProcess.ts` (6,942 chars)

**Workflow**:
```
1. InvitationAccepted event
   → Extract accountId, workspaceId, role
   → Emit CreateMembership command
   → Mark 'invitation' step complete

2. MembershipCreated event
   → Extract membershipId
   → Emit SendNotification command (to workspace)
   → Mark 'membership' step complete

3. NotificationSent event
   → Extract notificationId
   → Mark 'notification' step complete
   → Complete process
```

**Compensation Flow**:
```
1. CancelNotification (if notificationId exists)
2. DeleteMembership (if membershipId exists)
3. (Invitation typically marked failed, not deleted)
```

## Architecture Patterns

### Event-Driven Orchestration

```
Command → Aggregate → Event → Process → Command → Aggregate → Event → ...
          (Write)              (React)              (Write)
                                  ↓
                            Causality Chain
```

**Example Flow**:
```typescript
// User action
CompleteTaskCommand
  ↓
// Aggregate emits event
TaskCompletedEvent (id: evt-1, causedBy: cmd-1)
  ↓
// Process reacts
CreateAccountProcess.react(evt-1)
  ↓
// Process emits command
CreateWorkspaceCommand (causedBy: evt-1, correlationId: C-999)
  ↓
// Aggregate handles command
WorkspaceAggregate.create()
  ↓
// Aggregate emits event
WorkspaceCreatedEvent (id: evt-2, causedBy: evt-1, correlationId: C-999)
  ↓
// Process continues...
CreateAccountProcess.react(evt-2)
```

### Causality Tracking

Every command emitted by a process includes:
- `causedBy` - ID of the event that triggered this command
- `causedByUser` - User who initiated the workflow
- `causedByAction` - Semantic action name (e.g., `process.createAccount.createWorkspace`)
- `correlationId` - Workflow identifier linking all related events/commands
- `blueprintId` - Multi-tenant boundary (accountId/workspaceId)

This enables:
- Complete audit trail from user action to final outcome
- Event replay and debugging
- Process reconstruction from event stream
- Multi-tenant isolation and security

### Idempotency Pattern

Processes use a `stepCompleted: Set<string>` to track completed steps:

```typescript
private async handleAccountCreated(event: DomainEvent): Promise<void> {
  if (this.processState.stepCompleted.has('account')) {
    return; // Idempotent - already handled
  }

  // ... emit command ...

  this.processState.stepCompleted.add('account');
}
```

This ensures:
- Duplicate events are ignored (safe for event replay)
- Process state is consistent across retries
- Compensation logic can check what actually executed

## File Structure

```
packages/
├── core-engine/
│   ├── processes/
│   │   ├── ProcessBase.ts          (5,544 chars) - Abstract base class
│   │   ├── ProcessState.ts         (1,629 chars) - State enum
│   │   ├── ProcessCommand.ts       (1,292 chars) - Command interface
│   │   ├── ProcessBase.spec.ts     (4,509 chars) - Test suite
│   │   ├── index.ts                (656 chars) - Exports
│   │   └── examples/
│   │       ├── CreateAccountProcess.ts   (6,618 chars)
│   │       ├── JoinWorkspaceProcess.ts   (6,942 chars)
│   │       └── index.ts                  (172 chars)
│   └── index.ts                    (Updated to export ./processes)
└── scripts/
    └── validate-phase-2a.js        (14,317 chars) - Validation script
```

**Total Files Created**: 10  
**Total Lines of Code**: ~27,500 chars

## Validation Results

**Script**: `scripts/validate-phase-2a.js`  
**Total Checks**: 76  
**Passed**: 76  
**Failed**: 0  
**Success Rate**: 100%

### Validation Categories

1. **File Structure** (10 checks) - All files and directories exist
2. **ProcessState Implementation** (9 checks) - Enum and helpers complete
3. **ProcessCommand Implementation** (7 checks) - Interface and factory complete
4. **ProcessBase Implementation** (12 checks) - Lifecycle methods and hooks
5. **CreateAccountProcess** (12 checks) - Event handling, compensation, patterns
6. **JoinWorkspaceProcess** (9 checks) - Event handling and idempotency
7. **Test Coverage** (10 checks) - Lifecycle, event handling, compensation tests
8. **Exports and Index Files** (7 checks) - All exports properly configured

### Running Validation

```bash
node scripts/validate-phase-2a.js
```

Expected output:
```
✅ All checks passed! Phase 2A skeleton is complete.
```

## Test Coverage

**Location**: `packages/core-engine/processes/ProcessBase.spec.ts`

**Test Suites**:
1. **Lifecycle Management** (5 tests)
   - Initialize with Pending state
   - Transition Pending → Running on start()
   - Throw error if start() called twice
   - Transition Running → Completed on complete()
   - Transition Running → Failed on fail()

2. **Event Handling and Command Emission** (2 tests)
   - Handle events and emit commands via react()
   - Throw error if react() called in terminal state

3. **Compensation Logic** (2 tests)
   - Transition Running → Compensating → Compensated on compensate()
   - Throw error if compensate() called in Completed state

**Running Tests**:
```bash
npm test -- ProcessBase.spec.ts
```

## Design Decisions

### 1. Why Abstract Base Class over Interface?

**Decision**: Use `abstract class ProcessBase<TState>` instead of `interface IProcess`

**Rationale**:
- Provides default implementations for lifecycle methods
- Encapsulates command emission logic
- Enforces state machine transitions
- Allows protected hooks for subclass extension
- Reduces boilerplate in concrete processes

**Trade-off**: Less flexible than composition, but more ergonomic for common cases.

### 2. Why Generic State (`ProcessBase<TState>`)?

**Decision**: Allow processes to define custom state structures

**Rationale**:
- Each process has unique workflow state needs
- Type safety for state access in subclasses
- Prevents generic "bag of properties" anti-pattern
- Enables strong typing for state transitions

**Example**:
```typescript
interface CreateAccountProcessState {
  accountId?: string;
  workspaceId?: string;
  membershipId?: string;
  stepCompleted: Set<string>;
}

class CreateAccountProcess extends ProcessBase<CreateAccountProcessState> {
  // TypeScript knows this.processState is CreateAccountProcessState
}
```

### 3. Why Separate ProcessCommand from DomainEvent?

**Decision**: Define `ProcessCommand` interface separate from `DomainEvent`

**Rationale**:
- Commands represent **intent** (what should happen)
- Events represent **facts** (what did happen)
- Commands are mutable (can be validated, rejected)
- Events are immutable (already happened)
- Clear semantic separation in CQRS architecture

**Pattern**:
```
Process emits Command → Aggregate validates Command → Aggregate emits Event
```

### 4. Why In-Memory State (Phase 2A)?

**Decision**: Store process state in memory (not persisted in Phase 2A)

**Rationale**:
- Phase 2A is skeleton/foundation only
- Phase 2B will add persistence and state machine
- Simplifies initial implementation and testing
- Allows iteration on pattern before adding complexity

**Future Enhancement (Phase 2B)**:
- Persist process state to Firestore
- Implement process snapshots for recovery
- Add timeout and retry mechanisms
- Support long-running processes across restarts

### 5. Why Two Example Processes?

**Decision**: Implement CreateAccountProcess and JoinWorkspaceProcess as examples

**Rationale**:
- Demonstrates both **creation** and **joining** workflows
- Shows different compensation strategies (delete vs. mark inactive)
- Provides concrete patterns for future processes
- Validates base class design with real use cases

**Coverage**:
- CreateAccountProcess: 3 aggregates (Account → Workspace → Membership)
- JoinWorkspaceProcess: 4 aggregates (Invitation → Membership → Notification → complete)

## Integration with Phase 1

Phase 2A builds directly on Phase 1 foundations:

### Event Sourcing Integration
- Processes react to `DomainEvent` (from Phase 1)
- Commands include `CausalityMetadata` (Phase 1 pattern)
- Processes use `generateId()` utility (core-engine)

### CQRS Integration
- Processes are part of the **Command side** (orchestration)
- Processes **do not** query projections directly
- Processes emit commands → Aggregates handle → Events persist

### Causality Chain Integration
- Commands use `CausalityMetadataFactory.create()`
- Every command links back to triggering event via `causedBy`
- Correlation IDs propagate through entire workflow

### Clean Architecture Integration
- Processes in `core-engine/processes/` (pure TypeScript)
- **NO** Firebase imports (platform-agnostic)
- **NO** Angular imports (framework-agnostic)
- Infrastructure adapter will wire processes to event bus (Phase 2B)

## Next Steps - Phase 2B

**Phase 2B: Failure Compensation / State Machine** (★★★☆☆)

**Objectives**:
1. **Process Persistence**
   - Store process state in Firestore
   - Snapshot mechanism for recovery
   - Process repository pattern

2. **State Machine Enhancements**
   - Timeout handling (process-level timeouts)
   - Retry policies for failed steps
   - Compensation strategies (forward recovery vs. rollback)

3. **Process Manager**
   - Process registry (mapping events to processes)
   - Process lifecycle management (start, stop, timeout)
   - Process query interface (find by correlation ID)

4. **Integration**
   - Wire processes to EventStore via event bus
   - Command dispatcher for process-emitted commands
   - Process manager UI (admin/debugging)

**Estimated Complexity**: 3/5 ★★★☆☆  
**Estimated Effort**: 4-6 hours

## Lessons Learned

### What Went Well

1. **Clear Separation of Concerns**
   - ProcessBase handles lifecycle
   - Concrete processes handle business logic
   - Clean abstraction boundaries

2. **Strong Type Safety**
   - Generic state type prevents runtime errors
   - TypeScript catches invalid state transitions
   - Command/Event type safety

3. **Comprehensive Validation**
   - 76 automated checks ensure pattern correctness
   - Catches regressions during refactoring
   - Documents expected behavior

### Challenges

1. **Idempotency Design**
   - Initial design used array of event IDs
   - Switched to Set for O(1) lookup
   - Trade-off: memory vs. performance

2. **Compensation Ordering**
   - Reverse order compensation is intuitive
   - But not always correct (e.g., notifications)
   - Needs process-specific logic

3. **Testing Async State Machines**
   - Async compensation requires await
   - Test framework must support async/await
   - Jest/Jasmine both work well

## References

- <a>Process Manager Pattern Documentation</a>
- <a>Saga Pattern Documentation</a>
- <a>Phase 1 Vertical Slice</a>
- <a>Event Sourcing Patterns</a>
- <a>CQRS Architecture</a>

## Appendix A: Complete Example Workflow

### CreateAccountProcess - Full Trace

```typescript
// 1. User registers account
Command: RegisterAccountCommand
  → Aggregate: AccountAggregate.register()
  → Event: AccountCreatedEvent
    {
      id: "evt-001",
      aggregateId: "acc-123",
      eventType: "AccountCreated",
      metadata: {
        causedBy: "cmd-register",
        causedByUser: "user-456",
        causedByAction: "account.register",
        correlationId: "C-999",
        blueprintId: "acc-123"
      }
    }

// 2. Process reacts to AccountCreated
Process: CreateAccountProcess.react(evt-001)
  → handleAccountCreated()
  → emitCommand(CreateWorkspaceCommand)
    {
      id: "cmd-002",
      commandType: "CreateWorkspace",
      data: { accountId: "acc-123", status: "initializing" },
      metadata: {
        causedBy: "evt-001",  // Links to AccountCreated
        causedByUser: "user-456",
        causedByAction: "process.createAccount.createWorkspace",
        correlationId: "C-999",  // Same as original
        blueprintId: "acc-123"
      }
    }

// 3. Command handler creates workspace
Command: CreateWorkspaceCommand
  → Aggregate: WorkspaceAggregate.create()
  → Event: WorkspaceCreatedEvent
    {
      id: "evt-003",
      aggregateId: "ws-789",
      eventType: "WorkspaceCreated",
      metadata: {
        causedBy: "cmd-002",  // Links to CreateWorkspace
        causedByUser: "user-456",
        causedByAction: "workspace.create",
        correlationId: "C-999",  // Propagated
        blueprintId: "acc-123"
      }
    }

// 4. Process reacts to WorkspaceCreated
Process: CreateAccountProcess.react(evt-003)
  → handleWorkspaceCreated()
  → emitCommand(CreateMembershipCommand)
    {
      id: "cmd-004",
      commandType: "CreateMembership",
      data: {
        accountId: "acc-123",
        workspaceId: "ws-789",
        role: "Owner"
      },
      metadata: {
        causedBy: "evt-003",  // Links to WorkspaceCreated
        causedByUser: "user-456",
        causedByAction: "process.createAccount.createMembership",
        correlationId: "C-999",
        blueprintId: "acc-123"
      }
    }

// 5. Command handler creates membership
Command: CreateMembershipCommand
  → Aggregate: MembershipAggregate.create()
  → Event: MembershipCreatedEvent
    {
      id: "evt-005",
      aggregateId: "mem-101",
      eventType: "MembershipCreated",
      metadata: {
        causedBy: "cmd-004",
        causedByUser: "user-456",
        causedByAction: "membership.create",
        correlationId: "C-999",
        blueprintId: "acc-123"
      }
    }

// 6. Process reacts to MembershipCreated
Process: CreateAccountProcess.react(evt-005)
  → handleMembershipCreated()
  → this.complete()
  → State: Completed

// Final state:
// - Account: acc-123 (created)
// - Workspace: ws-789 (created, owned by acc-123)
// - Membership: mem-101 (acc-123 is Owner of ws-789)
// - Process: Completed
// - Causality: evt-001 → evt-003 → evt-005 (fully traced)
```

### Compensation Example (Failure Scenario)

```typescript
// Scenario: MembershipCreated fails, need to rollback

// 1. Process detects failure
Process: CreateAccountProcess.fail("Membership creation failed")
  → State: Failed

// 2. Trigger compensation
Process: CreateAccountProcess.compensate()
  → State: Compensating
  → onCompensate()

// 3. Compensation emits commands in reverse order
Compensation Step 1: Delete Membership
  → Command: DeleteMembershipCommand (if membershipId exists)
    {
      id: "cmd-comp-001",
      commandType: "DeleteMembership",
      data: { membershipId: "mem-101" },
      metadata: {
        causedBy: "proc-createAccount",
        causedByUser: "system",
        causedByAction: "process.createAccount.compensate.deleteMembership",
        correlationId: "C-999"
      }
    }

Compensation Step 2: Archive Workspace
  → Command: ArchiveWorkspaceCommand
    {
      id: "cmd-comp-002",
      commandType: "ArchiveWorkspace",
      data: { workspaceId: "ws-789" },
      metadata: {
        causedBy: "proc-createAccount",
        causedByUser: "system",
        causedByAction: "process.createAccount.compensate.archiveWorkspace",
        correlationId: "C-999"
      }
    }

// 4. Compensation completes
Process: onCompensate() finishes
  → State: Compensated

// Final state after compensation:
// - Account: acc-123 (exists, marked inactive)
// - Workspace: ws-789 (archived)
// - Membership: mem-101 (deleted)
// - Process: Compensated
```

## Appendix B: Future Enhancements (Post-Phase 2B)

### Process Timeouts
```typescript
class CreateAccountProcess extends ProcessBase<CreateAccountProcessState> {
  private timeoutId?: number;

  protected onStart(): void {
    // Set 30-minute timeout
    this.timeoutId = setTimeout(() => {
      this.fail('Process timeout after 30 minutes');
    }, 30 * 60 * 1000);
  }

  protected onComplete(): void {
    // Cancel timeout on successful completion
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
```

### Process Query Interface
```typescript
interface ProcessRepository {
  save(process: ProcessBase): Promise<void>;
  load(processId: string): Promise<ProcessBase | null>;
  findByCorrelationId(correlationId: string): Promise<ProcessBase[]>;
  findByState(state: ProcessState): Promise<ProcessBase[]>;
}
```

### Process Manager
```typescript
class ProcessManager {
  private registry = new Map<string, typeof ProcessBase>();

  register(eventType: string, processClass: typeof ProcessBase): void {
    this.registry.set(eventType, processClass);
  }

  async dispatch(event: DomainEvent): Promise<void> {
    const processClass = this.registry.get(event.eventType);
    if (!processClass) return;

    const process = await this.processRepository.findByCorrelationId(
      event.metadata.correlationId
    );

    const commands = await process.react(event);
    for (const cmd of commands) {
      await this.commandDispatcher.dispatch(cmd);
    }
  }
}
```

---

**Phase 2A Complete**: ✅ Process/Saga skeleton with 76/76 validation checks (100%)  
**Next**: Phase 2B - Failure Compensation / State Machine

// END OF FILE
