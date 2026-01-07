<!-- markdownlint-disable-file -->

# Task Research Notes: Account login → workspace selection model

## Research Executed

### File Analysis

- Workspace model doc — Workspace is scope; events need `actorAccountId` + `workspaceId`; ownership via memberships.
- Naming conventions Part1/2 — `assertWorkspaceAccess`, `WorkspaceRole`; forbid `ownerUserId/createdByUserId`.
- ui-angular/routes.ts — Guards present; `requireWorkspace: false` keeps gating off.
- ui-angular/core/guards/session.guard.ts — Auth + workspace/blueprint/module/ownership checks; ACL from SessionContext.
- ui-angular/core/session-context.interface.ts — Session contract with actor/scope fields plus roles/abilities/modules.
- ui-angular/core/auth/delon-session-context.adapter.spec.ts — Token expected to carry account + workspace payload; projection path pending.
- account-domain/aggregates/workspace.aggregate.ts — Stores `accountId`; `WorkspaceCreated` sets `actorAccountId` to it.
- account-domain/aggregates/account.aggregate.ts & membership.aggregate.ts — Use `ownerUserId`/`memberUserId` (user-centric) not account-based.

### Code Search Results

- requireWorkspace — disabled in routes; guard blocks when missing `workspaceId` if enabled.
- workspaceType — `'organization' | 'container'`; guard ownership for `workspaceType === 'container'`.
- ownerUserId/memberUserId — present in account-domain aggregates.

### External Research

- #githubRepo:"n/a" — No external repos consulted.
- #fetch:n/a — No external fetch performed.

### Project Conventions

- Naming conventions, workspace model doc, Account → Workspace → Module chain.

## Key Discoveries

- Workspace gating exists but is disabled, so users reach dashboard without selecting a workspace.
- SessionGuard/SessionContext already support workspace + module enforcement once hydrated.
- Domain stubs embed ownership (accountId/ownerUserId/memberUserId), conflicting with membership-based ownership and account actors.

### Complete Examples

```typescript
// session.guard.ts — workspace gate
if (route.data?.['requireWorkspace'] && !session.workspaceId) {
  return router.createUrlTree(['/exception/403']);
}
```

### API and Schema Documentation

- SessionContext: `accountId/accountType`, `workspaceId/workspaceType`, `blueprintId`, `ownerAccountIds`, roles/abilities/modules.
- Workspace model: events need `actorAccountId` + `workspaceId`; Workspace should omit owner fields; membership via `AccountWorkspaceMembership { accountId, workspaceId, role, grantedByAccountId, grantedAt }`.
- WorkspaceAggregate stub couples `accountId` to events → needs removal.

### Technical Requirements

- Flow: login → list AccountWorkspaceMemberships → user picks Workspace → SessionContext stores scope + roles/abilities/modules.
- Authorization: use `assertWorkspaceAccess(accountId, workspaceId)` + `assertModuleEnabled(workspaceId, moduleKey)`.
- Domain gap: remove owner fields/user-centric ids; keep actorAccountId separate from workspace scope.

## Recommended Approach

After login, load AccountWorkspaceMembership projection, show a workspace picker, hydrate SessionContext (workspaceId/type/blueprintId, roles/abilities/modules), then re-enable `requireWorkspace`. Refactor account-domain stubs to remove owner fields/user ids and emit events with `actorAccountId` distinct from workspace scope.

## Implementation Guidance

- **Objectives**: Post-login workspace selection; align session/ACL with actor vs scope; remove ownership coupling.
- **Key Tasks**: Membership projection→SessionContext; workspace picker; flip `requireWorkspace`; refactor account-domain aggregates.
- **Dependencies**: AccountWorkspaceMembership projection, SessionContext provider + Delon adapter, ACLService refresh, ModuleRegistry guards.
- **Success Criteria**: Users pick a workspace before guarded routes; SessionContext exposes actor + workspace data; events carry `actorAccountId` + `workspaceId` without owner fields.
