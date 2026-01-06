<!-- markdownlint-disable-file -->

# Task Research Notes: Workspace Model alignment & gaps

## Source Reviewed
- `docs/archive/04-core-model/06-Workspace-Model-Detailed-工作空间模型详解.md`

## Key Principles
- Workspace is a logical container (scope/where), **not** an actor.
- Event shape: actorAccountId (Account), workspaceId (scope), causedBy, timestamp, data (module-specific).
- Account → Workspace → Module → Entity is one-way; modules/entities do not back-reference actor data.
- Organization Account is an actor, distinct from Workspace; Workspaces are not owned via property but via membership relations.
- Workspace responsibilities: contain modules, define permission scope, enforce data isolation. It does not trigger events.

## Critical Rules to Carry into Skeleton
- No `ownerAccountId` field on Workspace; ownership is via AccountWorkspaceMembership with roles (owner/admin/member/viewer).
- Modules never create Workspaces; Platform/domain layer creates Workspaces; modules consume `workspaceId`.
- Always filter/read by `workspaceId` for data isolation; cross-workspace queries use memberships to list workspaceIds.
- Actors are Accounts (User/Org/Bot), never Workspaces; events must include actorAccountId and workspaceId.
- Organization ≠ Workspace; org manages/owns workspaces via relationships, not identity.

## Suggested Skeleton Adjustments
- In account-domain stubs: ensure `Workspace` aggregate has no actor/owner field; include status (active/archived) and metadata only.
- Membership model: `AccountWorkspaceMembership { accountId, workspaceId, role, grantedByAccountId, grantedAt }`.
- Workspace events: `WorkspaceCreated`, `WorkspaceArchived`; membership events: `AccountJoinedWorkspace`, `AccountLeftWorkspace`, `AccountRoleChanged` — all carry actorAccountId (who) and workspaceId (where).
- DomainEvent type: include `actorAccountId` distinct from `workspaceId`; keep `causedBy` chain.
- Module events (e.g., TaskCreated) must always carry `workspaceId` and `actorAccountId`; modules must not mutate Workspace.

## Gaps / To-Do for Skeleton Build Plan
- Update skeleton build plan to enforce actorAccountId vs workspaceId in DomainEvent stub.
- When creating placeholder account-domain files, reflect Workspace as container-only (no owner), and define membership relations separately.
- Ensure projection schemas/keying emphasize workspaceId and role-based membership, not ownership field.

## Next Actions (for future stub work)
- Extend `20260106-skeleton-build-plan.md` to incorporate workspace rules above.
- When stubbing account-domain commands/events, include `actorAccountId` + `workspaceId`, omit owner field, and add membership role changes.
- Add note that Organization/Team (Account subtype) owns workspaces via membership relation; workspaces do not belong to org by property.
