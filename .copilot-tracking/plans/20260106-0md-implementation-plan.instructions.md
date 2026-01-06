---
applyTo: ".copilot-tracking/changes/20260106-0md-implementation-changes.md"
---

<!-- markdownlint-disable-file -->

# Task Checklist: 0.md Event Flow Implementation

## Overview

Implement the complete 0.md event flow architecture: Account → Workspace (blueprintId) → Module → Entity → Event chain with causality tracking, event sourcing, and multi-tenant isolation across the monorepo.

## Objectives

- Establish core-engine contracts for DomainEvent with blueprintId and causality metadata (causedBy, causedByUser, causedByAction)
- Scaffold account-domain aggregates (Account, Workspace, Membership) with blueprintId boundary enforcement
- Build saas-domain module/entity aggregates gated by enabledModules and blueprintId
- Create platform-adapters facades that inject session (uid, blueprintId, roles) from DA_SERVICE_TOKEN into domain commands
- Wire ui-angular to use adapter facades and ACL guards through the Firebase → @delon/auth → DA_SERVICE_TOKEN → @delon/acl pipeline
- Implement projection layer with blueprintId-keyed read models and event replay preserving causality chains

## Research Summary

### Project Files

- 0.md - Core event flow visualization showing Account → Workspace → Module → Entity → Events → Event Sourcing → Causality Tracking
- ng-events_Architecture.md - Architecture mapping blueprintId multi-tenant boundary and auth chain
- packages/core-engine/src/session/session-context.interface.ts - Session context with blueprintId foundation
- packages/ui-angular/src/app/core/auth/firebase-auth-bridge.service.ts - Existing Firebase → @delon/auth bridge

### External References

- #file:../research/20260106-ng-events-0md-implementation-research.md - Complete 0.md implementation research
- #fetch:https://angular.dev/guide/di - Angular DI patterns for DA_SERVICE_TOKEN
- #file:../../.github/instructions/auth-flow.instructions.yml - Auth pipeline requirements
- #file:../../.github/instructions/event-sourcing-patterns.instructions.md - Event sourcing patterns with causality

### Standards References

- #file:../../.github/instructions/typescript-5-es2022.instructions.md - TypeScript conventions
- #file:../../.github/instructions/angular.instructions.md - Angular standalone components and signals
- #file:../../.github/instructions/account-domain.instructions.yml - Domain isolation rules

## Implementation Checklist

### [x] Phase 1: Core Engine Event Sourcing Contracts

- [x] Task 1.1: Create DomainEvent interface with causality metadata
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 11-29)

- [x] Task 1.2: Create EventStore interface and CausalityMetadata type
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 31-47)

- [x] Task 1.3: Create Projection interfaces for read model updates
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 49-65)

- [x] Task 1.4: Update SessionContext to enforce blueprintId
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 67-82)

### [x] Phase 2: Account Domain Aggregates and Events

- [x] Task 2.1: Create Account aggregate with creation and linking commands
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 86-106)

- [x] Task 2.2: Create Workspace aggregate with blueprintId boundary
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 108-129)

- [x] Task 2.3: Create Membership aggregate with role-based ACL
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 131-152)

- [x] Task 2.4: Define account-domain commands with blueprintId validation
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 154-172)

- [x] Task 2.5: Define account-domain events with causality metadata
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 174-192)

### [x] Phase 3: SaaS Domain Module and Entity Aggregates

- [x] Task 3.1: Create Module aggregate with enabledModules gating
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 196-215)

- [x] Task 3.2: Create Entity aggregate examples (Task, Issue)
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 217-237)

- [x] Task 3.3: Define saas-domain commands with blueprintId enforcement
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 239-256)

- [x] Task 3.4: Define saas-domain events with causality chain
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 258-275)

### [x] Phase 4: Platform Adapters with Session Injection

- [x] Task 4.1: Create AuthAdapter service with DA_SERVICE_TOKEN provider
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 279-300)

- [x] Task 4.2: Create WorkspaceFacade for workspace operations
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 302-320)

- [x] Task 4.3: Create MembershipFacade for membership operations
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 322-340)

- [x] Task 4.4: Create projection query services with blueprintId filtering
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 342-360)

### [x] Phase 5: UI Angular Integration with ACL Guards

- [x] Task 5.1: Update Firebase auth bridge to propagate blueprintId
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 364-383)

- [x] Task 5.2: Create adapter facades in ui-angular
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 385-403)

- [x] Task 5.3: Implement ACL guards using @delon/acl with blueprintId
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 405-423)

- [x] Task 5.4: Wire DA_SERVICE_TOKEN through app providers
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 425-442)

### [x] Phase 6: Event Replay and Causality Tracking

- [x] Task 6.1: Implement EventStore with causality preservation
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 446-467)

- [x] Task 6.2: Create ProjectionRebuilder for event replay
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 469-490)

- [x] Task 6.3: Implement causality chain visualization utilities
  - Details: .copilot-tracking/details/20260106-0md-implementation-details.md (Lines 492-510)

## Dependencies

- @angular/fire/auth for Firebase authentication
- @delon/auth for token service integration
- @delon/acl for role-based access control
- DA_SERVICE_TOKEN provider pattern
- TypeScript 5.x with ES2022 target
- Core-engine, account-domain, saas-domain, platform-adapters, ui-angular packages

## Success Criteria

- All DomainEvents include blueprintId and causality metadata (causedBy, causedByUser, causedByAction)
- Account → Workspace → Module → Entity hierarchy enforces blueprintId at each boundary
- Platform adapters are sole consumers of Firebase/Angular SDKs
- UI layer accesses domains only through adapter facades
- Auth chain flows: Firebase Auth → @delon/auth → DA_SERVICE_TOKEN → @delon/acl
- Projections and read models are keyed by blueprintId
- Event replay preserves causality chain (E1 ⇒ E2 ⇒ E3)
- All aggregates validate blueprintId before executing commands
- No SDK dependencies leak into core-engine or domain packages
