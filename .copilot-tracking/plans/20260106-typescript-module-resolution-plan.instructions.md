---
applyTo: ".copilot-tracking/changes/20260106-typescript-module-resolution-changes.md"
---

<!-- markdownlint-disable-file -->

# Task Checklist: TypeScript Module Resolution Fix for @account-domain

## Overview

Fix the TypeScript compiler error `TS2307: Cannot find module '@account-domain'` in platform-adapters by adding missing project references and package dependencies.

## Objectives

- Add TypeScript project reference to account-domain in platform-adapters
- Add package dependency to enable proper module resolution
- Verify build succeeds without TS2307 errors
- Maintain consistency with monorepo structure patterns

## Research Summary

### Project Files

- packages/platform-adapters/tsconfig.json - Missing reference to account-domain
- packages/platform-adapters/package.json - Missing dependency on @ng-events/account-domain
- tsconfig.base.json - Path mappings already configured correctly
- packages/account-domain/index.ts - Exports properly configured

### External References

- #file:../research/20260106-typescript-module-resolution-research.md - Complete root cause analysis and solution
- TypeScript composite projects documentation - Project references pattern

### Standards References

- #file:../../.github/instructions/typescript-5-es2022.instructions.md - TypeScript conventions
- Existing monorepo patterns in saas-domain and core-engine packages

## Implementation Checklist

### [ ] Phase 1: Add TypeScript Project Reference

- [ ] Task 1.1: Update platform-adapters tsconfig.json
  - Details: .copilot-tracking/details/20260106-typescript-module-resolution-details.md (Lines 11-24)

### [ ] Phase 2: Add Package Dependency

- [ ] Task 2.1: Update platform-adapters package.json
  - Details: .copilot-tracking/details/20260106-typescript-module-resolution-details.md (Lines 26-38)

### [ ] Phase 3: Verification

- [ ] Task 3.1: Verify TypeScript compilation
  - Details: .copilot-tracking/details/20260106-typescript-module-resolution-details.md (Lines 40-51)

## Dependencies

- TypeScript 5.x composite projects
- Yarn workspaces
- Existing account-domain package

## Success Criteria

- TypeScript compilation succeeds without TS2307 errors
- Imports from @account-domain resolve correctly in platform-adapters
- Pattern matches other package references in the monorepo (saas-domain, core-engine)
- Build process completes successfully
