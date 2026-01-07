---
applyTo: ".copilot-tracking/changes/20260107-module-mounting-mechanism-changes.md"
---

<!-- markdownlint-disable-file -->

# Task Checklist: Module Mounting Mechanism Implementation

## Overview

Implement the module mounting mechanism for ng-events, including ModuleManifest/ModuleRegistry in core-engine, EnableModuleCommand/WorkspaceModuleEnabled event in account-domain, per-module manifest declarations in saas-domain, and passive module initialization through event listeners.

## Objectives

- **Phase 0**: Update DomainEvent interface to include actorAccountId for proper actor/workspace separation
- Implement ModuleManifest and ModuleRegistry in core-engine for dependency validation
- Add EnableModuleCommand and WorkspaceModuleEnabled event to account-domain Workspace aggregate
- Create per-module manifest files (task, payment, issue) in saas-domain with dependency declarations
- Ensure Workspace maintains enabledModules array without knowing module internals
- Implement passive module initialization via WorkspaceModuleEnabled event listeners
- Ensure all events/commands carry workspaceId + actorAccountId + causedBy metadata

## Research Summary

### Project Files

- packages/core-engine/src/events/domain-event.ts - Base event structure with causality metadata
- packages/account-domain/src/aggregates/workspace.aggregate.ts - Workspace aggregate stub
- packages/saas-domain/src/aggregates/module.aggregate.ts - Module aggregate stub
- docs/archive/03-architecture/04-Module-Mounting-Mechanism(模組掛載機制).md - Module mounting specification

### External References

- #file:../research/20260106-module-mounting-gap-analysis.md (Lines 1-55) - Module mounting mechanism alignment and implementation guidance
- #file:../research/20260106-workspace-model-gap-analysis.md (Lines 1-49) - Workspace model rules and actor/workspace separation
- #file:../research/20260106-next-steps-skeletons.md (Lines 1-101) - Skeleton implementation guidance for all packages

### Standards References

- #file:../../.github/instructions/typescript-5-es2022.instructions.md - TypeScript development standards
- #file:../../.github/instructions/event-sourcing-patterns.instructions.md - Event sourcing and causality metadata requirements

## Implementation Checklist

### [ ] Phase 0: DomainEvent Interface Updates for actorAccountId

- [ ] Task 0.1: Add actorAccountId to DomainEventMetadata
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 11-31)

- [ ] Task 0.2: Update existing command/event interfaces to include actorAccountId in data
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 33-50)

### [ ] Phase 1: Core-Engine Module System Contracts

- [ ] Task 1.1: Create ModuleManifest interface with key and requires fields
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 52-69)

- [ ] Task 1.2: Implement ModuleRegistry class with dependency validation
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 71-91)

- [ ] Task 1.3: Create ModuleGuard utility for workspace-module boundary checks
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 93-109)

- [ ] Task 1.4: Define ModuleKey union type for type-safe module references
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 111-125)

### [ ] Phase 2: Account-Domain Workspace Module Management

- [ ] Task 2.1: Add enabledModules array to WorkspaceAggregate
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 127-145)

- [ ] Task 2.2: Create EnableModuleCommand interface with actorAccountId
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 147-164)

- [ ] Task 2.3: Create WorkspaceModuleEnabled event interface with actorAccountId
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 166-183)

- [ ] Task 2.4: Implement enableModule method in WorkspaceAggregate
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 185-208)

- [ ] Task 2.5: Update WorkspaceAggregate replay to handle WorkspaceModuleEnabled events
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 210-226)

### [ ] Phase 3: SaaS-Domain Module Manifests

- [ ] Task 3.1: Create task.manifest.ts with module declaration
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 228-244)

- [ ] Task 3.2: Create payment.manifest.ts with task dependency
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 246-263)

- [ ] Task 3.3: Create issue.manifest.ts with module declaration
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 265-281)

- [ ] Task 3.4: Export manifests from saas-domain index
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 283-297)

### [ ] Phase 4: Passive Module Initialization

- [ ] Task 4.1: Create WorkspaceModuleEnabled event handler interface
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 299-315)

- [ ] Task 4.2: Implement task module initialization handler
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 317-337)

- [ ] Task 4.3: Implement payment module initialization handler
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 339-359)

- [ ] Task 4.4: Implement issue module initialization handler
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 361-381)

### [ ] Phase 5: Integration and Validation

- [ ] Task 5.1: Update core-engine index to export module system contracts
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 383-397)

- [ ] Task 5.2: Validate ModuleRegistry dependency checking logic
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 399-416)

- [ ] Task 5.3: Ensure all events carry complete causality metadata including actorAccountId
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 418-435)

- [ ] Task 5.4: Verify modules never create Workspaces or access other module state
  - Details: .copilot-tracking/details/20260107-module-mounting-mechanism-details.md (Lines 437-454)

## Dependencies

- TypeScript 5.x with ES2022 target
- Existing core-engine DomainEvent contracts
- Existing account-domain Workspace aggregate
- Existing saas-domain module aggregates
- Event sourcing infrastructure for event replay

## Success Criteria

- **Phase 0**: DomainEventMetadata includes actorAccountId field to distinguish actor from workspace scope
- ModuleRegistry correctly validates module dependencies using manifest requires lists
- Workspace aggregate maintains enabledModules array without knowing module implementation details
- EnableModuleCommand and WorkspaceModuleEnabled events carry workspaceId, actorAccountId, and causedBy metadata
- Each module (task, payment, issue) has a manifest declaring its key and dependencies
- Modules passively initialize via WorkspaceModuleEnabled event handlers
- ModuleGuard enforces workspace-module boundary checks
- Payment module manifest correctly declares task as required dependency
- All module operations receive workspaceContext and never create Workspaces
- Event replay preserves module enablement state through WorkspaceModuleEnabled events
- No module directly accesses another module's internal state (only via manifest dependencies)
- Clear separation maintained: actorAccountId (who) vs workspaceId (where) vs causedBy (causality chain)
