<!-- markdownlint-disable-file -->

# Task Details: TypeScript Module Resolution Fix for @account-domain

## Research Reference

**Source Research**: #file:../research/20260106-typescript-module-resolution-research.md

## Phase 1: Add TypeScript Project Reference

### Task 1.1: Update platform-adapters tsconfig.json

Add the missing project reference to account-domain in the platform-adapters TypeScript configuration.

- **Files**:
  - packages/platform-adapters/tsconfig.json - Add reference to account-domain
- **Success**:
  - References array includes `{ "path": "../account-domain" }`
  - Configuration matches pattern used for core-engine and saas-domain references
- **Research References**:
  - #file:../research/20260106-typescript-module-resolution-research.md (Lines 63-80) - TypeScript Composite Projects Pattern
  - #file:../research/20260106-typescript-module-resolution-research.md (Lines 82-108) - Complete working examples
- **Dependencies**:
  - TypeScript composite project configuration already in place
  - account-domain package exists with proper exports

## Phase 2: Add Package Dependency

### Task 2.1: Update platform-adapters package.json

Add the missing package dependency to enable workspace resolution.

- **Files**:
  - packages/platform-adapters/package.json - Add @ng-events/account-domain dependency
- **Success**:
  - Dependencies object includes `"@ng-events/account-domain": "*"`
  - Pattern matches other monorepo package dependencies
- **Research References**:
  - #file:../research/20260106-typescript-module-resolution-research.md (Lines 82-108) - Complete working pattern from saas-domain
  - #file:../research/20260106-typescript-module-resolution-research.md (Lines 26-30) - Missing dependency analysis
- **Dependencies**:
  - Task 1.1 completion (TypeScript reference should be added first)

## Phase 3: Verification

### Task 3.1: Verify TypeScript compilation

Build the project to ensure the module resolution fix is working.

- **Files**:
  - All TypeScript files in platform-adapters that import from @account-domain
- **Success**:
  - `yarn build` or `tsc` completes without TS2307 errors
  - Imports like `import type { InviteMemberCommand } from '@account-domain';` resolve correctly
  - No regression in other package builds
- **Research References**:
  - #file:../research/20260106-typescript-module-resolution-research.md (Lines 110-121) - Recommended approach
  - #file:../research/20260106-typescript-module-resolution-research.md (Lines 123-137) - Success criteria
- **Dependencies**:
  - Phase 1 and Phase 2 completion

## Dependencies

- TypeScript 5.x with composite project support
- Yarn workspaces for monorepo
- Existing account-domain package with proper exports

## Success Criteria

- No TypeScript TS2307 module resolution errors
- Build succeeds for platform-adapters package
- Pattern is consistent with other package references in monorepo
- All imports from @account-domain resolve correctly
