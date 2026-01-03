# Task Aggregate Boundary

## Aggregate Root

**Task** - Represents a work item within a Workspace

## Structure

```
Task/
├── TaskId (Value Object) - Unique identifier
├── WorkspaceId (Foreign Key) - MANDATORY multi-tenant boundary
├── Title (Value Object) - Task title
├── Description (Value Object) - Task description
├── AssigneeId (Foreign Key) - Optional assigned account
├── Status (Value Object) - Task status (Pending, InProgress, Completed, Cancelled)
├── Priority (Value Object) - Task priority
└── Events: TaskCreated, TaskAssigned, TaskStatusChanged, TaskCompleted
```

## Responsibilities

✅ **Task OWNS:**
- Task lifecycle and status management
- Task metadata (title, description, priority)
- Assignment to workspace members

❌ **Task CANNOT:**
- Directly access Account profile (different aggregate)
- Directly access Workspace metadata (different aggregate)
- Directly access Payment or Issue entities (different aggregates)

## Aggregate Invariants

- TaskId is immutable after creation
- **WorkspaceId is MANDATORY** (multi-tenant isolation)
- Task can only be assigned to valid workspace members
- Status transitions must follow valid workflow (Pending → InProgress → Completed)

## Value Objects

- `TaskId`: Unique identifier for task
- `Title`: Task title (1-200 characters)
- `Description`: Task description (0-5000 characters)
- `Status`: Enumerated status (Pending, InProgress, Completed, Cancelled)
- `Priority`: Enumerated priority (Low, Medium, High, Critical)

## Domain Events

- `TaskCreated`: Fired when new task is created
- `TaskAssigned`: Fired when task is assigned to member
- `TaskStatusChanged`: Fired when task status changes
- `TaskCompleted`: Fired when task is completed
- `TaskDeleted`: Fired when task is soft-deleted

## Relationships to Other Aggregates

- **Workspace**: Task belongs to one Workspace (N:1)
- **Account**: Task may be assigned to one Account (N:1, optional)
- **Membership**: Task assignment validates via Membership (authorization)

## Multi-Tenant Boundary (CRITICAL)

**Task MUST be isolated by workspaceId:**

✅ **MUST DO:**
- Include `workspaceId` in ALL queries
- Validate `workspaceId` in command handlers
- Include `workspaceId` in projection schemas
- Filter by `workspaceId` in repository queries

❌ **NEVER:**
- Use `accountId` or `ownerId` for isolation
- Query tasks across workspaces without explicit authorization

## Query Patterns

```typescript
// ✅ CORRECT: Workspace-scoped query
findByWorkspaceId(workspaceId: string): Promise<Task[]>
findByStatus(workspaceId: string, status: TaskStatus): Promise<Task[]>

// ❌ WRONG: Missing workspace isolation
findByStatus(status: TaskStatus): Promise<Task[]>
```

## Phase 1.5 Status

**STRUCTURE DECLARED** - Implementation exists in `packages/saas-domain/task/`
This document clarifies boundaries and multi-tenant requirements.
NO code changes.
