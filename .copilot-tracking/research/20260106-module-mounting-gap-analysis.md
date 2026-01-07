<!-- markdownlint-disable-file -->

# Task Research Notes: Module Mounting Mechanism alignment

## Source Reviewed
- `docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md`

## Key Principles
- Workspace owns a **module registry**: `enabledModules: ModuleKey[]`; Workspace does **not** know module internals.
- Each module declares a **manifest** (`key`, `requires` dependencies). Workspace only checks manifests to decide enablement.
- Enabling a module is an **Event** (`WorkspaceModuleEnabled { workspaceId, moduleKey, enabledBy }`) — replayable/auditable.
- Module APIs always take workspace context; modules never create Workspaces nor peek at other modules’ state except via manifest dependencies.
- Enable flow: command → Workspace aggregate validates via ModuleRegistry → emits WorkspaceModuleEnabled → module listens and initializes its read models.

## Skeleton Implications
- core-engine: add `ModuleManifest`, `ModuleRegistry`, `ModuleGuard` stubs; registry checks `requires` list.
- account-domain Workspace aggregate: include `enabledModules: ModuleKey[]`, handle `EnableModuleCommand`, emit `WorkspaceModuleEnabled`; no direct module logic.
- saas-domain modules: per-module manifest file (e.g., `task.manifest.ts`), handler listening to WorkspaceModuleEnabled to bootstrap projections/read models.
- Platform/UI: treat module enablement as read-only state from Workspace aggregate/projection; guards can check module-enabled status via projection, not via other modules.

## Gaps / To-Do
- Extend skeleton build plan to include ModuleRegistry/manifest stubs and WorkspaceModuleEnabled event/command in account-domain stubs.
- Define `ModuleKey` union and minimal manifests for initial modules (e.g., task/payment/issue) even as placeholders.
- Ensure events/commands carry `workspaceId`, `actorAccountId`, `causedBy*`, consistent with workspace model rules.

## Next Steps
- Add a short stub list for module mounting to the skeleton build plan (ModuleManifest/Registry, EnableModuleCommand, WorkspaceModuleEnabled, per-module manifest placeholders).
- When stubbing, keep modules passive: they react to WorkspaceModuleEnabled to init their own projections.
