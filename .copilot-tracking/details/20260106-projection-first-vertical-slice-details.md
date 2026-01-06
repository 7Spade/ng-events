<!-- markdownlint-disable-file -->

# Task Details: Projection-First Vertical Slice

## Research Reference

**Source Research**: #file:../research/20260106-parallel-track-research.md

## Phase 1: Platform-Adapters Projection Infrastructure

### Task 1.1: Create Firestore projection writer service

Create a Firestore-backed projection writer that handles upsert operations keyed by blueprintId + membershipId.

- **Files**:
  - packages/platform-adapters/src/projections/firestore-projection-writer.ts - Firestore projection writer implementation
  - packages/platform-adapters/src/projections/index.ts - Export projection writer
- **Success**:
  - Writer accepts DomainEvent and updates Firestore projection document
  - Documents keyed by blueprintId collection → membershipId document
  - Idempotent writes using event metadata for deduplication
  - Handles upsert (create/update) operations atomically
- **Research References**:
  - #file:../research/20260106-parallel-track-research.md (Lines 13-15) - Firestore projection writer requirement
  - #file:../research/20260106-ng-events-architecture-research.md (Lines 85-95) - SDK isolation in adapters
- **Dependencies**:
  - firebase-admin SDK (platform-adapters only)
  - Core-engine DomainEvent interface

### Task 1.2: Create membership projection handler

Create a projection handler that consumes membership events and updates projection via the writer.

- **Files**:
  - packages/platform-adapters/src/projections/membership-projection.handler.ts - Membership projection handler
  - packages/platform-adapters/src/projections/index.ts - Export projection handler
- **Success**:
  - Handler implements ProjectionHandler interface from core-engine
  - Processes MembershipCreated and RoleChanged events
  - Extracts blueprintId, membershipId, role data from events
  - Calls Firestore projection writer with normalized data
  - Projection schema: { blueprintId, membershipId, role, updatedAt, causedBy }
- **Research References**:
  - #file:../research/20260106-parallel-track-research.md (Lines 13-15) - Membership projection handler requirement
  - #file:../research/20260106-next-steps-skeletons.md (Lines 36-38) - Projection schema guidance
- **Dependencies**:
  - Task 1.1 completion (Firestore projection writer)
  - Core-engine ProjectionHandler interface

### Task 1.3: Create projection rebuild job stub

Create a Cloud Run friendly projection rebuild job that can replay events from a seed collection.

- **Files**:
  - packages/platform-adapters/src/jobs/projection-rebuild.job.ts - Projection rebuild job stub
  - packages/platform-adapters/src/jobs/index.ts - Export rebuild job
- **Success**:
  - Job loads events from Firestore events collection (or mock source)
  - Replays events through projection handler in causality order
  - Preserves causedBy chain for deterministic replay
  - Idempotent execution (can be run multiple times safely)
  - Cloud Run compatible (HTTP trigger or background task)
- **Research References**:
  - #file:../research/20260106-parallel-track-research.md (Lines 13-15) - Projection rebuild job requirement
  - #file:../research/20260106-next-steps-skeletons.md (Lines 63-64) - Cloud Run friendly design
- **Dependencies**:
  - Task 1.2 completion (projection handler)
  - Core-engine ProjectionRebuilder interface

### Task 1.4: Create mock event generator for testing

Create a utility to generate mock membership events for testing projection pipeline without real aggregates.

- **Files**:
  - packages/platform-adapters/src/testing/mock-membership-events.ts - Mock event generator
  - packages/platform-adapters/src/testing/index.ts - Export mock utilities
- **Success**:
  - Generates valid MembershipCreated events with blueprintId + causality metadata
  - Generates RoleChanged events for testing projection updates
  - Events follow DomainEvent schema from core-engine
  - Configurable blueprintId, membershipId, roles for test scenarios
- **Research References**:
  - #file:../research/20260106-parallel-track-research.md (Lines 13-15) - Mock events for adapter testing
  - #file:../research/20260106-parallel-track-research.md (Lines 20-21) - Replace mock events later with real domain events
- **Dependencies**:
  - Core-engine DomainEvent interface

## Phase 2: UI-Angular ACL Integration

### Task 2.1: Create membership projection query service

Create an Angular service that queries membership projections through platform-adapters.

- **Files**:
  - packages/ui-angular/src/app/adapters/membership-projection-query.service.ts - Membership projection query service
  - packages/ui-angular/src/app/adapters/index.ts - Export query service
- **Success**:
  - Service reads membership projections from Firestore via platform-adapters facade
  - Queries filtered by blueprintId from current session (via @delon/auth)
  - Returns membership data with roles for ACL population
  - Uses Observable pattern for reactive updates
  - No direct Firestore SDK usage (goes through adapters)
- **Research References**:
  - #file:../research/20260106-parallel-track-research.md (Lines 17-19) - UI membership query service
  - #file:../research/20260106-ng-events-architecture-research.md (Lines 50-60) - Auth chain and DA_SERVICE_TOKEN
- **Dependencies**:
  - Platform-adapters membership facade
  - @delon/auth for session/blueprintId
  - Angular standalone component patterns

### Task 2.2: Update ACLService integration with projection roles

Update ACL configuration to populate from membership projection data instead of hardcoded roles.

- **Files**:
  - packages/ui-angular/src/app/core/acl/acl-config.service.ts - ACL configuration service
  - packages/ui-angular/src/app/core/acl/index.ts - Export ACL configuration
- **Success**:
  - Service consumes membership projection query service
  - Populates ACLService.setRole() with roles from projections
  - Filters by current blueprintId from session
  - Updates ACL on auth state changes
  - Maintains existing @delon/acl guard compatibility
- **Research References**:
  - #file:../research/20260106-parallel-track-research.md (Lines 17-19) - ACL driven by projection roles
  - #file:../research/20260106-ng-events-architecture-research.md (Lines 50-60) - DA_SERVICE_TOKEN to ACL flow
- **Dependencies**:
  - Task 2.1 completion (membership projection query service)
  - @delon/acl ACLService

### Task 2.3: Update workspace guards to use projection-based ACL

Update route guards to enforce workspace access based on projection-populated ACL roles.

- **Files**:
  - packages/ui-angular/src/app/core/guards/workspace.guard.ts - Workspace access guard
  - packages/ui-angular/src/app/core/guards/index.ts - Export guards
- **Success**:
  - Guard uses ACLService.can() or canAbility() for role checks
  - Validates user has required role in current blueprintId workspace
  - Returns navigation to login/unauthorized if access denied
  - Integrates with Angular router CanActivateFn pattern
  - No direct projection query (uses ACLService populated by Task 2.2)
- **Research References**:
  - #file:../research/20260106-parallel-track-research.md (Lines 17-19) - Guards enforce workspace access
  - #file:../../docs/使用說明：@delon_auth & @delon_acl 在 ui-angular Skeleton 的應用.md (Lines 25-35) - ACL guard usage
- **Dependencies**:
  - Task 2.2 completion (ACL populated with projection roles)
  - @delon/acl ACLService and guards

## Phase 3: Testing and Validation

### Task 3.1: Create integration tests for projection pipeline

Create integration tests that validate the full projection pipeline from mock events to Firestore.

- **Files**:
  - packages/platform-adapters/src/projections/__tests__/projection-pipeline.integration.spec.ts - Pipeline integration tests
- **Success**:
  - Test generates mock membership events
  - Validates projection handler processes events correctly
  - Verifies Firestore projection writer creates/updates documents
  - Checks blueprintId + membershipId document structure
  - Validates idempotent replay (running same events twice produces same result)
  - Tests causality chain preservation during rebuild
- **Research References**:
  - #file:../research/20260106-parallel-track-research.md (Lines 23-26) - Benefits of validating blueprintId partitioning
  - #file:../research/20260106-next-steps-skeletons.md (Lines 63-64) - Projection rebuild validation
- **Dependencies**:
  - Phase 1 completion (projection infrastructure)
  - Mock event generator (Task 1.4)

### Task 3.2: Validate blueprintId partitioning and projection keys

Create validation tests to ensure projection schema supports multi-tenant partitioning correctly.

- **Files**:
  - packages/platform-adapters/src/projections/__tests__/blueprintid-partitioning.spec.ts - Partitioning validation tests
- **Success**:
  - Test creates projections for multiple blueprintIds
  - Validates projections are isolated by blueprintId collection
  - Confirms queries filtered by blueprintId return only matching data
  - Verifies projection keys (blueprintId + membershipId) are unique
  - Tests projection rebuild maintains blueprintId boundaries
- **Research References**:
  - #file:../research/20260106-parallel-track-research.md (Lines 23-26) - Validates blueprintId partitioning
  - #file:../research/20260106-parallel-track-research.md (Lines 28-29) - Keep schemas stable with blueprintId
- **Dependencies**:
  - Phase 1 completion (projection infrastructure)
  - Task 3.1 completion (integration tests)

## Dependencies

- firebase-admin SDK (platform-adapters only)
- @angular/fire for client-side Firestore
- @delon/auth for token service integration
- @delon/acl for ACL service
- Core-engine contracts (DomainEvent, Projection, ProjectionHandler)

## Success Criteria

- Membership projections stored in Firestore with stable schema
- ACL populated from projection data and enforced by guards
- Projection pipeline tested and validated for multi-tenant partitioning
- Mock events successfully drive projections
- Auth chain remains intact with no SDK leakage to domain
- Schema ready for future swap to real domain events
