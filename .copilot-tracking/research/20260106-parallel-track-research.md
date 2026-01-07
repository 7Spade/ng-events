<!-- markdownlint-disable-file -->

# Task Research Notes: Parallel track for 0.md implementation

## Research Executed

### File Analysis

- Existing research files: architecture, 0.md implementation, next-step skeletons — provide primary path (contracts → domains → adapters → UI/ACL).
- Repo state: domains still stubs; adapters/UI auth bridge in place; no projections yet.

### Project Conventions

- Preserve auth chain @angular/fire/auth → @delon/auth → DA_SERVICE_TOKEN → @delon/acl; SDKs only in adapters; commands/events carry blueprintId + causedBy*.

## Key Discoveries

- Work can proceed in parallel as vertical slices without blocking on full domain scaffolding.

## Alternative Parallel Direction (projection-first vertical slice)

Focus on a thin end-to-end slice for Workspace/Membership projections while core contracts evolve separately.

1) **Projection contracts upfront (minimal core-engine additions)**
   - Add `domain-event.ts` + `projection.interface.ts` only, with metadata `{blueprintId, causedBy, timestamp}`; postpone full event-store/saga APIs.
   - Keep event shape stable to unblock projection handlers.

2) **Adapter-led projection pipeline**
   - In platform-adapters, create Firestore-backed projection writer + membership projection handler that consumes mocked DomainEvents (no real aggregates yet).
   - Provide `projection-rebuild.job.ts` (Cloud Run friendly) to replay events from a seed collection; idempotent writes keyed by blueprintId + membershipId.

3) **UI/ACL consumption first**
   - In ui-angular, add a simple membership query service (through adapters) that reads the projection and drives ACLService role data; guards enforce workspace access based on projection roles.
   - Continue using existing Firebase → @delon/auth bridge; DA_SERVICE_TOKEN feeds ACL.

4) **Domain later / swap-in**
   - When account-domain aggregates arrive, replace mock events with real domain-emitted events; projection schema stays stable, minimizing rework.

### Benefits & Trade-offs

- **Pros:** Enables ACL and workspace navigation to function early; front-end and adapter teams can iterate while domain contracts mature; validates blueprintId partitioning and projection keys.
- **Cons:** Temporary mock event source; later swap-in required; limited business rules until aggregates land.

## Implementation Guidance

- Deliverables for this parallel track:
  - Minimal core-engine types: DomainEvent + Projection interfaces with blueprintId/causality metadata.
  - Platform-adapters: Firestore projection writer, membership projection handler, rebuild job stub.
  - ui-angular: membership projection query + ACL guard wiring consuming projection roles.
- Keep schemas stable (blueprintId, membershipId, role, updatedAt, causedBy) to allow future domain integration.
