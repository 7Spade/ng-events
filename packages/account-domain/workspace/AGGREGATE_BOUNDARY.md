# Workspace Aggregate Boundary

## Aggregate Root

**Workspace** - Represents a multi-tenant isolation boundary (the WHERE of SaaS operations)

## Structure

```
Workspace/
├── WorkspaceId (Value Object) - Unique identifier (blueprintId compatible)
├── Name (Value Object) - Workspace name
├── AccountId (Foreign Key) - Owner account
├── Description (Value Object) - Optional description
└── Events: WorkspaceCreated, WorkspaceUpdated, WorkspaceDeleted
```

## Responsibilities

✅ **Workspace OWNS:**
- Workspace metadata (name, description)
- Workspace lifecycle (active, suspended, deleted)
- Multi-tenant boundary definition

❌ **Workspace CANNOT:**
- Directly access Account profile (different aggregate)
- Manage Tasks directly (Task aggregate responsibility)
- Manage Payments directly (Payment aggregate responsibility)

## Aggregate Invariants

- WorkspaceId is immutable after creation
- Workspace MUST have an owning Account
- Workspace name must be unique per Account
- **WorkspaceId is the ONLY multi-tenant isolation boundary**

## Value Objects

- `WorkspaceId`: Unique identifier (maps to `blueprintId` for backward compatibility)
- `Name`: Workspace name (1-100 characters)
- `Description`: Optional workspace description

## Domain Events

- `WorkspaceCreated`: Fired when new workspace is created
- `WorkspaceUpdated`: Fired when workspace metadata changes
- `WorkspaceDeleted`: Fired when workspace is soft-deleted

## Relationships to Other Aggregates

- **Account**: Workspace is OWNED BY one Account (N:1)
- **Membership**: Workspace has many Memberships (1:N)
- **ModuleRegistry**: Workspace can have registered modules (1:N)
- **Task/Payment/Issue**: Workspace is the isolation boundary for all SaaS entities

## Multi-Tenant Boundary (CRITICAL)

**Workspace IS the multi-tenant boundary.**

ALL SaaS domain operations MUST:
- Filter by `workspaceId`
- Include `workspaceId` in projection schemas
- Validate `workspaceId` in command handlers
- NEVER use `ownerId` or `accountId` for SaaS isolation

## Vertical Slice Priority

**Workspace is the FIRST vertical slice** for implementation because:
1. It defines the multi-tenant boundary
2. All SaaS entities depend on WorkspaceId
3. It bridges Account (WHO) and SaaS entities (WHAT)

## Phase 1.5 Status

**STRUCTURE DECLARED** - Implementation exists in `packages/account-domain/workspace/`
This document clarifies boundaries and marks Workspace as first vertical slice.
NO code changes.
