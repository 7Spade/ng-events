## Overview

`account-domain` models the existence conditions for the SaaS world: accounts, workspaces, memberships, and enabled modules. It is pure TypeScript that can depend on `@ng-events/core-engine` but must stay free of framework SDKs.

## Folder Structure

```
account-domain/
├── account/           # Account lifecycle (active, suspended, closed)
├── workspace/         # Workspace creation and lifecycle state
├── membership/        # Member ↔ workspace roles
├── module-registry/   # Enabled capabilities per workspace
└── __tests__/         # Domain tests
```

Each domain module contains `aggregates/`, `value-objects/`, `events/`, and `__tests__/` with `.gitkeep` placeholders until concrete implementations land.

## Domain Responsibilities

- **Account**: Provision and suspend the SaaS account; gates workspace creation.
- **Workspace**: Represents the world where SaaS modules run; ties back to an account.
- **Membership**: Binds a user to a workspace with a role (`Owner | Admin | Member | Viewer`).
- **Module Registry**: Lists capabilities (task/issue/payment, etc.) enabled per workspace.

## Event & Time Conventions

- Aggregates record `createdAt` (string) as their creation time.
- Events use `occurredAt` (string) and may carry `causationId` / `correlationId` for causality tracking.

## Event Flow Alignment

The onboarding flow follows the saga described in `docs/new/✨0 3.md`:
1) `AccountCreated` → 2) `WorkspaceCreated` → 3) `MemberJoinedWorkspace` → 4) `ModuleEnabled` → SaaS modules become usable.
Compensation events (`AccountSuspended`, `WorkspaceArchived`, module disablement) protect against partial onboarding.

## Usage Guidelines

- Exported types live under `@ng-events/account-domain`.
- Consumers (platform adapters, UI) should read projections, not mutate aggregates directly.
- Keep all new code free from Angular/Firebase SDKs; integrate through adapters instead.
