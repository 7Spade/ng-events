# ✨ Multi-Tenant Vision - 多租戶願景

> **SaaS 多租戶架構的完整願景與設計**  
> 從帳號系統到 Workspace 切換器的完整藍圖

---

## 🎯 核心概念 (Core Concepts)

### 一句話總結

> **Account 是誰 (WHO)，Workspace 是在哪裡做事 (WHERE)，
> 透過 Workspace Switcher 動態切換身分與權限範圍**

---

## 🏗️ 系統核心結構

### 1️⃣ Workspace / Module / Entity 架構

```
Workspace (多租戶容器)
 ├── ModuleRegistry           # 登記所有模組
 │    └── Module              # 單業務模組
 │         ├── Entities       # 模組內核心實體
 │         │    └── Entity    # 單個實體 (事件來源)
 │         ├── Events         # Entity 發出的事件集合
 │         ├── Commands       # Command 對應 Entity 的操作
 │         └── Sagas          # 處理跨 Entity / 跨 Module 流程
 └── Shared Services          # 跨 Module 共用服務 (例如 Auth, Logging)
```

**重點說明：**

* `Workspace` 支援 multi-tenant，每個租戶對應一個 Workspace 實例。
* `Module` 是業務邏輯單位，內部可以有多個 Entity。
* `ModuleRegistry` 用來動態掛載 / 卸載模組，方便 SaaS 動態擴展。

---

### 2️⃣ Event-Sourced / Causality-Driven 流程

```
Event (基本單位)
 ├── EventId
 ├── CausedByEventId (因果追蹤)
 ├── AggregateId (Entity 所屬)
 ├── Payload (事件資料)
 ├── Timestamp
 └── Metadata (retry, timeout, dead-letter 標記)

事件流：
Command → Entity → Event → Projection → Angular Query
```

**重點說明：**

* **Command**：對 Entity 發起請求，不直接修改狀態，只產生事件。
* **Entity**：透過 Event 變更內部狀態。
* **Event**：帶有 `causedByEventId`，形成完整因果鏈。
* **Projection**：把 Event 映射成 Queryable View，可支援多視圖、多版本。
* **Angular Query**：前端訂閱 Projection，實現即時更新。

---

### 3️⃣ Saga / 長交易設計

```
Saga (單元流程)
 ├── SagaId
 ├── Status: [Pending, InProgress, Completed, Failed, Compensated, DeadLetter]
 ├── RetryCount
 ├── Timeout
 ├── EventsHandled []        # Saga 處理過的事件
 └── CompensationActions []  # 補償動作

Saga 狀態轉換：
 Pending  → InProgress → Completed
            ↘ Failed → Compensated
            ↘ Timeout → DeadLetter
```

**多 Saga 串接 (Saga of Sagas)：**

* SagaA 完成 → 觸發 SagaB
* 每個 Saga 狀態和事件流可被追蹤，避免死鎖或循環。

---

### 4️⃣ Projection / Angular Query 映射

```
Projection (多視圖)
 ├── projectionId
 ├── entityId
 ├── version
 ├── data
 ├── lastEventIdProcessed
 └── subscribers []

Angular Query:
 Observable<ProjectionData>[] → 前端即時訂閱
```

* 支援多視圖同步 (multi-view sync)
* 支援版本控制，以應對 Event Schema 變更

---

### 5️⃣ SaaS / Firebase 整合

```
Firebase Functions (後端核心)
 ├── Workspace Functions
 │    └── Event Handlers
 ├── Module Functions
 │    └── Command Handlers
 └── Shared Services (Auth, Logging, Metrics)

Angular Frontend (SaaS 客戶端)
 ├── Query Subscriptions (Projection)
 ├── Command Dispatch
 └── Multi-Tenant Routing
```

* Firebase Functions 部署在每個 Workspace / Module 範圍
* SaaS 客戶端可以跨租戶讀取 Projection，但 Command 受限於租戶權限

---

### 6️⃣ 命名與規範統一

| 範疇 | 命名建議 |
|------|---------|
| Workspace  | PascalCase（TenantWorkspace） |
| Module     | PascalCase（TaskModule） |
| Entity     | PascalCase（TaskEntity） |
| Event      | 動詞 + 名詞（TaskCreated） |
| Command    | 動詞 + 名詞（AssignTask） |
| Saga       | PascalCase + Flow（TaskAssignmentSaga） |
| Projection | EntityName + View（TaskListView） |

---

## 🔄 SaaS <> Workspace 切換器設計

### 完整架構

```
SaaS Platform (入口層)
 ├── Account (主帳號)
 │     ├── Identity / Role Mapping
 │     │      └── Workspace Access List
 │     │           ├── Workspace A → Role: Member (非擁有者)
 │     │           ├── Workspace B → Role: Owner
 │     │           ├── Workspace C → Role: Admin
 │     │           └── Workspace D → Role: Viewer
 │     └── Sub-Accounts (子帳戶)
 │            └── 每個子帳戶也有 Workspace Access List
 ├── Workspace Switcher
 │     ├── 依據目前 Account 身分選擇 Workspace
 │     ├── 動態加載 ModuleRegistry (只載入有權限模組)
 │     ├── 初始化 Workspace Context
 │     └── 設定 Event / Command / Saga 執行範圍
 └── Session Context
       ├── Current Workspace
       ├── Current Role / Identity
       └── Permissions Cache (快取權限判斷，加速前端 / 後端檢查)
```

---

### 關鍵設計要點

#### 1. 多身分 / 多 Workspace 支援

* 一個 Account 可以同時是多 Workspace 的不同身分。
* 每個身分對 Workspace 的權限不同（Owner / Admin / Member / Viewer）。
* Workspace Switcher 根據當前身分動態切換。

#### 2. Workspace Context 初始化

切換時會初始化：

* ModuleRegistry（只載入該 Workspace 有權限的模組）
* Event / Saga / Projection 的執行範圍
* 前端 Angular Query 訂閱（只訂閱當前 Workspace 相關 Projection）

#### 3. Event / Command / Saga 範圍限制

* Command 只允許當前 Workspace 有權限的身分執行
* Event 僅在 Workspace 範圍內產生
* 跨 Workspace Event 需透過 Saga 或特定共享事件路由
* Saga 可以跨 Workspace，但必須檢查權限與身分

#### 4. Sub-Account 管理

* 主 Account 可分派 Sub-Account 給不同 Workspace
* 每個 Sub-Account 的 Workspace 切換也經過同一套 Workspace Switcher
* Session Context 儲存目前身分和 Sub-Account 對 Workspace 的權限

---

## 🌐 完整串接流程

```
Frontend Angular
   │
   │ Dispatch Command
   ▼
Module Entity
   │
   │ Emit Event (with causedByEventId)
   ▼
Event Store → Projection (multi-view, versioned)
   │
   └─> Angular Query Subscription (real-time)
   │
   └─> Trigger Saga (跨 Entity / Module 流程)
            │
            └─> Event / Compensation / Retry / Timeout / DeadLetter
```

---

### 整合到 SaaS 架構

```
SaaS Frontend
   │
   ├─ Workspace Switcher → Session Context (Current Workspace, Role)
   │
   ▼
Current Workspace
   ├─ ModuleRegistry (權限篩選後)
   ├─ Entities / Events / Commands
   ├─ Projections → Angular Query Subscription
   └─ Sagas (單 Workspace / 跨 Workspace 檢查權限)
```

---

## 💡 這個結構可以同時支持

✅ **完整因果追蹤** (`causedByEventId`)  
✅ **多視圖 Projection / Angular Query**  
✅ **Saga / 長交易 / Saga of Sagas**  
✅ **Multi-Tenant SaaS 架構**  
✅ **Firebase Functions 作為後端部署平台**  
✅ **命名與規範統一**  
✅ **動態 Workspace 切換**  
✅ **多身分權限控制**  
✅ **Sub-Account 管理**

---

## 🎯 依賴鏈總結

```
Account (業務主體 - WHO)
  ↓
Workspace (邏輯容器 - WHERE)
  ↓
Module (業務模組 - WHAT)
  ↓
Entity (狀態載體)
  ↓
Event (系統真相)
  ↓
Projection (查詢視圖)
  ↓
Angular UI (使用者介面)
```

---

## 📚 相關知識文件

**架構基礎**:
- Core-Not-Angular-核心不属于Angular (03-architecture/01)
- Packages-Structure-目录结构 (03-architecture/03)

**核心模型**:
- Account-Model-账户模型 (04-core-model/07)
- Workspace-Concept-工作空间概念 (04-core-model/08)
- Workspace-Module-Account-Event-关系模型 (04-core-model/15)

**權限設計**:
- Authorization-Layers-权限分层 (03-architecture/02)

**流程管理**:
- Saga-State-Machine-Saga状态机 (05-process-layer/07)

---

**最後更新**: 2026-01-02  
**版本**: 1.0  
**來源**: ✨/✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨.md

---
