# Responsibility Layer Alignment (Phase 1.5 Correction)

## Problem Statement

Current Angular Command/Query Services contain **domain orchestration logic** that should be in a framework-agnostic application layer. This creates tight coupling to Angular.

## Corrected Layer Responsibilities

### 1. Domain Layer (account-domain, saas-domain)
**Location**: `packages/account-domain/`, `packages/saas-domain/`

**Responsibilities**:
- Define aggregates and their business rules
- Define domain events
- Define value objects
- Enforce aggregate invariants

**Examples**:
- `Account.create()`: Business rule enforcement
- `Workspace.addMember()`: Invariant validation
- `Task.assignTo()`: Status validation

### 2. Application Layer (core-engine/application) ← NEW LAYER
**Location**: `packages/core-engine/application/`

**Responsibilities**:
- Define Commands (user intent)
- Define CommandHandlers (orchestration)
- Coordinate multiple aggregates
- Transaction boundaries (UnitOfWork)

**Examples**:
- `CreateWorkspaceCommand`: Data structure
- `CreateWorkspaceHandler`: Load Account → Create Workspace → Save
- `AssignTaskHandler`: Load Task → Load Membership → Validate → Assign → Save

**Key Principle**: This layer is **framework-agnostic**. Angular can be replaced with React/Vue without changing this layer.

### 3. Infrastructure Layer (platform-adapters)
**Location**: `packages/platform-adapters/`

**Responsibilities**:
- Implement Repository interfaces with Firestore SDK
- Implement EventStore with Firestore SDK
- Implement ProjectionBuilders with Firestore SDK
- Handle Firestore-specific concerns

**Examples**:
- `FirestoreWorkspaceRepository`: Actual Firestore calls
- `FirestoreEventStore`: Batch writes to events collection
- `WorkspaceProjectionBuilder`: Update projections/Workspace

### 4. UI Adapter Layer (ui-angular) ← CORRECTED ROLE
**Location**: `packages/ui-angular/src/app/core/services/`

**Responsibilities**:
- **Thin adapters** to Application Layer
- Convert Angular DI to Application dependencies
- Handle Angular-specific concerns (observables, zones)
- **NO orchestration logic**

**Examples**:
```typescript
// ✅ CORRECT: Thin adapter
@Injectable({ providedIn: 'root' })
export class WorkspaceCommandService {
  constructor(
    private createWorkspaceHandler: CreateWorkspaceHandler,
    private updateWorkspaceHandler: UpdateWorkspaceHandler
  ) {}

  async createWorkspace(params: CreateWorkspaceParams): Promise<void> {
    const command = new CreateWorkspaceCommand(params);
    const result = await this.createWorkspaceHandler.execute(command);
    if (result.isErr()) {
      // Handle error in Angular way
    }
  }
}

// ❌ WRONG: Contains orchestration (current state)
@Injectable({ providedIn: 'root' })
export class WorkspaceCommandService {
  constructor(private repository: IWorkspaceRepository) {}

  async createWorkspace(params: CreateWorkspaceParams): Promise<void> {
    // This orchestration should be in Application Layer!
    const workspace = Workspace.create(params);
    await this.repository.save(workspace);
  }
}
```

## Migration Path (NOT in Phase 1.5)

Future phases will:

1. Move orchestration from Angular Services to Application Handlers
2. Make Angular Services thin wrappers around Handlers
3. Inject Handlers (not Repositories) into Angular Services
4. Enable Angular to be swapped with any other UI framework

## Current State (Phase 1.5)

**What EXISTS**:
- ✅ Domain aggregates (skeleton)
- ✅ Infrastructure repositories (skeleton)
- ✅ Angular services (skeleton, but with wrong responsibilities)

**What is ADDED in Phase 1.5**:
- ✅ Application layer structure (`core-engine/application/`)
- ✅ README docs defining correct responsibilities
- ✅ Aggregate boundary documentation

**What is NOT CHANGED in Phase 1.5**:
- ❌ No code refactoring
- ❌ No moving logic between layers
- ❌ No implementation of handlers
- ❌ No Angular service modifications

## Verification

After Phase 1.5, verify:

- [ ] Application layer structure exists
- [ ] All READMEs clarify correct responsibilities
- [ ] Aggregate boundaries are documented
- [ ] NO code has been moved or refactored
- [ ] NO implementations have been added
- [ ] All existing skeleton code unchanged

## Phase 1.5 Compliance

This document is **STRUCTURE AND DOCUMENTATION ONLY**.
NO code changes, NO implementations, NO refactoring.
