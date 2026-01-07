<!-- markdownlint-disable-file -->

# Task Research Notes: Next-step skeletons for 0.md implementation

## Research Executed

### File Analysis

- 0.md and ng-events_Architecture.md reaffirm the flow: Account → Workspace (blueprintId) → Module → Entity → Events → Event Sourcing → Causality Tracking, with auth chain @angular/fire/auth → @delon/auth → DA_SERVICE_TOKEN → @delon/acl and SDK isolation in platform-adapters.
- Existing research files (20260106-ng-events-architecture-research.md, 20260106-ng-events-0md-implementation-research.md) outline contracts and package expectations.

### Code Search Results

- No new code added beyond research; domains remain stubs; core-engine only has session-context interface.

### External Research

- #fetch:https://angular.dev/guide/di — DI patterns for token-based providers align with DA_SERVICE_TOKEN usage.

### Project Conventions

- Follow auth-flow, dependency-injection, account-domain, ui-angular instructions; standalone Angular + signals; SDKs only in adapters.

## Recommended Skeletons (priority not critical)

### core-engine (contracts)
- `src/events/domain-event.ts`: event base with `aggregateId`, `aggregateType`, `eventType`, `data`, `metadata { causedBy, causedByUser, causedByAction, blueprintId, timestamp, version, idempotencyKey }`.
- `src/events/event-store.interface.ts`: `append(event)`, `loadByAggregate(aggregateId)`, `loadByBlueprint(blueprintId, options)`.
- `src/causality/causality-metadata.ts`: type for metadata; validator to ensure causedBy* + blueprintId.
- `src/projections/projection.interface.ts`: `upsert(event)`, `delete?(id)`, keyed by blueprintId.
- `src/projections/projection-rebuilder.ts`: full/incremental/selective replay preserving causality order.

### account-domain (Workspace/Membership)
- Aggregates: `workspace.aggregate.ts` (blueprintId boundary), `membership.aggregate.ts` (role, status, ownership guard).
- Commands: `invite-member.command.ts` (accountId, workspaceId/blueprintId, role, idempotencyKey, causedBy*), `change-role.command.ts`.
- Events: `membership-created.event.ts`, `role-changed.event.ts` with blueprintId + causality metadata.
- Policy: `acl.policy.ts` to check roles/owner and module access.
- Projections: `membership.projection.ts`, `workspace.projection.ts` keyed by blueprintId.

### saas-domain (Module/Entity examples)
- Aggregates: `module.aggregate.ts` (enabledModules), `task.aggregate.ts` (entity example).
- Commands/Events: `enable-module.command.ts` / `module-enabled.event.ts`; `create-task.command.ts` / `task-created.event.ts` (carry blueprintId, causedBy*).
- Projections: task read model keyed by blueprintId + module.

### platform-adapters
- `auth/da-service-token.provider.ts`: unify DA_SERVICE_TOKEN provider for UI/guards.
- Facades (angular-fire client): `membership.facade.ts`, `workspace.facade.ts` — read session from @delon/auth token, query projections, dispatch commands with blueprintId + causedBy*.
- Admin/backend (firebase-admin): `firestore-event-store.ts`, `projection-writer.ts`, `projection-rebuild.job.ts` (Cloud Run friendly) — only place using SDKs.

### ui-angular
- Continue using Firebase → @delon/auth bridge; ensure feature facades/guards rely on adapters + ACLService; no direct domain calls.
- Route guards: DA_SERVICE_TOKEN (@delon/auth) → ACLService; projections provide role/module permissions keyed by blueprintId.

## Implementation Guidance

- Keep domains SDK-free; all SDK usage stays in platform-adapters.
- Every command/event carries blueprintId and causality metadata; validate at aggregate boundary.
- Projections/read models keyed by blueprintId; rebuilders preserve ordering (causedBy chain) for 0.md causality tracking.
- DA_SERVICE_TOKEN is the single injection token for auth/session into facades and guards.
