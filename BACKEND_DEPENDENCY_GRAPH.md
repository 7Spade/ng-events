# Backend Dependency Graph & Implementation Order

## 🎯 Purpose

This document provides a comprehensive view of the backend skeleton structure, showing dependencies between all layers and the recommended implementation order for each aggregate.

## 📋 Skeleton Structure Verification

### ✅ Existing Components (Verified)

| Layer | Component | Status | Location |
|-------|-----------|--------|----------|
| **Domain** | Value Objects (19 total) | ✅ Complete | `packages/{domain}/{aggregate}/value-objects/` |
| **Domain** | Aggregates (7 total) | ✅ Complete | `packages/{domain}/{aggregate}/aggregates/` |
| **Domain** | Events | ✅ Complete | `packages/{domain}/{aggregate}/events/` |
| **Domain** | Domain Services (4 total) | ✅ Complete | `packages/{domain}/{aggregate}/services/` |
| **Domain** | Repositories (7 total) | ✅ Complete | `packages/{domain}/{aggregate}/repositories/` |
| **Application** | Commands (4 total) | ✅ Complete | `packages/core-engine/application/commands/` |
| **Application** | Handlers (4 total) | ✅ Complete | `packages/core-engine/application/handlers/` |
| **Infrastructure** | EventStore | ✅ Complete | `packages/platform-adapters/firestore/event-store/` |
| **Infrastructure** | Projection Builders (7 total) | ✅ Complete | `packages/platform-adapters/firestore/projections/` |
| **Infrastructure** | Sagas (3 total) | ✅ Complete | `packages/core-engine/sagas/` |
| **UI** | Command Services (7 total) | ✅ Complete | `packages/ui-angular/src/app/core/services/commands/` |
| **UI** | Query Services (7 total) | ✅ Complete | `packages/ui-angular/src/app/core/services/queries/` |
| **UI** | State Management (7 total) | ✅ Complete | `packages/ui-angular/src/app/core/services/state-management/` |

---

## 🏗️ Account Domain Dependencies

### 1. Account Aggregate

```
Value Objects (Foundation)
├── AccountId.ts → packages/account-domain/account/value-objects/AccountId.ts
│   ├── Type Alias: AccountId = string
│   └── Class: AccountIdVO (skeleton)
└── AccountStatus.ts → packages/account-domain/account/value-objects/AccountStatus.ts
    ├── Type Alias: AccountStatus = 'active' | 'suspended' | 'deleted'
    └── Class: AccountStatusVO (skeleton)

Aggregate Root
└── AccountEntity.ts → packages/account-domain/account/aggregates/AccountEntity.ts
    ├── Depends on: AccountId, AccountStatus
    └── Creates Events: AccountCreated, AccountUpdated, AccountDeleted

Domain Events
├── AccountCreated.ts → packages/account-domain/account/events/AccountCreated.ts
│   ├── Payload: { accountId, email, createdAt }
│   └── Consumed by: AccountProjectionBuilder
├── AccountUpdated.ts → packages/account-domain/account/events/AccountUpdated.ts
│   ├── Payload: { accountId, updates }
│   └── Consumed by: AccountProjectionBuilder
└── AccountDeleted.ts → packages/account-domain/account/events/AccountDeleted.ts
    ├── Payload: { accountId, deletedAt }
    └── Consumed by: AccountProjectionBuilder

Domain Service
└── AccountMembershipService.ts → packages/account-domain/account/services/AccountMembershipService.ts
    ├── Coordinates: Account + Membership
    └── Methods: addMemberToWorkspace(), removeMemberFromWorkspace()

Repository
└── AccountRepository.ts → packages/account-domain/account/repositories/AccountRepository.ts
    ├── Extends: Repository<AccountEntity>
    ├── EventStore Operations: save(), load(), delete()
    └── Projection Queries: findByEmail(), findByStatus() (TODO)

Application Layer
├── CreateAccountCommand.ts → packages/core-engine/application/commands/CreateAccountCommand.ts
│   └── Interface: { email, password }
└── CreateAccountHandler.ts → packages/core-engine/application/handlers/CreateAccountHandler.ts
    ├── Depends on: AccountRepository
    └── Flow: validate → create aggregate → save events

Infrastructure
├── FirestoreAccountRepository.ts → packages/platform-adapters/firestore/repositories/AccountRepository.ts
│   ├── Implements: AccountRepository
│   ├── EventStore: events/account/{accountId}/events
│   └── Projection: projections/account
└── AccountProjectionBuilder.ts → packages/platform-adapters/firestore/projections/AccountProjectionBuilder.ts
    ├── Extends: ProjectionBuilder
    ├── Schema: { id, accountId, email, status, version, lastUpdated }
    └── Event Handlers: handleAccountCreated(), handleAccountUpdated(), handleAccountDeleted()

UI Layer (Angular)
├── AccountCommandService.ts → packages/ui-angular/src/app/core/services/commands/account-command.service.ts
│   ├── Injectable
│   ├── Methods: createAccount(), updateAccount(), deleteAccount()
│   └── Depends on: AccountRepository (TODO injection)
├── AccountQueryService.ts → packages/ui-angular/src/app/core/services/queries/account-query.service.ts
│   ├── Injectable
│   ├── Methods: getAccountById(), findByEmail(), listAccounts()
│   └── Queries: Projection collection (TODO)
└── AccountStoreService.ts → packages/ui-angular/src/app/core/services/state-management/account-store.service.ts
    ├── Injectable (root)
    ├── State: BehaviorSubject<Account | null>
    └── Methods: loadAccount(), selectAccount()
```

**Implementation Order for Account:**
1. AccountIdVO, AccountStatusVO (Value Objects)
2. AccountEntity (Aggregate)
3. Account Events (AccountCreated, AccountUpdated, AccountDeleted)
4. AccountRepository (Domain)
5. CreateAccountCommand + Handler
6. FirestoreAccountRepository (Infrastructure)
7. AccountProjectionBuilder
8. Angular Services (Command, Query, Store)

---

### 2. Workspace Aggregate (FIRST VERTICAL SLICE)

```
Value Objects (Foundation)
├── WorkspaceId.ts → packages/account-domain/workspace/value-objects/WorkspaceId.ts
│   ├── Type Alias: WorkspaceId = string (blueprintId compatible)
│   └── Class: WorkspaceIdVO (skeleton)
└── WorkspaceRole.ts → packages/account-domain/workspace/value-objects/WorkspaceRole.ts
    ├── Type Alias: WorkspaceRole = 'owner' | 'admin' | 'member'
    └── Class: WorkspaceRoleVO (skeleton)

Aggregate Root
└── WorkspaceEntity.ts → packages/account-domain/workspace/aggregates/WorkspaceEntity.ts
    ├── Depends on: WorkspaceId, AccountId (foreign key)
    └── Creates Events: WorkspaceCreated, WorkspaceUpdated, WorkspaceDeleted

Domain Events
├── WorkspaceCreated.ts → packages/account-domain/workspace/events/WorkspaceCreated.ts
│   ├── Payload: { workspaceId, accountId, name, createdAt }
│   └── Consumed by: WorkspaceProjectionBuilder, MembershipSaga
├── WorkspaceUpdated.ts → packages/account-domain/workspace/events/WorkspaceUpdated.ts
│   ├── Payload: { workspaceId, updates }
│   └── Consumed by: WorkspaceProjectionBuilder
└── WorkspaceDeleted.ts → packages/account-domain/workspace/events/WorkspaceDeleted.ts
    ├── Payload: { workspaceId, deletedAt }
    └── Consumed by: WorkspaceProjectionBuilder

Repository
└── WorkspaceRepository.ts → packages/account-domain/workspace/repositories/WorkspaceRepository.ts
    ├── Extends: Repository<WorkspaceEntity>
    ├── EventStore Operations: save(), load(), delete()
    └── Projection Queries: findByAccountId(), findByWorkspaceId() (TODO)

Application Layer
├── CreateWorkspaceCommand.ts → packages/core-engine/application/commands/CreateWorkspaceCommand.ts
│   └── Interface: { accountId, name, description? }
└── CreateWorkspaceHandler.ts → packages/core-engine/application/handlers/CreateWorkspaceHandler.ts
    ├── Depends on: WorkspaceRepository
    └── Flow: validate → create aggregate → save events → trigger saga

Infrastructure
├── FirestoreWorkspaceRepository.ts → packages/platform-adapters/firestore/repositories/WorkspaceRepository.ts
│   ├── Implements: WorkspaceRepository
│   ├── EventStore: events/workspace/{workspaceId}/events
│   └── Projection: projections/workspace
└── WorkspaceProjectionBuilder.ts → packages/platform-adapters/firestore/projections/WorkspaceProjectionBuilder.ts
    ├── Extends: ProjectionBuilder
    ├── Schema: { id, workspaceId, accountId, name, status, version, lastUpdated }
    └── Event Handlers: handleWorkspaceCreated(), handleWorkspaceUpdated(), handleWorkspaceDeleted()

Saga
└── MembershipSaga.ts → packages/core-engine/sagas/MembershipSaga.ts
    ├── Listens to: WorkspaceCreated
    └── Actions: Auto-create owner membership

UI Layer (Angular)
├── WorkspaceCommandService.ts → packages/ui-angular/src/app/core/services/commands/workspace-command.service.ts
│   ├── Methods: createWorkspace(), updateWorkspace(), deleteWorkspace()
│   └── Depends on: WorkspaceRepository (TODO)
├── WorkspaceQueryService.ts → packages/ui-angular/src/app/core/services/queries/workspace-query.service.ts
│   ├── Methods: getWorkspaceById(), listWorkspacesByAccount()
│   └── Queries: Projection collection (TODO)
└── WorkspaceStoreService.ts → packages/ui-angular/src/app/core/services/state-management/workspace-store.service.ts
    ├── State: BehaviorSubject<Workspace | null>
    └── Methods: loadWorkspace(), selectWorkspace(), switchWorkspace()
```

**Implementation Order for Workspace (PRIORITY 1):**
1. WorkspaceIdVO, WorkspaceRoleVO (Value Objects) ✅
2. WorkspaceEntity (Aggregate) ✅
3. Workspace Events ✅
4. WorkspaceRepository ✅
5. CreateWorkspaceCommand + Handler ✅
6. FirestoreWorkspaceRepository ✅
7. WorkspaceProjectionBuilder ✅
8. MembershipSaga (for auto-membership) ✅
9. Angular Services (Command, Query, Store) ✅

**Why Workspace First:**
- ✅ WorkspaceId is THE multi-tenant boundary
- ✅ All SaaS entities require valid WorkspaceId
- ✅ Validates complete Event Sourcing + CQRS + Projection pattern
- ✅ Minimal dependencies (only Account)

---

### 3. Membership Aggregate

```
Value Objects (Foundation)
├── MemberId.ts → packages/account-domain/membership/value-objects/MemberId.ts
│   ├── Type Alias: MemberId = string
│   └── Class: MemberIdVO (skeleton)
└── Role.ts → packages/account-domain/membership/value-objects/Role.ts
    ├── Type Alias: Role = 'owner' | 'admin' | 'member' | 'viewer'
    └── Class: RoleVO (skeleton)

Aggregate Root
└── MembershipEntity.ts → packages/account-domain/membership/aggregates/MembershipEntity.ts
    ├── Depends on: MemberId, AccountId, WorkspaceId, Role
    └── Creates Events: MembershipCreated, MembershipUpdated, MembershipRevoked

Domain Events
├── MembershipCreated.ts → packages/account-domain/membership/events/MembershipCreated.ts
│   ├── Payload: { memberId, accountId, workspaceId, role, createdAt }
│   └── Consumed by: MembershipProjectionBuilder
├── MembershipUpdated.ts → packages/account-domain/membership/events/MembershipUpdated.ts
│   ├── Payload: { memberId, updates }
│   └── Consumed by: MembershipProjectionBuilder
└── MembershipRevoked.ts → packages/account-domain/membership/events/MembershipRevoked.ts
    ├── Payload: { memberId, revokedAt }
    └── Consumed by: MembershipProjectionBuilder

Repository
└── MembershipRepository.ts → packages/account-domain/membership/repositories/MembershipRepository.ts
    ├── Extends: Repository<MembershipEntity>
    ├── EventStore Operations: save(), load(), delete()
    └── Projection Queries: findByWorkspaceId(), findByAccountId() (TODO)

Infrastructure
├── FirestoreMembershipRepository.ts → packages/platform-adapters/firestore/repositories/MembershipRepository.ts
│   ├── EventStore: events/membership/{memberId}/events
│   └── Projection: projections/membership
└── MembershipProjectionBuilder.ts → packages/platform-adapters/firestore/projections/MembershipProjectionBuilder.ts
    ├── Schema: { id, memberId, accountId, workspaceId, role, version, lastUpdated }
    └── Event Handlers: handleMembershipCreated(), handleMembershipUpdated(), handleMembershipRevoked()

UI Layer (Angular)
├── MembershipCommandService.ts
├── MembershipQueryService.ts (requires workspaceId)
└── MembershipStoreService.ts
```

**Implementation Order for Membership:**
1. MemberIdVO, RoleVO
2. MembershipEntity
3. Membership Events
4. MembershipRepository
5. FirestoreMembershipRepository
6. MembershipProjectionBuilder
7. Angular Services

---

### 4. ModuleRegistry Aggregate

```
Value Objects (Foundation)
├── ModuleId.ts → packages/account-domain/module-registry/value-objects/ModuleId.ts
├── ModuleStatus.ts → packages/account-domain/module-registry/value-objects/ModuleStatus.ts
└── Capability.ts → packages/account-domain/module-registry/value-objects/Capability.ts

Aggregate Root
└── ModuleRegistryEntity.ts → packages/account-domain/module-registry/aggregates/ModuleRegistryEntity.ts
    ├── Depends on: ModuleId, WorkspaceId, ModuleStatus, Capability[]
    └── Creates Events: ModuleRegistered, ModuleEnabled, ModuleDisabled

Domain Events
├── ModuleRegistered.ts
├── ModuleEnabled.ts
└── ModuleDisabled.ts

Repository
└── ModuleRegistryRepository.ts

Infrastructure
├── FirestoreModuleRegistryRepository.ts
└── ModuleRegistryProjectionBuilder.ts

UI Layer (Angular)
├── ModuleRegistryCommandService.ts
├── ModuleRegistryQueryService.ts
└── ModuleRegistryStoreService.ts
```

---

## 🏗️ SaaS Domain Dependencies

### 5. Task Aggregate

```
Value Objects (Foundation)
├── TaskId.ts → packages/saas-domain/task/value-objects/TaskId.ts
├── TaskStatus.ts → packages/saas-domain/task/value-objects/TaskStatus.ts
│   └── Type: 'todo' | 'in-progress' | 'completed' | 'cancelled'
└── TaskPriority.ts → packages/saas-domain/task/value-objects/TaskPriority.ts
    └── Type: 'low' | 'medium' | 'high' | 'urgent'

Aggregate Root
└── TaskEntity.ts → packages/saas-domain/task/aggregates/TaskEntity.ts
    ├── Depends on: TaskId, WorkspaceId, TaskStatus, TaskPriority
    └── Creates Events: TaskCreated, TaskAssigned, TaskCompleted, TaskCancelled

Domain Events
├── TaskCreated.ts → packages/saas-domain/task/events/TaskCreated.ts
├── TaskAssigned.ts → packages/saas-domain/task/events/TaskAssigned.ts
├── TaskCompleted.ts → packages/saas-domain/task/events/TaskCompleted.ts
└── TaskCancelled.ts → packages/saas-domain/task/events/TaskCancelled.ts

Domain Service
└── TaskAssignmentService.ts → packages/saas-domain/task/services/TaskAssignmentService.ts
    ├── Coordinates: Task + Membership
    └── Validates: assignee has access to workspace

Repository
└── TaskRepository.ts → packages/saas-domain/task/repositories/TaskRepository.ts
    ├── EventStore Operations: save(), load(), delete()
    └── Projection Queries: findByWorkspaceId(), findByStatus() (TODO)

Application Layer
├── AssignTaskCommand.ts → packages/core-engine/application/commands/AssignTaskCommand.ts
└── AssignTaskHandler.ts → packages/core-engine/application/handlers/AssignTaskHandler.ts

Infrastructure
├── FirestoreTaskRepository.ts → packages/platform-adapters/firestore/repositories/TaskRepository.ts
│   ├── EventStore: events/task/{taskId}/events
│   └── Projection: projections/task (with workspaceId index)
└── TaskProjectionBuilder.ts → packages/platform-adapters/firestore/projections/TaskProjectionBuilder.ts
    ├── Schema: { id, taskId, workspaceId, status, priority, assigneeId, version, lastUpdated }
    └── Event Handlers: handleTaskCreated(), handleTaskAssigned(), handleTaskCompleted()

Saga
└── TaskSaga.ts → packages/core-engine/sagas/TaskSaga.ts
    ├── Listens to: TaskCreated, TaskAssigned, TaskCompleted
    └── Actions: Send notifications, update metrics

UI Layer (Angular)
├── TaskCommandService.ts (workspaceId required)
├── TaskQueryService.ts (workspaceId FIRST parameter)
└── TaskStoreService.ts
```

**Implementation Order for Task:**
1. TaskIdVO, TaskStatusVO, TaskPriorityVO
2. TaskEntity
3. Task Events
4. TaskAssignmentService
5. TaskRepository
6. AssignTaskCommand + Handler
7. FirestoreTaskRepository
8. TaskProjectionBuilder
9. TaskSaga
10. Angular Services

---

### 6. Payment Aggregate

```
Value Objects (Foundation)
├── PaymentId.ts → packages/saas-domain/payment/value-objects/PaymentId.ts
├── PaymentStatus.ts → packages/saas-domain/payment/value-objects/PaymentStatus.ts
│   └── Type: 'pending' | 'completed' | 'failed' | 'refunded'
└── Currency.ts → packages/saas-domain/payment/value-objects/Currency.ts
    └── Type: 'USD' | 'EUR' | 'GBP' | 'JPY'

Aggregate Root
└── PaymentEntity.ts → packages/saas-domain/payment/aggregates/PaymentEntity.ts
    ├── Depends on: PaymentId, WorkspaceId, PaymentStatus, Currency, Amount
    └── Creates Events: PaymentInitiated, PaymentCompleted, PaymentFailed, PaymentRefunded

Domain Events
├── PaymentInitiated.ts
├── PaymentCompleted.ts
├── PaymentFailed.ts
└── PaymentRefunded.ts

Domain Service
└── PaymentProcessingService.ts → packages/saas-domain/payment/services/PaymentProcessingService.ts
    ├── Coordinates: Payment + Workspace billing
    └── Methods: processPayment(), refundPayment()

Repository
└── PaymentRepository.ts → packages/saas-domain/payment/repositories/PaymentRepository.ts

Application Layer
├── ProcessPaymentCommand.ts → packages/core-engine/application/commands/ProcessPaymentCommand.ts
└── ProcessPaymentHandler.ts → packages/core-engine/application/handlers/ProcessPaymentHandler.ts

Infrastructure
├── FirestorePaymentRepository.ts
│   ├── EventStore: events/payment/{paymentId}/events
│   └── Projection: projections/payment (with workspaceId index)
└── PaymentProjectionBuilder.ts
    ├── Schema: { id, paymentId, workspaceId, status, amount, currency, version, lastUpdated }
    └── Event Handlers: handlePaymentInitiated(), handlePaymentCompleted(), handlePaymentFailed()

Saga
└── PaymentSaga.ts → packages/core-engine/sagas/PaymentSaga.ts
    ├── Listens to: PaymentCompleted, PaymentFailed
    └── Actions: Send receipts, update billing, trigger refunds

UI Layer (Angular)
├── PaymentCommandService.ts (workspaceId required)
├── PaymentQueryService.ts (workspaceId FIRST parameter)
└── PaymentStoreService.ts
```

**Implementation Order for Payment:**
1. PaymentIdVO, PaymentStatusVO, CurrencyVO
2. PaymentEntity
3. Payment Events
4. PaymentProcessingService
5. PaymentRepository
6. ProcessPaymentCommand + Handler
7. FirestorePaymentRepository
8. PaymentProjectionBuilder
9. PaymentSaga
10. Angular Services

---

### 7. Issue Aggregate

```
Value Objects (Foundation)
├── IssueId.ts → packages/saas-domain/issue/value-objects/IssueId.ts
├── IssueType.ts → packages/saas-domain/issue/value-objects/IssueType.ts
│   └── Type: 'bug' | 'feature' | 'enhancement' | 'documentation'
├── IssuePriority.ts → packages/saas-domain/issue/value-objects/IssuePriority.ts
│   └── Type: 'low' | 'medium' | 'high' | 'critical'
└── IssueStatus.ts → packages/saas-domain/issue/value-objects/IssueStatus.ts
    └── Type: 'open' | 'in-progress' | 'resolved' | 'closed'

Aggregate Root
└── IssueEntity.ts → packages/saas-domain/issue/aggregates/IssueEntity.ts
    ├── Depends on: IssueId, WorkspaceId, IssueType, IssuePriority, IssueStatus
    └── Creates Events: IssueCreated, IssueAssigned, IssueResolved, IssueClosed

Domain Events
├── IssueCreated.ts
├── IssueAssigned.ts
├── IssueResolved.ts
└── IssueClosed.ts

Domain Service
└── IssueWorkflowService.ts → packages/saas-domain/issue/services/IssueWorkflowService.ts
    ├── Coordinates: Issue + Task linking
    └── Methods: linkToTask(), unlinkFromTask()

Repository
└── IssueRepository.ts → packages/saas-domain/issue/repositories/IssueRepository.ts

Infrastructure
├── FirestoreIssueRepository.ts
│   ├── EventStore: events/issue/{issueId}/events
│   └── Projection: projections/issue (with workspaceId index)
└── IssueProjectionBuilder.ts
    ├── Schema: { id, issueId, workspaceId, type, priority, status, version, lastUpdated }
    └── Event Handlers: handleIssueCreated(), handleIssueAssigned(), handleIssueResolved()

UI Layer (Angular)
├── IssueCommandService.ts (workspaceId required)
├── IssueQueryService.ts (workspaceId FIRST parameter)
└── IssueStoreService.ts
```

**Implementation Order for Issue:**
1. IssueIdVO, IssueTypeVO, IssuePriorityVO, IssueStatusVO
2. IssueEntity
3. Issue Events
4. IssueWorkflowService
5. IssueRepository
6. FirestoreIssueRepository
7. IssueProjectionBuilder
8. Angular Services

---

## 🔄 Cross-Cutting Infrastructure

### Event Store Utilities

```
Event Store Core
└── FirestoreEventStore.ts → packages/platform-adapters/firestore/event-store/FirestoreEventStore.ts
    ├── Methods: append(), load(), getAllEvents()
    └── Path: events/{aggregateType}/{aggregateId}/events/{eventId}

Event Utilities
├── EventUpcaster.ts → packages/core-engine/event-store/EventUpcaster.ts
│   └── Transforms: old event schema → current schema
├── EventVersioning.ts → packages/core-engine/event-store/EventVersioning.ts
│   └── Manages: schema version tracking
├── DeadLetterQueue.ts → packages/core-engine/event-store/DeadLetterQueue.ts
│   └── Stores: failed events for retry
└── RetryPolicy.ts → packages/core-engine/event-store/RetryPolicy.ts
    └── Configures: retry strategies and circuit breaking
```

### Platform Adapters

```
Base Interfaces
├── IAdapter.ts → packages/platform-adapters/IAdapter.ts
│   └── Base adapter contract
└── IRepositoryAdapter.ts → packages/platform-adapters/IRepositoryAdapter.ts
    └── Repository adapter contract

Logging
└── Logger.ts → packages/platform-adapters/logging/Logger.ts
    ├── Levels: DEBUG, INFO, WARN, ERROR
    └── Methods: log(), error(), warn(), info(), debug()

Error Handling
└── ApplicationError.ts → packages/platform-adapters/errors/ApplicationError.ts
    ├── ValidationError
    ├── NotFoundError
    └── ConflictError
```

---

## 📊 Recommended Implementation Sequence

### Phase 1: Foundation (Account Domain)

**Priority: CRITICAL**

1. **Workspace** (FIRST VERTICAL SLICE) ✅
   - Value Objects → Aggregate → Events → Repository
   - Command/Handler → Infrastructure → Projection → Saga
   - Angular Services → End-to-End validation
   - **Validates**: Complete Event Sourcing + CQRS + Projection pattern

2. **Account** (Foundation for ownership)
   - Similar flow to Workspace
   - **Enables**: Account-based ownership model

3. **Membership** (Access control)
   - Depends on: Account, Workspace
   - **Enables**: Multi-user workspace access

4. **ModuleRegistry** (Feature flags)
   - Depends on: Workspace
   - **Enables**: Feature activation per workspace

### Phase 2: Core SaaS Features

**Priority: HIGH**

5. **Task** (Primary work entity)
   - Depends on: Workspace, Membership
   - **Enables**: Core task management

6. **Issue** (Support/tracking)
   - Depends on: Workspace, Task
   - **Enables**: Issue tracking and linking

### Phase 3: Business Logic

**Priority: MEDIUM**

7. **Payment** (Billing)
   - Depends on: Workspace
   - **Enables**: Subscription and billing

---

## 🔍 Dependency Validation Checklist

### For Each Aggregate, Verify:

- [ ] All Value Objects have class skeletons with create() and validate()
- [ ] Aggregate has fromEvents() static method for event replay
- [ ] All domain events are defined with correct payloads
- [ ] Repository extends base Repository interface
- [ ] EventStore path follows pattern: `events/{aggregateType}/{aggregateId}/events`
- [ ] Projection schema includes workspaceId for SaaS aggregates
- [ ] Projection Builder extends ProjectionBuilder base class
- [ ] SaaS projections have workspaceId index
- [ ] Angular Query Services have workspaceId as FIRST parameter for SaaS
- [ ] Command Handlers follow: load → execute → save flow
- [ ] Sagas listen to relevant domain events
- [ ] All files are skeleton-only (no implementations, no SDK)

---

## 🎯 Multi-Tenant Boundary Enforcement

### CRITICAL: WorkspaceId Isolation

**ALL SaaS operations MUST:**
- ✅ Filter by `workspaceId` in Repository queries
- ✅ Include `workspaceId` in Projection schemas
- ✅ Validate `workspaceId` in Command Handlers
- ✅ Pass `workspaceId` as FIRST parameter in Angular Query Services
- ❌ NEVER use `ownerId` or `accountId` for SaaS entity isolation

**Account Domain:**
- Uses `ownerId` / `accountId` for isolation (NOT workspaceId)
- Workspace belongs to Account (N:1 relationship)

---

## 📝 Notes

1. **All paths are relative to project root**: `/home/runner/work/ng-events/ng-events/`
2. **Skeleton only**: All implementations contain method signatures with throw statements
3. **No SDK dependencies**: Zero Firebase, AngularFire, or platform-specific imports
4. **Clean Architecture**: Dependency flow is core-engine ← platform-adapters ← ui-angular
5. **CQRS enforced**: Commands use Repository (EventStore), Queries use Projections
6. **Event Sourcing**: Aggregates reconstructed ONLY from event replay, NEVER from Projections

---

## 🚀 Next Steps for Implementation

### When Starting Implementation Phase:

1. **Choose Workspace as first vertical slice** (already designated)
2. **Implement in order**: VO → Aggregate → Events → Repository → Handler → Infrastructure → UI
3. **Validate at each step**: Ensure compilable, testable, and follows architecture
4. **Add integration tests**: Test complete flow from Command to Projection
5. **Document decisions**: Update AGGREGATE_BOUNDARY.md with implementation notes

### Future Phases:

- **Phase 2**: Implement Workspace validation logic in create() methods
- **Phase 3**: Implement EventStore SDK integration
- **Phase 4**: Implement Projection Builder event handling
- **Phase 5**: Implement Angular Service reactivity with RxJS
- **Phase 6**: End-to-end testing and optimization

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-03  
**Status**: Skeleton Phase Complete - Ready for Implementation Phase
