# Account Model

> **Account is the only business actor in the system.**

## Core Principle (from ✨✨✨.md)

> **用戶不是業務實體，組織也不是用戶，真正參與權限與因果的是：`Account`。**

**User / Organization / Bot 都只是「Account 的來源」而已。**

---

## What is an Account?

### Definition

**Account** is the **唯一業務行為主體** (sole business actor) in the system. It is the entity that:
- Triggers events (`actorAccountId` in events)
- Gets assigned permissions and roles
- Participates in causality chains
- Can be assigned to tasks
- Appears in audit trails

### Why Account Exists

In a multi-tenant, event-sourced system with complex authorization:
- We need a **single, unified concept** for "who did this action"
- Users, Organizations, and Bots all need to perform actions
- Events must have a **consistent actor reference**
- Authorization logic must work uniformly across all actor types

---

## Account Types

```typescript
interface Account {
  accountId: string;
  type: 'user' | 'organization' | 'bot';
  status: 'active' | 'suspended' | 'deleted';
  createdAt: number;
  metadata: AccountMetadata;
}

type AccountMetadata = UserMetadata | OrganizationMetadata | BotMetadata;
```

### 1. User Account

**Identity Source**: Human user with login credentials

```typescript
interface UserMetadata {
  email: string;
  displayName: string;
  authProvider: 'email' | 'google' | 'github' | 'sso';
  lastLoginAt?: number;
}
```

**Characteristics**:
- ✅ Can log in
- ✅ Has human interface (UI)
- ✅ Triggers events through user actions
- ✅ Can own resources
- ✅ Can be assigned roles

### 2. Organization Account

**Identity Source**: Legal entity or organizational unit

```typescript
interface OrganizationMetadata {
  legalName: string;
  taxId?: string;
  parentOrgAccountId?: string;  // For hierarchical orgs
}
```

**Characteristics**:
- ❌ Cannot log in directly
- ❌ No UI for direct action
- ✅ Can own resources
- ✅ Can be assigned roles
- ✅ Managed by User Accounts
- ✅ Can trigger events (through representatives)

**Note**: Organization is an Account type, **NOT a Workspace**. See [Workspace Model](./06-workspace-model.md).

### 3. Bot Account

**Identity Source**: Automated service or agent

```typescript
interface BotMetadata {
  purpose: string;
  tokenHash: string;
  allowedScopes: string[];
  ownerAccountId: string;       // User/Org that owns this bot
}
```

**Characteristics**:
- ❌ No login (uses API tokens)
- ❌ No UI
- ✅ Triggers events via API
- ✅ Limited, scoped permissions
- ✅ Can be suspended/revoked

---

## Account vs Identity Source

### ❌ Wrong Mental Model

```
User → does actions → creates events
Organization → does actions → creates events
Bot → does actions → creates events
```

This leads to:
- Inconsistent event models (userId vs orgId vs botId)
- Complex authorization logic with special cases
- Difficult event replay

### ✅ Correct Mental Model

```
User Identity → produces → User Account
Organization Identity → produces → Organization Account  
Bot Identity → produces → Bot Account

Account → triggers → Events
```

### Comparison Table

| Aspect                | User/Org/Bot Identity | Account            |
|-----------------------|-----------------------|--------------------|
| Is business actor?    | ❌ No                 | ✅ Yes             |
| Triggers events?      | ❌ No                 | ✅ Yes             |
| Appears in Event?     | ❌ No                 | ✅ Yes (actorAccountId) |
| Has permissions?      | ❌ No                 | ✅ Yes (via relationships) |
| Login mechanism?      | ✅ Yes (varies)       | ❌ No (handled by identity) |

---

## Account Relationships

### AccountWorkspaceMembership

Permissions are **relationships**, not properties.

```typescript
interface AccountWorkspaceMembership {
  accountId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  grantedByAccountId: string;
  grantedAt: number;
}
```

**Key Principle**: Ownership is a **relationship between Account and Workspace**, not an attribute of either.

### ❌ Anti-Pattern: Ownership as Property

```typescript
// BAD: Ownership baked into entity
interface Workspace {
  workspaceId: string;
  ownerAccountId: string;  // ❌ Don't do this
}
```

**Problems**:
- Can't have multiple owners
- Ownership transfer is complex
- No audit trail of permission changes
- Can't query "all workspaces for account X"

### ✅ Correct Pattern: Ownership as Relationship

```typescript
// GOOD: Ownership is a relationship
interface AccountWorkspaceMembership {
  accountId: string;
  workspaceId: string;
  role: 'owner' | 'member' | 'viewer';
}
```

**Benefits**:
- Multiple owners possible
- Clear permission history (via events)
- Easy queries in both directions
- Clean separation of concerns

---

## Account in Events

### Event Structure

```typescript
interface DomainEvent<T> {
  id: string;
  type: string;
  aggregateId: string;
  actorAccountId: string;     // ← Account is the actor
  workspaceId: string;         // ← Workspace is the scope
  causedBy: string[];
  timestamp: number;
  data: T;
}
```

### Example Events

```typescript
// Task created by User Account
{
  type: 'TaskCreated',
  actorAccountId: 'acc-user-123',
  workspaceId: 'ws-456',
  data: {
    title: 'Implement feature X',
    createdByAccountId: 'acc-user-123'
  }
}

// Task assigned by Organization Account (via representative)
{
  type: 'TaskAssigned',
  actorAccountId: 'acc-org-789',
  workspaceId: 'ws-456',
  data: {
    assigneeAccountId: 'acc-user-123',
    assignedByAccountId: 'acc-org-789'
  }
}

// Automated action by Bot Account
{
  type: 'TaskArchived',
  actorAccountId: 'acc-bot-999',
  workspaceId: 'ws-456',
  data: {
    reason: 'Auto-archived after 90 days',
    archivedByAccountId: 'acc-bot-999'
  }
}
```

---

## Account Lifecycle

### Account Events

```typescript
// Account creation
AccountCreated {
  accountId: string;
  type: 'user' | 'organization' | 'bot';
  metadata: AccountMetadata;
}

// Account activation/suspension
AccountActivated { accountId: string; }
AccountSuspended { accountId: string; reason: string; }

// Account deletion (soft delete)
AccountDeleted { 
  accountId: string; 
  deletedByAccountId: string;
  reason: string;
}

// Membership management
AccountJoinedWorkspace {
  accountId: string;
  workspaceId: string;
  role: string;
  grantedByAccountId: string;
}

AccountLeftWorkspace {
  accountId: string;
  workspaceId: string;
}
```

---

## Account-Based Authorization

### Decision Layer

Authorization decisions happen in the **domain layer**, using Account as the subject.

```typescript
function canCompleteTask(
  actor: Account,
  task: Task
): boolean {
  // Simple rule: assignee or admin
  return (
    actor.accountId === task.assigneeAccountId ||
    hasRole(actor.accountId, task.workspaceId, 'admin')
  );
}

function canDeleteWorkspace(
  actor: Account,
  workspace: Workspace
): boolean {
  // Only workspace owner can delete
  return hasRole(actor.accountId, workspace.workspaceId, 'owner');
}
```

### Platform Adapter Layer

Platform adapters (Firebase Auth, OAuth, SSO) produce `AuthContext`:

```typescript
interface AuthContext {
  accountId: string;
  workspaceId: string;  // Current workspace context
  roles: string[];      // Cached roles for performance
  accountType: 'user' | 'organization' | 'bot';
}
```

The adapter **does not** make authorization decisions. It only answers: **"Who are you?"**

---

## Benefits of Account Model

### 1. Unified Event Model

All events have consistent `actorAccountId` field. No more:
- `userId` vs `orgId` vs `botId` confusion
- Special-case handling for different actor types

### 2. Deterministic Event Replay

Events can be replayed to reconstruct state without needing to know:
- Whether the actor was a user, org, or bot
- Authentication details
- UI context

### 3. Flexible Permission Model

Permissions work the same way for all account types:
- User can be workspace owner
- Organization can be workspace owner
- Bot can have limited member role

### 4. Future-Proof

New actor types can be added without changing:
- Event schema
- Authorization logic
- Core domain model

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Exposing Identity Details in Events

```typescript
// BAD: Leaking identity provider details
{
  type: 'TaskCreated',
  actorEmail: 'user@example.com',  // ❌ Identity detail
  actorAuthProvider: 'google',     // ❌ Identity detail
}
```

**Fix**: Only store `actorAccountId`. Look up identity details from Account aggregate.

### ❌ Mistake 2: Multiple Actor Fields

```typescript
// BAD: Different fields for different types
{
  type: 'TaskCreated',
  userId?: string,
  orgId?: string,
  botId?: string,
}
```

**Fix**: Single `actorAccountId` field for all.

### ❌ Mistake 3: Confusing Account with Workspace

```typescript
// BAD: Thinking Organization Account = Workspace
const workspace = getOrganizationWorkspace(orgAccountId);
```

**Fix**: Organization is an **Account** (actor). Workspace is a **scope** (container). They are independent concepts. See [Workspace Model](./06-workspace-model.md).

---

## See Also

- [Workspace Model](./06-workspace-model.md) - Logical containers for business modules
- [Authorization Layers](../03-architecture/05-authorization-layers.md) - How authorization is split across layers
- [Platform Architecture](../dev/consolidated/17-平台層SaaS架構.md) - Platform layer design

---

**Version**: 1.0  
**Last Updated**: 2026-01-01  
**Source**: ✨✨✨.md (Account 核心概念)
