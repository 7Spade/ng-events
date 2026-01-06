---
applyTo: ".copilot-tracking/changes/20260106-ng-events-architecture-changes.md"
---

<!-- markdownlint-disable-file -->

# Task Checklist: ng-events architecture alignment

## Overview

Plan the implementation of the ng-events architecture skeleton, multi-tenant metadata, and auth pipeline based on validated research.

## Objectives

- Define core event/causality contracts with tenant metadata for all domains
- Scaffold domain, adapter, and UI layers to route auth/ACL through DA_SERVICE_TOKEN with blueprintId propagation

## Research Summary

### Project Files

- .copilot-tracking/research/20260106-ng-events-architecture-research.md - validated architecture guidance, package skeletons, auth chain, and tenant metadata requirements

### External References

- #file:../research/20260106-ng-events-architecture-research.md - primary source for architecture and tasks
- #fetch:https://angular.dev/guide/standalone-components - aligns with ui-angular standalone component guidance

### Standards References

- #file:../../.github/instructions/auth-flow.instructions.yml - enforced auth pipeline and DA_SERVICE_TOKEN usage
- #file:../../.github/instructions/account-domain.instructions.yml - domain isolation and export rules
- #file:../../.github/instructions/angular.instructions.md - Angular standalone and signals conventions

## Implementation Checklist

### [x] Phase 1: Core contracts and domain scaffolding

- [x] Task 1.1: Extend core-engine event and causality contracts

  - Details: .copilot-tracking/details/20260106-ng-events-architecture-details.md (Lines 11-25)

- [x] Task 1.2: Scaffold account-domain and saas-domain aggregates and commands
  - Details: .copilot-tracking/details/20260106-ng-events-architecture-details.md (Lines 27-48)

### [x] Phase 2: Adapter and UI auth pipeline alignment

- [x] Task 2.1: Build platform-adapters facades and align UI auth/ACL flow
  - Details: .copilot-tracking/details/20260106-ng-events-architecture-details.md (Lines 52-67)

## Dependencies

- @angular/fire/auth, @delon/auth, DA_SERVICE_TOKEN, @delon/acl available
- Core-engine and domain package directories present in monorepo

## Success Criteria

- Event/causality contracts include blueprintId and are exported
- Domain skeletons compile and expose commands/events without SDK leakage
- Adapter and UI layers route auth and ACL through DA_SERVICE_TOKEN with tenant metadata enforced
