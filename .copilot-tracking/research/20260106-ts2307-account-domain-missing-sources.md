<!-- markdownlint-disable-file -->

# Task Research Notes: TS2307 '@account-domain' missing module

## Research Executed

### File Analysis

- `packages/platform-adapters/src/facades/{membership,workspace}.facade.ts`
  - Import `InviteMemberCommand` / `CreateWorkspaceCommand` from `@account-domain`.
- `packages/account-domain/index.ts`
  - Re-exports aggregates/commands/events under `./src/...` but the `src` directory and files do not exist.
- `tsconfig.base.json`
  - Paths map `@account-domain` to `packages/account-domain/index.ts` (correct), so path mapping is present.
- `packages/platform-adapters/tsconfig.json` & `package.json`
  - Missing project reference and dependency on account-domain (already noted in module-resolution research).

### Code Search Results

- No `packages/account-domain/src/**` files exist; imports target non-existent files.

## Root Cause

`TS2307: Cannot find module '@account-domain'` arises from two factors:
1) platform-adapters lacks TS project reference + dependency on account-domain (composite build cannot resolve project).
2) account-domain has no `src` files; its index.ts re-exports paths that do not exist, so even with path mapping the module cannot be resolved.

## Recommended Fix

- Add account-domain to platform-adapters: tsconfig `references: [{ path: '../account-domain' }]` and package.json dependency, as captured in 20260106-typescript-module-resolution-research.md.
- Scaffold minimal account-domain src files (aggregates/commands/events folders) or stub exports so index.ts resolves; otherwise module resolution will continue to fail.

## Implementation Guidance

- Create empty or placeholder files under `packages/account-domain/src/aggregates`, `src/commands`, `src/events` to satisfy exports, then incrementally fill domain logic.
- After stubbing files, run TypeScript build to confirm TS2307 is resolved.
