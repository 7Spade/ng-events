<!-- markdownlint-disable-file -->
# Release Changes: Next Steps Implementation (Phase 1)

**Related Plan**: .copilot-tracking/plans/20260106-next-steps-implementation-plan.instructions.md  
**Implementation Date**: 2026-01-06

## Summary

Completed Phase 1 of the Next Steps implementation by extending core-engine contracts (causality validation, projection rebuilder strategies, idempotency metadata) and updating platform-adapters to the new rebuilder interface.

## Changes

### Added

- packages/core-engine/src/causality/causality-metadata.validator.ts - Validator enforcing required causality metadata fields.
- packages/core-engine/src/causality/index.ts - Barrel export for causality utilities.
- packages/core-engine/src/projections/projection-rebuilder.ts - Expanded projection rebuilder interface with rebuild strategies.

### Modified

- packages/core-engine/src/events/domain-event.ts - Added optional idempotencyKey to event metadata.
- packages/core-engine/src/projections/index.ts - Export new projection rebuilder interface.
- packages/core-engine/index.ts - Export causality barrel.
- packages/platform-adapters/src/projections/projection-rebuilder.ts - Implement new rebuild methods aligned to the updated interface.
- .copilot-tracking/plans/20260106-next-steps-implementation-plan.instructions.md - Marked Phase 1 tasks complete.
- .copilot-tracking/TASK_STATUS.md - Updated Next Steps status to reflect Phase 1 completion.

### Removed

- packages/core-engine/src/projections/projection-rebuilder.interface.ts - Replaced by the expanded projection-rebuilder contract.

## Release Summary

**Total Files Affected**: 10

### Files Created (3)

- packages/core-engine/src/causality/causality-metadata.validator.ts
- packages/core-engine/src/causality/index.ts
- packages/core-engine/src/projections/projection-rebuilder.ts

### Files Modified (6)

- packages/core-engine/src/events/domain-event.ts
- packages/core-engine/src/projections/index.ts
- packages/core-engine/index.ts
- packages/platform-adapters/src/projections/projection-rebuilder.ts
- .copilot-tracking/plans/20260106-next-steps-implementation-plan.instructions.md
- .copilot-tracking/TASK_STATUS.md

### Files Removed (1)

- packages/core-engine/src/projections/projection-rebuilder.interface.ts

### Dependencies & Infrastructure

- **New Dependencies**: None
- **Updated Dependencies**: None
- **Infrastructure Changes**: None
- **Configuration Updates**: None

### Deployment Notes

Run `yarn workspace @ng-events/core-engine build` and `yarn workspace @ng-events/platform-adapters build` to validate TypeScript contracts.
