# 平台層 SaaS 架構

> **目標**：事件源 + 因果 + Account/Workspace 的多租戶平台

## 核心設計原則 (from ✨✨✨.md, ✨✨✨✨✨.md)

1. **Account 是唯一業務主體** - User/Org/Bot 只是身份來源
2. **Workspace 是邏輯容器** - 定義範圍和隔離邊界，不觸發事件
3. **每個實體都是事件流** - Account、Workspace、Membership
4. **單一真相，派生多視圖** - Projection Replay 重建
5. **授權在 Domain，認證在 Platform** - Platform 只驗證身份

## 平台核心實體

### Account（帳號）

> **Account 是唯一的業務行為主體（Business Actor）**

**事件**：
- `AccountCreated { accountId, type, metadata }`
- `AccountActivated { accountId }`
- `AccountSuspended { accountId, reason }`
- `AccountDeleted { accountId, deletedByAccountId }`

**決策**：
- `decideCreateAccount(command, events)` - 建立帳號
- `decideActivateAccount(command, events)` - 啟用帳號
- `decideSuspendAccount(command, events)` - 停用帳號

**投影**：
- `AccountListProjection` - 帳號列表
- `AccountProfileProjection` - 帳號詳情
- `AccountTypeFilterProjection` - 按類型分組

**Account 類型**：
```typescript
type AccountType = 'user' | 'organization' | 'bot';

interface UserAccount {
  accountId: string;
  type: 'user';
  metadata: {
    email: string;
    displayName: string;
    authProvider: 'email' | 'google' | 'github';
  };
}

interface OrganizationAccount {
  accountId: string;
  type: 'organization';
  metadata: {
    legalName: string;
    taxId?: string;
  };
}

interface BotAccount {
  accountId: string;
  type: 'bot';
  metadata: {
    purpose: string;
    ownerAccountId: string;
  };
}
```

### Workspace（工作空間）

> **Workspace 是承載業務模組的邏輯容器，不是業務主體**

**事件**：
- `WorkspaceCreated { workspaceId, name, createdByAccountId }`
- `WorkspaceRenamed { workspaceId, newName }`
- `WorkspaceArchived { workspaceId, archivedByAccountId, reason }`

**決策**：
- `decideCreateWorkspace(command, events)` - 建立工作空間
- `decideRenameWorkspace(command, events)` - 重新命名
- `decideArchiveWorkspace(command, events)` - 歸檔

**投影**：
- `WorkspaceListProjection` - 工作空間列表
- `WorkspaceDetailProjection` - 工作空間詳情
- `ActiveWorkspacesProjection` - 活躍工作空間

**Workspace 定義**：
```typescript
interface Workspace {
  workspaceId: string;
  name: string;
  status: 'active' | 'archived';
  createdAt: number;
  // Notice: NO ownerAccountId!
  // Ownership is a relationship, not a property
}
```

### AccountWorkspaceMembership（帳號工作空間成員關係）

> **權限是關係，不是屬性**

**事件**：
- `AccountJoinedWorkspace { accountId, workspaceId, role, invitedByAccountId }`
- `AccountLeftWorkspace { accountId, workspaceId }`
- `AccountRoleChanged { accountId, workspaceId, oldRole, newRole, changedByAccountId }`

**決策**：
- `decideInviteAccount(command, events)` - 邀請帳號加入
- `decideAcceptInvitation(command, events)` - 接受邀請
- `decideChangeRole(command, events)` - 變更角色
- `decideRemoveMember(command, events)` - 移除成員

**投影**：
- `WorkspaceMembersProjection` - 工作空間成員列表
- `AccountWorkspacesProjection` - 帳號所屬工作空間
- `MembershipHistoryProjection` - 成員歷史記錄

**Membership 定義**：
```typescript
interface AccountWorkspaceMembership {
  accountId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  grantedByAccountId: string;
  grantedAt: number;
}
```

**Roles 說明**：
- **Owner**: 完全控制，可刪除工作空間
- **Admin**: 管理成員，配置設定
- **Member**: 存取和修改內容
- **Viewer**: 唯讀存取

## Platform ↔ Domain 關係

### 新架構（基於 Account/Workspace）

```
Task Domain (業務核心)
  ├─ TaskCreated
  │  ├─ actorAccountId: "acc-user-123" ← Account (WHO)
  │  ├─ workspaceId: "ws-456" ← Workspace (WHERE)
  │  ├─ assigneeAccountId: "acc-user-789" ← Account (assigned to)
  │  └─ createdByAccountId: "acc-user-123" ← Account (creator)
  │
  ↓ references
Platform Layer (多租戶能力)
  ├─ Account (Business Actor)
  │  ├─ UserAccount
  │  ├─ OrganizationAccount
  │  └─ BotAccount
  └─ Workspace (Logical Container)
     └─ AccountWorkspaceMembership
```

### 舊架構（已廢棄）

```
❌ Task Domain
  ├─ createdBy: "user-123" ← User
  ├─ assignedTo: "user-456" ← User
  ├─ orgId: "org-789" ← Organization
  └─ teamId: "team-321" ← Team

問題：
1. User/Org 混淆（哪個是 Actor？）
2. 多種 ID 類型（userId vs orgId）
3. 事件難以統一建模
4. 授權邏輯複雜
```

### 依賴鏈（from ✨✨✨✨✨✨✨✨✨.md）

```
Account ──▶ Workspace ──▶ Module ──▶ Entity
   誰           在哪          做什麼         狀態
```

**原則**：每一層只能「往右用」，不能「往左知道」

- **Account**: 不知道 Workspace 或 Module
- **Workspace**: 不知道 Account 或 Module
- **Module**: 知道 Workspace 存在（用 workspaceId 限定範圍）
- **Entity**: 知道 Workspace 和可能引用 Account（如 assignee）

## 設計哲學

### Platform Layer
> **"Platform provides WHO (Account) and WHERE (Workspace), not WHAT"**

- Platform 只做身份驗證，不做授權決策
- Platform 提供 AuthContext，不解釋權限
- Platform 定義 Scope（Workspace），不包含業務邏輯

### Task Domain
> **"Task is the ONLY business entity"**

- Task 使用 Account 和 Workspace，不管它們怎麼來的
- Task 做授權判斷（canCompleteTask），Platform 不做
- Task 在 Workspace 範圍內運作

### Account Model
> **"Account is the sole business actor"**

- User/Organization/Bot 都只是 Account 的類型
- Event 中只用 actorAccountId，不用 userId/orgId
- Account 觸發事件、被授權、被指派

### Workspace Model
> **"Workspace is a logical container, not an actor"**

- Workspace 不觸發事件，只作為 workspaceId 出現
- Workspace 定義資料隔離邊界
- Workspace 可承載多個業務模組（Task, Payment, Issue）

### Event Sourcing
> **"Events are facts. State is derived."**

- Events 記錄業務事實，不可變更
- Projection 從 Events 派生視圖

### Multi-View
> **"Same stream, different perspectives"**

- 同一事件流可產生多種投影
- 每種投影優化不同查詢需求

---

## 認證 vs 授權

### Platform Adapter（認證層）

**職責**：驗證身份，回答「你是誰？」

```typescript
class FirebaseAuthAdapter {
  async authenticate(token: string): Promise<AuthContext> {
    // 1. 驗證 Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // 2. 查詢 Account（從 Firebase UID 找 Account）
    const account = await this.getAccountByFirebaseUid(decodedToken.uid);
    
    // 3. 查詢當前 Workspace Membership
    const memberships = await this.getMemberships(account.accountId);
    const currentWorkspace = this.selectCurrentWorkspace(memberships);
    
    // 4. 回傳 AuthContext（不做授權判斷）
    return {
      accountId: account.accountId,
      accountType: account.type,
      workspaceId: currentWorkspace.workspaceId,
      roles: currentWorkspace.roles  // 只是資料，不解釋
    };
  }
}
```

### Domain Policy（授權層）

**職責**：業務授權，回答「你可以做什麼？」

```typescript
function canCompleteTask(
  actor: AuthContext,
  task: Task
): boolean {
  // Business rule: 只有 assignee 或 admin 可以完成任務
  return (
    actor.accountId === task.assigneeAccountId ||
    actor.roles.includes('admin')
  );
}

function canDeleteWorkspace(
  actor: AuthContext,
  workspace: Workspace
): boolean {
  // Business rule: 只有 owner 可以刪除工作空間
  return actor.roles.includes('owner');
}
```

**關鍵**：
- Platform 只驗證身份，不做業務判斷
- Domain 使用 AuthContext 做授權決策
- UI 呼叫 Domain Policy 決定顯示/隱藏

參考：[Authorization Layers](../../03-architecture/05-authorization-layers.md)

---

## 多租戶隔離

### Firestore Security Rules

```javascript
// Workspace-based isolation
match /tasks/{taskId} {
  allow read: if isWorkspaceMember(
    request.auth.uid,
    resource.data.workspaceId
  );
  
  allow write: if isWorkspaceMember(
    request.auth.uid,
    request.resource.data.workspaceId
  );
}

function isWorkspaceMember(uid, workspaceId) {
  let accountId = getAccountIdFromUid(uid);
  let membership = get(/databases/$(database)/documents/memberships/$(accountId + '_' + workspaceId));
  return membership != null;
}
```

### Query Pattern

```typescript
// ✅ GOOD: Always filter by workspaceId
const tasks = await getDocs(
  query(
    collection(db, 'tasks'),
    where('workspaceId', '==', currentWorkspaceId)
  )
);

// ❌ BAD: No workspace filter (data leak!)
const tasks = await getDocs(collection(db, 'tasks'));
```

---

## 事件範例

### Account Events

```typescript
// User Account created
{
  type: 'AccountCreated',
  aggregateId: 'acc-user-123',
  actorAccountId: 'system',  // System created this
  workspaceId: null,  // Not workspace-scoped
  data: {
    accountId: 'acc-user-123',
    type: 'user',
    metadata: {
      email: 'user@example.com',
      displayName: 'John Doe'
    }
  }
}

// Organization Account created by User
{
  type: 'AccountCreated',
  aggregateId: 'acc-org-456',
  actorAccountId: 'acc-user-123',  // Created by user
  workspaceId: null,
  data: {
    accountId: 'acc-org-456',
    type: 'organization',
    metadata: {
      legalName: 'Acme Corp'
    }
  }
}
```

### Workspace Events

```typescript
// Workspace created
{
  type: 'WorkspaceCreated',
  aggregateId: 'ws-789',
  actorAccountId: 'acc-user-123',  // Who created it
  workspaceId: 'ws-789',  // Self-reference
  data: {
    workspaceId: 'ws-789',
    name: 'My Workspace',
    createdByAccountId: 'acc-user-123'
  }
}
```

### Membership Events

```typescript
// Account joined workspace
{
  type: 'AccountJoinedWorkspace',
  aggregateId: 'membership-123',
  actorAccountId: 'acc-user-456',  // Inviter
  workspaceId: 'ws-789',
  data: {
    accountId: 'acc-user-789',  // Invitee
    workspaceId: 'ws-789',
    role: 'member',
    invitedByAccountId: 'acc-user-456'
  }
}
```

---

## 未來擴展

### Workspace 層級結構（可選）

```typescript
interface Workspace {
  workspaceId: string;
  name: string;
  parentWorkspaceId?: string;  // 支援子工作空間
  type?: 'default' | 'project' | 'team';
  status: 'active' | 'archived';
}
```

### Account 類型擴展（可選）

```typescript
type AccountType = 
  | 'user' 
  | 'organization' 
  | 'bot'
  | 'service'      // 未來：微服務帳號
  | 'api-client';  // 未來：外部 API 客戶端
```

---

**版本**: 2.0  
**更新日期**: 2026-01-01  
**來源**: ✨✨✨.md, ✨✨✨✨✨.md (Account/Workspace 核心概念)  
**重大變更**: 從 User/Org/Team 模型遷移至 Account/Workspace 模型
