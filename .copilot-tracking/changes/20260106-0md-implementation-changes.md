<!-- markdownlint-disable-file -->
# Release Changes: 0.md implementation

**Related Plan**: .copilot-tracking/plans/20260106-0md-implementation-plan.instructions.md  
**Implementation Date**: 2026-01-06

## Summary

Implemented the 0.md event flow skeleton across core-engine, account-domain, saas-domain, platform-adapters, and ui-angular with blueprintId-aware contracts, facades, and guards.

## Changes

### Added

- Core event contracts and projections: `packages/core-engine/src/events/*`, `packages/core-engine/src/projections/*`, and causality helper `src/causality/causality-chain.util.ts`.
- Account domain scaffolding: commands/events and aggregates for Account, Workspace, Membership under `packages/account-domain/src`.
- SaaS domain scaffolding: commands/events and aggregates for Module, Task, Issue under `packages/saas-domain/src`.
- Platform adapters: auth adapter, workspace/membership facades, blueprint query service, in-memory event store, projection rebuilder under `packages/platform-adapters/src`.
- UI facades and session helpers: session facade service plus workspace/membership facades under `packages/ui-angular/src/app`.

### Modified

- Session context boundary and exports (`packages/core-engine/src/session/session-context.interface.ts`, `packages/core-engine/index.ts`).
- Domain and adapter public APIs (`packages/account-domain/index.ts`, `packages/saas-domain/index.ts`, `packages/platform-adapters/index.ts`).
- UI auth/token flow to include blueprintId and guard checks (`firebase-auth-bridge.service.ts`, `delon-session-context.adapter.ts`, `session-context.interface.ts`, `session.guard.ts`, core and adapter indexes).
- Plan trackers updated to mark tasks complete (`.copilot-tracking/plans/*.md`).

### Removed

- None.

## Release Summary

**Total Files Affected**: 39

### Files Created (28)

- .copilot-tracking/changes/20260106-0md-implementation-changes.md
- .copilot-tracking/changes/20260106-ng-events-architecture-changes.md
- packages/core-engine/src/events/domain-event.ts
- packages/core-engine/src/events/event-store.interface.ts
- packages/core-engine/src/events/index.ts
- packages/core-engine/src/projections/projection.interface.ts
- packages/core-engine/src/projections/projection-rebuilder.interface.ts
- packages/core-engine/src/projections/index.ts
- packages/core-engine/src/causality/causality-chain.util.ts
- packages/account-domain/src/commands/index.ts
- packages/account-domain/src/events/index.ts
- packages/account-domain/src/aggregates/account.aggregate.ts
- packages/account-domain/src/aggregates/workspace.aggregate.ts
- packages/account-domain/src/aggregates/membership.aggregate.ts
- packages/saas-domain/src/commands/index.ts
- packages/saas-domain/src/events/index.ts
- packages/saas-domain/src/aggregates/module.aggregate.ts
- packages/saas-domain/src/aggregates/task.aggregate.ts
- packages/saas-domain/src/aggregates/issue.aggregate.ts
- packages/platform-adapters/src/auth/auth-adapter.service.ts
- packages/platform-adapters/src/facades/workspace.facade.ts
- packages/platform-adapters/src/facades/membership.facade.ts
- packages/platform-adapters/src/queries/blueprint-query.service.ts
- packages/platform-adapters/src/event-store/in-memory-event-store.ts
- packages/platform-adapters/src/projections/projection-rebuilder.ts
- packages/ui-angular/src/app/core/auth/session-facade.service.ts
- packages/ui-angular/src/app/adapters/workspace.facade.ts
- packages/ui-angular/src/app/adapters/membership.facade.ts

### Files Modified (11)

- packages/core-engine/src/session/session-context.interface.ts
- packages/core-engine/index.ts
- packages/account-domain/index.ts
- packages/saas-domain/index.ts
- packages/platform-adapters/index.ts
- packages/ui-angular/src/app/core/auth/delon-session-context.adapter.ts
- packages/ui-angular/src/app/core/auth/firebase-auth-bridge.service.ts
- packages/ui-angular/src/app/core/guards/session.guard.ts
- packages/ui-angular/src/app/core/index.ts
- packages/ui-angular/src/app/adapters/index.ts
- .copilot-tracking/plans/20260106-0md-implementation-plan.instructions.md

### Dependencies & Infrastructure

- **New Dependencies**: None
- **Updated Dependencies**: None
- **Infrastructure Changes**: None
- **Configuration Updates**: None

### Deployment Notes

No deployment actions recorded yet.
