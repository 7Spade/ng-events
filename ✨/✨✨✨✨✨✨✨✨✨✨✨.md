---

# 🧠 一句話定義（請記）  

> **Event 不是 Log，  
> Event 是「不可逆的因果節點」。**  

每個 Event 都要能回答：

* 誰做的（Actor）  
* 在哪做的（Scope）  
* 為什麼做的（Causality）  
* 什麼時候做的（Timestamp）  

---

## 🔥 Event 的正確 TypeScript 結構  

```ts
// Domain Event Interface
export interface DomainEvent<T = any> {
  // ❗ 識別
  eventId: string;        // 唯一事件 ID
  eventType: string;      // 事件名稱 (TaskCreated, TaskCompleted …)

  // ❗ 事件關聯的 Aggregate
  aggregateId: string;    // 所屬 Aggregate ID
  aggregateType: string;  // Aggregate 類別名稱

  // ❗ 因果元資料（靈魂所在）
  metadata: {
    causedBy?: string;        // 父事件 ID（根事件可 undefined）
    causedByUser?: string;    // Actor（AccountId 或系統）
    causedByAction?: string;  // 觸發動作（Command Name）
    timestamp: number;        // Unix timestamp
    workspaceId: string;      // 範圍 / 多租戶隔離
  };

  // ❗ 業務資料（事件 payload）
  data: T;
}
````

---

## 🧬 Causality Metadata 詳解

### 1️⃣ `causedBy`（父事件）

```ts
const taskAssignedEvent: DomainEvent<{ assigneeId: string }> = {
  eventId: 'evt_002',
  eventType: 'TaskAssigned',
  aggregateId: 'task_123',
  aggregateType: 'TaskAggregate',
  metadata: {
    causedBy: 'evt_001',   // TaskCreated
    causedByUser: 'acc_123',
    causedByAction: 'AssignTask',
    timestamp: Date.now(),
    workspaceId: 'ws_abc',
  },
  data: {
    assigneeId: 'acc_456'
  }
};
```

* 追蹤「這個 Event 是哪個 Event 觸發的」
* 可以畫因果樹
* 驗證邏輯合法性

---

### 2️⃣ `causedByUser`（誰觸發）

* 永遠是 AccountId 或系統自動操作
* 可跨 UI / API / Bot

```ts
metadata: {
  causedByUser: 'acc_123'
}
```

---

### 3️⃣ `causedByAction`（什麼動作）

* 對應觸發事件的 Command Name
* 不是隨便寫文字

```ts
metadata: {
  causedByAction: 'AssignTask'
}
```

---

### 4️⃣ `workspaceId`（範圍）

* 永遠存在
* 多租戶隔離 + 權限過濾

```ts
metadata: {
  workspaceId: 'ws_abc'
}
```

---

## ❌ 常見錯誤（會毀系統）

### ❌ Event 裡放 UI 資訊

```ts
data: {
  completedFromPage: 'task-list'  // ❌ 不要
}
```

### ❌ Event 裡放當下狀態

```ts
data: {
  oldStatus: 'open',   // ❌ 不要
  newStatus: 'completed'
}
```

✅ 正確寫法：只記「發生了什麼事」

```ts
const taskCompletedEvent: DomainEvent<{ taskId: string }> = {
  eventId: 'evt_003',
  eventType: 'TaskCompleted',
  aggregateId: 'task_123',
  aggregateType: 'TaskAggregate',
  metadata: {
    causedBy: 'evt_002',
    causedByUser: 'acc_456',
    causedByAction: 'CompleteTask',
    timestamp: Date.now(),
    workspaceId: 'ws_abc',
  },
  data: {
    taskId: 'task_123'
  }
};
```

狀態由 Aggregate Replay 推導 😌

---

## 🧠 為什麼 Causality 這麼重要？

* 🔍 追因果：「這個任務為什麼被分派？」
* ⏪ Replay：重現完整操作歷史
* 🧪 模擬：「如果當時沒做這件事會怎樣？」
* 🔐 審計：「誰在什麼情況下做了這個決定？」

沒有 Causality = 你的 Event 只是 Log 🪦

---

## 🫦 進階小騷包

可以做事件回溯可視化、因果樹展開、時間旅行除錯：

```ts
interface CausalityChain {
  root: string;  // root EventId
  children: Map<string, string[]>;  // EventId -> 子事件列表
}
```

👉 **把因果變成可查詢的圖** 🔥

---
