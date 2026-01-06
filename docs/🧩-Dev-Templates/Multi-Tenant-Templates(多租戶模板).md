# Multi-Tenant Templates (多租戶模板)

本文檔提供基於 Account/Workspace 模型的多租戶 SaaS 平台完整模板。

---

## 核心概念 (Core Concepts)

### Account - 唯一業務主體 (WHO)

**Account 是執行業務行為的唯一主體**，代表「誰」在執行操作。

```typescript
/**
 * Account - The sole business actor
 * Account 是唯一的業務主體
 */
export interface Account {
  /** Account ID (唯一識別符) */
  id: string;
  
  /** 顯示名稱 */
  displayName: string;
  
  /** Account 類型 */
  type: 'individual' | 'organization' | 'bot';
  
  /** 身份來源 (Identity Sources) */
  identitySources: IdentitySource[];
  
  /** 建立時間 */
  createdAt: Timestamp;
  
  /** 狀態 */
  status: 'active' | 'suspended' | 'deleted';
  
  /** 元數據 */
  metadata: AccountMetadata;
}

/**
 * Identity Source - 認證層的身份來源
 * 來自 Platform 層，僅用於身份驗證
 */
export interface IdentitySource {
  /** 身份提供者 */
  provider: 'google' | 'microsoft' | 'github' | 'email';
  
  /** 外部 ID */
  externalId: string;
  
  /** Email */
  email?: string;
  
  /** 驗證狀態 */
  verified: boolean;
  
  /** 連結時間 */
  linkedAt: Timestamp;
}

export interface AccountMetadata {
  /** 頭像 URL */
  avatar?: string;
  
  /** 時區 */
  timezone?: string;
  
  /** 語言偏好 */
  language?: string;
  
  /** 自訂屬性 */
  customFields?: Record<string, any>;
}
```

---

### Workspace - 邏輯容器 (WHERE)

**Workspace 是業務行為發生的邏輯容器**，代表「哪裡」執行操作。

```typescript
/**
 * Workspace - Logical container for business operations
 * Workspace 是業務操作的邏輯容器
 */
export interface Workspace {
  /** Workspace ID */
  id: string;
  
  /** 名稱 */
  name: string;
  
  /** 描述 */
  description?: string;
  
  /** 擁有者 Account ID */
  ownerAccountId: string;
  
  /** 類型 */
  type: 'personal' | 'team' | 'enterprise';
  
  /** 建立時間 */
  createdAt: Timestamp;
  
  /** 設定 */
  settings: WorkspaceSettings;
  
  /** 狀態 */
  status: 'active' | 'suspended' | 'archived';
  
  /** 多租戶邊界 (向後相容 blueprintId) */
  blueprintId: string;
}

export interface WorkspaceSettings {
  /** 時區 */
  timezone: string;
  
  /** 預設語言 */
  defaultLanguage: string;
  
  /** 貨幣 */
  currency: string;
  
  /** 功能開關 */
  features: {
    taskManagement: boolean;
    paymentProcessing: boolean;
    issueTracking: boolean;
    analytics: boolean;
    customWorkflows: boolean;
  };
  
  /** 客製化設定 */
  customSettings?: Record<string, any>;
}
```

---

### AccountWorkspaceMembership - 成員關係

**定義 Account 在 Workspace 中的角色和權限**。

```typescript
/**
 * Account-Workspace Membership
 * Account 與 Workspace 的成員關係
 */
export interface AccountWorkspaceMembership {
  /** 成員關係 ID */
  id: string;
  
  /** Account ID */
  accountId: string;
  
  /** Workspace ID */
  workspaceId: string;
  
  /** 角色 */
  role: WorkspaceRole;
  
  /** 權限集 */
  permissions: Permission[];
  
  /** 加入時間 */
  joinedAt: Timestamp;
  
  /** 邀請者 Account ID */
  invitedBy: string;
  
  /** 邀請接受時間 */
  acceptedAt?: Timestamp;
  
  /** 狀態 */
  status: 'pending' | 'active' | 'suspended' | 'removed';
}

/**
 * Workspace Role
 * Workspace 內的角色定義
 */
export enum WorkspaceRole {
  /** 擁有者 - 完全控制 */
  OWNER = 'owner',
  
  /** 管理員 - 管理成員和設定 */
  ADMIN = 'admin',
  
  /** 成員 - 一般操作權限 */
  MEMBER = 'member',
  
  /** 檢視者 - 只讀權限 */
  VIEWER = 'viewer',
  
  /** 訪客 - 受限訪問 */
  GUEST = 'guest'
}

/**
 * Permission
 * 細粒度權限定義
 */
export interface Permission {
  /** 資源類型 */
  resource: 'task' | 'payment' | 'issue' | 'project' | 'member' | 'settings';
  
  /** 操作 */
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve' | 'assign')[];
  
  /** 範圍限制 */
  scope?: PermissionScope;
}

export interface PermissionScope {
  /** 僅限特定專案 */
  projectIds?: string[];
  
  /** 僅限特定標籤 */
  tags?: string[];
  
  /** 自訂條件 */
  conditions?: Record<string, any>;
}
```

---

## 依賴鏈模型 (Dependency Chain)

**Account → Workspace → Module → Entity**

```typescript
/**
 * 依賴鏈範例
 * Dependency Chain Example
 */

// 1. Account (WHO)
const account: Account = {
  id: 'account-001',
  displayName: 'John Developer',
  type: 'individual',
  identitySources: [{
    provider: 'google',
    externalId: 'google-user-123',
    email: 'john@example.com',
    verified: true,
    linkedAt: Timestamp.now()
  }],
  createdAt: Timestamp.now(),
  status: 'active',
  metadata: {
    avatar: 'https://example.com/avatar.jpg',
    timezone: 'Asia/Taipei',
    language: 'zh-TW'
  }
};

// 2. Workspace (WHERE)
const workspace: Workspace = {
  id: 'workspace-001',
  name: 'Project Alpha',
  ownerAccountId: 'account-001',
  type: 'team',
  createdAt: Timestamp.now(),
  settings: {
    timezone: 'Asia/Taipei',
    defaultLanguage: 'zh-TW',
    currency: 'TWD',
    features: {
      taskManagement: true,
      paymentProcessing: true,
      issueTracking: true,
      analytics: false,
      customWorkflows: false
    }
  },
  status: 'active',
  blueprintId: 'blueprint-001'
};

// 3. Membership (Account in Workspace)
const membership: AccountWorkspaceMembership = {
  id: 'membership-001',
  accountId: 'account-001',
  workspaceId: 'workspace-001',
  role: WorkspaceRole.OWNER,
  permissions: [
    {
      resource: 'task',
      actions: ['create', 'read', 'update', 'delete', 'assign']
    },
    {
      resource: 'settings',
      actions: ['read', 'update']
    }
  ],
  joinedAt: Timestamp.now(),
  invitedBy: 'account-001',  // Self-created
  status: 'active'
};

// 4. Business Entity (Task in Workspace)
const task = {
  id: 'task-001',
  workspaceId: 'workspace-001',  // WHERE
  assignedToAccountId: 'account-002',  // WHO
  createdByAccountId: 'account-001',  // WHO
  title: 'Implement feature X',
  status: 'in-progress'
};
```

---

## 多租戶隔離服務 (Tenant Isolation Service)

### Workspace 隔離實作

```typescript
/**
 * Workspace Isolation Service
 * Workspace 隔離服務
 */
export class WorkspaceIsolationService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  /**
   * Get current workspace ID
   */
  getCurrentWorkspaceId(): string {
    const workspace = this.authService.currentWorkspace;
    if (!workspace) {
      throw new Error('No workspace selected');
    }
    return workspace.id;
  }

  /**
   * Get current actor account ID
   */
  getCurrentActorAccountId(): string {
    const account = this.authService.currentAccount;
    if (!account) {
      throw new Error('No account authenticated');
    }
    return account.id;
  }

  /**
   * Validate access to resource
   */
  async validateAccess(
    resourceId: string,
    resourceType: 'task' | 'payment' | 'issue',
    action: 'create' | 'read' | 'update' | 'delete'
  ): Promise<boolean> {
    const workspaceId = this.getCurrentWorkspaceId();
    const accountId = this.getCurrentActorAccountId();

    // 1. 檢查資源是否屬於當前 Workspace
    const resource = await this.getResource(resourceType, resourceId);
    if (resource.workspaceId !== workspaceId) {
      return false;
    }

    // 2. 檢查 Account 在 Workspace 中的權限
    const membership = await this.getMembership(accountId, workspaceId);
    if (!membership || membership.status !== 'active') {
      return false;
    }

    // 3. 檢查權限
    return this.hasPermission(membership, resourceType, action);
  }

  /**
   * Filter entities by workspace
   */
  filterByWorkspace<T extends { workspaceId: string }>(
    entities: T[]
  ): T[] {
    const workspaceId = this.getCurrentWorkspaceId();
    return entities.filter(e => e.workspaceId === workspaceId);
  }

  /**
   * Scope Firestore query to workspace
   */
  scopeToWorkspace(collectionPath: string): Query {
    const workspaceId = this.getCurrentWorkspaceId();
    return query(
      collection(this.firestore, collectionPath),
      where('workspaceId', '==', workspaceId)
    );
  }

  /**
   * Get membership
   */
  private async getMembership(
    accountId: string,
    workspaceId: string
  ): Promise<AccountWorkspaceMembership | null> {
    const membershipQuery = query(
      collection(this.firestore, 'workspace_memberships'),
      where('accountId', '==', accountId),
      where('workspaceId', '==', workspaceId)
    );

    const snapshot = await getDocs(membershipQuery);
    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as AccountWorkspaceMembership;
  }

  /**
   * Check permission
   */
  private hasPermission(
    membership: AccountWorkspaceMembership,
    resourceType: string,
    action: string
  ): boolean {
    // Owner has all permissions
    if (membership.role === WorkspaceRole.OWNER) {
      return true;
    }

    // Check specific permissions
    return membership.permissions.some(
      p => p.resource === resourceType && p.actions.includes(action as any)
    );
  }

  private async getResource(
    resourceType: string,
    resourceId: string
  ): Promise<any> {
    const doc = await getDoc(
      doc(this.firestore, `${resourceType}s`, resourceId)
    );
    return doc.data();
  }
}
```

---

## 權限檢查服務 (Permission Service)

### Account + Workspace 權限模型

```typescript
/**
 * Permission Service
 * 基於 Account + Workspace 的權限檢查服務
 */
export class PermissionService {
  constructor(
    private authService: AuthService,
    private workspaceService: WorkspaceIsolationService
  ) {}

  /**
   * Check if account has permission for action in workspace
   */
  async hasPermission(
    action: string,
    resourceType: string,
    resourceId?: string
  ): Promise<boolean> {
    const accountId = this.workspaceService.getCurrentActorAccountId();
    const workspaceId = this.workspaceService.getCurrentWorkspaceId();

    // 1. Get membership
    const membership = await this.getMembership(accountId, workspaceId);
    if (!membership || membership.status !== 'active') {
      return false;
    }

    // 2. Check role-based permissions
    if (this.checkRolePermission(membership.role, action, resourceType)) {
      return true;
    }

    // 3. Check granular permissions
    if (this.checkGranularPermission(membership.permissions, action, resourceType)) {
      return true;
    }

    // 4. Check resource-specific permissions
    if (resourceId) {
      return await this.checkResourcePermission(
        accountId,
        resourceType,
        resourceId,
        action
      );
    }

    return false;
  }

  /**
   * Get all workspaces for account
   */
  async getAccountWorkspaces(accountId: string): Promise<Workspace[]> {
    const membershipsQuery = query(
      collection(this.firestore, 'workspace_memberships'),
      where('accountId', '==', accountId),
      where('status', '==', 'active')
    );

    const snapshot = await getDocs(membershipsQuery);
    const workspaceIds = snapshot.docs.map(
      doc => (doc.data() as AccountWorkspaceMembership).workspaceId
    );

    // Fetch workspaces
    const workspaces: Workspace[] = [];
    for (const workspaceId of workspaceIds) {
      const workspaceDoc = await getDoc(
        doc(this.firestore, 'workspaces', workspaceId)
      );
      if (workspaceDoc.exists()) {
        workspaces.push(workspaceDoc.data() as Workspace);
      }
    }

    return workspaces;
  }

  /**
   * Check role-based permission
   */
  private checkRolePermission(
    role: WorkspaceRole,
    action: string,
    resourceType: string
  ): boolean {
    // Role permission matrix
    const rolePermissions: Record<WorkspaceRole, string[]> = {
      [WorkspaceRole.OWNER]: ['*'],
      [WorkspaceRole.ADMIN]: [
        'create_task', 'update_task', 'delete_task',
        'approve_payment', 'manage_members'
      ],
      [WorkspaceRole.MEMBER]: [
        'create_task', 'update_task',
        'create_issue', 'update_issue'
      ],
      [WorkspaceRole.VIEWER]: ['read_task', 'read_issue', 'read_payment'],
      [WorkspaceRole.GUEST]: ['read_task']
    };

    const permissions = rolePermissions[role] || [];
    return permissions.includes('*') || permissions.includes(`${action}_${resourceType}`);
  }

  /**
   * Check granular permission
   */
  private checkGranularPermission(
    permissions: Permission[],
    action: string,
    resourceType: string
  ): boolean {
    return permissions.some(
      p => p.resource === resourceType && p.actions.includes(action as any)
    );
  }

  /**
   * Check resource-specific permission
   */
  private async checkResourcePermission(
    accountId: string,
    resourceType: string,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    // Example: Check if account is the resource owner
    const resource = await this.getResource(resourceType, resourceId);
    
    if (resource.createdByAccountId === accountId) {
      // Creator has full permissions on their own resources
      return true;
    }

    if (resource.assignedToAccountId === accountId && action === 'update') {
      // Assignee can update assigned resources
      return true;
    }

    return false;
  }

  private async getMembership(
    accountId: string,
    workspaceId: string
  ): Promise<AccountWorkspaceMembership | null> {
    const membershipQuery = query(
      collection(this.firestore, 'workspace_memberships'),
      where('accountId', '==', accountId),
      where('workspaceId', '==', workspaceId)
    );

    const snapshot = await getDocs(membershipQuery);
    if (snapshot.empty) return null;

    return snapshot.docs[0].data() as AccountWorkspaceMembership;
  }

  private async getResource(
    resourceType: string,
    resourceId: string
  ): Promise<any> {
    const docRef = doc(this.firestore, `${resourceType}s`, resourceId);
    const docSnapshot = await getDoc(docRef);
    return docSnapshot.data();
  }
}
```

---

## Firestore 資料結構 (Firestore Data Structure)

### 多租戶集合結構

```
firestore/
├── accounts/                    # Account (業務主體)
│   └── {accountId}/
│       ├── id
│       ├── displayName
│       ├── type
│       ├── identitySources[]
│       ├── status
│       └── metadata
│
├── workspaces/                  # Workspace (邏輯容器)
│   └── {workspaceId}/
│       ├── id
│       ├── name
│       ├── ownerAccountId
│       ├── type
│       ├── settings
│       ├── status
│       └── blueprintId
│
├── workspace_memberships/       # Account-Workspace 成員關係
│   └── {membershipId}/
│       ├── accountId
│       ├── workspaceId
│       ├── role
│       ├── permissions[]
│       ├── joinedAt
│       ├── invitedBy
│       └── status
│
├── tasks/                       # 業務資料 (範例)
│   └── {taskId}/
│       ├── workspaceId          # WHERE
│       ├── createdByAccountId   # WHO
│       ├── assignedToAccountId  # WHO
│       ├── title
│       ├── status
│       └── metadata
│
├── payments/                    # 業務資料 (範例)
│   └── {paymentId}/
│       ├── workspaceId          # WHERE
│       ├── requestedByAccountId # WHO
│       ├── approvedByAccountId  # WHO
│       ├── amount
│       ├── status
│       └── metadata
│
└── events/                      # 領域事件
    └── {eventId}/
        ├── aggregateId
        ├── eventType
        ├── data
        └── metadata
            ├── actorAccountId   # WHO
            ├── workspaceId      # WHERE
            ├── causedBy
            ├── blueprintId
            └── timestamp
```

---

## 三層授權架構 (Three-Layer Authorization)

### Platform → Domain → UI

```typescript
/**
 * Platform Layer (Authentication)
 * 平台層：身份驗證
 */
export class PlatformAuthService {
  /**
   * Authenticate user from identity provider
   */
  async authenticateWithGoogle(idToken: string): Promise<Account> {
    // 1. Verify ID token with Google
    const googleUser = await this.verifyGoogleToken(idToken);
    
    // 2. Find or create Account
    let account = await this.findAccountByIdentitySource(
      'google',
      googleUser.uid
    );
    
    if (!account) {
      account = await this.createAccountFromIdentity({
        provider: 'google',
        externalId: googleUser.uid,
        email: googleUser.email,
        displayName: googleUser.name
      });
    }
    
    return account;
  }
}

/**
 * Domain Layer (Authorization)
 * 領域層：業務授權
 */
export class DomainAuthorizationService {
  /**
   * Authorize action in workspace
   */
  async authorizeAction(
    accountId: string,
    workspaceId: string,
    action: string,
    resourceType: string
  ): Promise<AuthorizationResult> {
    // 1. Get membership
    const membership = await this.getMembership(accountId, workspaceId);
    
    if (!membership || membership.status !== 'active') {
      return { allowed: false, reason: 'No active membership' };
    }
    
    // 2. Check permissions
    const hasPermission = await this.permissionService.hasPermission(
      action,
      resourceType
    );
    
    if (!hasPermission) {
      return { allowed: false, reason: 'Insufficient permissions' };
    }
    
    return { allowed: true };
  }
}

/**
 * UI Layer (Presentation)
 * UI 層：展示控制
 */
export class UIAuthorizationDirective {
  /**
   * Show/hide UI elements based on permissions
   */
  async canShow(
    action: string,
    resourceType: string
  ): Promise<boolean> {
    return await this.domainAuthService.authorizeAction(
      this.currentAccountId,
      this.currentWorkspaceId,
      action,
      resourceType
    ).then(result => result.allowed);
  }
}
```

---

## 跨 Workspace 協作 (Cross-Workspace Collaboration)

### Workspace 間的資源共享

```typescript
/**
 * Workspace Collaboration
 * Workspace 協作模型
 */
export interface WorkspaceCollaboration {
  /** 協作 ID */
  id: string;
  
  /** 主 Workspace ID (邀請方) */
  hostWorkspaceId: string;
  
  /** 協作 Workspace ID (被邀請方) */
  collaboratorWorkspaceId: string;
  
  /** 協作類型 */
  type: 'resource_sharing' | 'partner' | 'vendor' | 'client';
  
  /** 共享範圍 */
  sharedResources: SharedResource[];
  
  /** 建立時間 */
  createdAt: Timestamp;
  
  /** 到期時間 */
  expiresAt?: Timestamp;
  
  /** 狀態 */
  status: 'pending' | 'active' | 'suspended' | 'expired';
}

export interface SharedResource {
  /** 資源類型 */
  resourceType: 'task' | 'payment' | 'issue' | 'project';
  
  /** 資源 IDs */
  resourceIds: string[];
  
  /** 允許的操作 */
  allowedActions: ('read' | 'comment' | 'update')[];
  
  /** 限制 */
  restrictions?: {
    /** 僅限特定 Account */
    accountIds?: string[];
    
    /** 到期時間 */
    expiresAt?: Timestamp;
  };
}

/**
 * Cross-Workspace Access Service
 * 跨 Workspace 訪問服務
 */
export class CrossWorkspaceAccessService {
  /**
   * Check if account can access resource from another workspace
   */
  async canAccessCrossWorkspace(
    accountId: string,
    targetWorkspaceId: string,
    resourceId: string,
    resourceType: string,
    action: string
  ): Promise<boolean> {
    // 1. Get current workspace
    const currentWorkspaceId = this.getCurrentWorkspaceId();
    
    // 2. Find collaboration relationship
    const collaboration = await this.findCollaboration(
      currentWorkspaceId,
      targetWorkspaceId
    );
    
    if (!collaboration || collaboration.status !== 'active') {
      return false;
    }
    
    // 3. Check if resource is shared
    const sharedResource = collaboration.sharedResources.find(
      sr => sr.resourceType === resourceType &&
            sr.resourceIds.includes(resourceId)
    );
    
    if (!sharedResource) {
      return false;
    }
    
    // 4. Check if action is allowed
    if (!sharedResource.allowedActions.includes(action as any)) {
      return false;
    }
    
    // 5. Check restrictions
    if (sharedResource.restrictions) {
      if (sharedResource.restrictions.accountIds &&
          !sharedResource.restrictions.accountIds.includes(accountId)) {
        return false;
      }
      
      if (sharedResource.restrictions.expiresAt &&
          sharedResource.restrictions.expiresAt < Timestamp.now()) {
        return false;
      }
    }
    
    return true;
  }

  private async findCollaboration(
    workspaceId1: string,
    workspaceId2: string
  ): Promise<WorkspaceCollaboration | null> {
    const collabQuery = query(
      collection(this.firestore, 'workspace_collaborations'),
      where('hostWorkspaceId', '==', workspaceId1),
      where('collaboratorWorkspaceId', '==', workspaceId2),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(collabQuery);
    if (snapshot.empty) return null;
    
    return snapshot.docs[0].data() as WorkspaceCollaboration;
  }
}
```

---

## 最佳實踐

### ✅ DO
- 所有業務實體包含 workspaceId (WHERE)
- 所有業務行為記錄 actorAccountId (WHO)
- 使用 WorkspaceIsolationService 進行隔離
- 實作細粒度權限控制 (AccountWorkspaceMembership)
- 支援跨 Workspace 協作 (WorkspaceCollaboration)
- 定期審計訪問記錄
- Account 作為唯一業務主體
- Workspace 作為邏輯容器，不是業務主體
- 分離認證 (Platform) 與授權 (Domain)

### ❌ DON'T
- 跨 Workspace 查詢資料（除非有協作關係）
- 硬編碼 Workspace ID 或 Account ID
- 將 User/Organization 作為業務主體
- 使用 Team/Partner 作為獨立實體（應為 Workspace 內角色）
- 在 Platform 層處理業務授權
- 在 Domain 層處理身份驗證
- 混淆 Account (WHO) 與 Workspace (WHERE)

---

## 檢查清單

- [ ] 所有資料包含 workspaceId (WHERE)
- [ ] 所有行為記錄 actorAccountId (WHO)
- [ ] 實作 Workspace 隔離服務
- [ ] 使用 AccountWorkspaceMembership 管理權限
- [ ] 支援跨 Workspace 協作
- [ ] 權限細粒度控制
- [ ] 訪問日誌記錄
- [ ] 資料導出功能 (GDPR)
- [ ] Account 作為唯一業務主體
- [ ] Workspace 作為邏輯容器
- [ ] 三層授權架構 (Platform/Domain/UI)

---

## 術語遷移對照表

| 舊術語 | 新術語 | 說明 |
|--------|--------|------|
| User | Account (type=individual) | 個人作為業務主體 |
| Organization | Account (type=organization) | 組織作為業務主體 |
| Team | Workspace (type=team) | 團隊是 Workspace 類型 |
| userId | actorAccountId | 執行者的 Account ID |
| organizationId | workspaceId | 業務發生的 Workspace |
| Blueprint | Workspace + blueprintId | Workspace 包含 blueprintId |
| TeamMember | AccountWorkspaceMembership | Account 在 Workspace 的成員關係 |
| Partner/Collaborator | WorkspaceCollaboration | Workspace 間的協作關係 |

---

**版本**: 2.0 | **更新**: 2026-01-02 | **基於**: Account/Workspace 核心模型
