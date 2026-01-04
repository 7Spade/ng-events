# Phase 3C: Permission-Aware Command Guard

## 📋 Overview

### Objectives
實作權限感知的 Command Guard，在命令執行前驗證使用者權限，確保所有寫入操作都經過授權檢查。

**核心目標：**
1. Command-level permission validation
2. Aggregate-aware authorization
3. Role-based access control integration
4. Audit trail for authorization failures

### Success Criteria
- [ ] PermissionGuard interface 完整定義
- [ ] WorkspacePermissionGuard 實作完成
- [ ] 4+ aggregate guards 實作
- [ ] Authorization context 完整
- [ ] 35+ test cases (unit + integration)
- [ ] Validation script with 25+ checks
- [ ] All checks pass at 100%

### Complexity Estimate
- **Total**: 8/10
- **Domain Logic**: 3/10 (permission rules)
- **Infrastructure**: 3/10 (guard pipeline)
- **Testing**: 2/10 (authorization scenarios)

### Dependencies
- **Requires**: Phase 3A (Membership aggregate), Phase 3B (Query security)
- **Blocks**: Phase 4A (Monitoring with auth events)

---

## 🎯 Phase 3C Implementation

### Step 1: PermissionGuard Interface

```typescript
// packages/core-engine/authorization/PermissionGuard.ts

export interface AuthorizationContext {
  userId: string;
  workspaceId: string;
  roles: WorkspaceRole[];
  memberships: MembershipProjection[];
  timestamp: Date;
}

export interface PermissionGuard<TCommand> {
  /**
   * Check if user has permission to execute command
   * @throws UnauthorizedError if permission denied
   */
  checkPermission(
    command: TCommand,
    context: AuthorizationContext
  ): Promise<void>;

  /**
   * Get required role for this command
   */
  getRequiredRole(): WorkspaceRole;

  /**
   * Get command name for audit logging
   */
  getCommandName(): string;
}

export class UnauthorizedError extends Error {
  constructor(
    public readonly userId: string,
    public readonly commandName: string,
    public readonly requiredRole: WorkspaceRole,
    public readonly actualRoles: WorkspaceRole[]
  ) {
    super(
      `User ${userId} lacks required role ${requiredRole} for ${commandName}. ` +
      `Current roles: ${actualRoles.join(', ')}`
    );
    this.name = 'UnauthorizedError';
  }
}
```

**Pattern**: Command guards implement domain-specific authorization logic.

### Step 2: BasePermissionGuard

```typescript
// packages/core-engine/authorization/BasePermissionGuard.ts

export abstract class BasePermissionGuard<TCommand> 
  implements PermissionGuard<TCommand> {
  
  protected abstract commandName: string;
  protected abstract requiredRole: WorkspaceRole;

  async checkPermission(
    command: TCommand,
    context: AuthorizationContext
  ): Promise<void> {
    // 1. Validate context
    this.validateContext(context);

    // 2. Check workspace membership
    const membership = this.findMembership(context);
    if (!membership) {
      throw new UnauthorizedError(
        context.userId,
        this.commandName,
        this.requiredRole,
        []
      );
    }

    // 3. Check role hierarchy
    if (!this.hasRequiredRole(membership.role, this.requiredRole)) {
      throw new UnauthorizedError(
        context.userId,
        this.commandName,
        this.requiredRole,
        [membership.role]
      );
    }

    // 4. Additional command-specific checks
    await this.checkCommandSpecificRules(command, context, membership);
  }

  protected validateContext(context: AuthorizationContext): void {
    if (!context.userId) {
      throw new Error('AuthorizationContext.userId is required');
    }
    if (!context.workspaceId) {
      throw new Error('AuthorizationContext.workspaceId is required');
    }
  }

  protected findMembership(
    context: AuthorizationContext
  ): MembershipProjection | undefined {
    return context.memberships.find(
      m => m.workspaceId === context.workspaceId && m.userId === context.userId
    );
  }

  protected hasRequiredRole(
    userRole: WorkspaceRole,
    requiredRole: WorkspaceRole
  ): boolean {
    const hierarchy: Record<WorkspaceRole, number> = {
      Owner: 4,
      Admin: 3,
      Member: 2,
      Viewer: 1,
    };
    return hierarchy[userRole] >= hierarchy[requiredRole];
  }

  protected async checkCommandSpecificRules(
    command: TCommand,
    context: AuthorizationContext,
    membership: MembershipProjection
  ): Promise<void> {
    // Override in subclasses for additional checks
  }

  getCommandName(): string {
    return this.commandName;
  }

  getRequiredRole(): WorkspaceRole {
    return this.requiredRole;
  }
}
```

**Key Features**:
- Role hierarchy validation
- Workspace membership check
- Extensible for command-specific rules

### Step 3: WorkspacePermissionGuard

```typescript
// packages/account-domain/workspace/guards/WorkspacePermissionGuard.ts

export interface CreateWorkspaceCommand {
  name: string;
  ownerId: string;
}

export class CreateWorkspaceGuard 
  extends BasePermissionGuard<CreateWorkspaceCommand> {
  
  protected commandName = 'workspace.create';
  protected requiredRole = 'Owner' as WorkspaceRole;

  protected async checkCommandSpecificRules(
    command: CreateWorkspaceCommand,
    context: AuthorizationContext
  ): Promise<void> {
    // Owner can always create workspace
    // No additional checks needed
  }
}

export interface ArchiveWorkspaceCommand {
  workspaceId: string;
  archivedBy: string;
}

export class ArchiveWorkspaceGuard 
  extends BasePermissionGuard<ArchiveWorkspaceCommand> {
  
  protected commandName = 'workspace.archive';
  protected requiredRole = 'Owner' as WorkspaceRole;

  protected async checkCommandSpecificRules(
    command: ArchiveWorkspaceCommand,
    context: AuthorizationContext
  ): Promise<void> {
    // Only owner of the workspace can archive
    if (command.archivedBy !== context.userId) {
      throw new UnauthorizedError(
        context.userId,
        this.commandName,
        this.requiredRole,
        []
      );
    }
  }
}

export interface RenameWorkspaceCommand {
  workspaceId: string;
  newName: string;
}

export class RenameWorkspaceGuard 
  extends BasePermissionGuard<RenameWorkspaceCommand> {
  
  protected commandName = 'workspace.rename';
  protected requiredRole = 'Admin' as WorkspaceRole;
}
```

**Pattern**: Each command has dedicated guard with specific role requirements.

### Step 4: Task Guards

```typescript
// packages/saas-domain/task/guards/TaskPermissionGuard.ts

export interface CreateTaskCommand {
  workspaceId: string;
  title: string;
  assignedTo?: string;
}

export class CreateTaskGuard 
  extends BasePermissionGuard<CreateTaskCommand> {
  
  protected commandName = 'task.create';
  protected requiredRole = 'Member' as WorkspaceRole;
}

export interface AssignTaskCommand {
  taskId: string;
  workspaceId: string;
  assignedTo: string;
}

export class AssignTaskGuard 
  extends BasePermissionGuard<AssignTaskCommand> {
  
  protected commandName = 'task.assign';
  protected requiredRole = 'Member' as WorkspaceRole;
}

export interface CompleteTaskCommand {
  taskId: string;
  workspaceId: string;
}

export class CompleteTaskGuard 
  extends BasePermissionGuard<CompleteTaskCommand> {
  
  protected commandName = 'task.complete';
  protected requiredRole = 'Member' as WorkspaceRole;
}

export interface DeleteTaskCommand {
  taskId: string;
  workspaceId: string;
}

export class DeleteTaskGuard 
  extends BasePermissionGuard<DeleteTaskCommand> {
  
  protected commandName = 'task.delete';
  protected requiredRole = 'Admin' as WorkspaceRole;
}
```

### Step 5: Payment Guards

```typescript
// packages/saas-domain/payment/guards/PaymentPermissionGuard.ts

export interface CreatePaymentCommand {
  workspaceId: string;
  amount: number;
  currency: string;
}

export class CreatePaymentGuard 
  extends BasePermissionGuard<CreatePaymentCommand> {
  
  protected commandName = 'payment.create';
  protected requiredRole = 'Owner' as WorkspaceRole;

  protected async checkCommandSpecificRules(
    command: CreatePaymentCommand,
    context: AuthorizationContext
  ): Promise<void> {
    // Validate amount
    if (command.amount <= 0) {
      throw new Error('Payment amount must be positive');
    }

    // Only owner can create payments
    const membership = this.findMembership(context);
    if (membership?.role !== 'Owner') {
      throw new UnauthorizedError(
        context.userId,
        this.commandName,
        this.requiredRole,
        membership ? [membership.role] : []
      );
    }
  }
}

export interface RefundPaymentCommand {
  paymentId: string;
  workspaceId: string;
  reason: string;
}

export class RefundPaymentGuard 
  extends BasePermissionGuard<RefundPaymentCommand> {
  
  protected commandName = 'payment.refund';
  protected requiredRole = 'Owner' as WorkspaceRole;
}
```

### Step 6: Issue Guards

```typescript
// packages/saas-domain/issue/guards/IssuePermissionGuard.ts

export interface CreateIssueCommand {
  workspaceId: string;
  title: string;
  description: string;
}

export class CreateIssueGuard 
  extends BasePermissionGuard<CreateIssueCommand> {
  
  protected commandName = 'issue.create';
  protected requiredRole = 'Member' as WorkspaceRole;
}

export interface AssignIssueCommand {
  issueId: string;
  workspaceId: string;
  assignedTo: string;
}

export class AssignIssueGuard 
  extends BasePermissionGuard<AssignIssueCommand> {
  
  protected commandName = 'issue.assign';
  protected requiredRole = 'Admin' as WorkspaceRole;
}

export interface CloseIssueCommand {
  issueId: string;
  workspaceId: string;
}

export class CloseIssueGuard 
  extends BasePermissionGuard<CloseIssueCommand> {
  
  protected commandName = 'issue.close';
  protected requiredRole = 'Admin' as WorkspaceRole;
}
```

### Step 7: GuardExecutor Service

```typescript
// packages/core-engine/authorization/GuardExecutor.ts

export class GuardExecutor {
  constructor(
    private membershipQueryService: MembershipQueryService
  ) {}

  async executeWithGuard<TCommand, TResult>(
    command: TCommand,
    guard: PermissionGuard<TCommand>,
    userId: string,
    workspaceId: string,
    commandHandler: (cmd: TCommand) => Promise<TResult>
  ): Promise<TResult> {
    // 1. Build authorization context
    const context = await this.buildContext(userId, workspaceId);

    // 2. Check permission
    try {
      await guard.checkPermission(command, context);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        // Log unauthorized attempt
        console.error('Authorization failed:', error.message);
        throw error;
      }
      throw error;
    }

    // 3. Execute command
    return commandHandler(command);
  }

  private async buildContext(
    userId: string,
    workspaceId: string
  ): Promise<AuthorizationContext> {
    // Query user's memberships
    const memberships = await this.membershipQueryService.findByUserId(userId);

    // Extract roles for current workspace
    const roles = memberships
      .filter(m => m.workspaceId === workspaceId)
      .map(m => m.role);

    return {
      userId,
      workspaceId,
      roles,
      memberships,
      timestamp: new Date(),
    };
  }
}
```

**Pattern**: Centralized guard execution with context building.

### Step 8: Angular Integration

```typescript
// packages/ui-angular/src/app/core/services/authorization/guard-executor.service.ts

@Injectable({ providedIn: 'root' })
export class AngularGuardExecutorService {
  constructor(
    private membershipQuery: MembershipQueryService,
    private authService: AuthService
  ) {}

  async executeCommand<TCommand, TResult>(
    command: TCommand,
    guard: PermissionGuard<TCommand>,
    workspaceId: string,
    handler: (cmd: TCommand) => Promise<TResult>
  ): Promise<TResult> {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const executor = new GuardExecutor(this.membershipQuery);
    return executor.executeWithGuard(
      command,
      guard,
      userId,
      workspaceId,
      handler
    );
  }
}
```

### Step 9: Usage in CommandService

```typescript
// packages/ui-angular/src/app/core/services/workspace/workspace-command.service.ts

@Injectable({ providedIn: 'root' })
export class WorkspaceCommandService {
  constructor(
    private repository: WorkspaceRepository,
    private guardExecutor: AngularGuardExecutorService
  ) {}

  async createWorkspace(name: string, ownerId: string): Promise<WorkspaceId> {
    const command: CreateWorkspaceCommand = { name, ownerId };
    const guard = new CreateWorkspaceGuard();

    return this.guardExecutor.executeCommand(
      command,
      guard,
      'system', // Special workspace for workspace creation
      async (cmd) => {
        const workspace = Workspace.create(cmd.name, cmd.ownerId);
        await this.repository.save(workspace);
        return workspace.getId();
      }
    );
  }

  async archiveWorkspace(
    workspaceId: WorkspaceId,
    archivedBy: string
  ): Promise<void> {
    const command: ArchiveWorkspaceCommand = {
      workspaceId,
      archivedBy,
    };
    const guard = new ArchiveWorkspaceGuard();

    return this.guardExecutor.executeCommand(
      command,
      guard,
      workspaceId,
      async (cmd) => {
        const workspace = await this.repository.load(cmd.workspaceId);
        workspace.archive(cmd.archivedBy);
        await this.repository.save(workspace);
      }
    );
  }
}
```

---

## 🧪 Testing Strategy

### Test Suite Structure

```typescript
// packages/core-engine/authorization/__tests__/PermissionGuard.spec.ts

describe('BasePermissionGuard', () => {
  describe('Role Hierarchy', () => {
    it('should allow Owner to execute Admin commands', async () => {
      const guard = new TestGuard('Admin');
      const context = createContext('Owner');
      
      await expect(
        guard.checkPermission({}, context)
      ).resolves.not.toThrow();
    });

    it('should allow Admin to execute Member commands', async () => {
      const guard = new TestGuard('Member');
      const context = createContext('Admin');
      
      await expect(
        guard.checkPermission({}, context)
      ).resolves.not.toThrow();
    });

    it('should deny Member from executing Admin commands', async () => {
      const guard = new TestGuard('Admin');
      const context = createContext('Member');
      
      await expect(
        guard.checkPermission({}, context)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should deny Viewer from executing Member commands', async () => {
      const guard = new TestGuard('Member');
      const context = createContext('Viewer');
      
      await expect(
        guard.checkPermission({}, context)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('Context Validation', () => {
    it('should reject missing userId', async () => {
      const guard = new TestGuard('Member');
      const context = { ...createContext('Member'), userId: '' };
      
      await expect(
        guard.checkPermission({}, context)
      ).rejects.toThrow('userId is required');
    });

    it('should reject missing workspaceId', async () => {
      const guard = new TestGuard('Member');
      const context = { ...createContext('Member'), workspaceId: '' };
      
      await expect(
        guard.checkPermission({}, context)
      ).rejects.toThrow('workspaceId is required');
    });
  });

  describe('Membership Validation', () => {
    it('should deny user without membership', async () => {
      const guard = new TestGuard('Member');
      const context = createContext('Member');
      context.memberships = []; // No memberships
      
      await expect(
        guard.checkPermission({}, context)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should allow user with valid membership', async () => {
      const guard = new TestGuard('Member');
      const context = createContext('Member');
      
      await expect(
        guard.checkPermission({}, context)
      ).resolves.not.toThrow();
    });
  });
});
```

### Workspace Guard Tests

```typescript
// packages/account-domain/workspace/guards/__tests__/WorkspacePermissionGuard.spec.ts

describe('WorkspacePermissionGuard', () => {
  describe('CreateWorkspaceGuard', () => {
    it('should allow owner to create workspace', async () => {
      const guard = new CreateWorkspaceGuard();
      const context = createContext('Owner');
      const command: CreateWorkspaceCommand = {
        name: 'Test Workspace',
        ownerId: context.userId,
      };
      
      await expect(
        guard.checkPermission(command, context)
      ).resolves.not.toThrow();
    });

    it('should deny non-owner from creating workspace', async () => {
      const guard = new CreateWorkspaceGuard();
      const context = createContext('Admin');
      const command: CreateWorkspaceCommand = {
        name: 'Test Workspace',
        ownerId: 'different-user',
      };
      
      await expect(
        guard.checkPermission(command, context)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('ArchiveWorkspaceGuard', () => {
    it('should allow owner to archive workspace', async () => {
      const guard = new ArchiveWorkspaceGuard();
      const context = createContext('Owner');
      const command: ArchiveWorkspaceCommand = {
        workspaceId: 'ws-123',
        archivedBy: context.userId,
      };
      
      await expect(
        guard.checkPermission(command, context)
      ).resolves.not.toThrow();
    });

    it('should deny admin from archiving workspace', async () => {
      const guard = new ArchiveWorkspaceGuard();
      const context = createContext('Admin');
      const command: ArchiveWorkspaceCommand = {
        workspaceId: 'ws-123',
        archivedBy: context.userId,
      };
      
      await expect(
        guard.checkPermission(command, context)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('RenameWorkspaceGuard', () => {
    it('should allow admin to rename workspace', async () => {
      const guard = new RenameWorkspaceGuard();
      const context = createContext('Admin');
      const command: RenameWorkspaceCommand = {
        workspaceId: 'ws-123',
        newName: 'New Name',
      };
      
      await expect(
        guard.checkPermission(command, context)
      ).resolves.not.toThrow();
    });

    it('should deny member from renaming workspace', async () => {
      const guard = new RenameWorkspaceGuard();
      const context = createContext('Member');
      const command: RenameWorkspaceCommand = {
        workspaceId: 'ws-123',
        newName: 'New Name',
      };
      
      await expect(
        guard.checkPermission(command, context)
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
```

### GuardExecutor Tests

```typescript
// packages/core-engine/authorization/__tests__/GuardExecutor.spec.ts

describe('GuardExecutor', () => {
  let executor: GuardExecutor;
  let membershipQuery: jest.Mocked<MembershipQueryService>;

  beforeEach(() => {
    membershipQuery = createMockMembershipQuery();
    executor = new GuardExecutor(membershipQuery);
  });

  it('should execute command when permission granted', async () => {
    const guard = new TestGuard('Member');
    membershipQuery.findByUserId.mockResolvedValue([
      createMembership('Owner'),
    ]);

    const result = await executor.executeWithGuard(
      { test: 'data' },
      guard,
      'user-123',
      'ws-123',
      async (cmd) => 'success'
    );

    expect(result).toBe('success');
  });

  it('should throw when permission denied', async () => {
    const guard = new TestGuard('Admin');
    membershipQuery.findByUserId.mockResolvedValue([
      createMembership('Viewer'),
    ]);

    await expect(
      executor.executeWithGuard(
        { test: 'data' },
        guard,
        'user-123',
        'ws-123',
        async (cmd) => 'success'
      )
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should build authorization context correctly', async () => {
    const guard = new TestGuard('Member');
    const memberships = [
      createMembership('Admin', 'ws-123'),
      createMembership('Member', 'ws-456'),
    ];
    membershipQuery.findByUserId.mockResolvedValue(memberships);

    await executor.executeWithGuard(
      { test: 'data' },
      guard,
      'user-123',
      'ws-123',
      async (cmd) => 'success'
    );

    // Verify context was built with correct workspace
    expect(membershipQuery.findByUserId).toHaveBeenCalledWith('user-123');
  });
});
```

---

## ✅ Validation Script

```javascript
// scripts/validate-phase-3c.js

const fs = require('fs');
const path = require('path');

const checks = [
  // Core interfaces
  {
    file: 'packages/core-engine/authorization/PermissionGuard.ts',
    patterns: [
      'interface AuthorizationContext',
      'interface PermissionGuard',
      'class UnauthorizedError',
      'checkPermission',
      'getRequiredRole',
    ],
  },
  // Base guard
  {
    file: 'packages/core-engine/authorization/BasePermissionGuard.ts',
    patterns: [
      'abstract class BasePermissionGuard',
      'protected abstract commandName',
      'protected abstract requiredRole',
      'validateContext',
      'findMembership',
      'hasRequiredRole',
    ],
  },
  // Workspace guards
  {
    file: 'packages/account-domain/workspace/guards/WorkspacePermissionGuard.ts',
    patterns: [
      'class CreateWorkspaceGuard',
      'class ArchiveWorkspaceGuard',
      'class RenameWorkspaceGuard',
    ],
  },
  // Task guards
  {
    file: 'packages/saas-domain/task/guards/TaskPermissionGuard.ts',
    patterns: [
      'class CreateTaskGuard',
      'class AssignTaskGuard',
      'class CompleteTaskGuard',
      'class DeleteTaskGuard',
    ],
  },
  // GuardExecutor
  {
    file: 'packages/core-engine/authorization/GuardExecutor.ts',
    patterns: [
      'class GuardExecutor',
      'executeWithGuard',
      'buildContext',
    ],
  },
  // Tests
  {
    file: 'packages/core-engine/authorization/__tests__/PermissionGuard.spec.ts',
    patterns: [
      "describe('Role Hierarchy'",
      "describe('Context Validation'",
      "describe('Membership Validation'",
    ],
  },
];

let totalChecks = 0;
let passedChecks = 0;

checks.forEach(({ file, patterns }) => {
  const filePath = path.join(__dirname, '..', file);
  console.log(`\nChecking: ${file}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ File not found`);
    totalChecks++;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  patterns.forEach(pattern => {
    totalChecks++;
    const found = content.includes(pattern);
    if (found) {
      console.log(`  ✅ ${pattern}`);
      passedChecks++;
    } else {
      console.log(`  ❌ ${pattern}`);
    }
  });
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Total checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${totalChecks - passedChecks}`);
console.log(`Success rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);

process.exit(passedChecks === totalChecks ? 0 : 1);
```

---

## 📊 Complexity Breakdown

| Component | Complexity | Effort (hours) |
|-----------|------------|----------------|
| PermissionGuard interface | 1/10 | 0.5 |
| BasePermissionGuard | 2/10 | 1 |
| Workspace guards (3) | 1/10 | 0.5 |
| Task guards (4) | 1/10 | 0.5 |
| Payment guards (2) | 1/10 | 0.5 |
| Issue guards (3) | 1/10 | 0.5 |
| GuardExecutor | 2/10 | 1 |
| Angular integration | 1/10 | 0.5 |
| Testing (35+ tests) | 2/10 | 2 |
| Validation script | 1/10 | 0.5 |
| **Total** | **8/10** | **~8 hours** |

---

## 🎯 Success Criteria

### Functional Requirements
- ✅ All commands protected by guards
- ✅ Role hierarchy correctly enforced
- ✅ Workspace membership validated
- ✅ Authorization context complete
- ✅ Error messages informative

### Code Quality
- ✅ 35+ comprehensive test cases
- ✅ 100% guard coverage
- ✅ Type-safe command definitions
- ✅ Reusable base guard
- ✅ Clear error handling

### Documentation
- ✅ Guard implementation patterns
- ✅ Usage examples in services
- ✅ Authorization flow diagrams
- ✅ Role requirements documented

---

## 🔄 Integration with Other Phases

### Depends On
- **Phase 3A**: Membership aggregate and projections
- **Phase 3B**: Query security for membership lookup

### Enables
- **Phase 4A**: Authorization events for monitoring
- **Phase 4B**: Authorization errors in taxonomy
- **Phase 5C**: Authorization metrics in observability

### Testing Dependencies
- Requires Membership query service
- Requires test fixtures for memberships
- Requires mock authorization contexts

---

## 📝 Implementation Notes

### Key Design Decisions
1. **Command-Level Guards**: Each command has dedicated guard
2. **Role Hierarchy**: Owner > Admin > Member > Viewer
3. **Lazy Context**: Build context only when needed
4. **Extensible Rules**: Command-specific validation via override

### Common Pitfalls
- ⚠️ Don't check permissions in aggregate methods
- ⚠️ Don't bypass guards for "system" operations
- ⚠️ Don't cache authorization context
- ⚠️ Don't allow role escalation

### Performance Considerations
- Cache membership queries when possible
- Build context once per command
- Use indexed queries for memberships
- Consider caching role hierarchy

---

## 🚀 Next Steps

After Phase 3C completion:
1. Proceed to **Phase 4A**: Monitoring with authorization events
2. Integrate guards into all command services
3. Add authorization metrics to observability
4. Document common authorization patterns
5. Create guard generator CLI tool

**Phase 3 Complete**: Full authorization model with Membership aggregate, query security, and permission guards! 🎉
