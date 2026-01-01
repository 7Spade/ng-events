# System Architecture

> **Layered structure from immutable events to observable UI.**

## Architecture Layers

```
┌─────────────────────────────────────┐
│      UI Layer (Angular 20)          │ ← Observes state via Signals
├─────────────────────────────────────┤
│   Projection Layer (Pure Functions) │ ← Derives views from events
├─────────────────────────────────────┤
│   Process Layer (Saga/PM)           │ ← Coordinates workflows
├─────────────────────────────────────┤
│   Decision Layer (Business Rules)   │ ← Validates commands
├─────────────────────────────────────┤
│   Event Layer (Immutable Facts)     │ ← Source of truth
├─────────────────────────────────────┤
│   Event Store (Firebase/Firestore)  │ ← Persistence
└─────────────────────────────────────┘
```

---

## Flow Diagram

### Write Flow (Command → Event)
```
User Action
  ↓
Command (StartTaskCommand)
  ↓
Decision Layer
  ├─ Load events for aggregate
  ├─ Validate business rules
  ├─ Approve or Reject
  ↓
Event (TaskStarted)
  ↓
Event Store (append)
  ↓
Projections (notify)
  ↓
UI Update (via Signal)
```

### Read Flow (Query → Projection)
```
UI Query (getTaskList)
  ↓
Projection Layer
  ├─ Load events from store
  ├─ Replay to derive state
  ├─ Return result
  ↓
UI Display (via async pipe)
```

---

## Layer Details

### 1. Event Layer (Immutable Facts)

**Responsibility**: Record immutable business facts

**Structure**:
```typescript
interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  causedBy: string[];
  correlationId: string;
  timestamp: number;
  data: T;
}
```

**Guarantees**:
- ✅ Append-only (no UPDATE/DELETE)
- ✅ Immutable after persistence
- ✅ Complete causal chain
- ✅ Chronological ordering

**Location**: `src/app/features/task/events/`

---

### 2. Decision Layer (Business Rules)

**Responsibility**: Validate commands and enforce business rules

**Pattern**:
```typescript
function decideStartTask(
  command: StartTaskCommand,
  events: TaskEvent[]
): Decision {
  const state = reconstructTask(events);
  
  if (state.status !== 'Todo') {
    return reject('Task must be Todo');
  }
  
  if (!state.assignee) {
    return reject('Task needs assignee');
  }
  
  return approve([{
    type: 'TaskStarted',
    aggregateId: command.taskId,
    causedBy: [lastEvent.id],
    data: { startedBy: command.userId }
  }]);
}
```

**Guarantees**:
- ✅ Pure functions (deterministic)
- ✅ Load events, not database
- ✅ Can reject with reasons
- ✅ Explicit causality

**Location**: `src/app/features/task/decisions/`

---

### 3. Projection Layer (Derived Views)

**Responsibility**: Derive multiple views from same event stream

**Pattern**:
```typescript
function projectTaskList(events: TaskEvent[]): TaskListItem[] {
  const tasks = new Map();
  
  for (const event of events) {
    switch (event.type) {
      case 'TaskCreated':
        tasks.set(event.aggregateId, {
          id: event.aggregateId,
          title: event.data.title,
          status: 'Todo'
        });
        break;
      case 'TaskStarted':
        tasks.get(event.aggregateId).status = 'Doing';
        break;
      case 'TaskCompleted':
        tasks.get(event.aggregateId).status = 'Done';
        break;
    }
  }
  
  return Array.from(tasks.values());
}
```

**Projection Types**:
- **List**: Flat task summary
- **Board**: Status columns (Todo/Doing/Done)
- **Why**: Event history with explanations
- **Discussion**: Comment threads
- **Comment**: Comment view
- **Attachment**: File list
- **Timeline**: Chronological event view

**Guarantees**:
- ✅ Pure functions (no side effects)
- ✅ Idempotent (same input → same output)
- ✅ No database writes
- ✅ Cacheable results

**Location**: `src/app/features/task/projections/`

---

### 4. Process Layer (Saga/Process Manager)

**Responsibility**: Coordinate long-running workflows

**Patterns**:

**Saga (Choreography)**:
```typescript
// Event-driven coordination
TaskStarted
  → Notify assignee
  → Update dashboard
  → Log audit trail
```

**Process Manager (Orchestration)**:
```typescript
class TaskLifecycleProcess {
  handle(event: TaskEvent) {
    if (event.type === 'TaskStarted') {
      this.emit(NotifyAssignee);
      this.scheduleTimeout(3, DaysLater);
    }
    if (event.type === 'TaskCompleted') {
      this.emit(NotifyReporter);
      this.closeProcess();
    }
  }
}
```

**Guarantees**:
- ✅ Event-driven coordination
- ✅ Compensation on failure
- ✅ Idempotent handlers

**Location**: `src/app/features/task/processes/`

---

### 5. UI Layer (Observation)

**Responsibility**: Display state, accept user commands

**Pattern (Angular 20 Signals)**:
```typescript
@Component({
  template: `
    @if (tasks$ | async; as tasks) {
      @for (task of tasks; track task.id) {
        <div>{{ task.title }} - {{ task.status }}</div>
      }
    }
  `
})
export class TaskListComponent {
  tasks$ = this.taskQuery.getTaskList();
  
  startTask(taskId: string) {
    this.taskCommand.startTask({ taskId, userId: this.currentUser.id });
  }
}
```

**Guarantees**:
- ✅ Read-only state observation
- ✅ Commands for mutations
- ✅ No direct state changes
- ✅ Reactive updates (async pipe)

**Location**: `src/app/features/task/ui/`

---

## Platform Layer (Infrastructure)

### Purpose
Provides **WHO (Account)** and **WHERE (Workspace)** - NOT business domain logic.

### Core Entities

**Account** (Business Actor)
- The **only** entity that triggers events
- Types: UserAccount, OrganizationAccount, BotAccount
- See: [Account Model](../04-core-model/05-account-model.md)

**Workspace** (Logical Container)
- Defines scope boundaries for operations
- Contains business modules (Task, Payment, etc.)
- See: [Workspace Model](../04-core-model/06-workspace-model.md)

### Platform Structure
```
platform-adapters/
├── account/
│   ├── events/              # AccountCreated, AccountActivated
│   ├── decisions/           # decideCreateAccount
│   └── projections/         # account-list, account-profile
├── workspace/
│   ├── events/              # WorkspaceCreated, AccountJoinedWorkspace
│   ├── decisions/           # decideCreateWorkspace
│   └── projections/         # workspace-list, workspace-members
└── auth/                    # Authentication (identity verification)
    └── firebase-auth/       # Returns AuthContext with accountId
```

### ⚠️ Platform Layer Responsibilities

**Platform DOES**:
- ✅ Verify identity (authentication)
- ✅ Provide Account and Workspace models
- ✅ Manage AccountWorkspaceMembership
- ✅ Multi-tenant data isolation

**Platform DOES NOT**:
- ❌ Make authorization decisions (that's Domain Policy)
- ❌ Contain business logic (that's Domain)
- ❌ Directly modify domain entities

---

## Cross-Layer Guarantees

### Immutability
- Events: Never modified after append
- Projections: Pure functions (no side effects)
- Decisions: Deterministic (same input → same output)

### Causality
- Every event has `causedBy`
- Replay respects causal order
- Conflict resolution via causality

### Traceability
- Complete audit trail (events)
- Root cause analysis (causal chains)
- Time-travel replay (historical state)

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| UI | Angular 20 + Signals |
| State Management | RxJS 7.8.x |
| Event Store | Firebase/Firestore |
| Auth | Firebase Auth |
| Storage | Firebase Storage |
| Functions | Firebase Cloud Functions |
| Testing | Playwright E2E |
| Dev Tools | Core Tester Widget |

---

## File Organization

### ⚠️ CRITICAL: Core/Domain Must NOT Be Under src/app/

**From ✨.md principle:**

> **Core 不屬於 Angular**  
> Core Engine 必須與框架無關，不應該放在 `src/app/` 下。

### Recommended Monorepo Structure

```
packages/
├── core-engine/                    # 純核心（與框架無關）
│   ├── causality/                  # 因果鏈引擎
│   ├── event-store/                # Event Store 抽象
│   ├── aggregates/                 # Aggregate 基礎
│   ├── projection/                 # Projection 引擎
│   ├── decision/                   # Decision 模式
│   └── process/                    # Process/Saga 模式
│
├── saas-domain/                    # SaaS 業務模型（純 TypeScript）
│   ├── task/                       # Task 業務領域
│   │   ├── events/
│   │   ├── decisions/
│   │   ├── projections/
│   │   └── processes/
│   ├── payment/                    # Payment 業務領域（未來）
│   └── issue/                      # Issue 業務領域（未來）
│
├── platform-adapters/              # 技術實作（非業務）
│   ├── firebase/
│   │   ├── firebase-event-store/
│   │   ├── firebase-auth/
│   │   ├── firebase-repository/
│   │   └── firebase-storage/
│   ├── auth/                       # 認證適配器
│   ├── notification/               # 通知適配器
│   └── search/                     # 搜尋適配器
│
└── ui-angular/                     # Angular 畫面層（只有 UI）
    └── src/app/
        ├── features/               # 功能組件
        │   └── task/
        │       ├── task-list/
        │       ├── task-detail/
        │       └── task-board/
        └── adapters/               # UI → Core 適配器
            ├── task-command.service.ts
            ├── task-query.service.ts
            └── auth-context.service.ts
```

### Why This Structure?

#### 1. **Framework Independence**
- Core Engine can be used with React, Vue, or server-side Node.js
- Business domain is pure TypeScript, no Angular dependencies
- UI framework is a replaceable detail

#### 2. **Testability**
- Core and Domain can be unit tested without Angular TestBed
- Faster test execution
- Better isolation

#### 3. **Reusability**
- Core Engine can be open-sourced separately
- Domain models shared across multiple UIs
- Platform adapters reusable

#### 4. **Clear Boundaries**
- Physical separation enforces architectural boundaries
- Prevents accidental coupling
- Easier to enforce import rules

### Migration Path (from current structure)

If currently using `src/app/core/`, migrate gradually:

**Phase 1**: Extract Core Engine
```bash
# Move to separate package
mv src/app/core/ packages/core-engine/
```

**Phase 2**: Extract Domain
```bash
# Move to separate package
mv src/app/features/task/ packages/saas-domain/task/
```

**Phase 3**: Refactor UI
```bash
# Keep only UI components in Angular
# Task components reference @core-engine and @saas-domain
```

**Total**: Estimated 340 files reorganized into clean boundaries

---

### Alternative: Single Repo with Strict Import Rules

If monorepo is not feasible immediately, enforce boundaries via linting:

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["@angular/*"],
            "message": "Core/Domain must not import Angular"
          }
        ]
      }
    ]
  }
}
```

```
src/
├── core/                           # MUST NOT import @angular/*
├── domain/                         # MUST NOT import @angular/*
├── adapters/                       # CAN import both
└── app/                            # Angular UI only
```

---

**Version**: v2.0  
**Last Updated**: 2025-12-31
