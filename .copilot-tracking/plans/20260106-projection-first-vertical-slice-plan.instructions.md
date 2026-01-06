---
applyTo: ".copilot-tracking/changes/20260106-projection-first-vertical-slice-changes.md"
---

<!-- markdownlint-disable-file -->

# Task Checklist: Projection-First Vertical Slice

## Overview

Implement a projection-first vertical slice for Workspace/Membership projections while core domain contracts evolve separately, enabling ACL and workspace navigation to function early.

## Objectives

- Enable ACL and workspace navigation with projection-based membership data
- Validate blueprintId partitioning and projection keys with minimal domain code
- Allow front-end and adapter teams to iterate while domain contracts mature
- Create foundation for later swap from mock events to real domain events

## Research Summary

### Project Files

- packages/core-engine/src/events/domain-event.ts - Core event contracts with causality metadata
- packages/core-engine/src/projections/projection.interface.ts - Projection abstractions
- packages/account-domain/src/aggregates/membership.aggregate.ts - Membership aggregate skeleton
- packages/platform-adapters/src/facades/membership.facade.ts - Membership facade skeleton
- packages/ui-angular/src/app/core/auth/firebase-auth-bridge.service.ts - Auth bridge implementation

### External References

- #file:../research/20260106-parallel-track-research.md - Parallel track projection-first approach
- #file:../research/20260106-ng-events-architecture-research.md - Main architecture patterns
- #file:../research/20260106-next-steps-skeletons.md - Skeleton implementations guide

### Standards References

- #file:../../.github/instructions/auth-flow.instructions.yml - Auth chain enforcement
- #file:../../.github/instructions/account-domain.instructions.yml - Domain isolation rules
- #file:../../.github/instructions/angular.instructions.md - Angular development standards

## Implementation Checklist

### [ ] Phase 1: Platform-Adapters Projection Infrastructure

- [ ] Task 1.1: Create Firestore projection writer service
  - Details: .copilot-tracking/details/20260106-projection-first-vertical-slice-details.md (Lines 15-32)

- [ ] Task 1.2: Create membership projection handler
  - Details: .copilot-tracking/details/20260106-projection-first-vertical-slice-details.md (Lines 34-51)

- [ ] Task 1.3: Create projection rebuild job stub
  - Details: .copilot-tracking/details/20260106-projection-first-vertical-slice-details.md (Lines 53-70)

- [ ] Task 1.4: Create mock event generator for testing
  - Details: .copilot-tracking/details/20260106-projection-first-vertical-slice-details.md (Lines 72-89)

### [ ] Phase 2: UI-Angular ACL Integration

- [ ] Task 2.1: Create membership projection query service
  - Details: .copilot-tracking/details/20260106-projection-first-vertical-slice-details.md (Lines 93-110)

- [ ] Task 2.2: Update ACLService integration with projection roles
  - Details: .copilot-tracking/details/20260106-projection-first-vertical-slice-details.md (Lines 112-129)

- [ ] Task 2.3: Update workspace guards to use projection-based ACL
  - Details: .copilot-tracking/details/20260106-projection-first-vertical-slice-details.md (Lines 131-148)

### [ ] Phase 3: Testing and Validation

- [ ] Task 3.1: Create integration tests for projection pipeline
  - Details: .copilot-tracking/details/20260106-projection-first-vertical-slice-details.md (Lines 152-169)

- [ ] Task 3.2: Validate blueprintId partitioning and projection keys
  - Details: .copilot-tracking/details/20260106-projection-first-vertical-slice-details.md (Lines 171-188)

## Dependencies

- @angular/fire for Firestore SDK (platform-adapters only)
- @delon/auth for token service integration
- @delon/acl for ACL service
- firebase-admin for server-side projection operations
- Existing Firebase auth bridge in ui-angular

## Success Criteria

- Membership projections stored in Firestore keyed by blueprintId + membershipId
- ACLService populated with roles from projection data
- Workspace guards enforce access based on projection roles
- Projection rebuild job can replay mock events idempotently
- Auth chain @angular/fire/auth → @delon/auth → DA_SERVICE_TOKEN → @delon/acl remains intact
- No SDK leakage into domain layer
- Projection schema stable for future domain event integration
