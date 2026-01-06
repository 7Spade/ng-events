<!-- markdownlint-disable-file -->

# Task Details: 0.md Event Flow Implementation

## Research Reference

**Source Research**: #file:../research/20260106-ng-events-0md-implementation-research.md

## Phase 1: Core Engine Event Sourcing Contracts

All tasks create core contracts for event sourcing with blueprintId and causality metadata.

### Task 1.1: Create DomainEvent interface - packages/core-engine/src/events/domain-event.ts
### Task 1.2: Create EventStore interface - packages/core-engine/src/events/event-store.interface.ts  
### Task 1.3: Create Projection interfaces - packages/core-engine/src/projections/
### Task 1.4: Update SessionContext - packages/core-engine/src/session/session-context.interface.ts

Research: Lines 92-110, 70-75 of 0md-implementation-research.md

## Phase 2: Account Domain Aggregates and Events

All tasks scaffold account-domain with blueprintId boundary enforcement.

### Task 2.1: Account aggregate - packages/account-domain/src/aggregates/account.aggregate.ts
### Task 2.2: Workspace aggregate with blueprintId - packages/account-domain/src/aggregates/workspace.aggregate.ts
### Task 2.3: Membership aggregate with ACL - packages/account-domain/src/aggregates/membership.aggregate.ts
### Task 2.4: Account-domain commands - packages/account-domain/src/commands/
### Task 2.5: Account-domain events - packages/account-domain/src/events/

Research: Lines 11-20, 60-68, 111-125 of 0md-implementation-research.md

## Phase 3: SaaS Domain Module and Entity Aggregates

All tasks create saas-domain with module gating and entity examples.

### Task 3.1: Module aggregate - packages/saas-domain/src/aggregates/module.aggregate.ts
### Task 3.2: Entity aggregates (Task/Issue) - packages/saas-domain/src/aggregates/
### Task 3.3: SaaS-domain commands - packages/saas-domain/src/commands/
### Task 3.4: SaaS-domain events with causality - packages/saas-domain/src/events/

Research: Lines 11-20, 126-137 of 0md-implementation-research.md

## Phase 4: Platform Adapters with Session Injection

All tasks create adapters that inject session (uid, blueprintId, roles) from DA_SERVICE_TOKEN.

### Task 4.1: AuthAdapter service - packages/platform-adapters/src/auth/auth-adapter.service.ts
### Task 4.2: WorkspaceFacade - packages/platform-adapters/src/facades/workspace.facade.ts
### Task 4.3: MembershipFacade - packages/platform-adapters/src/facades/membership.facade.ts
### Task 4.4: Projection queries with blueprintId filter - packages/platform-adapters/src/queries/

Research: Lines 21-27, 60-68, 111-125 of 0md-implementation-research.md

## Phase 5: UI Angular Integration with ACL Guards

All tasks wire UI to use Firebase → @delon/auth → DA_SERVICE_TOKEN → @delon/acl pipeline.

### Task 5.1: Update Firebase auth bridge - packages/ui-angular/src/app/core/auth/firebase-auth-bridge.service.ts
### Task 5.2: UI adapter facades - packages/ui-angular/src/app/adapters/
### Task 5.3: ACL guards - packages/ui-angular/src/app/core/guards/
### Task 5.4: Wire DA_SERVICE_TOKEN - packages/ui-angular/src/app/app.config.ts

Research: Lines 21-27, 46-49 of 0md-implementation-research.md

## Phase 6: Event Replay and Causality Tracking

All tasks implement event replay preserving causality chain (E1 ⇒ E2 ⇒ E3).

### Task 6.1: EventStore implementation - packages/platform-adapters/src/event-store/
### Task 6.2: ProjectionRebuilder - packages/platform-adapters/src/projections/
### Task 6.3: Causality visualization - packages/core-engine/src/causality/causality-chain.util.ts

Research: Lines 8-9, 50-59, 92-110, 126-137 of 0md-implementation-research.md

## Success Criteria

- All DomainEvents include blueprintId and causality metadata
- Account → Workspace (blueprintId) → Module → Entity hierarchy enforced
- Platform adapters are sole SDK consumers
- UI accesses domain only through adapter facades
- Auth chain: Firebase → @delon/auth → DA_SERVICE_TOKEN → @delon/acl
- Projections keyed by blueprintId
- Event replay preserves causality chain
- No SDK dependencies in core-engine or domain packages
