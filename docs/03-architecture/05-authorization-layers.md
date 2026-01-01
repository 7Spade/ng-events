# Authorization Architecture - Three Layer Model

> **Authentication ≠ Authorization. Platform ≠ Domain ≠ UI.**

## Core Principle (from ✨✨.md)

> **認證在 Platform、授權在 Domain、UI 只呈現**

**三層分離，職責清晰，避免邏輯外洩**

---

## The Three Authorization Layers

```
┌─────────────────────────────────────────┐
│  UI Layer                               │
│  - Shows/hides UI elements              │
│  - *ngIf="canComplete()"                │
│  - NO authorization logic               │
├─────────────────────────────────────────┤
│  Domain Policy Layer                    │
│  - Business authorization rules         │
│  - canCompleteTask(account, task)       │
│  - Domain-specific permissions          │
├─────────────────────────────────────────┤
│  Platform Adapter Layer                 │
│  - Authentication (identity)            │
│  - Returns AuthContext                  │
│  - NO business logic                    │
└─────────────────────────────────────────┘
```

---

## Layer 1: Platform Adapter (Authentication)

### Responsibility

**Answer: "Who are you?"**

Platform adapters verify identity and produce `AuthContext`. They do **NOT** make authorization decisions.

### Example: Firebase Auth Adapter

```typescript
// Platform Adapter - Identity Verification
class FirebaseAuthAdapter {
  async authenticate(token: string): Promise<AuthContext> {
    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Look up Account from Firebase UID
    const account = await this.getAccountByFirebaseUid(decodedToken.uid);
    
    // Look up current workspace membership
    const memberships = await this.getMemberships(account.accountId);
    const currentWorkspace = this.selectCurrentWorkspace(memberships);
    
    // Return auth context (no decisions made here)
    return {
      accountId: account.accountId,
      accountType: account.type,
      workspaceId: currentWorkspace.workspaceId,
      roles: currentWorkspace.roles,  // Just data, no interpretation
      metadata: {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email
      }
    };
  }
}

// AuthContext structure
interface AuthContext {
  accountId: string;
  accountType: 'user' | 'organization' | 'bot';
  workspaceId: string;
  roles: string[];           // e.g., ['owner', 'admin']
  metadata?: {
    firebaseUid: string;
    email?: string;
  };
}
```

### What Platform Adapter DOES

- ✅ Verify authentication tokens
- ✅ Map identity provider UID → Account ID
- ✅ Fetch Account and Workspace memberships
- ✅ Return structured `AuthContext`

### What Platform Adapter DOES NOT

- ❌ Make authorization decisions
- ❌ Know about business rules (e.g., "only assignee can complete task")
- ❌ Interpret roles (that's Domain's job)

---

## Layer 2: Domain Policy (Authorization)

### Responsibility

**Answer: "What can you do?"**

Domain policy enforces business-specific authorization rules using `AuthContext` and domain state.

### Example: Task Domain Policy

```typescript
// Domain Policy - Business Authorization
function canCompleteTask(
  actor: AuthContext,
  task: Task
): boolean {
  // Business rule: Must be the assignee
  if (actor.accountId !== task.assigneeAccountId) {
    return false;
  }
  
  // Business rule: Task must be in "Doing" status
  if (task.status !== 'Doing') {
    return false;
  }
  
  return true;
}

function canDeleteTask(
  actor: AuthContext,
  task: Task
): boolean {
  // Business rule: Only workspace owner/admin can delete
  const hasAdminRole = actor.roles.includes('owner') || actor.roles.includes('admin');
  if (!hasAdminRole) {
    return false;
  }
  
  // Business rule: Can't delete completed tasks
  if (task.status === 'Completed') {
    return false;
  }
  
  return true;
}

function canViewTask(
  actor: AuthContext,
  task: Task
): boolean {
  // Business rule: Must be in the same workspace
  return actor.workspaceId === task.workspaceId;
}
```

### What Domain Policy DOES

- ✅ Enforce business rules for permissions
- ✅ Check domain state (task status, assignee, etc.)
- ✅ Interpret roles in business context
- ✅ Return boolean decisions

### What Domain Policy DOES NOT

- ❌ Verify authentication (Platform's job)
- ❌ Render UI (UI's job)
- ❌ Call external auth providers

---

## Layer 3: UI (Presentation)

### Responsibility

**Answer: "Show or hide?"**

UI layer calls Domain Policy to decide what to render. It does **NOT** duplicate authorization logic.

### Example: Angular Task Component

```typescript
@Component({
  selector: 'app-task-detail',
  template: `
    <div class="task-card">
      <h2>{{ task.title }}</h2>
      <p>Status: {{ task.status }}</p>
      
      <!-- UI calls Domain Policy -->
      @if (canComplete()) {
        <button (click)="completeTask()">Complete Task</button>
      }
      
      @if (canDelete()) {
        <button (click)="deleteTask()" class="danger">Delete Task</button>
      }
    </div>
  `
})
export class TaskDetailComponent {
  @Input() task!: Task;
  
  // Inject auth context and domain policy
  constructor(
    private authService: AuthContextService,
    private taskPolicy: TaskPolicyService
  ) {}
  
  // UI delegates to Domain Policy
  canComplete(): boolean {
    const authContext = this.authService.getCurrentContext();
    return this.taskPolicy.canCompleteTask(authContext, this.task);
  }
  
  canDelete(): boolean {
    const authContext = this.authService.getCurrentContext();
    return this.taskPolicy.canDeleteTask(authContext, this.task);
  }
  
  // Commands are separate
  completeTask(): void {
    this.taskCommand.completeTask({
      taskId: this.task.id,
      actorAccountId: this.authService.getCurrentAccountId(),
      workspaceId: this.authService.getCurrentWorkspaceId()
    });
  }
}
```

### What UI DOES

- ✅ Call Domain Policy to check permissions
- ✅ Show/hide elements based on policy results
- ✅ Provide user-friendly error messages

### What UI DOES NOT

- ❌ Duplicate authorization logic (e.g., `if (user.id === task.assignee)`)
- ❌ Verify authentication tokens
- ❌ Make business rule decisions

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: UI with Authorization Logic

```typescript
// BAD: Business logic in UI
@Component({
  template: `
    @if (currentUser.id === task.assigneeId && task.status === 'Doing') {
      <button>Complete</button>
    }
  `
})
export class BadComponent {
  // ❌ Duplicating domain rules in UI
}
```

**Problems**:
- Business rules scattered across UI components
- Hard to test
- Easy to get out of sync
- Violates Single Responsibility Principle

**Fix**: Call Domain Policy instead.

### ❌ Anti-Pattern 2: Platform Making Business Decisions

```typescript
// BAD: Platform adapter making authorization decisions
class BadFirebaseAdapter {
  async authenticate(token: string): Promise<AuthResult> {
    const context = await this.verifyToken(token);
    
    // ❌ Don't do this! This is business logic.
    if (context.roles.includes('admin')) {
      context.canDeleteTasks = true;
    }
    
    return context;
  }
}
```

**Problems**:
- Platform doesn't know business rules
- Couples infrastructure to domain
- Rules can't evolve independently

**Fix**: Platform only returns `AuthContext`, Domain interprets it.

### ❌ Anti-Pattern 3: Domain Calling Platform Services

```typescript
// BAD: Domain calling Firebase directly
function canCompleteTask(taskId: string, userId: string): boolean {
  // ❌ Domain shouldn't call Firebase Auth
  const user = await admin.auth().getUser(userId);
  
  if (!user.emailVerified) {
    return false;
  }
  
  // ...
}
```

**Problems**:
- Domain coupled to infrastructure
- Hard to test
- Can't swap auth providers

**Fix**: Accept `AuthContext` as parameter, let Platform produce it.

---

## Flow Diagram: Complete Request Lifecycle

```
1. User clicks "Complete Task" button
   ↓
2. UI Component
   ├─ Calls canComplete() 
   │  └─ Domain Policy checks rules
   │     └─ Returns: true
   ├─ User sees enabled button
   ↓
3. User clicks button
   ↓
4. UI Component
   ├─ Gets AuthContext from AuthService
   ├─ Builds CompleteTaskCommand
   │  { taskId, actorAccountId, workspaceId }
   ↓
5. Command Handler (Application Layer)
   ├─ Loads events for task aggregate
   ├─ Calls Decision Function
   │  └─ decideCompleteTask(command, events)
   │     ├─ Reconstructs task state
   │     ├─ Checks: task.status === 'Doing'
   │     ├─ Checks: command.actorAccountId === task.assigneeAccountId
   │     └─ Returns: Approved([TaskCompletedEvent])
   ↓
6. Event Store
   ├─ Appends TaskCompletedEvent
   ├─ Publishes to subscribers
   ↓
7. Projection Updates
   ├─ Task list updates status to "Done"
   ↓
8. UI Updates (via Signal/Observable)
   ├─ Button becomes disabled
   ├─ Task card shows "Done" status
```

**Key: Each layer has a clear responsibility**

---

## Testing Authorization Layers

### Testing Platform Adapter

```typescript
describe('FirebaseAuthAdapter', () => {
  it('should return AuthContext with correct accountId', async () => {
    const adapter = new FirebaseAuthAdapter();
    const token = 'valid-firebase-token';
    
    const context = await adapter.authenticate(token);
    
    expect(context.accountId).toBe('acc-user-123');
    expect(context.workspaceId).toBe('ws-456');
    expect(context.roles).toContain('member');
  });
  
  it('should throw error for invalid token', async () => {
    const adapter = new FirebaseAuthAdapter();
    const token = 'invalid-token';
    
    await expect(adapter.authenticate(token)).rejects.toThrow();
  });
});
```

### Testing Domain Policy

```typescript
describe('TaskPolicy.canCompleteTask', () => {
  it('should allow assignee to complete Doing task', () => {
    const authContext: AuthContext = {
      accountId: 'acc-user-123',
      accountType: 'user',
      workspaceId: 'ws-456',
      roles: ['member']
    };
    
    const task: Task = {
      id: 'task-789',
      status: 'Doing',
      assigneeAccountId: 'acc-user-123',
      workspaceId: 'ws-456'
    };
    
    const result = canCompleteTask(authContext, task);
    
    expect(result).toBe(true);
  });
  
  it('should reject non-assignee from completing task', () => {
    const authContext: AuthContext = {
      accountId: 'acc-user-999',  // Different account
      accountType: 'user',
      workspaceId: 'ws-456',
      roles: ['member']
    };
    
    const task: Task = {
      id: 'task-789',
      status: 'Doing',
      assigneeAccountId: 'acc-user-123',
      workspaceId: 'ws-456'
    };
    
    const result = canCompleteTask(authContext, task);
    
    expect(result).toBe(false);
  });
});
```

### Testing UI

```typescript
describe('TaskDetailComponent', () => {
  it('should show Complete button when policy allows', () => {
    const component = createComponent();
    const policyService = TestBed.inject(TaskPolicyService);
    
    spyOn(policyService, 'canCompleteTask').and.returnValue(true);
    
    component.task = mockTask;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('.complete-btn');
    expect(button).toBeTruthy();
  });
  
  it('should hide Complete button when policy denies', () => {
    const component = createComponent();
    const policyService = TestBed.inject(TaskPolicyService);
    
    spyOn(policyService, 'canCompleteTask').and.returnValue(false);
    
    component.task = mockTask;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('.complete-btn');
    expect(button).toBeFalsy();
  });
});
```

---

## Benefits of Three-Layer Authorization

### 1. **Single Responsibility**
- Platform: Identity verification
- Domain: Business rules
- UI: Presentation

### 2. **Testability**
- Each layer tested in isolation
- Domain policy tested without UI or Firebase
- UI tested with mocked policy

### 3. **Maintainability**
- Business rules centralized in Domain
- Changes to auth provider only affect Platform
- UI changes don't require retesting authorization

### 4. **Security**
- Authorization enforced in Domain (server-side safe)
- UI can't bypass policy
- Platform can't leak business logic

### 5. **Flexibility**
- Swap Firebase for Auth0 without touching Domain
- Add new UI frameworks without changing rules
- Evolve business rules without touching Platform

---

## Common Questions

### Q: Can UI cache policy results?

**A**: Yes, but with caution.
```typescript
// Cache for current render cycle only
canComplete = computed(() => {
  const context = this.authService.context();
  const task = this.task();
  return this.taskPolicy.canCompleteTask(context, task);
});
```

Don't cache across tasks or time periods—state may change.

### Q: What if authorization needs external data?

**A**: Domain Policy can call repositories.
```typescript
async function canApproveTask(
  actor: AuthContext,
  task: Task
): Promise<boolean> {
  // Load approver list from repository
  const approvers = await this.approverRepo.getForTask(task.id);
  return approvers.includes(actor.accountId);
}
```

### Q: Should Platform cache roles?

**A**: Yes, for performance.
```typescript
// Cache roles in AuthContext for short periods (e.g., 5 minutes)
const authContext = {
  accountId: 'acc-123',
  workspaceId: 'ws-456',
  roles: ['member'],  // Cached from last DB lookup
  rolesCachedAt: Date.now()
};
```

But refresh on critical operations or when cache expires.

---

## See Also

- [Account Model](../04-core-model/05-account-model.md) - Business actor definition
- [Workspace Model](../04-core-model/06-workspace-model.md) - Scope boundaries
- [Platform Architecture](../dev/consolidated/17-平台層SaaS架構.md) - Platform layer design

---

**Version**: 1.0  
**Last Updated**: 2026-01-01  
**Source**: ✨✨.md (認證 vs 授權分層)
