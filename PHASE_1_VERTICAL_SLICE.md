# Phase 1 Vertical Slice - Workspace Foundation

## Objective
Establish the complete vertical slice for **Workspace + ModuleRegistry → Account → Membership** aggregates, validating the full Event Sourcing + CQRS + Multi-Tenant pattern from domain to UI.

## Why Workspace First?

**Workspace is the multi-tenant boundary foundation:**
1. **workspaceId** is the ONLY isolation boundary for all SaaS operations
2. All SaaS entities (Task, Payment, Issue) require a valid workspaceId
3. Validates the complete pattern: Event Store → Projection → Query → UI
4. Minimal dependencies (only Account ownership)

**Implementation Order:**
```
Workspace (FIRST) → Account → Membership → ModuleRegistry
```

---

## Phase 1 Aggregates Overview

| Aggregate | Domain | Purpose | Dependencies | Status |
|-----------|--------|---------|--------------|--------|
| **Workspace** | account-domain | Multi-tenant boundary, workspace lifecycle | Account (ownerId) | ✅ Skeleton Complete |
| **Account** | account-domain | User identity and ownership | None | ✅ Skeleton Complete |
| **Membership** | account-domain | User ↔ Workspace access control | Workspace, Account | ✅ Skeleton Complete |
| **ModuleRegistry** | account-domain | Feature flags per workspace | Workspace | ✅ Skeleton Complete |

---

## 1️⃣ Workspace Aggregate

**Purpose:** Multi-tenant workspace lifecycle management

### File Structure

```
packages/account-domain/workspace/
├── aggregates/
│   └── Workspace.ts                    # Aggregate Root with fromEvents()
├── value-objects/
│   ├── WorkspaceId.ts                  # Primary Key + Class skeleton
│   └── WorkspaceRole.ts                # Owner/Admin/Member roles
├── events/
│   ├── WorkspaceCreated.ts            # Initial workspace creation
│   └── WorkspaceArchived.ts           # Workspace deactivation
├── repositories/
│   └── WorkspaceRepository.ts         # Domain interface
├── index.ts                            # Public exports
└── AGGREGATE_BOUNDARY.md              # Boundary documentation
```

### Dependency Tree

```
Value Objects
└─> WorkspaceId.ts
└─> WorkspaceRole.ts
    ↓
Aggregate
└─> Workspace.ts (uses WorkspaceId, WorkspaceRole)
    ├─> fromEvents() - Event Sourcing reconstruction
    └─> Emits: WorkspaceCreated, WorkspaceArchived
    ↓
Domain Events
└─> WorkspaceCreated.ts
└─> WorkspaceArchived.ts
    ↓
Domain Repository (Interface)
└─> WorkspaceRepository.ts
    ├─> save(workspace: Workspace): Promise<void>
    ├─> load(id: WorkspaceId): Promise<Workspace>
    └─> findByOwnerId(ownerId: string): Promise<Workspace[]>
    ↓
Infrastructure Repository (platform-adapters)
└─> FirestoreWorkspaceRepository.ts
    ├─> EventStore: events/workspace/{workspaceId}/events
    └─> Projection: projections/workspace
    ↓
Projection Builder (platform-adapters)
└─> WorkspaceProjectionBuilder.ts
    ├─> handleWorkspaceCreated()
    ├─> handleWorkspaceArchived()
    └─> Schema: { id, ownerId, name, status, createdAt, archivedAt }
    ↓
Application Layer (core-engine)
└─> CreateWorkspaceCommand
└─> CreateWorkspaceHandler
    ↓
Angular Services (ui-angular)
├─> WorkspaceCommandService (writes via Repository)
├─> WorkspaceQueryService (reads via Projection)
└─> WorkspaceStoreService (state management)
```

### Multi-Tenant Boundary Enforcement

**Workspace is the ONLY isolation boundary:**
- ✅ Workspace Projection includes `ownerId` (NOT workspaceId for itself)
- ✅ Workspace Query Service uses `ownerId` to filter workspaces by account
- ✅ ALL SaaS entities (Task, Payment, Issue) MUST include `workspaceId` in their projections
- ✅ ALL SaaS Query Services require `workspaceId` as FIRST parameter

**Key Files:**
- `packages/account-domain/workspace/VERTICAL_SLICE_FIRST.md` - Explains why Workspace is first
- `packages/account-domain/workspace/AGGREGATE_BOUNDARY.md` - Multi-tenant rules documented

---

## 2️⃣ Account Aggregate

**Purpose:** User identity and ownership model

### File Structure

```
packages/account-domain/account/
├── aggregates/
│   └── Account.ts                      # Aggregate Root
├── value-objects/
│   ├── AccountId.ts                    # Primary Key
│   └── AccountStatus.ts                # Active/Suspended/Deleted
├── events/
│   ├── AccountCreated.ts              # Account registration
│   └── AccountSuspended.ts            # Account deactivation
├── repositories/
│   └── AccountRepository.ts           # Domain interface
├── services/
│   └── AccountMembershipService.ts    # Cross-aggregate coordination
├── index.ts
└── AGGREGATE_BOUNDARY.md
```

### Dependency Tree

```
Value Objects
└─> AccountId.ts
└─> AccountStatus.ts
    ↓
Aggregate
└─> Account.ts
    ├─> fromEvents() pattern
    └─> Emits: AccountCreated, AccountSuspended
    ↓
Domain Events
└─> AccountCreated.ts
└─> AccountSuspended.ts
    ↓
Domain Repository
└─> AccountRepository.ts
    ↓
Infrastructure Repository
└─> FirestoreAccountRepository.ts
    ├─> EventStore: events/account/{accountId}/events
    └─> Projection: projections/account
    ↓
Projection Builder
└─> AccountProjectionBuilder.ts
    ├─> handleAccountCreated()
    ├─> handleAccountSuspended()
    └─> Schema: { id, email, status, createdAt, suspendedAt }
    ↓
Application Layer
└─> CreateAccountCommand
└─> CreateAccountHandler
    ↓
Angular Services
├─> AccountCommandService
├─> AccountQueryService
└─> AccountStoreService
```

### Isolation Boundary

**Account uses ownerId (NOT workspaceId):**
- ✅ Account Projection schema: `{ id, email, status, createdAt }`
- ✅ Query pattern: `findById(accountId)`, `findByEmail(email)`
- ✅ NO workspaceId in Account domain - workspaceId belongs to Workspace aggregate

---

## 3️⃣ Membership Aggregate

**Purpose:** User ↔ Workspace access control

### File Structure

```
packages/account-domain/membership/
├── aggregates/
│   └── Membership.ts                   # Aggregate Root
├── value-objects/
│   ├── MemberId.ts                     # Primary Key
│   └── Role.ts                         # Owner/Admin/Member/Guest
├── events/
│   ├── MemberJoinedWorkspace.ts       # Member added
│   └── MemberRoleChanged.ts           # Permission updated
├── repositories/
│   └── MembershipRepository.ts        # Domain interface
├── index.ts
└── AGGREGATE_BOUNDARY.md
```

### Dependency Tree

```
Value Objects
└─> MemberId.ts
└─> Role.ts
    ↓
Aggregate
└─> Membership.ts
    ├─> Depends on: WorkspaceId, AccountId
    ├─> fromEvents() pattern
    └─> Emits: MemberJoinedWorkspace, MemberRoleChanged
    ↓
Domain Events
└─> MemberJoinedWorkspace.ts
└─> MemberRoleChanged.ts
    ↓
Domain Repository
└─> MembershipRepository.ts
    ├─> findByWorkspaceId(workspaceId)
    └─> findByAccountId(accountId)
    ↓
Infrastructure Repository
└─> FirestoreMembershipRepository.ts
    ├─> EventStore: events/membership/{memberId}/events
    └─> Projection: projections/membership
    ↓
Projection Builder
└─> MembershipProjectionBuilder.ts
    ├─> handleMemberJoinedWorkspace()
    ├─> handleMemberRoleChanged()
    └─> Schema: { id, workspaceId, accountId, role, joinedAt }
    ↓
Saga (core-engine)
└─> MembershipSaga.ts
    ├─> onMemberJoinedWorkspace() - Send welcome email
    └─> onMemberRoleChanged() - Update permissions
    ↓
Angular Services
├─> MembershipCommandService
├─> MembershipQueryService (workspaceId-first queries)
└─> MembershipStoreService
```

### Multi-Tenant Isolation

**Membership bridges Account and Workspace:**
- ✅ Membership Projection includes `workspaceId` for isolation
- ✅ Query pattern: `findByWorkspaceId(workspaceId)` - FIRST parameter
- ✅ Query pattern: `findByAccountId(accountId)` - Secondary query
- ✅ Membership enforces workspace boundary via workspaceId

---

## 4️⃣ ModuleRegistry (Part of Workspace Boundary)

**Purpose:** Feature flag management per workspace

### File Structure

```
packages/account-domain/module-registry/
├── aggregates/
│   └── ModuleRegistry.ts              # Aggregate Root
├── value-objects/
│   ├── ModuleId.ts                    # task/payment/issue
│   ├── ModuleStatus.ts                # enabled/disabled
│   └── Capability.ts                  # Feature capabilities
├── events/
│   ├── ModuleEnabled.ts               # Feature activated
│   └── ModuleDisabled.ts              # Feature deactivated
├── repositories/
│   └── ModuleRegistryRepository.ts    # Domain interface
├── index.ts
└── AGGREGATE_BOUNDARY.md
```

### Dependency Tree

```
Value Objects
└─> ModuleId.ts
└─> ModuleStatus.ts
└─> Capability.ts
    ↓
Aggregate
└─> ModuleRegistry.ts
    ├─> Belongs to Workspace boundary
    ├─> fromEvents() pattern
    └─> Emits: ModuleEnabled, ModuleDisabled
    ↓
Domain Events
└─> ModuleEnabled.ts
└─> ModuleDisabled.ts
    ↓
Domain Repository
└─> ModuleRegistryRepository.ts
    ↓
Infrastructure Repository
└─> FirestoreModuleRegistryRepository.ts
    ├─> EventStore: events/module-registry/{workspaceId}/events
    └─> Projection: projections/module-registry
    ↓
Projection Builder
└─> ModuleRegistryProjectionBuilder.ts
    ├─> handleModuleEnabled()
    ├─> handleModuleDisabled()
    └─> Schema: { workspaceId, moduleId, status, capabilities, enabledAt }
    ↓
Angular Services
├─> ModuleRegistryCommandService
├─> ModuleRegistryQueryService (workspaceId-first)
└─> ModuleRegistryStoreService
```

---

## TypeScript Path Aliases

**Configured in `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@shared": ["packages/ui-angular/src/app/shared/index"],
      "@core": ["packages/ui-angular/src/app/core/index"],
      "@env/*": ["packages/ui-angular/src/environments/*"],
      "@_mock": ["_mock/index"],
      "@app/*": ["packages/ui-angular/src/app/*"],
      "@account-domain": ["packages/account-domain/index"],
      "@account-domain/*": ["packages/account-domain/*"],
      "@core-engine": ["packages/core-engine/index"],
      "@core-engine/*": ["packages/core-engine/*"],
      "@saas-domain": ["packages/saas-domain/index"],
      "@saas-domain/*": ["packages/saas-domain/*"],
      "@platform-adapters": ["packages/platform-adapters/index"],
      "@platform-adapters/*": ["packages/platform-adapters/*"],
      "@ui-angular": ["packages/ui-angular/src/app/index"],
      "@ui-angular/*": ["packages/ui-angular/src/app/*"]
    }
  }
}
```

**Usage Examples:**

✅ **CORRECT - Import via package alias:**
```typescript
import { Workspace, WorkspaceId, WorkspaceCreated } from '@account-domain/workspace';
import { Account, AccountId } from '@account-domain/account';
import { Membership, MemberId, Role } from '@account-domain/membership';
import { IEventStore, AggregateRoot } from '@core-engine';
```

❌ **WRONG - Direct file import:**
```typescript
import { Workspace } from '@account-domain/workspace/aggregates/Workspace';
import { Account } from '../../../account-domain/account/aggregates/Account';
```

---

## Index.ts Export Structure (Phase 1 Aggregates)

### Workspace Aggregate Exports

**File:** `packages/account-domain/workspace/index.ts`

```typescript
// Value Objects
export * from './value-objects/WorkspaceId';
export * from './value-objects/WorkspaceRole';

// Aggregates
export * from './aggregates/Workspace';

// Domain Events
export * from './events/WorkspaceCreated';
export * from './events/WorkspaceArchived';

// Repository Interface
export * from './repositories/WorkspaceRepository';
```

**External Usage:**
```typescript
import { 
  Workspace,           // Aggregate
  WorkspaceId,         // Value Object
  WorkspaceRole,       // Value Object
  WorkspaceCreated,    // Event
  WorkspaceArchived,   // Event
  WorkspaceRepository  // Repository Interface
} from '@account-domain/workspace';
```

### Account Aggregate Exports

**File:** `packages/account-domain/account/index.ts`

```typescript
// Value Objects
export * from './value-objects/AccountId';
export * from './value-objects/AccountStatus';

// Aggregates
export * from './aggregates/Account';

// Domain Events
export * from './events/AccountCreated';
export * from './events/AccountSuspended';

// Repository Interface
export * from './repositories/AccountRepository';

// Domain Services
export * from './services/AccountMembershipService';
```

**External Usage:**
```typescript
import { 
  Account,                   // Aggregate
  AccountId,                 // Value Object
  AccountStatus,             // Value Object
  AccountCreated,            // Event
  AccountSuspended,          // Event
  AccountRepository,         // Repository Interface
  AccountMembershipService   // Domain Service
} from '@account-domain/account';
```

### Membership Aggregate Exports

**File:** `packages/account-domain/membership/index.ts`

```typescript
// Value Objects
export * from './value-objects/MemberId';
export * from './value-objects/Role';

// Aggregates
export * from './aggregates/Membership';

// Domain Events
export * from './events/MemberJoinedWorkspace';
export * from './events/MemberRoleChanged';

// Repository Interface
export * from './repositories/MembershipRepository';
```

**External Usage:**
```typescript
import { 
  Membership,            // Aggregate
  MemberId,              // Value Object
  Role,                  // Value Object
  MemberJoinedWorkspace, // Event
  MemberRoleChanged,     // Event
  MembershipRepository   // Repository Interface
} from '@account-domain/membership';
```

### ModuleRegistry Aggregate Exports

**File:** `packages/account-domain/module-registry/index.ts`

```typescript
// Value Objects
export * from './value-objects/ModuleId';
export * from './value-objects/ModuleStatus';
export * from './value-objects/Capability';

// Aggregates
export * from './aggregates/ModuleRegistry';

// Domain Events
export * from './events/ModuleEnabled';
export * from './events/ModuleDisabled';

// Repository Interface
export * from './repositories/ModuleRegistryRepository';
```

**External Usage:**
```typescript
import { 
  ModuleRegistry,           // Aggregate
  ModuleId,                 // Value Object
  ModuleStatus,             // Value Object
  Capability,               // Value Object
  ModuleEnabled,            // Event
  ModuleDisabled,           // Event
  ModuleRegistryRepository  // Repository Interface
} from '@account-domain/module-registry';
```

---

## Package Root Index.ts Exports

### account-domain Package Export

**File:** `packages/account-domain/index.ts`

```typescript
// Account Aggregate
export * from './account';

// Workspace Aggregate
export * from './workspace';

// Membership Aggregate
export * from './membership';

// ModuleRegistry Aggregate
export * from './module-registry';
```

**External Usage (All-in-One Import):**
```typescript
import { 
  Account, AccountId, AccountStatus,
  Workspace, WorkspaceId, WorkspaceRole,
  Membership, MemberId, Role,
  ModuleRegistry, ModuleId, ModuleStatus, Capability
} from '@account-domain';
```

**External Usage (Granular Import - Recommended):**
```typescript
import { Workspace, WorkspaceId } from '@account-domain/workspace';
import { Account, AccountId } from '@account-domain/account';
import { Membership, MemberId } from '@account-domain/membership';
```

---

## _private Folder Encapsulation Guidelines (Future Refactoring)

**NOTE:** This is a FUTURE encapsulation pattern, NOT implemented in current skeleton phase. Files remain in current locations for Phase 1 implementation.

### Proposed _private Structure (For Reference)

**Current Structure (Phase 1):**
```
packages/account-domain/workspace/
├── aggregates/Workspace.ts
├── value-objects/WorkspaceId.ts
├── events/WorkspaceCreated.ts
└── index.ts (exports all)
```

**Future _private Structure (Post Phase 1):**
```
packages/account-domain/workspace/
├── _private/
│   ├── aggregates/Workspace.ts
│   ├── value-objects/WorkspaceId.ts
│   └── events/WorkspaceCreated.ts
└── index.ts (ONLY public exports)
```

### _private Folder Benefits

**Encapsulation:**
- External consumers MUST import through index.ts
- Internal implementation details hidden in _private/
- TypeScript prevents direct file imports

**Example (Future Pattern):**
```typescript
// ✅ CORRECT - Via index.ts
import { Workspace, WorkspaceId } from '@account-domain/workspace';

// ❌ BLOCKED - Direct import fails (file in _private/)
import { Workspace } from '@account-domain/workspace/_private/aggregates/Workspace';
// TypeScript error: Module not found
```

### Implementation Timeline

**Phase 1 (Current):**
- ✅ Skeleton files in standard locations
- ✅ index.ts exports established
- ✅ External imports via package aliases

**Post Phase 1 (Future Refactoring):**
- Move implementation files to _private/ folders
- Update index.ts to export from _private/
- Enforce boundary with TypeScript path restrictions

**Why NOT Now:**
- Phase 1 focuses on skeleton structure validation
- Moving files would complicate initial vertical slice implementation
- _private pattern best applied after implementation is stable

---

## Complete Phase 1 Package Dependency Graph

```
┌─────────────────────────────────────────────────┐
│         ui-angular (Angular Services)           │
│  - WorkspaceCommandService / QueryService       │
│  - AccountCommandService / QueryService         │
│  - MembershipCommandService / QueryService      │
│  - ModuleRegistryCommandService / QueryService  │
└────────────────┬────────────────────────────────┘
                 │ depends on
                 ↓
┌─────────────────────────────────────────────────┐
│    platform-adapters (Infrastructure)           │
│  - FirestoreWorkspaceRepository                 │
│  - FirestoreAccountRepository                   │
│  - FirestoreMembershipRepository                │
│  - FirestoreModuleRegistryRepository            │
│  - WorkspaceProjectionBuilder                   │
│  - AccountProjectionBuilder                     │
│  - MembershipProjectionBuilder                  │
│  - ModuleRegistryProjectionBuilder              │
└────────────────┬────────────────────────────────┘
                 │ depends on
                 ↓
┌─────────────────────────────────────────────────┐
│      account-domain (Domain Layer)              │
│  - Workspace (aggregate + VOs + events)         │
│  - Account (aggregate + VOs + events)           │
│  - Membership (aggregate + VOs + events)        │
│  - ModuleRegistry (aggregate + VOs + events)    │
│  - Repository interfaces                        │
└────────────────┬────────────────────────────────┘
                 │ depends on
                 ↓
┌─────────────────────────────────────────────────┐
│        core-engine (Core Abstractions)          │
│  - AggregateRoot                                │
│  - IEventStore                                  │
│  - IRepository                                  │
│  - IProjection                                  │
│  - CreateWorkspaceCommand/Handler               │
│  - CreateAccountCommand/Handler                 │
│  - MembershipSaga                               │
└─────────────────────────────────────────────────┘
```

---

## Phase 1 Skeleton Verification

### Component Inventory

| Component Type | Count | Files | Status |
|---------------|-------|-------|--------|
| **Value Objects** | 9 | AccountId, AccountStatus, WorkspaceId, WorkspaceRole, MemberId, Role, ModuleId, ModuleStatus, Capability | ✅ Complete |
| **Aggregates** | 4 | Account, Workspace, Membership, ModuleRegistry | ✅ Complete |
| **Domain Events** | 8 | AccountCreated, AccountSuspended, WorkspaceCreated, WorkspaceArchived, MemberJoinedWorkspace, MemberRoleChanged, ModuleEnabled, ModuleDisabled | ✅ Complete |
| **Domain Repositories** | 4 | AccountRepository, WorkspaceRepository, MembershipRepository, ModuleRegistryRepository | ✅ Complete |
| **Infrastructure Repositories** | 4 | FirestoreAccountRepository, FirestoreWorkspaceRepository, FirestoreMembershipRepository, FirestoreModuleRegistryRepository | ✅ Complete |
| **Projection Builders** | 4 | AccountProjectionBuilder, WorkspaceProjectionBuilder, MembershipProjectionBuilder, ModuleRegistryProjectionBuilder | ✅ Complete |
| **Commands** | 2 | CreateAccountCommand, CreateWorkspaceCommand | ✅ Complete |
| **Handlers** | 2 | CreateAccountHandler, CreateWorkspaceHandler | ✅ Complete |
| **Sagas** | 1 | MembershipSaga | ✅ Complete |
| **Angular Services** | 12 | 4 Command + 4 Query + 4 Store services | ✅ Complete |

**Total Phase 1 Skeleton Files:** ~50 files

---

## Architecture Compliance Validation

### ✅ Multi-Tenant Isolation

**Workspace Boundary:**
- Workspace aggregate uses `ownerId` (from Account)
- Workspace Projection schema: `{ id, ownerId, name, status, createdAt }`
- Workspace Query: `findByOwnerId(ownerId)` - Account-scoped

**Membership Boundary:**
- Membership Projection includes `workspaceId` for isolation
- Membership Query: `findByWorkspaceId(workspaceId)` - Workspace-scoped
- Membership Query: `findByAccountId(accountId)` - Account-scoped

**ModuleRegistry Boundary:**
- ModuleRegistry Projection includes `workspaceId`
- ModuleRegistry Query: `findByWorkspaceId(workspaceId)` - Workspace-scoped

### ✅ CQRS Separation

**Command Side (Writes):**
- Command Services → Repository → EventStore
- Account/Workspace/Membership/ModuleRegistry repositories save events
- NO Projection reads in Command Services

**Query Side (Reads):**
- Query Services → Projection collections
- Account/Workspace/Membership/ModuleRegistry query services read projections
- NO Repository/EventStore access in Query Services

### ✅ Event Sourcing

**Event Store Pattern:**
- All aggregates have `static fromEvents(events: DomainEvent[]): Aggregate`
- Repository `save()` appends events to EventStore
- Repository `load()` replays events via `fromEvents()`
- Event paths: `events/{aggregateType}/{aggregateId}/events/{eventId}`

**Projection Pattern:**
- Projection Builders handle events from EventStore
- Projections are query-optimized (NOT aggregate state mirrors)
- Projection paths: `projections/{aggregateType}`

### ✅ Clean Architecture

**Dependency Direction:**
```
core-engine ← account-domain ← platform-adapters ← ui-angular
```

**SDK Isolation:**
- ✅ core-engine: ZERO SDK imports (Pure TypeScript)
- ✅ account-domain: ZERO SDK imports (Pure TypeScript)
- ✅ platform-adapters: ONLY layer with Firestore SDK
- ✅ ui-angular: Depends on Repository interfaces (NOT implementations)

### ✅ Skeleton-Only Compliance

**All Phase 1 files:**
- ✅ Method signatures present
- ✅ Method bodies throw "Not implemented - skeleton only"
- ✅ NO SDK/AngularFire imports in domain/core layers
- ✅ NO business logic implementations
- ✅ Compilable TypeScript structure only

---

## Implementation Order Justification

### Why This Sequence?

**1. Workspace (FIRST):**
- Establishes multi-tenant boundary (workspaceId)
- Validates full vertical slice pattern
- Required by ALL SaaS entities (Task, Payment, Issue)
- Minimal dependencies (only Account ownerId)

**2. Account (SECOND):**
- Provides ownership for Workspace
- Independent aggregate (no dependencies)
- Foundation for all user identity

**3. Membership (THIRD):**
- Bridges Account ↔ Workspace
- Requires both Account and Workspace
- Validates Saga pattern (MembershipSaga)

**4. ModuleRegistry (FOURTH):**
- Part of Workspace boundary
- Feature flag activation per workspace
- Enables conditional SaaS module access

**After Phase 1:**
- Phase 2: Task → Issue (depends on Workspace)
- Phase 3: Payment (depends on Workspace)

---

## Next Steps

**Phase 1 Implementation Readiness:**
1. ✅ All skeleton files verified
2. ✅ Package exports documented
3. ✅ TypeScript paths configured
4. ✅ Multi-tenant boundary enforced
5. ✅ Architecture compliance validated

**Ready for Phase 1 Implementation:**
- Start with Workspace vertical slice
- Implement EventStore → Projection → Query pattern
- Validate multi-tenant isolation
- Test complete flow: Domain → Infrastructure → UI

**Phase 1 Success Criteria:**
- [ ] Create workspace via Command
- [ ] Load workspace via Repository (fromEvents)
- [ ] Query workspace via Projection
- [ ] Display workspace in Angular UI
- [ ] Verify workspaceId isolation in all queries

---

## References

- **SKELETON_VERIFICATION.md** - Complete dependency graphs for all 7 aggregates
- **BACKEND_DEPENDENCY_GRAPH.md** - Implementation order recommendations
- **PACKAGE_EXPORT_HIERARCHY.md** - All 47 index.ts export mappings
- **VERTICAL_SLICE_FIRST.md** - Why Workspace is the first vertical slice
- **AGGREGATE_BOUNDARY.md** (×4) - Boundary rules for each aggregate

<!-- END OF FILE -->
