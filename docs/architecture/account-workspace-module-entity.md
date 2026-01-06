# Account-Workspace-Module-Entity Architecture

## Overview

This document describes the foundational architecture for the ng-events system, implementing a clear separation of concerns across four key layers: Account, Workspace, Module, and Entity.

## Architecture Flow

```
Account (誰) → Workspace (在哪) → Module (做什麼) → Entity (狀態...)
   Who          Where          What to do      State
```

### Layer Responsibilities

#### 1. Account (誰 - Who)
**Purpose**: Identifies who is performing actions in the system.

**Key Concepts**:
- Account is the UNIFIED business entity for all actors
- Account types: User, Organization, Bot
- ALL events reference `accountId` (never userId/orgId/botId separately)
- Account is the ONLY identity that participates in events

**Account Types**:
- **User**: 
  - Can login (email/OAuth)
  - Human interface
  - Has email, displayName, avatarUrl, firebaseUid
  
- **Organization**: 
  - Cannot login directly
  - Container/group for accounts
  - Managed by Users
  - Has name, billingEmail, logoUrl
  - **IMPORTANT**: Organization is NOT a Workspace
  
- **Bot**: 
  - Cannot use UI
  - Token-based authentication
  - Narrow permissions
  - Has name, ownerAccountId, tokenHash

**Commands**:
- `CreateAccountCommand`
- `UpdateAccountCommand`
- `SuspendAccountCommand`
- `ReactivateAccountCommand`
- `DeleteAccountCommand`

**Events**:
- `AccountCreated`
- `AccountUpdated`
- `AccountSuspended`
- `AccountReactivated`
- `AccountDeleted`

**Invariants**:
- accountId must be unique
- User accounts MUST have email
- Organization accounts MUST have name
- Bot accounts MUST have ownerAccountId
- Deleted accounts cannot be reactivated

#### 2. Workspace (在哪 - Where)
**Purpose**: Defines the multi-tenant boundary (blueprintId) where work happens.

**Key Concepts**:
- Workspace = blueprintId boundary
- One Workspace = One blueprintId
- Workspace is the container for tenant-specific data
- Workspace tracks which modules are enabled
- Workspace does NOT know module internals

**Critical Constraint**:
- **Organization is INDEPENDENT of Workspace**
- Organization is an Account type that can OWN workspaces
- Organization is NOT a Workspace itself

**Commands**:
- `CreateWorkspaceCommand`
- `UpdateWorkspaceCommand`
- `EnableModuleCommand`
- `DisableModuleCommand`
- `SuspendWorkspaceCommand`
- `ArchiveWorkspaceCommand`

**Events**:
- `WorkspaceCreated` (blueprintId = workspaceId)
- `WorkspaceUpdated`
- `ModuleEnabled`
- `ModuleDisabled`
- `WorkspaceSuspended`
- `WorkspaceArchived`

**Invariants**:
- workspaceId MUST equal blueprintId
- Must have an owner account
- Cannot enable same module twice
- Cannot disable module that's not enabled
- Archived workspaces cannot be modified
- All events MUST include blueprintId

#### 3. Module (做什麼 - What to do)
**Purpose**: Defines what capabilities/features are available in a workspace.

**Key Concepts**:
- Modules are external plugins to Workspace
- Modules declare dependencies via manifests
- ModuleRegistry validates dependencies
- Workspace enables/disables modules via events
- Modules are PASSIVE (listen to events, don't modify Workspace)

**Module Types** (predefined):
- **Task**: Base module (no dependencies)
- **Issue**: Depends on Task
- **Payment**: Independent module
- **Analytics**: Depends on Task

**Module Manifest**:
```typescript
{
  key: 'issue',
  name: 'Issue Tracking',
  version: '1.0.0',
  requires: ['task'], // Dependencies
  capabilities: ['create_issue', 'link_to_task'],
  metadata: { icon, color, category, isPremium }
}
```

**Dependency Flow**:
1. Module declares manifest
2. Workspace checks if dependencies are satisfied (via ModuleRegistry)
3. Workspace emits `ModuleEnabled` event
4. Module listens and initializes itself (passive)

**One-Way Dependency Rule**:
- Module → Workspace: READ ONLY (consume blueprintId, check enabled state)
- Module NEVER modifies Workspace state directly
- Module NEVER reads Account/Organization data directly

#### 4. Entity (狀態 - State)
**Purpose**: Domain entities within modules (Tasks, Issues, Payments, etc.)

**Key Concepts** (future implementation):
- Entities are scoped to blueprintId
- Entities are owned by modules
- Entities reference Account (who created/modified)
- Entities use causality metadata

**Not Yet Implemented** - Reserved for future phases

## Event Sourcing Principles

### Causality Metadata
ALL events MUST include causality metadata:

```typescript
{
  causedBy: string;        // Parent event/command ID
  causedByUser: string;    // accountId who triggered
  causedByAction: string;  // Action description
  blueprintId?: string;    // Workspace boundary (optional for Account creation)
  timestamp: string;       // ISO 8601
  correlationId?: string;  // For tracking related events
}
```

### Event Flow Example

```
1. User creates Workspace:
   Command: CreateWorkspaceCommand
   └─> Event: WorkspaceCreated (blueprintId = workspaceId)

2. Workspace enables Task module:
   Command: EnableModuleCommand
   └─> Event: ModuleEnabled (moduleKey: 'task')
       └─> Module listens and initializes

3. User enables Issue module:
   Command: EnableModuleCommand
   ├─> Check: ModuleRegistry.canEnable('issue', ['task']) = true
   └─> Event: ModuleEnabled (moduleKey: 'issue')
       └─> Module listens and initializes
```

## Architectural Constraints

### 1. Organization ≠ Workspace
**CRITICAL**: Organization is an Account type, NOT a Workspace.

```
❌ WRONG:
Organization → Contains Workspaces (like folders)

✅ CORRECT:
Account(type=organization) → Owns Workspaces
```

### 2. One-Way Dependencies
**Rule**: Dependencies only flow to the right, never left.

```
Account ──┐
          ├──> Workspace ──┐
          │                ├──> Module ──> Entity
          │                │
          └────────────────┘
           (ownership only, no data flow back)
```

- Module reads Workspace context (blueprintId, enabled modules)
- Module NEVER modifies Workspace
- Entity reads Module context
- Entity NEVER modifies Module or Workspace

### 3. blueprintId Boundary
**Rule**: All workspace-scoped data MUST include blueprintId.

```typescript
// ✅ Correct
const event: ModuleEnabledEvent = {
  eventId: '...',
  aggregateId: workspaceId,
  metadata: {
    blueprintId: workspaceId, // ← MUST match
    causedBy: commandId,
    causedByUser: accountId,
    ...
  }
};

// ❌ Wrong
const event = {
  metadata: {
    blueprintId: undefined // ← Missing!
  }
};
```

### 4. Account Unification
**Rule**: User/Org/Bot are metadata variants, not separate entities.

```typescript
// ✅ Correct
const account: Account = {
  accountId: 'acc_123',
  accountType: 'organization',
  metadata: { name: 'Acme Corp', billingEmail: '...' }
};

// ❌ Wrong
const org: Organization = { orgId: 'org_123' };
const user: User = { userId: 'user_456' };
```

### 5. Event-Driven Module Enablement
**Rule**: Module enablement MUST be event-driven for audit trail.

```
Command: EnableModuleCommand
   ↓
Validation: Check dependencies via ModuleRegistry
   ↓
Event: ModuleEnabled
   ↓
Module: Listen and initialize (passive)
```

## Implementation Status

### ✅ Implemented
- Core-Engine: DomainEvent, Command, AggregateRoot, EventStore, ProcessManager
- Account-Domain: Account aggregate, Workspace aggregate
- Account Commands/Events: Full lifecycle support
- Workspace Commands/Events: Module enablement support
- SaaS-Domain: ModuleManifest, ModuleRegistry, Predefined modules
- Causality tracking in all events
- blueprintId boundary enforcement

### 🔄 Partial
- Team aggregate (deferred - can be implemented as needed)
- Membership/Role system (deferred - ACL later phase)

### ⏳ Future
- Entity layer (Task, Issue, Payment domain models)
- ACL/Permission system
- UI integration with @delon/auth + @delon/acl
- Event store implementation (Firestore adapter)

## Best Practices

### 1. Creating New Modules
```typescript
// 1. Define manifest
const MyModuleManifest: ModuleManifest = {
  key: 'mymodule',
  name: 'My Module',
  requires: ['task'], // Dependencies
  ...
};

// 2. Register in ModuleRegistry
registry.register(MyModuleManifest);

// 3. Listen to ModuleEnabled event
eventBus.on('ModuleEnabled', (event) => {
  if (event.data.moduleKey === 'mymodule') {
    initializeModule(event.metadata.blueprintId);
  }
});
```

### 2. Enforcing blueprintId Boundary
```typescript
// Always include blueprintId in workspace-scoped queries
const tasks = await firestore
  .collection('tasks')
  .where('blueprintId', '==', currentBlueprintId)
  .get();
```

### 3. Creating Accounts
```typescript
// User account
const userAccount = Account.create(
  'acc_user_123',
  'user',
  { email: 'user@example.com', displayName: 'John' },
  eventMetadata // No blueprintId for Account creation
);

// Organization account
const orgAccount = Account.create(
  'acc_org_456',
  'organization',
  { name: 'Acme Corp', billingEmail: 'billing@acme.com' },
  eventMetadata
);
```

### 4. Creating Workspaces
```typescript
const workspace = Workspace.create(
  'wks_789',           // workspaceId
  'acc_org_456',       // ownerAccountId (Organization)
  'Acme Workspace',    // name
  'Main workspace',    // description
  ['task'],            // initialModules
  {
    ...eventMetadata,
    blueprintId: 'wks_789' // MUST match workspaceId
  }
);
```

## Summary

The Account-Workspace-Module-Entity architecture provides:

1. **Clear Separation**: Each layer has well-defined responsibilities
2. **Multi-Tenancy**: blueprintId enforces tenant boundaries
3. **Extensibility**: Modules as plugins with dependency management
4. **Audit Trail**: Full causality tracking via event sourcing
5. **Type Safety**: Account unification prevents identity confusion
6. **Architectural Constraints**: One-way dependencies, Organization ≠ Workspace

This architecture enables scalable, maintainable, and auditable SaaS applications with proper tenant isolation and modular capabilities.

// END OF FILE
