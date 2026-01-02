---

## **1️⃣ 系統核心結構 (Workspace / Module / Entity)**

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

## **2️⃣ Event-Sourced / Causality-Driven 流程**

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

## **3️⃣ Saga / 長交易設計**

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

## **4️⃣ Projection / Angular Query 映射**

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

## **5️⃣ SaaS / Firebase 整合**

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

## **6️⃣ 命名與規範統一**

| 範疇         | 命名建議                                  |
| ---------- | ------------------------------------- |
| Workspace  | PascalCase（TenantWorkspace）           |
| Module     | PascalCase（TaskModule）                |
| Entity     | PascalCase（TaskEntity）                |
| Event      | 動詞 + 名詞（TaskCreated）                  |
| Command    | 動詞 + 名詞（AssignTask）                   |
| Saga       | PascalCase + Flow（TaskAssignmentSaga） |
| Projection | EntityName + View（TaskListView）       |

---

✅ **完整串接觀點：**

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

這個結構可以同時支持：

* 完整因果追蹤 (`causedByEventId`)
* 多視圖 Projection / Angular Query
* Saga / 長交易 / Saga of Sagas
* Multi-Tenant SaaS 架構
* Firebase Functions 作為後端部署平台
* 命名與規範統一

---
