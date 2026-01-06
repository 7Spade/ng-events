# Research Note: Account-Workspace-Module-Entity Architecture

**Date**: 2026-01-06  
**Status**: Implementation Complete - Phase 1  
**Related Issue**: Account → Workspace → Module → Entity skeleton implementation

## Problem Statement

需要建立清晰的架構骨架，定義 Account（誰）、Workspace（在哪）、Module（做什麼）、Entity（狀態）之間的關係。

關鍵需求：
- Account(User/Org/Bot) 為來源，Workspace 是邊界（blueprintId）
- Module/Entity 只往右用，不回讀左側
- Organization 是獨立於 Workspace 的上層，不把 Org 當 Workspace
- 優先起 Account 層（含 Organization/Team/Bot）與 Workspace、Module gating 的指令/事件 stub

## Architecture Decision

### 核心概念

```
Account (誰) → Workspace (在哪) → Module (做什麼) → Entity (狀態...)
```

1. **Account 層**：
   - 統一的業務實體，包含 User/Organization/Bot 三種類型
   - User：可登入、有 email、人類介面
   - Organization：不能直接登入、群組容器、由 User 管理
   - Bot：無 UI、token-based、窄權限
   - **重點**：Organization 是 Account type，不是 Workspace

2. **Workspace 層**：
   - blueprintId 多租戶邊界
   - 追蹤啟用的 modules
   - 不知道 module 內部細節
   - 由 Account 擁有

3. **Module 層**：
   - 外掛式功能模組
   - 宣告依賴（requires: []）
   - 被動式初始化（監聽事件）
   - 只讀取 Workspace context，不修改

4. **Entity 層**：
   - 各 Module 的 domain entities
   - 限制在 blueprintId 範圍
   - 未來階段實作

### Event Sourcing 設計

**Causality Metadata（必要）**：
```typescript
{
  causedBy: string;        // 父事件/命令 ID
  causedByUser: string;    // accountId（觸發者）
  causedByAction: string;  // 動作描述
  blueprintId?: string;    // Workspace 邊界（Account 創建時可為空）
  timestamp: string;       // ISO 8601
}
```

**架構限制**：
1. Organization ≠ Workspace（Organization 是 Account 類型）
2. 單向依賴（Module → Workspace 只讀，不可逆）
3. blueprintId 邊界（所有 workspace-scoped 資料必須包含）
4. Account 統一（User/Org/Bot 是 metadata 變體，非獨立實體）
5. 事件驅動 module 啟用（為了 audit trail）

## Implementation Details

### Core-Engine (Event Sourcing 基礎)
- ✅ `DomainEvent`: 包含 causality metadata
- ✅ `Command`: 包含 actor context
- ✅ `AggregateRoot`: Event sourcing pattern
- ✅ `EventStore`: Interface for persistence
- ✅ `ProcessManager`: Saga 基礎

### Account-Domain
- ✅ `Account` aggregate:
  - User/Organization/Bot 統一實體
  - Commands: Create, Update, Suspend, Reactivate, Delete
  - Events: AccountCreated, AccountUpdated, etc.
  - Metadata validation per type
  
- ✅ `Workspace` aggregate:
  - blueprintId 邊界強制
  - Module enablement tracking
  - Commands: Create, Update, EnableModule, DisableModule, Suspend, Archive
  - Events: WorkspaceCreated, ModuleEnabled, etc.

### SaaS-Domain (Module System)
- ✅ `ModuleManifest`: 模組宣告
- ✅ `ModuleRegistry`: 依賴驗證
- ✅ Predefined modules:
  - Task (無依賴)
  - Issue (需要 Task)
  - Payment (獨立)
  - Analytics (需要 Task)

## Key Insights

### 1. Organization 不是 Workspace
**錯誤理解**：
```
Organization
  ├── Workspace 1
  └── Workspace 2
```

**正確理解**：
```
Account(type=organization, id=acc_org_123)
  └── owns → Workspace(ownerId=acc_org_123, blueprintId=wks_456)
```

Organization 是 Account 的一種類型，不是 Workspace 的容器。

### 2. Module 依賴單向性
Module 可以：
- 讀取 Workspace.blueprintId
- 檢查 Workspace.enabledModules
- 監聽 ModuleEnabled event

Module 不可以：
- 修改 Workspace 狀態
- 直接讀取 Account 資料
- 觸發 Workspace 命令

### 3. blueprintId 邊界強制
所有 workspace-scoped 查詢必須包含 blueprintId：

```typescript
// ❌ 錯誤
const tasks = await firestore.collection('tasks').get();

// ✅ 正確
const tasks = await firestore
  .collection('tasks')
  .where('blueprintId', '==', currentBlueprintId)
  .get();
```

### 4. Event Causality 追蹤
每個事件都追蹤因果關係：

```
CreateWorkspaceCommand (commandId: cmd_123)
  └─> WorkspaceCreated (causedBy: cmd_123, causedByUser: acc_456)
       └─> ModuleEnabled (causedBy: evt_workspace_created, causedByUser: acc_456)
```

## Testing Strategy

### Unit Tests (待實作)
- Account aggregate: Create, Update, Suspend, Delete
- Workspace aggregate: Create, EnableModule, DisableModule
- ModuleRegistry: Dependency validation

### Integration Tests (待實作)
- Account → Workspace flow
- Workspace → Module enablement flow
- Event causality chain validation

## Future Work

### Phase 2: Membership & Teams
- Team aggregate (團隊容器)
- Membership aggregate (Account ↔ Workspace 關係)
- Role-based access (admin, member, viewer)

### Phase 3: ACL System
- Permission model
- Role definitions
- Integration with @delon/acl

### Phase 4: Entity Layer
- Task domain
- Issue domain
- Payment domain
- Entity-level causality

### Phase 5: Infrastructure
- Firestore EventStore adapter
- Event bus implementation
- Projection builders
- Read model synchronization

## Conclusion

架構骨架已完成，確保：
1. ✅ Account/Workspace/Module 清晰分層
2. ✅ Organization 作為 Account type，非 Workspace
3. ✅ blueprintId 邊界強制
4. ✅ 單向依賴規則
5. ✅ Event sourcing + Causality tracking
6. ✅ Module 依賴驗證機制

所有筆記與任務一致，無衝突。

## References
- Architecture Document: `/docs/architecture/account-workspace-module-entity.md`
- Core-Engine: `/packages/core-engine/`
- Account-Domain: `/packages/account-domain/`
- SaaS-Domain: `/packages/saas-domain/`

// END OF FILE
