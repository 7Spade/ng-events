<!-- markdownlint-disable-file -->

# Task Research Notes: TypeScript Module Resolution Error for @account-domain

## Research Executed

### File Analysis

- `/home/runner/work/ng-events/ng-events/tsconfig.base.json`
  - Defines path mappings for all packages including `@account-domain`
  - Maps `@account-domain` to `packages/account-domain/index.ts`
  
- `/home/runner/work/ng-events/ng-events/packages/platform-adapters/tsconfig.json`
  - Extends base configuration
  - Has TypeScript project references to `core-engine` and `saas-domain`
  - **MISSING**: Reference to `account-domain` package
  
- `/home/runner/work/ng-events/ng-events/packages/platform-adapters/package.json`
  - Has dependencies on `@ng-events/core-engine` and `@ng-events/saas-domain`
  - **MISSING**: Dependency on `@ng-events/account-domain`

- `/home/runner/work/ng-events/ng-events/packages/account-domain/index.ts`
  - Properly exports all domain modules including commands
  - Exports `InviteMemberCommand` and `CreateWorkspaceCommand` via `export * from './src/commands'`

### Code Search Results

- `@account-domain` imports in platform-adapters
  - Found in `membership.facade.ts`: `import type { InviteMemberCommand } from '@account-domain';`
  - Found in `workspace.facade.ts`: `import type { CreateWorkspaceCommand } from '@account-domain';`

### Project Conventions

- Standards referenced: TypeScript 5.x composite projects with project references
- Workspace structure: Yarn workspaces with monorepo architecture
- All packages use `tsconfig.json` with `"extends": "../../tsconfig.base.json"`
- All packages use TypeScript project references via `"references": [{ "path": "../package-name" }]`

## Key Discoveries

### Project Structure

This is a monorepo using Yarn workspaces with the following package structure:
- `packages/core-engine` - Core domain engine
- `packages/account-domain` - Account/Workspace/Membership domain
- `packages/saas-domain` - SaaS domain models
- `packages/platform-adapters` - Firebase/Auth adapters
- `packages/ui-angular` - Angular UI application

### Root Cause Analysis

The TypeScript compiler error `TS2307: Cannot find module '@account-domain'` occurs because:

1. **Missing TypeScript Project Reference**: The `platform-adapters/tsconfig.json` does not include a reference to the `account-domain` package in its `references` array
2. **Missing Package Dependency**: The `platform-adapters/package.json` does not declare `@ng-events/account-domain` as a dependency

### TypeScript Composite Projects Pattern

TypeScript composite projects require:
1. Path mappings in `tsconfig.base.json` (✅ Already configured)
2. Project references in consuming package's `tsconfig.json` (❌ Missing)
3. Package dependency in consuming package's `package.json` (❌ Missing)

### Implementation Patterns

Other packages follow this pattern correctly. For example, `saas-domain` references `core-engine`:

```json
// packages/saas-domain/tsconfig.json
{
  "references": [
    { "path": "../core-engine" }
  ]
}

// packages/saas-domain/package.json
{
  "dependencies": {
    "@ng-events/core-engine": "*"
  }
}
```

### Complete Examples

**Pattern from saas-domain (working reference):**

```json
// tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist",
    "composite": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"],
  "references": [
    { "path": "../core-engine" }
  ]
}

// package.json
{
  "dependencies": {
    "@ng-events/core-engine": "*"
  }
}
```

## Recommended Approach

Add the missing TypeScript project reference and package dependency to enable proper module resolution:

1. **Update `packages/platform-adapters/tsconfig.json`**:
   - Add `{ "path": "../account-domain" }` to the `references` array

2. **Update `packages/platform-adapters/package.json`**:
   - Add `"@ng-events/account-domain": "*"` to the `dependencies` object

This follows the established pattern used by other packages in the monorepo and is the standard approach for TypeScript composite projects.

## Implementation Guidance

- **Objectives**: 
  - Fix TypeScript module resolution error TS2307
  - Enable platform-adapters to import types from account-domain
  - Maintain consistency with monorepo structure

- **Key Tasks**:
  1. Add TypeScript project reference in `platform-adapters/tsconfig.json`
  2. Add package dependency in `platform-adapters/package.json`
  3. Verify build succeeds

- **Dependencies**: 
  - No external dependencies required
  - Uses existing monorepo workspace structure

- **Success Criteria**:
  - TypeScript compilation succeeds without TS2307 errors
  - Imports from `@account-domain` resolve correctly
  - Pattern matches other package references in the monorepo
