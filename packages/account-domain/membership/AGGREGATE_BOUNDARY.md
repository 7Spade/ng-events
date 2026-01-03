# Membership Aggregate Boundary

## Aggregate Root

**Membership** - Represents a user's membership/role within a specific Workspace

## Structure

```
Membership/
├── MembershipId (Value Object) - Unique identifier
├── AccountId (Foreign Key) - The member account
├── WorkspaceId (Foreign Key) - The workspace
├── Role (Value Object) - Member's role (Owner, Admin, Member, Viewer)
├── Status (Value Object) - Membership status (Active, Suspended, Revoked)
└── Events: MembershipCreated, MembershipUpdated, MembershipRevoked
```

## Responsibilities

✅ **Membership OWNS:**
- Account-Workspace relationship
- Role and permissions for a specific account in a workspace
- Membership lifecycle (invited, active, suspended, revoked)

❌ **Membership CANNOT:**
- Directly modify Account profile
- Directly modify Workspace metadata
- Grant permissions outside its workspace context

## Aggregate Invariants

- AccountId + WorkspaceId combination must be unique (one membership per user per workspace)
- MembershipId is immutable after creation
- At least one Owner role must exist per Workspace
- Owner cannot revoke their own membership if they are the last owner

## Value Objects

- `MembershipId`: Unique identifier for membership
- `Role`: Enumerated role (Owner, Admin, Member, Viewer)
- `Status`: Membership status (Active, Suspended, Revoked)

## Domain Events

- `MembershipCreated`: Fired when user is added to workspace
- `MembershipRoleChanged`: Fired when member's role is updated
- `MembershipRevoked`: Fired when membership is terminated

## Relationships to Other Aggregates

- **Account**: Membership references one Account (N:1)
- **Workspace**: Membership belongs to one Workspace (N:1)
- **Task/Payment/Issue**: Membership determines access rights (authorization concern)

## Multi-Tenant Boundary

Membership operates WITHIN workspace context:
- Uses `workspaceId` for isolation
- Bridges Account-level identity with Workspace-level authorization

## Authorization Flow

```
User (Account) → Membership (in Workspace) → Role → Permissions → Access to SaaS Entities
```

## Phase 1.5 Status

**STRUCTURE DECLARED** - Implementation exists in `packages/account-domain/membership/`
This document clarifies boundaries only, NO code changes.
