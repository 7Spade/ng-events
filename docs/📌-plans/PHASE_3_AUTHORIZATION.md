# Phase 3: Authorization & Multi-Workspace Security

**Status**: 📋 Planned  
**Date**: 2026-01-03  
**Total Complexity**: ★★★★☆ (17/25 points)  
**Estimated Duration**: 12-16 hours

## Executive Summary

Phase 3 implements **authorization, multi-workspace isolation, and security** across the platform. This phase introduces the Membership aggregate, role-based permissions, query-level security, and command guards to ensure proper access control.

### Key Objectives

1. **Membership Aggregate**: Implement User ↔ Workspace relationships with roles
2. **Role-Based Permissions**: Define granular permissions per workspace role
3. **Query Security**: Enforce row-level security in projections
4. **Command Guards**: Validate permissions before aggregate operations
5. **Multi-Workspace Isolation**: Ensure complete data separation between workspaces

### Phase 3 Sub-Phases

| Phase | Focus | Complexity | Status |
|-------|-------|-----------|---------|
| **3A** | Membership Aggregate & Vertical Slice | ★★★★☆ (4/5) | 📋 Planned |
| **3B** | Query Security & Firestore Rules | ★★★★☆ (4/5) | 📋 Planned |
| **3C** | Permission-Aware Command Guard | ★★★☆☆ (3/5) | 📋 Planned |
| **3D** | Multi-Workspace Context & Switching | ★★★☆☆ (3/5) | 📋 Planned |

**Total**: 14/20 complexity points, 4 phases

---

## Why Phase 3 Now?

**Phase 1-2 Foundation Complete** ✅:
- Single aggregate (Workspace) operational
- Cross-aggregate processes working
- Event versioning and projection rebuild

**Phase 3 Requirements** 🎯:
- Real SaaS needs multi-tenant access control
- Users belong to multiple workspaces with different roles
- Queries must filter by workspace + user permissions
- Commands must validate permissions before execution
- Security must be enforced at multiple layers

**Business Value**:
```
Without Phase 3:
❌ No access control (anyone can read/write anything)
❌ No workspace isolation (data leaks between tenants)
❌ No role differentiation (admin = member = viewer)
❌ Compliance violations (GDPR, SOC 2)

With Phase 3:
✅ Role-based access control (Owner, Admin, Member, Viewer)
✅ Complete workspace isolation (multi-tenant security)
✅ Granular permissions (read/write/delete per resource)
✅ Audit-ready authorization (who did what, when, why)
```

---

## Phase 3A: Membership Aggregate & Vertical Slice 📋 PLANNED

**Complexity**: ★★★★☆ (4/5)  
**Duration**: 4-6 hours  
**Status**: 📋 Planned

### Objectives

1. **Membership Aggregate**
   - Represent User ↔ Workspace relationship
   - Store role (Owner, Admin, Member, Viewer)
   - Track invitation/acceptance flow
   - Handle role changes and removal

2. **Membership Events**
   - `MembershipCreated`
   - `MembershipRoleChanged`
   - `MembershipRemoved`
   - `InvitationSent`
   - `InvitationAccepted`

3. **Membership Vertical Slice**
   - Domain layer (aggregate, events)
   - Infrastructure layer (repository, projection)
   - Application layer (commands, queries)
   - UI layer (Angular components)

### Membership Aggregate Structure

```typescript
export class Membership extends AggregateRoot {
  private membershipId: MembershipId;
  private workspaceId: WorkspaceId;
  private accountId: AccountId;
  private role: WorkspaceRole;  // Owner | Admin | Member | Viewer
  private status: MembershipStatus;  // Active | Invited | Removed
  private invitedBy?: AccountId;
  private invitedAt?: Date;
  private joinedAt?: Date;
  private removedAt?: Date;
  
  static create(params: {
    workspaceId: WorkspaceId;
    accountId: AccountId;
    role: WorkspaceRole;
    invitedBy: AccountId;
  }): Membership {
    // Create membership (initially Invited status)
    // Raise MembershipCreatedEvent
  }
  
  acceptInvitation(): void {
    // Change status from Invited → Active
    // Raise InvitationAcceptedEvent
  }
  
  changeRole(newRole: WorkspaceRole): void {
    // Update role
    // Raise MembershipRoleChangedEvent
  }
  
  remove(): void {
    // Change status to Removed
    // Raise MembershipRemovedEvent
  }
}
```

### Membership Projection Schema

```typescript
interface MembershipProjection {
  id: string;
  workspaceId: string;
  accountId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'removed';
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  removedAt?: string;
  version: number;
  lastUpdated: string;
}

// Firestore path: projections/membership/{membershipId}
```

### Membership Queries

```typescript
// Query service methods
class MembershipQueryService {
  async getMembershipsByWorkspace(workspaceId: string): Promise<MembershipProjection[]> {
    // Query: projections/membership where workspaceId = ?
  }
  
  async getMembershipsByAccount(accountId: string): Promise<MembershipProjection[]> {
    // Query: projections/membership where accountId = ?
  }
  
  async getUserRole(workspaceId: string, accountId: string): Promise<WorkspaceRole | null> {
    // Query single membership, return role
  }
}
```

### Deliverables

**Files to Create**:
```
packages/
├── account-domain/
│   └── membership/
│       ├── aggregates/
│       │   ├── Membership.ts
│       │   └── Membership.spec.ts
│       ├── events/
│       │   ├── MembershipCreated.ts
│       │   ├── MembershipRoleChanged.ts
│       │   ├── MembershipRemoved.ts
│       │   ├── InvitationAccepted.ts
│       │   └── (tests for each)
│       └── value-objects/
│           ├── MembershipId.ts
│           └── WorkspaceRole.ts
├── platform-adapters/
│   └── membership/
│       ├── FirestoreMembershipRepository.ts
│       └── MembershipProjectionBuilder.ts
└── ui-angular/
    └── src/app/
        └── membership/
            ├── membership-list.component.ts
            ├── membership-invite.component.ts
            └── membership-role-change.component.ts
```

### Success Criteria

- [ ] Membership aggregate implements invitation flow
- [ ] Membership events support causality chain
- [ ] Membership repository persists via EventStore
- [ ] Membership projection builder updates read model
- [ ] Angular UI displays workspace members
- [ ] Angular UI sends invitations
- [ ] Angular UI changes member roles
- [ ] E2E test: invite user → accept → change role → remove

**Details**: See [`PHASE_3A_MEMBERSHIP.md`](./PHASE_3A_MEMBERSHIP.md)

---

## Phase 3B: Query Security & Firestore Rules 📋 PLANNED

**Complexity**: ★★★★☆ (4/5)  
**Duration**: 4-5 hours  
**Status**: 📋 Planned

### Objectives

1. **Query-Level Security**
   - Enforce workspace isolation in queries
   - Filter results by user's memberships
   - Implement role-based query restrictions

2. **Firestore Security Rules**
   - Row-level security in projections
   - Validate user has membership before read
   - Validate permissions before write

3. **Security Context**
   - Current user context (accountId)
   - Active workspace context (workspaceId)
   - User roles in current workspace

### Query Security Pattern

```typescript
// BAD: No security check
async getTasks(workspaceId: string): Promise<Task[]> {
  return query(
    collection(this.firestore, 'projections/task'),
    where('workspaceId', '==', workspaceId)
  );
}

// GOOD: Verify user membership
async getTasks(workspaceId: string, userId: string): Promise<Task[]> {
  // 1. Check user has membership in workspace
  const membership = await this.membershipQuery.getUserRole(workspaceId, userId);
  if (!membership) {
    throw new UnauthorizedError('User not member of workspace');
  }
  
  // 2. Query tasks (already filtered by workspaceId)
  return query(
    collection(this.firestore, 'projections/task'),
    where('workspaceId', '==', workspaceId)
  );
}
```

### Firestore Security Rules

**Location**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper: Check if user is member of workspace
    function isMemberOfWorkspace(workspaceId) {
      return exists(/databases/$(database)/documents/projections/membership/$(request.auth.uid + '_' + workspaceId))
        && get(/databases/$(database)/documents/projections/membership/$(request.auth.uid + '_' + workspaceId)).data.status == 'active';
    }
    
    // Helper: Check user role
    function getUserRole(workspaceId) {
      return get(/databases/$(database)/documents/projections/membership/$(request.auth.uid + '_' + workspaceId)).data.role;
    }
    
    // Workspace projections: Read if member, Write if admin/owner
    match /projections/workspace/{workspaceId} {
      allow read: if isMemberOfWorkspace(workspaceId);
      allow write: if isMemberOfWorkspace(workspaceId) 
                   && getUserRole(workspaceId) in ['owner', 'admin'];
    }
    
    // Task projections: Read if member, Write if member+ (not viewer)
    match /projections/task/{taskId} {
      allow read: if isMemberOfWorkspace(resource.data.workspaceId);
      allow write: if isMemberOfWorkspace(resource.data.workspaceId)
                   && getUserRole(resource.data.workspaceId) in ['owner', 'admin', 'member'];
    }
    
    // Membership projections: Read own membership, Write if admin/owner
    match /projections/membership/{membershipId} {
      allow read: if request.auth.uid == resource.data.accountId
                  || isMemberOfWorkspace(resource.data.workspaceId);
      allow write: if isMemberOfWorkspace(resource.data.workspaceId)
                   && getUserRole(resource.data.workspaceId) in ['owner', 'admin'];
    }
  }
}
```

### Deliverables

**Files to Create**:
```
├── firestore.rules                     (updated with security rules)
├── packages/core-engine/security/
│   ├── SecurityContext.ts              (user + workspace context)
│   ├── PermissionChecker.ts            (role validation)
│   └── UnauthorizedError.ts            (custom error)
└── packages/platform-adapters/queries/
    ├── SecureWorkspaceQuery.ts         (query with membership check)
    ├── SecureTaskQuery.ts              (query with membership check)
    └── SecureMembershipQuery.ts        (query with membership check)
```

### Success Criteria

- [ ] Firestore rules enforce workspace isolation
- [ ] Queries validate user membership before returning data
- [ ] Role-based query restrictions implemented
- [ ] Security context available in all layers
- [ ] Unauthorized access throws clear error
- [ ] E2E test: user without membership cannot read workspace

**Details**: See [`PHASE_3B_QUERY_SECURITY.md`](./PHASE_3B_QUERY_SECURITY.md)

---

## Phase 3C: Permission-Aware Command Guard 📋 PLANNED

**Complexity**: ★★★☆☆ (3/5)  
**Duration**: 3-4 hours  
**Status**: 📋 Planned

### Objectives

1. **Command Guard Pattern**
   - Validate permissions before command execution
   - Check user role in workspace
   - Enforce permission policies

2. **Permission Policies**
   - Define required permissions per command
   - Owner: full control
   - Admin: manage members, settings
   - Member: create/edit tasks
   - Viewer: read-only access

3. **Guard Integration**
   - Wrap command handlers with guard
   - Inject security context
   - Fail fast on unauthorized commands

### Command Guard Pattern

```typescript
/**
 * Permission guard decorator for command handlers.
 */
export function RequirePermission(
  requiredRole: WorkspaceRole | WorkspaceRole[]
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Extract command and security context
      const command = args[0];
      const securityContext = this.securityContext;
      
      // Check user role in workspace
      const userRole = await securityContext.getUserRole(
        command.workspaceId,
        securityContext.currentUserId
      );
      
      // Validate permission
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowedRoles.includes(userRole)) {
        throw new UnauthorizedError(
          `User role ${userRole} does not have permission for ${propertyKey}`
        );
      }
      
      // Execute command
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// Usage example
export class CreateTaskHandler {
  constructor(private securityContext: SecurityContext) {}
  
  @RequirePermission(['owner', 'admin', 'member'])
  async execute(command: CreateTaskCommand): Promise<void> {
    // Command execution logic
    // Permission already validated by guard
  }
}
```

### Permission Matrix

| Command | Owner | Admin | Member | Viewer |
|---------|-------|-------|--------|--------|
| **Workspace** |
| Create Workspace | ✅ | ❌ | ❌ | ❌ |
| Archive Workspace | ✅ | ❌ | ❌ | ❌ |
| **Membership** |
| Invite Member | ✅ | ✅ | ❌ | ❌ |
| Change Role | ✅ | ✅ | ❌ | ❌ |
| Remove Member | ✅ | ✅ | ❌ | ❌ |
| **Task** |
| Create Task | ✅ | ✅ | ✅ | ❌ |
| Edit Task | ✅ | ✅ | ✅ | ❌ |
| Delete Task | ✅ | ✅ | ✅ | ❌ |
| View Task | ✅ | ✅ | ✅ | ✅ |
| **Payment** |
| Process Payment | ✅ | ✅ | ❌ | ❌ |
| View Payment | ✅ | ✅ | ✅ | ❌ |

### Deliverables

**Files to Create**:
```
packages/core-engine/security/
├── PermissionGuard.ts              (decorator pattern)
├── PermissionPolicy.ts             (permission matrix)
└── SecurityContext.ts              (current user + workspace)

packages/ui-angular/src/app/core/guards/
├── workspace-permission.guard.ts   (Angular route guard)
└── command-permission.guard.ts     (Angular HTTP interceptor)
```

### Success Criteria

- [ ] Permission guard validates user role before command execution
- [ ] Permission policies defined for all commands
- [ ] Unauthorized commands throw clear error
- [ ] Angular route guard prevents unauthorized navigation
- [ ] E2E test: viewer cannot create task (permission denied)

**Details**: See [`PHASE_3C_PERMISSION_GUARD.md`](./PHASE_3C_PERMISSION_GUARD.md)

---

## Phase 3D: Multi-Workspace Context & Switching 📋 PLANNED

**Complexity**: ★★★☆☆ (3/5)  
**Duration**: 2-3 hours  
**Status**: 📋 Planned

### Objectives

1. **Workspace Context Management**
   - Track active workspace per user
   - Switch workspace context
   - Persist workspace preference

2. **UI Workspace Selector**
   - Dropdown to select workspace
   - Display current workspace
   - Reload data on workspace change

3. **Context Propagation**
   - Inject workspace context into all queries/commands
   - Filter data by active workspace
   - Enforce workspace boundary

### Workspace Context Pattern

```typescript
/**
 * Workspace context service.
 * Manages active workspace for current user.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceContextService {
  private activeWorkspaceId$ = new BehaviorSubject<string | null>(null);
  
  getActiveWorkspace(): Observable<string | null> {
    return this.activeWorkspaceId$.asObservable();
  }
  
  async setActiveWorkspace(workspaceId: string): Promise<void> {
    // Verify user has membership
    const membership = await this.membershipQuery.getUserRole(
      workspaceId,
      this.authService.currentUserId
    );
    
    if (!membership) {
      throw new Error('User not member of workspace');
    }
    
    // Update active workspace
    this.activeWorkspaceId$.next(workspaceId);
    
    // Persist preference
    await this.persistWorkspacePreference(workspaceId);
    
    // Reload data for new workspace
    this.reloadData();
  }
}
```

### Deliverables

**Files to Create**:
```
packages/ui-angular/src/app/core/services/
├── workspace-context.service.ts    (context management)
└── workspace-selector.component.ts (UI component)

packages/ui-angular/src/app/core/interceptors/
└── workspace-context.interceptor.ts (inject workspaceId into HTTP requests)
```

### Success Criteria

- [ ] Workspace context persisted per user
- [ ] UI workspace selector displays user's workspaces
- [ ] Switching workspace reloads data
- [ ] All queries/commands use active workspace context
- [ ] E2E test: switch workspace → data updates correctly

**Details**: See [`PHASE_3D_WORKSPACE_CONTEXT.md`](./PHASE_3D_WORKSPACE_CONTEXT.md)

---

## Phase 3 Architecture Overview

### Authorization Flow

```
User Action (Command)
    ↓
Command Guard (RequirePermission decorator)
    ↓
Check User Role in Workspace
    ↓
    If authorized → Execute Command
    If not → Throw UnauthorizedError
    ↓
Aggregate applies business logic
    ↓
Event raised (with causality + security metadata)
```

### Multi-Workspace Isolation

```
User logs in
    ↓
Load user's memberships
    ↓
Display workspace selector
    ↓
User selects workspace
    ↓
Set active workspace context
    ↓
All queries filtered by workspaceId
All commands validated with workspaceId
    ↓
Data isolated per workspace
```

---

## Phase 3 Success Criteria

### Overall Phase 3 Completion

- [ ] All 4 sub-phases (3A-3D) complete
- [ ] Membership aggregate fully operational
- [ ] Query security enforced at Firestore level
- [ ] Command guards validate permissions
- [ ] Multi-workspace context working
- [ ] 200+ total validation checks pass at 100%
- [ ] E2E test suite covers authorization scenarios
- [ ] Security audit passes (no privilege escalation)

---

## Next Steps - Phase 4

**Phase 4: Platform Operability**

**Objectives**:
1. Monitoring and health checks
2. Error taxonomy and handling
3. Migration scripts and tools
4. Deployment automation

**Estimated Effort**: 10-14 hours

---

## References

- [Phase 2 Overview](./PHASE_2_CROSS_AGGREGATE.md)
- [Phase 3A: Membership (Details)](./PHASE_3A_MEMBERSHIP.md)
- [Phase 3B: Query Security (Details)](./PHASE_3B_QUERY_SECURITY.md)
- [Phase 3C: Permission Guard (Details)](./PHASE_3C_PERMISSION_GUARD.md)
- [Phase 3D: Workspace Context (Details)](./PHASE_3D_WORKSPACE_CONTEXT.md)
- [Phase 4: Platform (Next)](./PHASE_4_PLATFORM.md)

---

**Phase 3 Status**: 📋 Planned - Ready After Phase 2  
**Next**: Phase 3A - Membership Aggregate Implementation

// END OF FILE
