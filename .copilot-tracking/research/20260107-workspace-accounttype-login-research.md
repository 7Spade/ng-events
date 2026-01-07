<!-- markdownlint-disable-file -->

# Task Research Notes: Workspace selection & accountType-driven login mapping

## Research Executed

### File Analysis

- docs/archive/03-architecture/05-Authorization-Layers-Detailed-权限分层详解.md
  - Authentication adapters only answer "Who are you?" and return `AuthContext` with `accountId`, `accountType`, `workspaceId`, `roles`; domain layer owns authorization decisions. Login flow fetches memberships to pick current workspace.
- docs/archive/04-core-model/05-Account-Model-Detailed-账户模型详解.md
  - Account is the actor with `accountType: 'user' | 'organization' | 'bot'`; AuthContext mirrors it. Events and permissions always use `actorAccountId`; workspace membership governs scope.
- packages/ui-angular/src/app/core/auth/delon-session-context.adapter.ts
  - Frontend token adapter exposes `accountId/accountType/workspaceId/workspaceType/roles/modules` from @delon/auth token. TODO notes: map accountId/accountType from Account projection and refresh ACL when actor or workspace changes.

### Code Search Results

- accountType | docs + ui-angular adapter/specs
  - Shows accountType used for AuthContext and session adapter (user/organization/bot) with TODOs for projection-fed data.
- Workspace portal selection | not present in UI; guards rely on workspaceId in session context
  - Indicates workspace selection UX not yet implemented; current guards expect workspaceId/blueprintId token fields.

### External Research

- #githubRepo:"7Spade/ng-events account workspace"
  - Not executed; internal architecture docs already define required workspace/accountType model.
- #fetch:https://angular.dev/guide/signals
  - Not consulted; UI changes not in research scope for this task.

### Project Conventions

- Standards referenced: Authorization three-layer split (platform adapter vs domain vs UI), AuthContext shape (`accountId/accountType/workspaceId/roles`), actor-centric events from account model doc.
- Instructions followed: Research-only updates; no source changes; consolidated findings into single recommended approach.

## Key Discoveries

### Project Structure

- Domain/auth docs clearly separate actor (Account) from workspace (scope). Workspace is a container chosen post-login based on membership; UI should be a portal to pick workspace rather than the work surface itself.
- Frontend session adapter already models accountId/accountType/workspaceId but relies on token payload; notes indicate future projection integration and ACL refresh when actor/workspace changes.

### Implementation Patterns

- AuthContext returned by platform adapters: `{ accountId, accountType: 'user' | 'organization' | 'bot', workspaceId, roles }` with optional metadata; no business rules in adapters.
- Authorization checks use `assertWorkspaceAccess(accountId, workspaceId)` and module gating after workspace is selected.
- Events carry `actorAccountId` and `workspaceId` (scope) regardless of accountType; workspace ownership/membership is relational, not a property on Workspace.

### Complete Examples

```typescript
// From authorization layer doc (platform adapter outcome)
interface AuthContext {
  accountId: string;
  accountType: 'user' | 'organization' | 'bot';
  workspaceId: string;
  roles: string[];
  metadata?: Record<string, unknown>;
}
```

### API and Schema Documentation

- Workspace is a logical container; membership drives role/ability. accountType distinguishes actor (user/bot) vs container-type accounts (organization) but Workspace itself remains scope, not actor.

### Configuration Examples

```text
Token payload (ui-angular adapter expectation):
uid/accountId/accountType/workspaceId/workspaceType/roles/abilities/modules/ownerAccountIds/expired
```

### Technical Requirements

- Login flow must authenticate Account, load Account↔Workspace memberships, and prompt workspace selection (or apply default) before showing modules.
- Permissions evaluated at workspace/module level; UI should only gate visibility, not make decisions.
- Workspace types likely include organization/project/personal; sandbox/container types are unnecessary for task tracking per guidance.

## Recommended Approach

Treat login UI as an Account portal that authenticates the actor (user/organization/bot), fetches memberships, and requires the user to select a Workspace (organization/project/personal) before entering modules. AuthContext/session tokens should always carry `accountId`, `accountType`, `workspaceId`, `roles`, and enabled modules. Workspace remains a container; ownership is expressed via membership roles, and authorization checks run at workspace/module boundaries with `actorAccountId` + `workspaceId` in events.

## Implementation Guidance

- **Objectives**: Map login to a two-step flow (authenticate Account ➜ choose Workspace) and ensure session context exposes `accountId/accountType/workspaceId/roles/modules` for guards and module toggles.
- **Key Tasks**: Implement membership-backed workspace picker post-login; ensure token/projection feeds accountType/workspaceId; wire guards to `assertWorkspaceAccess` and module enablement; keep events actor+workspace scoped.
- **Dependencies**: Account projection supplying accountId/accountType; membership list per account; session adapter consuming projection-fed token; workspace/module configuration for module toggles.
- **Success Criteria**: After login, users/bots land on workspace chooser; selected workspace propagates to session context; guards/use-cases read accountId/accountType and workspaceId; permissions evaluated per workspace/module with no owner fields on Workspace.
