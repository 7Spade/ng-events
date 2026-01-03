# Account Aggregate Boundary

## Aggregate Root

**Account** - Represents a user's account in the system (the WHO of all operations)

## Structure

```
Account/
├── AccountId (Value Object) - Unique identifier
├── Email (Value Object) - Email address with validation
├── DisplayName (Value Object) - User's display name
└── Events: AccountCreated, AccountUpdated, AccountDeleted
```

## Responsibilities

✅ **Account OWNS:**
- User profile information
- Authentication credentials (abstraction only)
- Account status and lifecycle

❌ **Account CANNOT:**
- Directly access Workspace data (different aggregate)
- Directly access Membership data (different aggregate)
- Know about Tasks, Payments, or Issues (SaaS domain)

## Aggregate Invariants

- Email must be unique across all accounts
- AccountId is immutable after creation
- Account can exist without Workspaces

## Value Objects

- `AccountId`: Unique identifier for account
- `Email`: Email address with format validation
- `DisplayName`: User-facing name (1-100 characters)

## Domain Events

- `AccountCreated`: Fired when new account is created
- `AccountUpdated`: Fired when account profile is modified
- `AccountDeleted`: Fired when account is soft-deleted

## Relationships to Other Aggregates

- **Workspace**: Account OWNS one or more Workspaces (1:N)
- **Membership**: Account has Memberships in various Workspaces (N:N via Membership)
- **ModuleRegistry**: N/A (module-level, not account-specific)

## Multi-Tenant Boundary

Account operates at **ACCOUNT level** (uses `ownerId`), NOT workspace level.
Account is the owner entity, Workspace is the isolation boundary.

## Phase 1.5 Status

**STRUCTURE DECLARED** - Implementation exists in `packages/account-domain/account/`
This document clarifies boundaries only, NO code changes.
