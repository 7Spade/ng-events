<!-- markdownlint-disable-file -->
# Release Changes: TypeScript Module Resolution Fix

**Related Plan**: .copilot-tracking/plans/20260106-typescript-module-resolution-plan.instructions.md  
**Implementation Date**: 2026-01-06

## Summary

Fixed the `@account-domain` module resolution in platform-adapters by adding the missing TypeScript project reference and workspace dependency, matching existing monorepo patterns.

## Changes

### Added

- .copilot-tracking/changes/20260106-typescript-module-resolution-changes.md - Tracking log for the module resolution fix.

### Modified

- packages/platform-adapters/tsconfig.json - Added project reference to account-domain for composite builds.
- packages/platform-adapters/package.json - Declared @ng-events/account-domain workspace dependency to align with other packages.
- tsconfig.base.json - Set baseUrl to enable path mappings required for composite builds.
- .copilot-tracking/plans/20260106-typescript-module-resolution-plan.instructions.md - Marked plan tasks as completed.

### Removed

- None.

## Release Summary

**Total Files Affected**: 4

### Files Created (1)

- .copilot-tracking/changes/20260106-typescript-module-resolution-changes.md - Change log for the module resolution fix.

### Files Modified (3)

- packages/platform-adapters/tsconfig.json - Added project reference to account-domain.
- packages/platform-adapters/package.json - Added workspace dependency on @ng-events/account-domain.
- tsconfig.base.json - Enabled baseUrl for workspace path mappings.

### Dependencies & Infrastructure

- **New Dependencies**: @ng-events/account-domain (workspace)
- **Updated Dependencies**: None
- **Infrastructure Changes**: None
- **Configuration Updates**: platform-adapters references and dependency list updated for TypeScript composite build consistency.

### Deployment Notes

Run `yarn install` and `yarn workspace @ng-events/platform-adapters build` to verify module resolution.
