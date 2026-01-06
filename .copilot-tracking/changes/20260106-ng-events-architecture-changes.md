<!-- markdownlint-disable-file -->
# Release Changes: ng-events architecture alignment

**Related Plan**: .copilot-tracking/plans/20260106-ng-events-architecture-plan.instructions.md  
**Implementation Date**: 2026-01-06

## Summary

Aligned ng-events architecture skeleton with tenant metadata propagation, core event contracts, domain scaffolds, and adapter/UI auth pipeline updates.

## Changes

### Added

- Core event/projection/causality contracts in `packages/core-engine/src`.
- Domain scaffolds for account and saas packages (commands, events, aggregates).
- Platform adapter facades, event store, and blueprint-aware queries.
- UI facades and session helpers for blueprint-aware auth/ACL flow.

### Modified

- Export surfaces and session context metadata across core-engine, domain, platform, and UI layers.
- Plan checklist statuses updated for architecture milestones.

### Removed

- None.

## Release Summary

**Total Files Affected**: 39

### Files Created (28)

- (See 0.md implementation change log for the full created file list across core, domain, adapters, and UI.)

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
- .copilot-tracking/plans/20260106-ng-events-architecture-plan.instructions.md

### Dependencies & Infrastructure

- **New Dependencies**: None
- **Updated Dependencies**: None
- **Infrastructure Changes**: None
- **Configuration Updates**: None

### Deployment Notes

No deployment actions recorded yet.
