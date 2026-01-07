<!-- markdownlint-disable-file -->

# Task Details: Module Mounting Mechanism Implementation

## Research Reference

**Source Research**: 
- #file:../research/20260106-module-mounting-gap-analysis.md
- #file:../research/20260106-workspace-model-gap-analysis.md
- #file:../research/20260106-next-steps-skeletons.md

## Phase 1: Core-Engine Module System Contracts

### Task 1.1: Create ModuleManifest interface with key and requires fields

Define the ModuleManifest interface that each module will use to declare its identity and dependencies.

- **Files**:
  - packages/core-engine/src/module-system/module-manifest.ts - Create new file with ModuleManifest interface
  - packages/core-engine/src/module-system/index.ts - Create barrel export
- **Success**:
  - ModuleManifest has key: ModuleKey and requires: ModuleKey[] fields
  - Interface is properly exported from module-system
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 13-16) - Module manifest structure
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md - Manifest declaration pattern
- **Dependencies**:
  - ModuleKey type must be defined first

### Task 1.2: Implement ModuleRegistry class with dependency validation

Create ModuleRegistry that checks if a module can be enabled based on its manifest requirements.

- **Files**:
  - packages/core-engine/src/module-system/module-registry.ts - Create ModuleRegistry class
  - packages/core-engine/src/module-system/module-manifest.ts - Import for validation logic
- **Success**:
  - ModuleRegistry.canEnable(moduleKey, enabledModules, manifests) validates dependencies
  - Returns boolean indicating if all required modules are enabled
  - Properly checks manifest.requires array against enabledModules
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 18-21) - ModuleRegistry validation logic
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md - Dependency checking rules
- **Dependencies**:
  - Task 1.1 completion (ModuleManifest interface)

### Task 1.3: Create ModuleGuard utility for workspace-module boundary checks

Implement ModuleGuard to enforce that modules never create Workspaces and always receive workspace context.

- **Files**:
  - packages/core-engine/src/module-system/module-guard.ts - Create ModuleGuard utility class
- **Success**:
  - ModuleGuard validates workspaceContext is provided to module operations
  - Prevents module operations without valid workspace scope
  - Utility methods for boundary enforcement
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 18-21) - ModuleGuard specification
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 80-90) - Module boundary rules
- **Dependencies**:
  - None (utility class)

### Task 1.4: Define ModuleKey union type for type-safe module references

Create ModuleKey union type for initial modules (task, payment, issue).

- **Files**:
  - packages/core-engine/src/module-system/module-key.ts - Create ModuleKey type definition
  - packages/core-engine/src/module-system/index.ts - Export ModuleKey
- **Success**:
  - ModuleKey is a string literal union: 'task' | 'payment' | 'issue'
  - Type provides compile-time safety for module references
  - Extensible for future modules
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 23-24) - ModuleKey union definition
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 15-17) - ModuleKey examples
- **Dependencies**:
  - None (type definition)

## Phase 2: Account-Domain Workspace Module Management

### Task 2.1: Add enabledModules array to WorkspaceAggregate

Update WorkspaceAggregate to track enabled modules without knowing their internals.

- **Files**:
  - packages/account-domain/src/aggregates/workspace.aggregate.ts - Add enabledModules property
- **Success**:
  - WorkspaceAggregate has enabledModules: ModuleKey[] property
  - Constructor and replay initialize enabledModules
  - Workspace knows which modules are enabled but not their implementation
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 6-11) - Workspace module registry principle
  - #file:../research/20260106-workspace-model-gap-analysis.md (Lines 24-29) - Workspace as container only
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 10-14) - enabledModules array
- **Dependencies**:
  - Task 1.4 completion (ModuleKey type)

### Task 2.2: Create EnableModuleCommand interface

Define EnableModuleCommand with workspaceId, moduleKey, and actorAccountId.

- **Files**:
  - packages/account-domain/src/commands/enable-module.command.ts - Create command interface
  - packages/account-domain/src/commands/index.ts - Export EnableModuleCommand
- **Success**:
  - EnableModuleCommand has workspaceId, moduleKey, actorAccountId, blueprintId, metadata fields
  - Carries complete causality metadata (causedBy, causedByUser, causedByAction)
  - Properly typed with ModuleKey
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 30-32) - EnableModuleCommand specification
  - #file:../research/20260106-workspace-model-gap-analysis.md (Lines 34-36) - actorAccountId vs workspaceId
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 45-51) - Enable command structure
- **Dependencies**:
  - Task 1.4 completion (ModuleKey type)

### Task 2.3: Create WorkspaceModuleEnabled event interface

Define WorkspaceModuleEnabled event for replayable module enablement.

- **Files**:
  - packages/account-domain/src/events/workspace-module-enabled.event.ts - Create event interface
  - packages/account-domain/src/events/index.ts - Export WorkspaceModuleEnabled
- **Success**:
  - WorkspaceModuleEnabled extends DomainEvent with workspaceId, moduleKey, enabledBy in data
  - Event carries complete causality metadata including blueprintId
  - Replayable and auditable event structure
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 13-16) - WorkspaceModuleEnabled event specification
  - #file:../research/20260106-workspace-model-gap-analysis.md (Lines 34-36) - Event metadata requirements
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 35-43) - Event structure
- **Dependencies**:
  - Task 1.4 completion (ModuleKey type)

### Task 2.4: Implement enableModule method in WorkspaceAggregate

Add enableModule method that validates via ModuleRegistry and emits WorkspaceModuleEnabled.

- **Files**:
  - packages/account-domain/src/aggregates/workspace.aggregate.ts - Add enableModule method
- **Success**:
  - enableModule validates dependencies using ModuleRegistry.canEnable
  - Throws error if dependencies not met
  - Emits WorkspaceModuleEnabled event with complete metadata
  - Updates enabledModules array
  - Method accepts EnableModuleCommand and ModuleRegistry
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 13-16) - Enable flow specification
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 53-70) - Enablement flow steps
- **Dependencies**:
  - Task 1.2 completion (ModuleRegistry)
  - Task 2.1 completion (enabledModules property)
  - Task 2.2 completion (EnableModuleCommand)
  - Task 2.3 completion (WorkspaceModuleEnabled)

### Task 2.5: Update WorkspaceAggregate replay to handle WorkspaceModuleEnabled events

Ensure event replay rebuilds enabledModules state from WorkspaceModuleEnabled events.

- **Files**:
  - packages/account-domain/src/aggregates/workspace.aggregate.ts - Update replay and apply methods
- **Success**:
  - apply method handles WorkspaceModuleEnabled events
  - Adds moduleKey to enabledModules when event is applied
  - Replay correctly reconstructs enabledModules state
  - Deterministic state reconstruction
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 13-16) - Replayable event requirement
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md - Event sourcing replay
- **Dependencies**:
  - Task 2.3 completion (WorkspaceModuleEnabled event)
  - Task 2.4 completion (enableModule method)

## Phase 3: SaaS-Domain Module Manifests

### Task 3.1: Create task.manifest.ts with module declaration

Create task module manifest declaring no dependencies.

- **Files**:
  - packages/saas-domain/src/manifests/task.manifest.ts - Create task manifest
  - packages/saas-domain/src/manifests/index.ts - Create barrel export
- **Success**:
  - taskManifest constant with key: 'task' and requires: []
  - Exported from manifests barrel
  - Follows ModuleManifest interface
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 23-24) - Per-module manifest requirement
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 22-28) - Task manifest example
- **Dependencies**:
  - Task 1.1 completion (ModuleManifest interface)

### Task 3.2: Create payment.manifest.ts with task dependency

Create payment module manifest declaring task as required dependency.

- **Files**:
  - packages/saas-domain/src/manifests/payment.manifest.ts - Create payment manifest
  - packages/saas-domain/src/manifests/index.ts - Export paymentManifest
- **Success**:
  - paymentManifest constant with key: 'payment' and requires: ['task']
  - Demonstrates dependency declaration
  - ModuleRegistry will enforce task enablement before payment
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 23-24) - Module dependency example
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 30-36) - Payment manifest with dependency
- **Dependencies**:
  - Task 1.1 completion (ModuleManifest interface)
  - Task 3.1 conceptual (task module exists)

### Task 3.3: Create issue.manifest.ts with module declaration

Create issue module manifest declaring no dependencies.

- **Files**:
  - packages/saas-domain/src/manifests/issue.manifest.ts - Create issue manifest
  - packages/saas-domain/src/manifests/index.ts - Export issueManifest
- **Success**:
  - issueManifest constant with key: 'issue' and requires: []
  - Third module example demonstrating independence
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 23-24) - Module manifest requirement
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md - Module manifest examples
- **Dependencies**:
  - Task 1.1 completion (ModuleManifest interface)

### Task 3.4: Export manifests from saas-domain index

Make manifests available for ModuleRegistry validation.

- **Files**:
  - packages/saas-domain/src/index.ts - Add manifest exports
- **Success**:
  - All manifests (task, payment, issue) exported from saas-domain
  - ModuleRegistry can import and use for validation
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 23-24) - Manifest accessibility
- **Dependencies**:
  - Tasks 3.1, 3.2, 3.3 completion (all manifests)

## Phase 4: Passive Module Initialization

### Task 4.1: Create WorkspaceModuleEnabled event handler interface

Define handler interface for modules to listen to WorkspaceModuleEnabled events.

- **Files**:
  - packages/core-engine/src/module-system/module-event-handler.ts - Create handler interface
  - packages/core-engine/src/module-system/index.ts - Export handler interface
- **Success**:
  - ModuleEventHandler interface with onWorkspaceModuleEnabled method
  - Accepts WorkspaceModuleEnabled event parameter
  - Returns void or Promise<void>
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 18-21) - Passive module initialization
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 72-78) - Event listener pattern
- **Dependencies**:
  - Task 2.3 completion (WorkspaceModuleEnabled event)

### Task 4.2: Implement task module initialization handler

Create handler that initializes task read models when task module is enabled.

- **Files**:
  - packages/saas-domain/src/handlers/task-module.handler.ts - Create task event handler
- **Success**:
  - TaskModuleHandler listens to WorkspaceModuleEnabled(module === 'task')
  - Initializes task read models/projections for workspaceId
  - Passive initialization (no workspace mutation)
  - Handler is placeholder stub that logs initialization
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 18-21) - Module passive initialization
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 80-86) - Task initialization example
- **Dependencies**:
  - Task 4.1 completion (ModuleEventHandler interface)
  - Task 2.3 completion (WorkspaceModuleEnabled event)

### Task 4.3: Implement payment module initialization handler

Create handler that initializes payment read models when payment module is enabled.

- **Files**:
  - packages/saas-domain/src/handlers/payment-module.handler.ts - Create payment event handler
- **Success**:
  - PaymentModuleHandler listens to WorkspaceModuleEnabled(module === 'payment')
  - Initializes payment read models for workspaceId
  - Passive initialization only
  - Handler is placeholder stub
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 18-21) - Passive module pattern
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md - Module handler examples
- **Dependencies**:
  - Task 4.1 completion (ModuleEventHandler interface)
  - Task 2.3 completion (WorkspaceModuleEnabled event)

### Task 4.4: Implement issue module initialization handler

Create handler that initializes issue read models when issue module is enabled.

- **Files**:
  - packages/saas-domain/src/handlers/issue-module.handler.ts - Create issue event handler
- **Success**:
  - IssueModuleHandler listens to WorkspaceModuleEnabled(module === 'issue')
  - Initializes issue read models for workspaceId
  - Passive initialization pattern
  - Handler is placeholder stub
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 18-21) - Module initialization
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md - Handler pattern
- **Dependencies**:
  - Task 4.1 completion (ModuleEventHandler interface)
  - Task 2.3 completion (WorkspaceModuleEnabled event)

## Phase 5: Integration and Validation

### Task 5.1: Update core-engine index to export module system contracts

Ensure all module system types are exported from core-engine.

- **Files**:
  - packages/core-engine/src/index.ts - Add module-system exports
- **Success**:
  - ModuleManifest, ModuleRegistry, ModuleGuard, ModuleKey all exported
  - ModuleEventHandler interface exported
  - Other packages can import module system contracts
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 18-21) - Core-engine module system stubs
- **Dependencies**:
  - Phase 1 completion (all core-engine module system files)

### Task 5.2: Validate ModuleRegistry dependency checking logic

Test that ModuleRegistry correctly enforces module dependencies.

- **Files**:
  - Create test scenario demonstrating dependency validation
- **Success**:
  - Payment module cannot be enabled before task module
  - Task and issue modules can be enabled independently
  - ModuleRegistry.canEnable returns correct boolean
  - Manual validation through code review
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 18-21) - ModuleRegistry validation requirement
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 53-70) - Dependency validation flow
- **Dependencies**:
  - Task 1.2 completion (ModuleRegistry)
  - Tasks 3.1, 3.2, 3.3 completion (all manifests)

### Task 5.3: Ensure all events carry complete causality metadata

Verify EnableModuleCommand and WorkspaceModuleEnabled include all required metadata.

- **Files**:
  - Review command and event interfaces
- **Success**:
  - workspaceId present in all module-related commands/events
  - actorAccountId identifies who performed the action
  - causedBy, causedByUser, causedByAction in metadata
  - blueprintId included for multi-tenant boundary
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 30-32) - Metadata requirements
  - #file:../research/20260106-workspace-model-gap-analysis.md (Lines 34-36) - Actor vs workspace separation
- **Dependencies**:
  - Task 2.2 completion (EnableModuleCommand)
  - Task 2.3 completion (WorkspaceModuleEnabled)

### Task 5.4: Verify modules never create Workspaces or access other module state

Code review to ensure module boundaries are respected.

- **Files**:
  - Review saas-domain module handlers and aggregates
- **Success**:
  - Modules only initialize via WorkspaceModuleEnabled events
  - No module creates Workspace instances
  - Modules only access other modules via manifest dependencies
  - All module operations receive workspaceContext parameter
  - ModuleGuard can be used to enforce boundaries
- **Research References**:
  - #file:../research/20260106-module-mounting-gap-analysis.md (Lines 26-32) - Module boundary rules
  - docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md (Lines 92-110) - Anti-patterns
- **Dependencies**:
  - Phase 4 completion (all module handlers)

## Dependencies

- TypeScript 5.x with ES2022 target
- Existing core-engine DomainEvent contracts
- Existing account-domain Workspace aggregate
- Existing saas-domain module aggregates

## Success Criteria

- ModuleRegistry validates dependencies correctly
- Workspace maintains enabledModules without knowing module internals
- All events/commands carry workspaceId, actorAccountId, causedBy metadata
- Modules initialize passively via event handlers
- Module boundaries respected (no workspace creation, no cross-module access)
