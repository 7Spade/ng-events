# ModuleRegistry Aggregate Boundary

## Aggregate Root

**ModuleRegistry** - Represents registered modules/features within a Workspace

## Structure

```
ModuleRegistry/
├── ModuleId (Value Object) - Unique identifier
├── WorkspaceId (Foreign Key) - The workspace this module is registered to
├── ModuleName (Value Object) - Module identifier (e.g., "tasks", "issues", "payments")
├── IsEnabled (Boolean) - Module activation status
├── Configuration (Value Object) - Module-specific settings
└── Events: ModuleRegistered, ModuleEnabled, ModuleDisabled, ModuleUnregistered
```

## Responsibilities

✅ **ModuleRegistry OWNS:**
- Which modules are available in a workspace
- Module activation/deactivation
- Module-level configuration settings

❌ **ModuleRegistry CANNOT:**
- Manage actual module entities (Task/Payment/Issue)
- Modify Workspace metadata
- Control user permissions (Membership responsibility)

## Aggregate Invariants

- ModuleName + WorkspaceId combination must be unique
- ModuleId is immutable after registration
- Cannot unregister a module that has active entities (soft constraint)

## Value Objects

- `ModuleId`: Unique identifier for module registration
- `ModuleName`: Standard module name identifier
- `Configuration`: JSON/Map of module settings

## Domain Events

- `ModuleRegistered`: Fired when module is added to workspace
- `ModuleEnabled`: Fired when module is activated
- `ModuleDisabled`: Fired when module is deactivated
- `ModuleUnregistered`: Fired when module is removed from workspace

## Relationships to Other Aggregates

- **Workspace**: ModuleRegistry belongs to one Workspace (N:1)
- **Task/Payment/Issue**: Module entities are managed by this registry (conceptual, not direct)

## Multi-Tenant Boundary

ModuleRegistry operates WITHIN workspace context:
- Uses `workspaceId` for isolation
- Determines which features are available per workspace

## Module Lifecycle

```
1. Module Registered (in Workspace)
2. Module Enabled (feature available)
3. Users create entities (Task/Payment/Issue)
4. Module Disabled (feature hidden, entities preserved)
5. Module Unregistered (cleanup)
```

## Phase 1.5 Status

**STRUCTURE DECLARED** - Implementation exists in `packages/account-domain/module-registry/`
This document clarifies boundaries only, NO code changes.
