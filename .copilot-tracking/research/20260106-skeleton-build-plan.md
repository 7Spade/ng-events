<!-- markdownlint-disable-file -->

# Task Research Notes: Skeleton build plan (0.md alignment + TS2307 fix)

## Objectives
- Stand up minimal compilable skeleton to unblock TS2307 and begin vertical slices.
- Keep scope to scaffolding (stubs/placeholders) consistent with existing architecture/0.md research.

## Immediate Fixes (TS2307)
1) platform-adapters/tsconfig.json: add project reference `{ "path": "../account-domain" }`.
2) platform-adapters/package.json: add dependency `"@ng-events/account-domain": "*"`.
3) account-domain: create `src/aggregates`, `src/commands`, `src/events` folders with placeholder exports matching index.ts (e.g., empty classes/interfaces `WorkspaceAggregate`, `MembershipAggregate`, `InviteMemberCommand`, `CreateWorkspaceCommand`, etc.).

## Skeleton Scaffold (MVP stubs)
- core-engine:
  - Add minimal `src/events/domain-event.ts`, `src/projections/projection.interface.ts` with blueprintId + causedBy metadata; defer full event-store/saga.
- account-domain:
  - Stubs for `workspace.aggregate.ts`, `membership.aggregate.ts` (validate presence of blueprintId in ctor/handle methods).
  - Commands: `create-workspace.command.ts`, `invite-member.command.ts` interfaces with blueprintId, metadata.
  - Events: `workspace-created.event.ts`, `membership-invited.event.ts` interfaces with blueprintId, metadata.
- platform-adapters:
  - Keep facades; once stubs exist, imports resolve. Optionally add mock handlers that return resolved commands for now.
- ui-angular:
  - No code required to fix TS2307; ensure adapters are consumable after stubs.

## Optional Parallel Slice (projection-first)
- platform-adapters: Firestore projection writer stub + membership projection handler consuming fake DomainEvents.
- core-engine: minimal DomainEvent type reused by projection handler.

## Success Criteria
- `tsc -b` (or package build) resolves `@account-domain` imports without TS2307.
- Monorepo compiles with placeholder domain files; no runtime logic needed yet.

## Notes
- Keep stubs typed and aligned to blueprintId/metadata schema to reduce rework when implementing real logic.
- Maintain consistency with existing research docs; do not diverge from auth chain or layering rules.
