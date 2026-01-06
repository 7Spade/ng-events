<!-- markdownlint-disable-file -->

# Task Details: Next Steps Implementation - Event Sourcing Skeletons

## Research Reference

**Source Research**: #file:../research/20260106-next-steps-skeletons.md

## Phase 1: Core-Engine Contract Extensions

### Task 1.1: Implement causality metadata validator

Create a validator utility in core-engine to ensure all commands and events carry required causality metadata before processing.

- **Files**:
  - packages/core-engine/src/causality/causality-metadata.validator.ts - New validator implementation
  - packages/core-engine/src/causality/index.ts - Export validator
- **Success**:
  - Validator rejects events/commands missing causedBy, causedByUser, causedByAction, or blueprintId
  - Provides clear error messages indicating which field is missing
  - Can be used at aggregate boundaries during event application
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 17-19) - Causality metadata validator requirement
  - #file:../research/20260106-next-steps-skeletons.md (Lines 56-58) - Validation enforcement at aggregate boundaries
- **Dependencies**:
  - Existing CausalityMetadata interface from domain-event.ts

### Task 1.2: Create projection rebuilder implementation interface

Define the contract for projection rebuilders that support full, incremental, and selective replay strategies.

- **Files**:
  - packages/core-engine/src/projections/projection-rebuilder.ts - Complete rebuilder interface with rebuild strategies
  - packages/core-engine/src/projections/index.ts - Export rebuilder interface
- **Success**:
  - Interface supports full rebuild (all events)
  - Interface supports incremental rebuild (from timestamp)
  - Interface supports selective rebuild (specific aggregateIds)
  - Preserves causality ordering during replay
  - Includes error handling strategy (skip for ops, abort for tests)
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 20-20) - ProjectionRebuilder requirement
  - #file:../research/20260106-next-steps-skeletons.md (Lines 29-32) - Rebuild strategies and operations
- **Dependencies**:
  - Existing ProjectionRebuilderInterface stub
  - DomainEvent interface

### Task 1.3: Add idempotency key support to domain events

Extend the domain event metadata to include idempotency key for duplicate detection.

- **Files**:
  - packages/core-engine/src/events/domain-event.ts - Add idempotencyKey to DomainEventMetadata
- **Success**:
  - DomainEventMetadata includes optional idempotencyKey field
  - Field is documented for duplicate detection usage
  - Maintains backward compatibility
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 17-19) - Idempotency key in metadata schema
  - #file:../research/20260106-next-steps-skeletons.md (Lines 40-41) - Idempotency key in commands
- **Dependencies**:
  - Existing DomainEventMetadata interface

## Phase 2: Account-Domain Implementation

### Task 2.1: Implement Workspace aggregate with blueprintId boundary

Create the Workspace aggregate that serves as the tenant boundary (blueprintId).

- **Files**:
  - packages/account-domain/src/aggregates/workspace.aggregate.ts - Complete workspace aggregate implementation
  - packages/account-domain/src/aggregates/index.ts - Export workspace aggregate
- **Success**:
  - Workspace aggregate has blueprintId as primary identifier
  - Supports workspace creation with owner assignment
  - Validates blueprintId is present in all operations
  - Maintains workspace metadata (name, settings, etc.)
  - Enforces owner-only operations for critical changes
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 23-24) - Workspace aggregate with blueprintId boundary
  - #file:../research/20260106-next-steps-skeletons.md (Lines 56-58) - BlueprintId validation at aggregate boundary
- **Dependencies**:
  - core-engine aggregate base (if exists)
  - DomainEvent interface
  - Causality metadata validator

### Task 2.2: Implement Membership aggregate with role/ownership guards

Create the Membership aggregate for managing workspace members and their roles.

- **Files**:
  - packages/account-domain/src/aggregates/membership.aggregate.ts - Complete membership aggregate
  - packages/account-domain/src/aggregates/index.ts - Export membership aggregate
- **Success**:
  - Membership aggregate tracks accountId, workspaceId/blueprintId, role, status
  - Composite key: (accountId, workspaceId)
  - Supports role changes with ownership guards
  - Validates only owners can change other owners
  - Enforces at least one owner must remain
  - Status tracking (active, suspended, removed)
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 24-25) - Membership aggregate with role/status/ownership
  - #file:../research/20260106-next-steps-skeletons.md (Lines 35-36) - ACL policy enforcement
- **Dependencies**:
  - core-engine aggregate base
  - DomainEvent interface
  - Causality metadata validator

### Task 2.3: Create invite-member and change-role commands

Define command DTOs for membership operations.

- **Files**:
  - packages/account-domain/src/commands/invite-member.command.ts - Invite member command
  - packages/account-domain/src/commands/change-role.command.ts - Change role command
  - packages/account-domain/src/commands/index.ts - Export commands
- **Success**:
  - InviteMemberCommand includes accountId, workspaceId/blueprintId, role, idempotencyKey, causedBy*
  - ChangeRoleCommand includes membershipId, newRole, causedBy* metadata
  - Both commands are immutable DTOs
  - Clear validation rules documented
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 26-27) - Command definitions with metadata
  - #file:../research/20260106-next-steps-skeletons.md (Lines 40-41) - Command metadata requirements
- **Dependencies**:
  - CausalityMetadata interface

### Task 2.4: Create membership-created and role-changed events

Define domain events for membership operations.

- **Files**:
  - packages/account-domain/src/events/membership-created.event.ts - Membership created event
  - packages/account-domain/src/events/role-changed.event.ts - Role changed event
  - packages/account-domain/src/events/index.ts - Export events
- **Success**:
  - MembershipCreatedEvent carries accountId, workspaceId, blueprintId, role, causality metadata
  - RoleChangedEvent carries membershipId, oldRole, newRole, causality metadata
  - Both extend DomainEvent interface
  - Event types follow naming convention: AggregateVerbPastTense
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 28-28) - Event definitions with blueprintId and causality
  - #file:../research/20260106-next-steps-skeletons.md (Lines 42-43) - Event metadata schema
- **Dependencies**:
  - DomainEvent interface
  - DomainEventMetadata interface

### Task 2.5: Implement ACL policy for role and module access checks

Create policy service to check user permissions based on roles and modules.

- **Files**:
  - packages/account-domain/src/policies/acl.policy.ts - ACL policy implementation
  - packages/account-domain/src/policies/index.ts - Export policy
- **Success**:
  - Policy checks user roles (owner, admin, member, viewer)
  - Policy validates module access based on enabled modules
  - Returns boolean for permission checks
  - Integrates with @delon/acl through adapters
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 29-29) - ACL policy for roles and module access
  - #file:../research/20260106-next-steps-skeletons.md (Lines 35-36) - Policy enforcement
- **Dependencies**:
  - Membership aggregate state
  - Workspace aggregate state

### Task 2.6: Create workspace and membership projections

Define projection interfaces for workspace and membership read models.

- **Files**:
  - packages/account-domain/src/projections/workspace.projection.ts - Workspace projection definition
  - packages/account-domain/src/projections/membership.projection.ts - Membership projection definition
  - packages/account-domain/src/projections/index.ts - Export projections
- **Success**:
  - Workspace projection keyed by blueprintId
  - Membership projection keyed by (blueprintId, accountId)
  - Both implement Projection interface from core-engine
  - Include upsert and optional delete methods
  - Optimized for read queries
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 30-30) - Workspace and membership projections
  - #file:../research/20260106-next-steps-skeletons.md (Lines 33-35) - Projection observability and keying
- **Dependencies**:
  - core-engine Projection interface
  - DomainEvent interface

## Phase 3: SaaS-Domain Implementation

### Task 3.1: Implement Module aggregate with enabledModules tracking

Create Module aggregate to track which modules are enabled for a workspace.

- **Files**:
  - packages/saas-domain/src/aggregates/module.aggregate.ts - Complete module aggregate
  - packages/saas-domain/src/aggregates/index.ts - Export module aggregate
- **Success**:
  - Module aggregate tracks enabledModules per workspace
  - Keyed by (blueprintId, moduleId)
  - Supports enable/disable operations
  - Validates blueprintId presence
  - Enforces module dependencies if applicable
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 39-39) - Module aggregate with enabledModules
  - #file:../research/20260106-next-steps-skeletons.md (Lines 56-58) - BlueprintId enforcement
- **Dependencies**:
  - core-engine aggregate base
  - DomainEvent interface
  - Causality metadata validator

### Task 3.2: Implement Task aggregate as entity example

Create Task aggregate as an example SaaS entity within a module.

- **Files**:
  - packages/saas-domain/src/aggregates/task.aggregate.ts - Complete task aggregate
  - packages/saas-domain/src/aggregates/index.ts - Export task aggregate
- **Success**:
  - Task aggregate tracks task state (title, description, status, assignee)
  - Keyed by (blueprintId, taskId)
  - Belongs to a specific module
  - All operations validate blueprintId
  - Supports create, update, assign, complete operations
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 40-40) - Task aggregate example
  - #file:../research/20260106-next-steps-skeletons.md (Lines 56-58) - BlueprintId validation
- **Dependencies**:
  - core-engine aggregate base
  - DomainEvent interface
  - Causality metadata validator

### Task 3.3: Create enable-module and create-task commands

Define command DTOs for SaaS domain operations.

- **Files**:
  - packages/saas-domain/src/commands/enable-module.command.ts - Enable module command
  - packages/saas-domain/src/commands/create-task.command.ts - Create task command
  - packages/saas-domain/src/commands/index.ts - Export commands
- **Success**:
  - EnableModuleCommand includes blueprintId, moduleId, causedBy* metadata
  - CreateTaskCommand includes blueprintId, moduleId, taskData, causedBy* metadata
  - Both commands are immutable DTOs
  - Validation rules documented
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 41-41) - Command definitions
  - #file:../research/20260106-next-steps-skeletons.md (Lines 56-58) - BlueprintId and causality requirements
- **Dependencies**:
  - CausalityMetadata interface

### Task 3.4: Create module-enabled and task-created events

Define domain events for SaaS operations.

- **Files**:
  - packages/saas-domain/src/events/module-enabled.event.ts - Module enabled event
  - packages/saas-domain/src/events/task-created.event.ts - Task created event
  - packages/saas-domain/src/events/index.ts - Export events
- **Success**:
  - ModuleEnabledEvent carries blueprintId, moduleId, causality metadata
  - TaskCreatedEvent carries blueprintId, moduleId, taskId, taskData, causality metadata
  - Both extend DomainEvent interface
  - Event types follow naming convention
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 41-41) - Event definitions
  - #file:../research/20260106-next-steps-skeletons.md (Lines 42-43) - Event metadata requirements
- **Dependencies**:
  - DomainEvent interface
  - DomainEventMetadata interface

### Task 3.5: Create task projection with blueprintId and module keys

Define task projection for read model queries.

- **Files**:
  - packages/saas-domain/src/projections/task.projection.ts - Task projection definition
  - packages/saas-domain/src/projections/index.ts - Export projection
- **Success**:
  - Task projection keyed by (blueprintId, moduleId, taskId)
  - Implements Projection interface from core-engine
  - Optimized for module-scoped queries
  - Includes upsert and delete methods
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 42-42) - Task projection with keys
  - #file:../research/20260106-next-steps-skeletons.md (Lines 33-35) - Projection keying by blueprintId
- **Dependencies**:
  - core-engine Projection interface
  - DomainEvent interface

## Phase 4: Platform-Adapters Auth and Facades

### Task 4.1: Create DA_SERVICE_TOKEN provider for @delon/auth integration

Implement the unified auth token provider for @delon/auth integration.

- **Files**:
  - packages/platform-adapters/src/auth/da-service-token.provider.ts - Token provider implementation
  - packages/platform-adapters/src/auth/index.ts - Export provider
- **Success**:
  - DA_SERVICE_TOKEN InjectionToken defined
  - Provider integrates with @delon/auth token service
  - Provides session context with blueprintId
  - Can be injected into guards and facades
  - Reads from Firebase Auth via @angular/fire
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 47-47) - DA_SERVICE_TOKEN provider
  - #file:../research/20260106-next-steps-skeletons.md (Lines 61-62) - Auth chain integration
- **Dependencies**:
  - @delon/auth
  - @angular/fire/auth
  - Angular dependency injection

### Task 4.2: Implement membership facade with angular-fire client

Create facade for membership operations using @angular/fire client SDK.

- **Files**:
  - packages/platform-adapters/src/facades/membership.facade.ts - Membership facade implementation
  - packages/platform-adapters/src/facades/index.ts - Export facade
- **Success**:
  - Facade reads session from @delon/auth token
  - Queries membership projections from Firestore
  - Dispatches membership commands with blueprintId and causedBy*
  - Uses @angular/fire for Firestore client access
  - Returns observables for reactive updates
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 48-49) - Membership facade with angular-fire
  - #file:../research/20260106-next-steps-skeletons.md (Lines 44-46) - Facade responsibilities
- **Dependencies**:
  - @angular/fire/firestore
  - DA_SERVICE_TOKEN provider
  - Account-domain commands and events
  - Membership projection interface

### Task 4.3: Implement workspace facade with angular-fire client

Create facade for workspace operations using @angular/fire client SDK.

- **Files**:
  - packages/platform-adapters/src/facades/workspace.facade.ts - Workspace facade implementation
  - packages/platform-adapters/src/facades/index.ts - Export facade
- **Success**:
  - Facade reads session from @delon/auth token
  - Queries workspace projections from Firestore
  - Dispatches workspace commands with blueprintId and causedBy*
  - Uses @angular/fire for Firestore client access
  - Returns observables for reactive updates
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 49-49) - Workspace facade
  - #file:../research/20260106-next-steps-skeletons.md (Lines 44-46) - Facade pattern
- **Dependencies**:
  - @angular/fire/firestore
  - DA_SERVICE_TOKEN provider
  - Account-domain commands and events
  - Workspace projection interface

### Task 4.4: Create Firestore event store implementation (firebase-admin)

Implement event store using firebase-admin for backend operations.

- **Files**:
  - packages/platform-adapters/src/firebase/admin/firestore-event-store.ts - Event store implementation
  - packages/platform-adapters/src/firebase/admin/index.ts - Export event store
- **Success**:
  - Implements EventStore interface from core-engine
  - Uses firebase-admin Firestore for persistence
  - Supports append operation with idempotency
  - Supports load by aggregateId
  - Supports loadByBlueprint for tenant-scoped queries
  - Only used in backend/admin contexts
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 50-50) - Firestore event store with admin SDK
  - #file:../research/20260106-next-steps-skeletons.md (Lines 44-46) - Backend adapter requirements
- **Dependencies**:
  - firebase-admin
  - core-engine EventStore interface
  - DomainEvent interface

### Task 4.5: Create projection writer service (firebase-admin)

Implement service to write projections using firebase-admin.

- **Files**:
  - packages/platform-adapters/src/firebase/admin/projection-writer.ts - Projection writer service
  - packages/platform-adapters/src/firebase/admin/index.ts - Export projection writer
- **Success**:
  - Writes projections to Firestore collections
  - Supports upsert and delete operations
  - Enforces blueprintId keying
  - Batches writes for performance
  - Only used in backend/admin contexts
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 51-51) - Projection writer
  - #file:../research/20260106-next-steps-skeletons.md (Lines 33-35) - Projection operations
- **Dependencies**:
  - firebase-admin
  - core-engine Projection interface
  - DomainEvent interface

### Task 4.6: Create projection rebuild job for Cloud Run

Implement Cloud Run job for rebuilding projections.

- **Files**:
  - packages/platform-adapters/src/firebase/admin/projection-rebuild.job.ts - Rebuild job implementation
  - packages/platform-adapters/src/firebase/admin/index.ts - Export rebuild job
- **Success**:
  - Supports full, incremental, and selective rebuild modes
  - Preserves causality ordering during replay
  - Emits observability metrics (lag, lastEventId, errors)
  - Handles errors per strategy (skip for ops, abort for tests)
  - Cloud Run compatible (no Cloud Functions dependencies)
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 51-52) - Projection rebuild job for Cloud Run
  - #file:../research/20260106-next-steps-skeletons.md (Lines 29-32) - Rebuild strategies
- **Dependencies**:
  - firebase-admin
  - core-engine ProjectionRebuilder interface
  - Firestore event store
  - Projection writer

## Phase 5: UI-Angular Guards and Integration

### Task 5.1: Update SessionGuard to use ACLService with DA_SERVICE_TOKEN

Update the session guard to use @delon/acl with DA_SERVICE_TOKEN.

- **Files**:
  - packages/ui-angular/src/app/guards/session.guard.ts - Update guard implementation
- **Success**:
  - Guard injects DA_SERVICE_TOKEN for session context
  - Uses ACLService.can() and canAbility() for permission checks
  - Queries projections for role/module permissions keyed by blueprintId
  - Returns CanActivateFn result
  - No direct domain dependencies
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 61-62) - SessionGuard with ACLService
  - #file:../research/20260106-next-steps-skeletons.md (Lines 47-47) - DA_SERVICE_TOKEN injection
- **Dependencies**:
  - @delon/acl ACLService
  - DA_SERVICE_TOKEN provider
  - Platform-adapters facades

### Task 5.2: Ensure feature facades rely on platform-adapters

Verify that all UI feature facades use platform-adapters and not direct domain/SDK access.

- **Files**:
  - packages/ui-angular/src/app/features/*/facades/*.facade.ts - Review and update feature facades
- **Success**:
  - Feature facades inject platform-adapters facades only
  - No direct imports from account-domain, saas-domain, or core-engine
  - No direct Firebase SDK usage
  - All domain operations go through platform-adapters
  - Facades use Angular signals for state management
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 63-64) - Feature facades rely on adapters
  - #file:../research/20260106-next-steps-skeletons.md (Lines 44-46) - Adapter layer isolation
- **Dependencies**:
  - Platform-adapters facades
  - Angular signals

### Task 5.3: Configure route guards with blueprintId-based permissions

Ensure route guards check permissions based on blueprintId from projections.

- **Files**:
  - packages/ui-angular/src/app/app.routes.ts - Update route guards configuration
  - packages/ui-angular/src/app/guards/*.guard.ts - Review guard implementations
- **Success**:
  - Guards query ACLService with blueprintId-scoped permissions
  - Projections provide role/module data keyed by blueprintId
  - Guards handle missing blueprintId gracefully
  - Route protection based on workspace membership and enabled modules
  - Clear error messages for unauthorized access
- **Research References**:
  - #file:../research/20260106-next-steps-skeletons.md (Lines 65-66) - Route guards with blueprintId permissions
  - #file:../research/20260106-next-steps-skeletons.md (Lines 61-62) - ACL integration
- **Dependencies**:
  - @delon/acl ACLService
  - DA_SERVICE_TOKEN provider
  - Membership and workspace projections

## Dependencies

- TypeScript 5.x with ES2022 target
- Angular standalone components and signals
- @angular/fire for Firebase client SDK
- firebase-admin for backend operations
- @delon/auth for authentication token management
- @delon/acl for role-based access control
- Firestore for event store and projections
- Cloud Run for projection rebuild jobs

## Success Criteria

- All domain aggregates enforce blueprintId boundary validation
- Every command and event carries complete causality metadata
- Causality metadata validator rejects incomplete metadata
- Projection rebuilder preserves causality ordering
- DA_SERVICE_TOKEN provides unified auth integration
- ACL policies enforce role/module permissions
- No SDK usage in domain packages
- All SDK operations isolated to platform-adapters
- UI guards query projections keyed by blueprintId
- Full event sourcing replay capability
