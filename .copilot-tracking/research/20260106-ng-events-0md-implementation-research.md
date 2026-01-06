<!-- markdownlint-disable-file -->

# Task Research Notes: 0.md implementation details (Account → Workspace → Module → Entity with causality)

## Research Executed

### File Analysis

- 0.md
  - Visualizes the core flow: Account → Workspace → Module → Entity → ordered Events → Event Sourcing → Causality Tracking, with explicit causality links (E1 ⇒ E2 ⇒ E3) and processing fan-out to event sourcing and causality tracking layers.
- ng-events_Architecture.md
  - Maps 0.md into concrete packages, auth chain (@angular/fire/auth → @delon/auth → DA_SERVICE_TOKEN → @delon/acl), and multi-tenant blueprintId boundary; prescribes contracts for commands/events, projections, and adapters.
- packages/core-engine/src/session/session-context.interface.ts
  - Defines session context with optional blueprintId; starting point to carry workspace boundary through commands/events.
- ui-angular auth bridge (firebase-auth-bridge.service.ts)
  - Existing implementation for syncing Firebase Auth → @delon/auth; shows DA_SERVICE_TOKEN usage to seed token service.

### Code Search Results

- "blueprintId"
  - Defined in core-engine session context; needs propagation into commands/events and ACL/membership checks.
- "DA_SERVICE_TOKEN"
  - Used across ui-angular for token service; instructions mandate it for domain service injection and guard pipeline.

### External Research

- #fetch:https://angular.dev/guide/di
  - Confirms Angular DI best practices for provider tokens like DA_SERVICE_TOKEN, supporting the prescribed auth chain wiring.
- #githubRepo:"7Spade/ng-events blueprintId event sourcing"
  - Not executed; internal docs already describe required metadata flow and package skeletons.

### Project Conventions

- Standards referenced: auth-flow.instructions.yml, account-domain.instructions.yml, ui-angular instructions (standalone + signals), dependency-injection instructions.
- Instructions followed: single auth bridge; DA_SERVICE_TOKEN as entry; domains SDK-free; blueprintId must be enforced at workspace boundary.

## Key Discoveries

### Project Structure

- Monorepo skeleton exists but domains are empty; core-engine only has session context. Platform-adapters include auth/session adapters; ui-angular uses DA_SERVICE_TOKEN and Firebase bridge.
- 0.md’s flow aligns to architecture doc’s multi-tenant boundary (Account → Workspace/blueprintId → Module → Entity) feeding event sourcing and causality tracking layers.

### Implementation Patterns

- Tenant boundary: blueprintId ties Workspace to all downstream entities; every command/event must carry blueprintId, validated in domain aggregates and projections.
- Causality: events must include causedBy / causedByUser / causedByAction metadata; event store append is ordered per aggregate, enabling replay.
- Auth chain: client auth via @angular/fire → token stored in @delon/auth via DA_SERVICE_TOKEN → ACL via @delon/acl; adapters enrich commands with session (uid, blueprintId, roles).
- Projection flow: events emitted by domain → projection handlers update read models keyed by blueprintId; rebuilders replay events preserving causality metadata.

### Complete Examples

```typescript
// Event base (core-engine) — illustrative
export interface DomainEvent<T> {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  data: T;
  metadata: {
    causedBy: string;          // parent event/command id
    causedByUser: string;      // uid from auth
    causedByAction: string;    // e.g., "InviteMember"
    blueprintId: string;       // workspace boundary
    timestamp: number;
    version: number;
  };
}
```

### API and Schema Documentation

- SessionContext: `{ uid, email, roles?, blueprintId?, token? }` → should be threaded into all adapter calls to domains.
- Commands: VerbAggregate naming, carry blueprintId + idempotency + causality metadata; validated at aggregate boundary.
- Events: Past-tense naming, include aggregateId, blueprintId, version, metadata (causedBy*, timestamp).

### Configuration Examples

```text
packages/
  core-engine/
    src/events/{domain-event.ts,event-store.interface.ts}
    src/causality/causality-metadata.ts
    src/projections/{projection.interface.ts,projection-rebuilder.ts}
  account-domain/
    src/aggregates/{account,workspace,membership}.aggregate.ts
    src/commands/{invite-member,change-role}.command.ts
    src/events/{membership-created,role-changed}.event.ts
    src/policies/acl.policy.ts (enforce roles, blueprintId)
  platform-adapters/
    src/auth/{auth-state.service.ts,da-service-token.provider.ts}
    src/facades/{membership,workspace}.facade.ts (inject session, blueprintId)
    src/queries/{membership.query.ts}
  ui-angular/
    src/app/adapters/{membership.facade.ts}
    src/app/core/acl/acl.guard.ts (uses @delon/acl + DA_SERVICE_TOKEN)
```

### Technical Requirements

- Enforce Account → Workspace (blueprintId) → Module → Entity chain in domain aggregates.
- Propagate blueprintId and causality metadata from adapters into commands/events; reject missing/invalid blueprintId at domain boundary.
- Keep SDKs (@angular/fire, firebase-admin) in adapters only; domains consume pure contracts from core-engine.
- Single auth bridge (@angular/fire → @delon/auth → DA_SERVICE_TOKEN → @delon/acl) feeding ACL guards and adapter facades.
- Projections/read models keyed by blueprintId for ACL and feature modules; rebuilders must preserve causality ordering.

## Recommended Approach

Implement 0.md by codifying the flow into the monorepo skeleton:
1) Extend core-engine with event/causality/projection contracts so events can carry blueprintId and causality metadata.
2) Scaffold account-domain aggregates (Account, Workspace, Membership) with commands/events that validate blueprintId and roles; add ACL policy hooks.
3) Scaffold saas-domain aggregates/entities gated by enabledModules; every command/event must include blueprintId from Workspace.
4) Build platform-adapters facades (client/admin) that inject session (uid, blueprintId, roles) from DA_SERVICE_TOKEN + @delon/acl into domain commands, and expose DA_SERVICE_TOKEN provider.
5) Ensure ui-angular uses adapter facades and ACL guards; no direct domain calls; rely on the existing Firebase → @delon/auth bridge to seed tokens.
6) Projection layer (in adapters) writes read models keyed by blueprintId; rebuilders replay events preserving causality links (causedBy chain) to satisfy 0.md’s causality tracking.

## Implementation Guidance

- **Objectives**: Realize 0.md’s flow by wiring blueprintId and causality metadata through core-engine → domains → adapters → UI/ACL, with strict SDK isolation.
- **Key Tasks**:
  - Add core-engine contracts for DomainEvent, EventStore, CausalityMetadata, Projection interfaces.
  - Create account-domain and saas-domain src trees with placeholder aggregates/commands/events enforcing blueprintId.
  - Add adapter facades and DA_SERVICE_TOKEN provider that enrich commands with auth claims + blueprintId, and ACL guard hooks for ui-angular.
  - Document module/entity gating via enabledModules and membership roles; ensure projections/read models carry blueprintId.
- **Dependencies**: @angular/fire/auth, @delon/auth, DA_SERVICE_TOKEN, @delon/acl; core-engine contracts; membership projections.
- **Success Criteria**: Commands/events always include blueprintId & causality metadata; adapters are sole SDK users; UI relies on DA_SERVICE_TOKEN/ACL guard pipeline; projections and rebuilders respect causality chain from 0.md.
