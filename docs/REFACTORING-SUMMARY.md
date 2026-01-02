# 文件重構總結

## 目標

根據 ✨* 知識庫，修正 docs 中的架構衝突，確保文件準備至可開發階段。

## 執行方式

使用 **Sequential-Thinking** 進行分析，使用 **Software-Planning-Tool** 規劃任務，一次只聚焦一份文件進行修改。

---

## 已識別並修正的 6 個核心衝突

### ✅ Conflict #1: 目錄結構混亂

**問題**: `core/` 放在 `src/app/` 下，與 Angular 耦合  
**原則**: Core engine 應該框架無關 (from ✨.md)  
**解決方案**:
- 建議 monorepo 結構 (`packages/`)
- 分離 `core-engine` (框架無關)
- 分離 `saas-domain` (純 TypeScript)
- `ui-angular` 只保留 UI 層

**影響文件**: `docs/03-architecture/README.md`

---

### ✅ Conflict #2: Platform 與 Features 層級混淆

**問題**: platform 和 features 被視為同級  
**原則**: Platform 是 Adapter，不是 Feature (from ✨.md)  
**解決方案**:
- 明確定義 Platform 為技術適配層
- Platform 只提供 WHO (Account) 和 WHERE (Workspace)
- Domain 包含業務邏輯 (WHAT)

**影響文件**: `docs/03-architecture/README.md`

---

### ✅ Conflict #3: 權限分層不明確

**問題**: 未明確區分認證/授權/UI 層  
**原則**: 認證在 platform，授權在 domain，UI 只呈現 (from ✨✨.md)  
**解決方案**:
- Platform Adapter: 驗證身份 (WHO)
- Domain Policy: 業務授權 (WHAT)
- UI Layer: 呈現界面 (SHOW/HIDE)

**新增文件**: `docs/03-architecture/05-authorization-layers.md`

---

### ✅ Conflict #4: 缺少 Account 模型

**問題**: User/Organization 被當作獨立業務實體  
**原則**: Account 是唯一 actor，User/Org/Bot 只是身份來源 (from ✨✨✨.md)  
**解決方案**:
- Account 是唯一業務行為主體
- User/Organization/Bot Identity 是身份來源
- 事件中統一使用 `actorAccountId`

**新增文件**: 
- `docs/04-core-model/05-account-model.md`
- 更新 `docs/04-core-model/README.md`

---

### ✅ Conflict #5: 缺少 Workspace 概念

**問題**: 沒有明確的邏輯容器  
**原則**: Workspace 是業務模組的承載容器，不是 Actor (from ✨✨✨✨✨.md)  
**解決方案**:
- Workspace 定義範圍邊界 (WHERE)
- Workspace 不觸發事件，只作為 `workspaceId` 出現
- Account ↔ Workspace via AccountWorkspaceMembership

**新增文件**: `docs/04-core-model/06-workspace-model.md`

---

### ✅ Conflict #6: 事件模型中的 Actor 定義不一致

**問題**: Event 中使用 `userId/orgId` 而非 `accountId`  
**原則**: 依賴鏈應為 Account → Workspace → Module → Entity (from ✨✨✨✨✨✨✨✨✨.md)  
**解決方案**:
- DomainEvent 介面新增 `actorAccountId` 和 `workspaceId`
- 所有事件目錄使用 AccountId
- 所有 Decision 函數使用 Account 授權

**更新文件**: `docs/04-core-model/README.md`

---

## 修正的文件清單

### 新增文件 (3 個)

1. **`docs/04-core-model/05-account-model.md`**
   - Account 完整定義
   - Account 類型 (UserAccount/OrgAccount/BotAccount)
   - Account vs Identity Source 區別
   - 事件、決策、投影範例

2. **`docs/04-core-model/06-workspace-model.md`**
   - Workspace 完整定義
   - Workspace 不是 Actor 的原則
   - AccountWorkspaceMembership 關係
   - 權限是關係，不是屬性

3. **`docs/03-architecture/05-authorization-layers.md`**
   - 三層授權架構
   - Platform: 認證 (WHO)
   - Domain: 授權 (WHAT)
   - UI: 呈現 (SHOW/HIDE)
   - Anti-patterns 和測試策略

### 重大更新文件 (4 個)

4. **`docs/04-core-model/README.md`**
   - DomainEvent 介面新增 `actorAccountId` 和 `workspaceId`
   - 所有事件目錄改用 AccountId
   - 所有 Decision 函數改用 Account
   - Command 和 DTO 模型更新

5. **`docs/03-architecture/README.md`**
   - 目錄結構建議改為 monorepo
   - Core/Domain 不放在 Angular 下
   - Platform Layer 使用 Account/Workspace
   - 明確 Adapter vs Domain 職責

6. **`docs/dev/consolidated/03-名詞與語言邊界定義.md`**
   - Platform 層術語重新定義
   - Account vs Identity Source 明確區分
   - 新增 Workspace 定義
   - 程式碼命名規範更新
   - 廢棄舊術語 (User/Org/Team/Collaborator)

7. **`docs/dev/consolidated/17-平台層SaaS架構.md`**
   - 完全重寫核心實體定義
   - 替換 User/Org/Team 為 Account/Workspace
   - 新增 AccountWorkspaceMembership
   - 新增認證 vs 授權分離
   - 新增依賴鏈圖解
   - 新增多租戶隔離模式

---

## 核心原則確立

### 1. Account 模型 (from ✨✨✨.md)

```
Account 是唯一的業務行為主體 (Business Actor)
├── UserAccount (人類用戶)
├── OrganizationAccount (組織實體)
└── BotAccount (自動化代理)

User/Organization/Bot Identity = 身份來源，不是業務實體
```

### 2. Workspace 模型 (from ✨✨✨✨✨.md)

```
Workspace 是業務模組的邏輯容器
- 定義範圍邊界 (WHERE)
- 不觸發事件，只作為 workspaceId 出現
- 通過 AccountWorkspaceMembership 關聯 Account
```

### 3. 依賴鏈 (from ✨✨✨✨✨✨✨✨✨.md)

```
Account ──▶ Workspace ──▶ Module ──▶ Entity
  WHO         WHERE        WHAT       STATE
```

**原則**: 每一層只能「往右用」，不能「往左知道」

### 4. 授權分層 (from ✨✨.md)

```
Platform Adapter ──▶ Domain Policy ──▶ UI Layer
   認證 (WHO)         授權 (WHAT)      呈現 (SHOW/HIDE)
```

---

## 術語統一

### ✅ 新標準術語

| 術語 | 定義 | 用途 |
|------|------|------|
| Account | 唯一的業務行為主體 | 觸發事件、被授權、被指派 |
| Workspace | 業務模組的邏輯容器 | 定義範圍、隔離資料 |
| User Identity | Account 的身份來源 | 有登入行為、Email/OAuth |
| Organization Identity | Account 的身份來源 | 不能登入、法律主體 |
| Bot Identity | Account 的身份來源 | API Token、受限權限 |
| AccountWorkspaceMembership | 權限關係 | Account ↔ Workspace |
| actorAccountId | 事件欄位 | 誰觸發的事件 |
| workspaceId | 事件欄位 | 在哪個工作空間 |

### ❌ 已廢棄術語

| 舊術語 | 問題 | 替代方案 |
|--------|------|----------|
| User（用戶）作為業務主體 | 混淆身份與主體 | UserAccount 或 User Identity |
| Organization（組織）作為業務主體 | 混淆身份與主體 | OrganizationAccount 或 Org Identity |
| Team（團隊） | 定義不清 | 待重新定義或移除 |
| Collaborator（協作者） | 只是關係 | AccountWorkspaceMembership |
| userId, orgId | 多種 ID 類型混亂 | 統一使用 actorAccountId |
| createdBy | 欄位名稱不明確 | createdByAccountId |
| assignedTo | 欄位名稱不明確 | assigneeAccountId |

---

## 程式碼命名範例

### ✅ 正確

```typescript
// Event
interface TaskCreatedEvent {
  actorAccountId: string;      // 誰建立的
  workspaceId: string;          // 在哪建立的
  assigneeAccountId: string;    // 指派給誰
}

// Membership
interface AccountWorkspaceMembership {
  accountId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

// Decision
function canCompleteTask(
  actor: { accountId: string },
  task: Task
): boolean {
  return actor.accountId === task.assigneeAccountId;
}
```

### ❌ 錯誤

```typescript
// Event - 不要用 userId/orgId
interface TaskCreatedEvent {
  userId: string;        // ❌ 應該是 actorAccountId
  orgId: string;         // ❌ 應該是 workspaceId
  assignedTo: string;    // ❌ 應該是 assigneeAccountId
}

// Decision - 不要用 User
function canCompleteTask(
  user: User,            // ❌ 應該是 AuthContext
  task: Task
): boolean {
  return user.id === task.assignedTo;  // ❌
}
```

---

## 架構清晰化

### 新的目錄結構建議

```
packages/
├── core-engine/              # 框架無關的核心
│   ├── causality/
│   ├── event-store/
│   ├── aggregates/
│   └── projection/
│
├── saas-domain/              # 純 TypeScript 業務邏輯
│   ├── account/
│   ├── workspace/
│   ├── task/
│   └── payment/
│
├── platform-adapters/        # 技術實作
│   ├── firebase/
│   ├── auth/
│   └── notification/
│
└── ui-angular/               # 只有 UI 層
    └── src/app/
        ├── features/
        └── adapters/
```

### 層級關係

```
┌─────────────────────────────────────────┐
│           UI Layer (Angular)            │
│  - Components, Pages, Routing           │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Platform Adapters (Infrastructure) │
│  - Firebase, Auth, Notification         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      SaaS Domain (Business Logic)       │
│  - Account, Workspace, Task, Payment    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Core Engine (Framework-Agnostic)   │
│  - Event Sourcing, Causality, Projection│
└─────────────────────────────────────────┘
```

---

## 下一步行動建議

### 1. 立即可開發的部分

基於已修正的文件，以下模組可以開始開發：

- ✅ **Account Aggregate**: 已有完整事件、決策、投影定義
- ✅ **Workspace Aggregate**: 已有完整事件、決策、投影定義
- ✅ **AccountWorkspaceMembership**: 已有完整關係模型
- ✅ **Authorization Layers**: 已有清晰的三層架構

### 2. 需要進一步細化的部分

- ⚠️ **Team 模型**: 待重新定義或移除
- ⚠️ **Bot Identity 驗證機制**: 需要更多技術細節
- ⚠️ **Workspace 層級結構**: 是否支援子工作空間？

### 3. 技術實作準備

- [ ] 建立 `packages/` monorepo 結構
- [ ] 分離 Core Engine 到獨立套件
- [ ] 實作 Account Aggregate
- [ ] 實作 Workspace Aggregate
- [ ] 實作授權三層架構
- [ ] 遷移現有代碼到新架構

---

## 總結

**已完成**:
- 6 個核心衝突已全部修正
- 3 個新文件已建立
- 4 個主要文件已更新
- 術語已統一
- 架構已清晰

**成果**:
- 文件準備至可開發階段 ✅
- Account/Workspace 模型完整定義 ✅
- 授權分層架構明確 ✅
- 依賴鏈清晰 ✅

**狀態**: 可以開始開發 🚀

---

**版本**: 1.0  
**完成日期**: 2026-01-01  
**維護者**: Architecture Team
