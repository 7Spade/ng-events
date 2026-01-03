# Issue Aggregate Boundary

## Aggregate Root

**Issue** - Represents a problem or bug report within a Workspace

## Structure

```
Issue/
├── IssueId (Value Object) - Unique identifier
├── WorkspaceId (Foreign Key) - MANDATORY multi-tenant boundary
├── Title (Value Object) - Issue title
├── Description (Value Object) - Issue description
├── ReporterId (Foreign Key) - Account that reported issue
├── AssigneeId (Foreign Key) - Optional assigned account
├── Status (Value Object) - Issue status (Open, InProgress, Resolved, Closed, Reopened)
├── Priority (Value Object) - Issue priority
├── Severity (Value Object) - Issue severity
└── Events: IssueCreated, IssueAssigned, IssueStatusChanged, IssueResolved, IssueClosed
```

## Responsibilities

✅ **Issue OWNS:**
- Issue lifecycle and status management
- Issue metadata (title, description, priority, severity)
- Assignment to workspace members
- Resolution tracking

❌ **Issue CANNOT:**
- Directly access Account profile (different aggregate)
- Directly access Workspace metadata (different aggregate)
- Directly trigger Task or Payment creation (different aggregates)

## Aggregate Invariants

- IssueId is immutable after creation
- **WorkspaceId is MANDATORY** (multi-tenant isolation)
- Issue can only be assigned to valid workspace members
- Status transitions must follow valid workflow
- Resolved issues can be reopened
- Closed issues cannot be modified (immutable)

## Value Objects

- `IssueId`: Unique identifier for issue
- `Title`: Issue title (1-200 characters)
- `Description`: Issue description (0-10000 characters)
- `Status`: Enumerated status (Open, InProgress, Resolved, Closed, Reopened)
- `Priority`: Enumerated priority (Low, Medium, High, Critical)
- `Severity`: Enumerated severity (Minor, Moderate, Major, Blocker)

## Domain Events

- `IssueCreated`: Fired when new issue is created
- `IssueAssigned`: Fired when issue is assigned to member
- `IssueStatusChanged`: Fired when issue status changes
- `IssueResolved`: Fired when issue is marked as resolved
- `IssueClosed`: Fired when issue is closed
- `IssueReopened`: Fired when closed issue is reopened

## Relationships to Other Aggregates

- **Workspace**: Issue belongs to one Workspace (N:1)
- **Account**: Issue has reporter and optional assignee (N:1)
- **Membership**: Issue assignment validates via Membership (authorization)

## Multi-Tenant Boundary (CRITICAL)

**Issue MUST be isolated by workspaceId:**

✅ **MUST DO:**
- Include `workspaceId` in ALL queries
- Validate `workspaceId` in command handlers
- Include `workspaceId` in projection schemas
- Filter by `workspaceId` in repository queries

❌ **NEVER:**
- Use `accountId` or `ownerId` for isolation
- Query issues across workspaces without explicit authorization
- Expose issue details outside workspace context

## Query Patterns

```typescript
// ✅ CORRECT: Workspace-scoped query
findByWorkspaceId(workspaceId: string): Promise<Issue[]>
findByStatus(workspaceId: string, status: IssueStatus): Promise<Issue[]>
findBySeverity(workspaceId: string, severity: Severity): Promise<Issue[]>

// ❌ WRONG: Missing workspace isolation
findByStatus(status: IssueStatus): Promise<Issue[]>
```

## Issue Lifecycle

```
Open → InProgress → Resolved → Closed
  ↑                              ↓
  └──────── Reopened ────────────┘
```

## Phase 1.5 Status

**STRUCTURE DECLARED** - Implementation exists in `packages/saas-domain/issue/`
This document clarifies boundaries and multi-tenant requirements.
NO code changes.
