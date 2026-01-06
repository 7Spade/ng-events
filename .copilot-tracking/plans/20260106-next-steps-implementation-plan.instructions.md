---
applyTo: ".copilot-tracking/changes/20260106-next-steps-implementation-changes.md"
---

<!-- markdownlint-disable-file -->

# Task Checklist: Next Steps Implementation - Event Sourcing Skeletons

## Overview

Implement the next-phase skeletons for ng-events event sourcing architecture, including core-engine contracts, account-domain and saas-domain aggregates/commands/events, platform-adapters auth/facades, and ui-angular guards integration, all following blueprintId boundary and causality tracking requirements.

## Objectives

- Complete core-engine contracts for causality metadata validation and projection rebuilding
- Implement account-domain workspace/membership aggregates with ACL policies
- Create saas-domain module/task aggregates with blueprintId enforcement
- Build platform-adapters DA_SERVICE_TOKEN provider and domain facades
- Integrate ui-angular guards with @delon/acl and adapter facades

## Research Summary

### Project Files

- packages/core-engine/src/events/domain-event.ts - Base event structure with causality metadata already defined
- packages/core-engine/src/events/event-store.interface.ts - Event store contract for append/load operations
- packages/core-engine/src/projections/projection.interface.ts - Projection read model contract
- packages/account-domain/src/aggregates/ - Workspace, membership aggregates (stubs exist)
- packages/saas-domain/src/aggregates/ - Task, issue, module aggregates (stubs exist)
- packages/platform-adapters/src/session/session-context.adapter.ts - Session context adapter
- packages/ui-angular/src/app/adapters/core-engine.facade.ts - Core engine facade stub

### External References

- #file:../research/20260106-next-steps-skeletons.md - Comprehensive implementation guidance for all skeleton components
- #fetch:https://angular.dev/guide/di - DI patterns for token-based providers aligning with DA_SERVICE_TOKEN usage
- docs/0.md - Event flow architecture diagram showing causality chain
- ng-events_Architecture.md - Full architecture plan with package boundaries

### Standards References

- #file:../../.github/instructions/typescript-5-es2022.instructions.md - TypeScript development standards
- #file:../../.github/instructions/angular.instructions.md - Angular standalone components and signals guidelines
- #file:../../.github/instructions/event-sourcing-patterns.instructions.md - Event sourcing and causality metadata requirements

## Implementation Checklist

### [x] Phase 1: Core-Engine Contract Extensions

- [x] Task 1.1: Implement causality metadata validator
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 11-26)

- [x] Task 1.2: Create projection rebuilder implementation interface
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 28-46)

- [x] Task 1.3: Add idempotency key support to domain events
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 48-64)

### [ ] Phase 2: Account-Domain Implementation

- [ ] Task 2.1: Implement Workspace aggregate with blueprintId boundary
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 66-85)

- [ ] Task 2.2: Implement Membership aggregate with role/ownership guards
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 87-107)

- [ ] Task 2.3: Create invite-member and change-role commands
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 109-126)

- [ ] Task 2.4: Create membership-created and role-changed events
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 128-146)

- [ ] Task 2.5: Implement ACL policy for role and module access checks
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 148-165)

- [ ] Task 2.6: Create workspace and membership projections
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 167-188)

### [ ] Phase 3: SaaS-Domain Implementation

- [ ] Task 3.1: Implement Module aggregate with enabledModules tracking
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 190-209)

- [ ] Task 3.2: Implement Task aggregate as entity example
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 211-230)

- [ ] Task 3.3: Create enable-module and create-task commands
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 232-249)

- [ ] Task 3.4: Create module-enabled and task-created events
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 251-269)

- [ ] Task 3.5: Create task projection with blueprintId and module keys
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 271-290)

### [ ] Phase 4: Platform-Adapters Auth and Facades

- [ ] Task 4.1: Create DA_SERVICE_TOKEN provider for @delon/auth integration
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 292-311)

- [ ] Task 4.2: Implement membership facade with angular-fire client
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 313-333)

- [ ] Task 4.3: Implement workspace facade with angular-fire client
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 335-355)

- [ ] Task 4.4: Create Firestore event store implementation (firebase-admin)
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 357-377)

- [ ] Task 4.5: Create projection writer service (firebase-admin)
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 379-398)

- [ ] Task 4.6: Create projection rebuild job for Cloud Run
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 400-422)

### [ ] Phase 5: UI-Angular Guards and Integration

- [ ] Task 5.1: Update SessionGuard to use ACLService with DA_SERVICE_TOKEN
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 424-442)

- [ ] Task 5.2: Ensure feature facades rely on platform-adapters
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 444-461)

- [ ] Task 5.3: Configure route guards with blueprintId-based permissions
  - Details: .copilot-tracking/details/20260106-next-steps-implementation-details.md (Lines 463-483)

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
- Every command and event carries complete causality metadata (causedBy, causedByUser, causedByAction, blueprintId)
- Causality metadata validator rejects incomplete metadata at aggregate boundaries
- Projection rebuilder preserves causality ordering during replay
- DA_SERVICE_TOKEN provides unified auth integration for UI guards and facades
- ACL policies correctly enforce role/module permissions based on projections
- No SDK usage in domain packages (core-engine, account-domain, saas-domain)
- All SDK operations isolated to platform-adapters
- UI-Angular guards query projections keyed by blueprintId
- Full event sourcing replay capability with deterministic state reconstruction
