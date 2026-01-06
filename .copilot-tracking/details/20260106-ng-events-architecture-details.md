<!-- markdownlint-disable-file -->

# Task Details: ng-events architecture alignment

## Research Reference

**Source Research**: #file:../research/20260106-ng-events-architecture-research.md

## Phase 1: Core contracts and domain scaffolding

### Task 1.1: Extend core-engine event and causality contracts

Define event-sourcing contracts that propagate tenant and causality metadata across aggregates. Add base domain event types carrying `id`, `aggregateId`, `aggregateType`, `eventType`, `data`, and `metadata` with `blueprintId`, `causedBy`, `causedByUser`, `causedByAction`, and `timestamp`. Ensure session context keeps optional `blueprintId` to enforce workspace boundary.

- **Files**:
  - packages/core-engine/src/events/domain-event.ts - add base domain event and metadata interfaces
  - packages/core-engine/src/events/index.ts - export event contracts
  - packages/core-engine/src/session/session-context.interface.ts - confirm/extend optional `blueprintId` in session context
- **Success**:
  - Domain event contracts include causality metadata and optional `blueprintId`
  - Event exports available to downstream packages
- **Research References**:
  - #file:../research/20260106-ng-events-architecture-research.md (Lines 9-18, 92-110) - architecture chain, tenant metadata, and event-sourcing guidance
- **Dependencies**:
  - None

### Task 1.2: Scaffold account-domain and saas-domain aggregates and commands

Create skeleton source trees for account-domain (Account, Workspace, Membership) and saas-domain (e.g., Task/Issue) with placeholder aggregates, commands, and events. Each command/event should carry `blueprintId` and causality metadata from core-engine contracts. Expose public exports via package index files without pulling SDK dependencies.

- **Files**:
  - packages/account-domain/src/aggregates/account.aggregate.ts - placeholder aggregate structure
  - packages/account-domain/src/aggregates/workspace.aggregate.ts - placeholder enforcing Account → Workspace boundary
  - packages/account-domain/src/aggregates/membership.aggregate.ts - membership/ACL projection placeholder
  - packages/account-domain/src/commands/index.ts - command entry points carrying `blueprintId`
  - packages/account-domain/src/events/index.ts - event entry points carrying metadata
  - packages/account-domain/src/index.ts - public exports only
  - packages/saas-domain/src/aggregates/module.aggregate.ts - placeholder module/entity aggregate
  - packages/saas-domain/src/commands/index.ts - commands with `blueprintId`
  - packages/saas-domain/src/events/index.ts - events with metadata
  - packages/saas-domain/src/index.ts - public exports only
- **Success**:
  - Domain folders contain compilable placeholder classes/interfaces referencing core event contracts
  - Commands/events include `blueprintId` in payloads
- **Research References**:
  - #file:../research/20260106-ng-events-architecture-research.md (Lines 41-51, 92-110) - package skeleton, tenant chain, and metadata requirements
- **Dependencies**:
  - Task 1.1 domain event contracts available

## Phase 2: Adapter and UI auth pipeline alignment

### Task 2.1: Build platform-adapters facades and align UI auth/ACL flow

Add platform-adapters facades that accept UI DTOs, inject Firebase auth claims, and forward to domain services through `DA_SERVICE_TOKEN`, ensuring `blueprintId` is set before invoking domain commands. Update ui-angular facades/guards to consume these adapter services, reusing the single Firebase → @delon/auth bridge and @delon/acl guard pipeline.

- **Files**:
  - packages/platform-adapters/src/auth/auth-adapter.service.ts - enrich commands with claims/`blueprintId`, expose DA_SERVICE_TOKEN provider
  - packages/platform-adapters/src/index.ts - export adapter providers/facades
  - packages/ui-angular/src/app/core/auth/session-facade.service.ts - consume adapter, expose `waitForAuthState`/`refreshToken`
  - packages/ui-angular/src/app/core/guards/session.guard.ts - rely on ACL and adapter-provided permissions
- **Success**:
  - Adapter service composes auth claims with `blueprintId` and forwards via DA_SERVICE_TOKEN
  - UI guard/facade depend only on adapter/ACL, not domain SDKs
- **Research References**:
  - #file:../research/20260106-ng-events-architecture-research.md (Lines 10-18, 46-50, 94-110) - auth chain, adapter expectations, and tenant metadata propagation
- **Dependencies**:
  - Phase 1 scaffolding for domain contracts and exports

## Dependencies

- @angular/fire/auth, @delon/auth, DA_SERVICE_TOKEN, @delon/acl available in repo per architecture

## Success Criteria

- Core contracts define causality metadata with `blueprintId`
- Domain packages expose skeleton aggregates/commands/events without SDK leakage
- Adapter and UI layers route auth and ACL through DA_SERVICE_TOKEN with tenant metadata enforced
