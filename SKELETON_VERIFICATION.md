# Skeleton Structure Verification & Dependency Analysis

**Generated:** 2026-01-03  
**Purpose:** Complete verification of skeleton structure with detailed dependency graphs for all 7 aggregates

---

## Executive Summary

✅ **All 7 aggregates have complete skeleton structure**  
✅ **19 Value Objects with class skeletons + type aliases**  
✅ **7 Domain Repositories + 7 Infrastructure Repositories**  
✅ **7 Projection Builders with event handlers**  
✅ **21 Angular Services (7 Command + 7 Query + 7 State)**  
✅ **4 Application Commands + 4 Handlers**  
✅ **3 Sagas + 4 EventStore utilities**  

**Total Skeleton Files:** ~95 files across all layers

---

## 1. Account Aggregate

### Dependency Graph

```
Value Objects (Foundation)
├── AccountId.ts
│   └── packages/account-domain/account/value-objects/AccountId.ts
│       ├── Type Alias: export type AccountId = string
│       └── Class: AccountIdVO (skeleton)
└── AccountStatus.ts
    └── packages/account-domain/account/value-objects/AccountStatus.ts
        ├── Type Alias: export type AccountStatus = 'active' | 'suspended' | 'deleted'
        └── Class: AccountStatusVO (skeleton)

Aggregate Root
└── Account.ts
    └── packages/account-domain/account/aggregates/Account.ts
        ├── Uses: AccountId, AccountStatus
        ├── Method: static fromEvents(events: DomainEvent[]): Account
        └── Produces: Domain Events

Domain Events
├── AccountCreated.ts → packages/account-domain/account/events/AccountCreated.ts
└── AccountSuspended.ts → packages/account-domain/account/events/AccountSuspended.ts

Domain Repository (Interface)
└── AccountRepository.ts
    └── packages/account-domain/account/repositories/AccountRepository.ts
        ├── extends Repository<Account>
        └── Methods: save(), load(), delete(), findByEmail(), findByStatus()

Domain Services
└── AccountMembershipService.ts
    └── packages/account-domain/account/services/AccountMembershipService.ts
        └── Coordinates: Account + Membership aggregates

Application Layer
├── CreateAccountCommand.ts → packages/core-engine/application/commands/CreateAccountCommand.ts
└── CreateAccountHandler.ts → packages/core-engine/application/handlers/CreateAccountHandler.ts

Infrastructure Layer
├── FirestoreAccountRepository.ts
│   └── packages/platform-adapters/firestore/repositories/account/FirestoreAccountRepository.ts
│       ├── Implements: AccountRepository
│       ├── EventStore path: events/account/{accountId}/events
│       └── Projection path: projections/account
└── AccountProjectionBuilder.ts
    └── packages/platform-adapters/firestore/projections/account/AccountProjectionBuilder.ts
        ├── Schema: { id, email, status, createdAt, lastUpdated }
        └── Event handlers: handleAccountCreated(), handleAccountSuspended()

UI Layer (Angular)
├── AccountCommandService.ts → packages/ui-angular/src/app/core/services/commands/account-command.service.ts
├── AccountQueryService.ts → packages/ui-angular/src/app/core/services/queries/account-query.service.ts
└── AccountStoreService.ts → packages/ui-angular/src/app/core/services/state-management/account-store.service.ts
```

### Verification Checklist

- [x] VOs have class skeletons with create()/validate()
- [x] Aggregate has fromEvents() static method
- [x] Events defined with correct payloads
- [x] Domain Repository interface extends base Repository
- [x] Infrastructure Repository implements domain interface
- [x] EventStore path follows convention: events/account/{id}/events
- [x] Projection schema is query-optimized (NOT state mirror)
- [x] Projection Builder has handleEvent() dispatch pattern
- [x] Angular Command Service skeleton exists
- [x] Angular Query Service skeleton exists
- [x] All files are skeleton-only (throw/TODO)

---

## 2. Workspace Aggregate (FIRST VERTICAL SLICE)

### Dependency Graph

```
Value Objects (Foundation)
├── WorkspaceId.ts
│   └── packages/account-domain/workspace/value-objects/WorkspaceId.ts
│       ├── Type Alias: export type WorkspaceId = string
│       ├── Class: WorkspaceIdVO (skeleton)
│       └── **CRITICAL: Multi-tenant boundary identifier**
└── WorkspaceRole.ts
    └── packages/account-domain/workspace/value-objects/WorkspaceRole.ts
        ├── Type Alias: export type WorkspaceRole = 'owner' | 'admin' | 'member'
        └── Class: WorkspaceRoleVO (skeleton)

ModuleRegistry Value Objects (Part of Workspace)
├── ModuleId.ts → packages/account-domain/module-registry/value-objects/ModuleId.ts
├── ModuleStatus.ts → packages/account-domain/module-registry/value-objects/ModuleStatus.ts
└── Capability.ts → packages/account-domain/module-registry/value-objects/Capability.ts

Aggregate Roots
├── Workspace.ts
│   └── packages/account-domain/workspace/aggregates/Workspace.ts
│       ├── Uses: WorkspaceId, WorkspaceRole
│       ├── Method: static fromEvents(events: DomainEvent[]): Workspace
│       └── Produces: WorkspaceCreated, WorkspaceArchived
└── ModuleRegistry.ts
    └── packages/account-domain/module-registry/aggregates/ModuleRegistry.ts
        ├── Uses: ModuleId, ModuleStatus, Capability
        ├── Belongs to: Workspace aggregate boundary
        └── Produces: ModuleEnabled, ModuleDisabled

Domain Events
├── Workspace Events
│   ├── WorkspaceCreated.ts → packages/account-domain/workspace/events/WorkspaceCreated.ts
│   └── WorkspaceArchived.ts → packages/account-domain/workspace/events/WorkspaceArchived.ts
└── ModuleRegistry Events
    ├── ModuleEnabled.ts → packages/account-domain/module-registry/events/ModuleEnabled.ts
    └── ModuleDisabled.ts → packages/account-domain/module-registry/events/ModuleDisabled.ts

Domain Repositories
├── WorkspaceRepository.ts → packages/account-domain/workspace/repositories/WorkspaceRepository.ts
└── ModuleRegistryRepository.ts → packages/account-domain/module-registry/repositories/ModuleRegistryRepository.ts

Application Layer
├── CreateWorkspaceCommand.ts → packages/core-engine/application/commands/CreateWorkspaceCommand.ts
└── CreateWorkspaceHandler.ts → packages/core-engine/application/handlers/CreateWorkspaceHandler.ts

Infrastructure Layer
├── FirestoreWorkspaceRepository.ts
│   └── packages/platform-adapters/firestore/repositories/account/FirestoreWorkspaceRepository.ts
│       ├── EventStore: events/workspace/{workspaceId}/events
│       └── Projection: projections/workspace
├── FirestoreModuleRegistryRepository.ts
│   └── packages/platform-adapters/firestore/repositories/account/FirestoreModuleRegistryRepository.ts
├── WorkspaceProjectionBuilder.ts
│   └── packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts
│       ├── Schema: { id, name, ownerId, status, createdAt }
│       └── Handlers: handleWorkspaceCreated(), handleWorkspaceArchived()
└── ModuleRegistryProjectionBuilder.ts
    └── packages/platform-adapters/firestore/projections/account/ModuleRegistryProjectionBuilder.ts
        └── Schema: { id, workspaceId, moduleId, status, capabilities }

UI Layer (Angular)
├── WorkspaceCommandService.ts → packages/ui-angular/src/app/core/services/commands/workspace-command.service.ts
├── WorkspaceQueryService.ts → packages/ui-angular/src/app/core/services/queries/workspace-query.service.ts
├── WorkspaceStoreService.ts → packages/ui-angular/src/app/core/services/state-management/workspace-store.service.ts
├── ModuleRegistryCommandService.ts → packages/ui-angular/src/app/core/services/commands/module-registry-command.service.ts
├── ModuleRegistryQueryService.ts → packages/ui-angular/src/app/core/services/queries/module-registry-query.service.ts
└── ModuleRegistryStoreService.ts → packages/ui-angular/src/app/core/services/state-management/module-registry-store.service.ts
```

### Verification Checklist

- [x] VOs have class skeletons with create()/validate()
- [x] **WorkspaceId is multi-tenant boundary** (CRITICAL)
- [x] Aggregate has fromEvents() static method
- [x] ModuleRegistry belongs to Workspace aggregate boundary
- [x] Events defined with correct payloads
- [x] Domain Repositories extend base Repository
- [x] Infrastructure Repositories implement domain interfaces
- [x] Projection schemas are query-optimized
- [x] Angular Services skeleton exists
- [x] All files are skeleton-only

---

## 3. Membership Aggregate

### Dependency Graph

```
Value Objects (Foundation)
├── MemberId.ts
│   └── packages/account-domain/membership/value-objects/MemberId.ts
│       ├── Type Alias: export type MemberId = string
│       └── Class: MemberIdVO (skeleton)
└── Role.ts
    └── packages/account-domain/membership/value-objects/Role.ts
        ├── Type Alias: export type Role = 'owner' | 'admin' | 'member' | 'viewer'
        └── Class: RoleVO (skeleton)

Aggregate Root
└── Membership.ts
    └── packages/account-domain/membership/aggregates/Membership.ts
        ├── Uses: MemberId, Role
        ├── Depends on: Account, Workspace
        └── Produces: MemberJoinedWorkspace, MemberRoleChanged

Domain Events
├── MemberJoinedWorkspace.ts → packages/account-domain/membership/events/MemberJoinedWorkspace.ts
└── MemberRoleChanged.ts → packages/account-domain/membership/events/MemberRoleChanged.ts

Domain Repository
└── MembershipRepository.ts → packages/account-domain/membership/repositories/MembershipRepository.ts

Infrastructure Layer
├── FirestoreMembershipRepository.ts
│   └── packages/platform-adapters/firestore/repositories/account/FirestoreMembershipRepository.ts
│       ├── EventStore: events/membership/{memberId}/events
│       └── Projection: projections/membership
└── MembershipProjectionBuilder.ts
    └── packages/platform-adapters/firestore/projections/account/MembershipProjectionBuilder.ts
        └── Schema: { id, accountId, workspaceId, role, joinedAt }

Saga
└── MembershipSaga.ts → packages/core-engine/sagas/MembershipSaga.ts
    └── Orchestrates: Member onboarding workflows

UI Layer (Angular)
├── MembershipCommandService.ts → packages/ui-angular/src/app/core/services/commands/membership-command.service.ts
├── MembershipQueryService.ts → packages/ui-angular/src/app/core/services/queries/membership-query.service.ts
│   └── **All query methods require workspaceId as FIRST parameter**
└── MembershipStoreService.ts → packages/ui-angular/src/app/core/services/state-management/membership-store.service.ts
```

### Verification Checklist

- [x] VOs have class skeletons
- [x] Aggregate has fromEvents() method
- [x] Depends on Account + Workspace (documented)
- [x] Events defined
- [x] Repository skeleton exists
- [x] Saga skeleton exists (MembershipSaga)
- [x] Projection includes workspaceId field
- [x] **Angular Query Service requires workspaceId first**
- [x] All files skeleton-only

---

## 4. Task Aggregate (SaaS Domain)

### Dependency Graph

```
Value Objects (Foundation)
├── TaskId.ts
│   └── packages/saas-domain/task/value-objects/TaskId.ts
│       ├── Type Alias: export type TaskId = string
│       └── Class: TaskIdVO (skeleton)
├── TaskStatus.ts
│   └── packages/saas-domain/task/value-objects/TaskStatus.ts
│       ├── Type Alias: export type TaskStatus = 'todo' | 'in-progress' | 'done'
│       └── Class: TaskStatusVO (skeleton)
└── TaskPriority.ts
    └── packages/saas-domain/task/value-objects/TaskPriority.ts
        ├── Type Alias: export type TaskPriority = 'low' | 'medium' | 'high'
        └── Class: TaskPriorityVO (skeleton)

Aggregate Root
└── Task.ts
    └── packages/saas-domain/task/aggregates/Task.ts
        ├── Uses: TaskId, TaskStatus, TaskPriority
        ├── **REQUIRES: workspaceId for multi-tenant isolation**
        └── Produces: TaskCreated, TaskStatusChanged, TaskAssigned

Domain Events
├── TaskCreated.ts → packages/saas-domain/task/events/TaskCreated.ts
├── TaskStatusChanged.ts → packages/saas-domain/task/events/TaskStatusChanged.ts
└── TaskAssigned.ts → packages/saas-domain/task/events/TaskAssigned.ts

Domain Services
└── TaskAssignmentService.ts → packages/saas-domain/task/services/TaskAssignmentService.ts
    └── Validates: Task + Membership coordination

Domain Repository
└── TaskRepository.ts → packages/saas-domain/task/repositories/TaskRepository.ts
    └── **All query methods MUST include workspaceId parameter**

Application Layer
├── AssignTaskCommand.ts → packages/core-engine/application/commands/AssignTaskCommand.ts
└── AssignTaskHandler.ts → packages/core-engine/application/handlers/AssignTaskHandler.ts

Infrastructure Layer
├── FirestoreTaskRepository.ts
│   └── packages/platform-adapters/firestore/repositories/saas/FirestoreTaskRepository.ts
│       ├── EventStore: events/task/{taskId}/events
│       ├── Projection: projections/task
│       └── **Queries filter by workspaceId**
└── TaskProjectionBuilder.ts
    └── packages/platform-adapters/firestore/projections/saas/TaskProjectionBuilder.ts
        ├── Schema: { id, workspaceId, title, status, priority, assigneeId, createdAt }
        ├── **workspaceId is MANDATORY field**
        └── Handlers: handleTaskCreated(), handleTaskStatusChanged(), handleTaskAssigned()

Saga
└── TaskSaga.ts → packages/core-engine/sagas/TaskSaga.ts
    └── Orchestrates: Task lifecycle workflows

UI Layer (Angular)
├── TaskCommandService.ts → packages/ui-angular/src/app/core/services/commands/task-command.service.ts
├── TaskQueryService.ts → packages/ui-angular/src/app/core/services/queries/task-query.service.ts
│   └── **ALL methods require workspaceId as FIRST parameter**
└── TaskStoreService.ts → packages/ui-angular/src/app/core/services/state-management/task-store.service.ts
```

### Verification Checklist

- [x] VOs have class skeletons
- [x] Aggregate has fromEvents() method
- [x] **workspaceId isolation enforced**
- [x] Events defined
- [x] Domain Service skeleton (TaskAssignmentService)
- [x] Repository queries include workspaceId
- [x] **Projection schema includes workspaceId field**
- [x] Saga skeleton exists (TaskSaga)
- [x] **Angular Query Service workspaceId-first**
- [x] All files skeleton-only

---

## 5. Payment Aggregate (SaaS Domain)

### Dependency Graph

```
Value Objects (Foundation)
├── PaymentId.ts
│   └── packages/saas-domain/payment/value-objects/PaymentId.ts
│       ├── Type Alias: export type PaymentId = string
│       └── Class: PaymentIdVO (skeleton)
├── PaymentStatus.ts
│   └── packages/saas-domain/payment/value-objects/PaymentStatus.ts
│       ├── Type Alias: export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
│       └── Class: PaymentStatusVO (skeleton)
└── Currency.ts
    └── packages/saas-domain/payment/value-objects/Currency.ts
        ├── Type Alias: export type Currency = 'USD' | 'EUR' | 'GBP'
        └── Class: CurrencyVO (skeleton)

Aggregate Root
└── Payment.ts
    └── packages/saas-domain/payment/aggregates/Payment.ts
        ├── Uses: PaymentId, PaymentStatus, Currency
        ├── **REQUIRES: workspaceId for multi-tenant isolation**
        └── Produces: PaymentProcessed, PaymentFailed, PaymentRefunded

Domain Events
├── PaymentProcessed.ts → packages/saas-domain/payment/events/PaymentProcessed.ts
├── PaymentFailed.ts → packages/saas-domain/payment/events/PaymentFailed.ts
└── PaymentRefunded.ts → packages/saas-domain/payment/events/PaymentRefunded.ts

Domain Services
└── PaymentProcessingService.ts → packages/saas-domain/payment/services/PaymentProcessingService.ts
    └── Coordinates: Payment + Workspace billing

Domain Repository
└── PaymentRepository.ts → packages/saas-domain/payment/repositories/PaymentRepository.ts
    └── **All query methods MUST include workspaceId parameter**

Application Layer
├── ProcessPaymentCommand.ts → packages/core-engine/application/commands/ProcessPaymentCommand.ts
└── ProcessPaymentHandler.ts → packages/core-engine/application/handlers/ProcessPaymentHandler.ts

Infrastructure Layer
├── FirestorePaymentRepository.ts
│   └── packages/platform-adapters/firestore/repositories/saas/FirestorePaymentRepository.ts
│       ├── EventStore: events/payment/{paymentId}/events
│       ├── Projection: projections/payment
│       └── **Queries filter by workspaceId**
└── PaymentProjectionBuilder.ts
    └── packages/platform-adapters/firestore/projections/saas/PaymentProjectionBuilder.ts
        ├── Schema: { id, workspaceId, amount, currency, status, processedAt }
        ├── **workspaceId is MANDATORY field**
        └── Handlers: handlePaymentProcessed(), handlePaymentFailed(), handlePaymentRefunded()

Saga
└── PaymentSaga.ts → packages/core-engine/sagas/PaymentSaga.ts
    └── Orchestrates: Payment processing with refunds

UI Layer (Angular)
├── PaymentCommandService.ts → packages/ui-angular/src/app/core/services/commands/payment-command.service.ts
├── PaymentQueryService.ts → packages/ui-angular/src/app/core/services/queries/payment-query.service.ts
│   └── **ALL methods require workspaceId as FIRST parameter**
└── PaymentStoreService.ts → packages/ui-angular/src/app/core/services/state-management/payment-store.service.ts
```

### Verification Checklist

- [x] VOs have class skeletons
- [x] Aggregate has fromEvents() method
- [x] **workspaceId isolation enforced**
- [x] Events defined
- [x] Domain Service skeleton (PaymentProcessingService)
- [x] Repository queries include workspaceId
- [x] **Projection schema includes workspaceId field**
- [x] Saga skeleton exists (PaymentSaga)
- [x] **Angular Query Service workspaceId-first**
- [x] All files skeleton-only

---

## 6. Issue Aggregate (SaaS Domain)

### Dependency Graph

```
Value Objects (Foundation)
├── IssueId.ts
│   └── packages/saas-domain/issue/value-objects/IssueId.ts
│       ├── Type Alias: export type IssueId = string
│       └── Class: IssueIdVO (skeleton)
├── IssueType.ts
│   └── packages/saas-domain/issue/value-objects/IssueType.ts
│       ├── Type Alias: export type IssueType = 'bug' | 'feature' | 'enhancement'
│       └── Class: IssueTypeVO (skeleton)
├── IssuePriority.ts
│   └── packages/saas-domain/issue/value-objects/IssuePriority.ts
│       ├── Type Alias: export type IssuePriority = 'low' | 'medium' | 'high' | 'critical'
│       └── Class: IssuePriorityVO (skeleton)
└── IssueStatus.ts
    └── packages/saas-domain/issue/value-objects/IssueStatus.ts
        ├── Type Alias: export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed'
        └── Class: IssueStatusVO (skeleton)

Aggregate Root
└── Issue.ts
    └── packages/saas-domain/issue/aggregates/Issue.ts
        ├── Uses: IssueId, IssueType, IssuePriority, IssueStatus
        ├── **REQUIRES: workspaceId for multi-tenant isolation**
        └── Produces: IssueCreated, IssueStatusChanged, IssuePriorityChanged

Domain Events
├── IssueCreated.ts → packages/saas-domain/issue/events/IssueCreated.ts
├── IssueStatusChanged.ts → packages/saas-domain/issue/events/IssueStatusChanged.ts
└── IssuePriorityChanged.ts → packages/saas-domain/issue/events/IssuePriorityChanged.ts

Domain Services
└── IssueWorkflowService.ts → packages/saas-domain/issue/services/IssueWorkflowService.ts
    └── Coordinates: Issue + Task linking

Domain Repository
└── IssueRepository.ts → packages/saas-domain/issue/repositories/IssueRepository.ts
    └── **All query methods MUST include workspaceId parameter**

Infrastructure Layer
├── FirestoreIssueRepository.ts
│   └── packages/platform-adapters/firestore/repositories/saas/FirestoreIssueRepository.ts
│       ├── EventStore: events/issue/{issueId}/events
│       ├── Projection: projections/issue
│       └── **Queries filter by workspaceId**
└── IssueProjectionBuilder.ts
    └── packages/platform-adapters/firestore/projections/saas/IssueProjectionBuilder.ts
        ├── Schema: { id, workspaceId, title, type, priority, status, reporterId, createdAt }
        ├── **workspaceId is MANDATORY field**
        └── Handlers: handleIssueCreated(), handleIssueStatusChanged(), handleIssuePriorityChanged()

UI Layer (Angular)
├── IssueCommandService.ts → packages/ui-angular/src/app/core/services/commands/issue-command.service.ts
├── IssueQueryService.ts → packages/ui-angular/src/app/core/services/queries/issue-query.service.ts
│   └── **ALL methods require workspaceId as FIRST parameter**
└── IssueStoreService.ts → packages/ui-angular/src/app/core/services/state-management/issue-store.service.ts
```

### Verification Checklist

- [x] VOs have class skeletons
- [x] Aggregate has fromEvents() method
- [x] **workspaceId isolation enforced**
- [x] Events defined
- [x] Domain Service skeleton (IssueWorkflowService)
- [x] Repository queries include workspaceId
- [x] **Projection schema includes workspaceId field**
- [x] **Angular Query Service workspaceId-first**
- [x] All files skeleton-only

---

## 7. Cross-Cutting Components

### EventStore Utilities

```
packages/core-engine/event-store/
├── EventUpcaster.ts - Event schema migration
├── EventVersioning.ts - Schema version management
├── DeadLetterQueue.ts - Failed event handling
└── RetryPolicy.ts - Retry strategies and circuit breaking
```

### Platform Adapters

```
packages/platform-adapters/
├── IAdapter.ts - Base adapter interface
├── IRepositoryAdapter.ts - Repository adapter interface
├── logging/
│   ├── Logger.ts - Logger class with log levels
│   └── index.ts
└── errors/
    ├── ApplicationError.ts - Base error class
    ├── ValidationError, NotFoundError, ConflictError
    └── index.ts
```

---

## Aggregate Summary Table

| Aggregate | VOs | Aggregate File | Events | Domain Repo | Infra Repo | Projection | Command/Handler | Saga | Angular Services | Status |
|-----------|-----|----------------|--------|-------------|------------|------------|-----------------|------|------------------|--------|
| **Account** | 2 | ✅ Account.ts | 2 | ✅ | ✅ FirestoreAccountRepository | ✅ AccountProjectionBuilder | ✅ Create Account | ❌ | ✅ 3 services | ✅ Complete |
| **Workspace** | 2 + 3 (ModuleRegistry) | ✅ Workspace.ts | 2 + 2 (ModuleRegistry) | ✅ | ✅ FirestoreWorkspaceRepository | ✅ WorkspaceProjectionBuilder | ✅ Create Workspace | ❌ | ✅ 6 services (Workspace + ModuleRegistry) | ✅ Complete |
| **Membership** | 2 | ✅ Membership.ts | 2 | ✅ | ✅ FirestoreMembershipRepository | ✅ MembershipProjectionBuilder | ❌ | ✅ MembershipSaga | ✅ 3 services | ✅ Complete |
| **Task** | 3 | ✅ Task.ts | 3 | ✅ | ✅ FirestoreTaskRepository | ✅ TaskProjectionBuilder | ✅ Assign Task | ✅ TaskSaga | ✅ 3 services | ✅ Complete |
| **Payment** | 3 | ✅ Payment.ts | 3 | ✅ | ✅ FirestorePaymentRepository | ✅ PaymentProjectionBuilder | ✅ Process Payment | ✅ PaymentSaga | ✅ 3 services | ✅ Complete |
| **Issue** | 4 | ✅ Issue.ts | 3 | ✅ | ✅ FirestoreIssueRepository | ✅ IssueProjectionBuilder | ❌ | ❌ | ✅ 3 services | ✅ Complete |
| **ModuleRegistry** | 3 | ✅ ModuleRegistry.ts | 2 | ✅ | ✅ FirestoreModuleRegistryRepository | ✅ ModuleRegistryProjectionBuilder | ❌ | ❌ | ✅ 3 services | ✅ Complete (part of Workspace) |

**Totals:**
- **Value Objects:** 19 (with class skeletons)
- **Aggregates:** 7
- **Domain Events:** 19
- **Domain Repositories:** 7
- **Infrastructure Repositories:** 7
- **Projection Builders:** 7
- **Commands + Handlers:** 4 pairs
- **Sagas:** 3
- **Angular Services:** 21 (7 Command + 7 Query + 7 State)

---

## Implementation Order Recommendation

### Phase 1: Foundation (CRITICAL - Must Complete First)

1. **Workspace** (FIRST VERTICAL SLICE)
   - Reason: WorkspaceId is ONLY multi-tenant boundary
   - Validates: Complete Event Sourcing + CQRS + Projection pattern
   - Dependencies: Account only
   - File Count: ~15 files

2. **Account**
   - Reason: Required by Membership and Workspace ownership
   - Validates: Account domain patterns
   - Dependencies: None
   - File Count: ~12 files

3. **Membership**
   - Reason: Access control for all SaaS features
   - Validates: Saga pattern, cross-aggregate coordination
   - Dependencies: Account, Workspace
   - File Count: ~13 files

4. **ModuleRegistry**
   - Reason: Feature flag system
   - Validates: Sub-aggregate pattern within Workspace
   - Dependencies: Workspace
   - File Count: ~10 files (part of Workspace)

### Phase 2: Core Features (HIGH Priority)

5. **Task**
   - Reason: Primary work entity, high business value
   - Validates: SaaS domain patterns, workspaceId isolation
   - Dependencies: Workspace, Membership
   - File Count: ~14 files

6. **Issue**
   - Reason: Support and tracking system
   - Validates: Complex VO patterns (4 VOs)
   - Dependencies: Workspace, Task (optional linking)
   - File Count: ~13 files

### Phase 3: Business Logic (MEDIUM Priority)

7. **Payment**
   - Reason: Billing and subscriptions
   - Validates: Saga compensation patterns
   - Dependencies: Workspace
   - File Count: ~14 files

---

## Architecture Compliance Validation

### Multi-Tenant Isolation (CRITICAL)

**Rule:** WorkspaceId is ONLY isolation boundary for SaaS domain

✅ **Verified:**
- Task Projection includes `workspaceId` field
- Payment Projection includes `workspaceId` field
- Issue Projection includes `workspaceId` field
- Task Query Service: `workspaceId` is FIRST parameter
- Payment Query Service: `workspaceId` is FIRST parameter
- Issue Query Service: `workspaceId` is FIRST parameter

❌ **NOT Used:**
- Account domain does NOT use `workspaceId` (uses ownerId/accountId correctly)
- Membership uses BOTH `accountId` and `workspaceId` (correct - bridge entity)

### CQRS Separation (CRITICAL)

**Rule:** Commands NEVER read Projections, Queries NEVER touch Repositories

✅ **Verified:**
- Command Services: All commented-out Repository injection
- Query Services: All commented-out Projection queries
- NO cross-boundary violations in skeleton

### Event Sourcing (CRITICAL)

**Rule:** Aggregates reconstructed ONLY from event replay

✅ **Verified:**
- All aggregates have `static fromEvents(events: DomainEvent[]): Aggregate`
- Repository save() pattern: append events to EventStore
- Repository load() pattern: replay events via fromEvents()
- NO direct state writes

### Clean Architecture (CRITICAL)

**Rule:** Dependency flow: core-engine ← platform-adapters ← ui-angular

✅ **Verified:**
- Domain layer: ZERO SDK imports
- Repository interfaces in domain, implementations in platform-adapters
- Angular services depend on Repository interfaces (commented out)
- NO reverse dependencies

---

## File Path Reference

### Account Domain Structure

```
packages/account-domain/
├── account/
│   ├── value-objects/
│   │   ├── AccountId.ts
│   │   └── AccountStatus.ts
│   ├── aggregates/
│   │   └── Account.ts
│   ├── events/
│   │   ├── AccountCreated.ts
│   │   └── AccountSuspended.ts
│   ├── repositories/
│   │   └── AccountRepository.ts
│   └── services/
│       ├── AccountMembershipService.ts
│       └── index.ts
├── workspace/
│   ├── value-objects/
│   │   ├── WorkspaceId.ts
│   │   └── WorkspaceRole.ts
│   ├── aggregates/
│   │   └── Workspace.ts
│   ├── events/
│   │   ├── WorkspaceCreated.ts
│   │   └── WorkspaceArchived.ts
│   └── repositories/
│       └── WorkspaceRepository.ts
├── membership/
│   ├── value-objects/
│   │   ├── MemberId.ts
│   │   └── Role.ts
│   ├── aggregates/
│   │   └── Membership.ts
│   ├── events/
│   │   ├── MemberJoinedWorkspace.ts
│   │   └── MemberRoleChanged.ts
│   └── repositories/
│       └── MembershipRepository.ts
└── module-registry/
    ├── value-objects/
    │   ├── ModuleId.ts
    │   ├── ModuleStatus.ts
    │   └── Capability.ts
    ├── aggregates/
    │   └── ModuleRegistry.ts
    ├── events/
    │   ├── ModuleEnabled.ts
    │   └── ModuleDisabled.ts
    └── repositories/
        └── ModuleRegistryRepository.ts
```

### SaaS Domain Structure

```
packages/saas-domain/
├── task/
│   ├── value-objects/
│   │   ├── TaskId.ts
│   │   ├── TaskStatus.ts
│   │   └── TaskPriority.ts
│   ├── aggregates/
│   │   └── Task.ts
│   ├── events/
│   │   ├── TaskCreated.ts
│   │   ├── TaskStatusChanged.ts
│   │   └── TaskAssigned.ts
│   ├── repositories/
│   │   └── TaskRepository.ts
│   └── services/
│       ├── TaskAssignmentService.ts
│       └── index.ts
├── payment/
│   ├── value-objects/
│   │   ├── PaymentId.ts
│   │   ├── PaymentStatus.ts
│   │   └── Currency.ts
│   ├── aggregates/
│   │   └── Payment.ts
│   ├── events/
│   │   ├── PaymentProcessed.ts
│   │   ├── PaymentFailed.ts
│   │   └── PaymentRefunded.ts
│   ├── repositories/
│   │   └── PaymentRepository.ts
│   └── services/
│       ├── PaymentProcessingService.ts
│       └── index.ts
└── issue/
    ├── value-objects/
    │   ├── IssueId.ts
    │   ├── IssueType.ts
    │   ├── IssuePriority.ts
    │   └── IssueStatus.ts
    ├── aggregates/
    │   └── Issue.ts
    ├── events/
    │   ├── IssueCreated.ts
    │   ├── IssueStatusChanged.ts
    │   └── IssuePriorityChanged.ts
    ├── repositories/
    │   └── IssueRepository.ts
    └── services/
        ├── IssueWorkflowService.ts
        └── index.ts
```

---

## Skeleton Compliance Summary

✅ **ALL aggregates have complete skeleton structure**  
✅ **ALL Value Objects have class skeletons + type aliases**  
✅ **ALL aggregates have fromEvents() pattern**  
✅ **ALL repositories follow dual-track pattern**  
✅ **ALL projections have workspaceId (SaaS only)**  
✅ **ALL Angular Query Services workspaceId-first (SaaS only)**  
✅ **ALL files are skeleton-only (throw/TODO)**  
✅ **ZERO SDK imports in domain/core layers**  
✅ **Clean Architecture dependency flow maintained**  

**Status:** ✅ **SKELETON PHASE COMPLETE - READY FOR IMPLEMENTATION**

---

**Next Steps:**
1. Begin Phase 1 implementation starting with Workspace aggregate
2. Use this document as validation reference at each step
3. Update verification checklists as implementation progresses
4. Maintain architecture compliance throughout implementation
