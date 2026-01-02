## Mission

Guard the identity / organization / capability context. This package owns accounts, workspaces, memberships, and module registry state. It should remain pure TypeScript and may depend on `@ng-events/core-engine` only.

## Guardrails

- Do not pull Angular, Firebase, or other SDKs into this package.
- Keep task/payment/issue logic in `saas-domain`; this package only decides whether those modules are allowed.
- Follow the saga flow: `AccountCreated` → `WorkspaceCreated` → `MemberJoinedWorkspace` → `ModuleEnabled`. Compensation uses `AccountSuspended`, `WorkspaceArchived`, and module disablement.

## Structure Cheatsheet

- `account/` — lifecycle of the SaaS account.
- `workspace/` — world where SaaS modules run.
- `membership/` — user ↔ workspace roles (`Owner | Admin | Member | Viewer`).
- `module-registry/` — enabled capabilities per workspace.
- `__tests__/` — place domain tests alongside aggregates.

## How to extend

Add new value objects, aggregates, or events inside the appropriate module. Keep folders tracked with `.gitkeep` until implementations are ready. Expose new exports via `packages/account-domain/index.ts`.
