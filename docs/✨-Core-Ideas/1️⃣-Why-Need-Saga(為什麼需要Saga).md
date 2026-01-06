---

# 🧠 先給你一行定心丸

> **Saga = 用事件串起一連串「可補償」的行為**
> **沒有 Rollback，只有「反向事件」**

---

## 1️⃣ 為什麼你一定需要 Saga

在你現在的世界裡：

```txt
TaskCompleted
  → RewardGranted
      → NotificationSent
```

如果最後一步炸了 💥？

❌ 你不能 DB rollback
❌ 你不能假裝沒發生
❌ 你不能讓系統精神分裂

👉 **你要補償（Compensate）**

---

## 2️⃣ Saga 是什麼角色？

| 東西        | 角色                         |
| --------- | -------------------------- |
| Aggregate | 單一一致性                      |
| Event     | 事實                         |
| Policy    | 即時反應                       |
| **Saga**  | **跨時間、跨 Aggregate 的流程守護者** |

👉 Saga **有狀態**
👉 Policy **沒有狀態**

---

## 3️⃣ 一個真實 Saga 範例（Task Reward）

### 🎬 正常流程

```txt
TaskCompleted
 → RewardGranted
 → NotificationSent
```

### 💥 失敗情境

```txt
RewardGranted
 → NotificationFailed
```

👉 Saga 要介入

---

## 4️⃣ Saga 的狀態長這樣 🧬

```ts
TaskRewardSaga {
  sagaId: 'S-1',
  correlationId: 'C-999',

  taskCompleted: true,
  rewardGranted: true,
  notificationSent: false,

  status: 'compensating'
}
```

---

## 5️⃣ 補償不是「Undo」，是新事件 🔄

### ❌ 錯誤想法

> 把 Reward 刪掉

### ✅ 正確補償

```txt
RewardRevoked
```

---

## 6️⃣ 事件實際長相（你會愛）

```txt
e-1 TaskCompleted
e-2 RewardGranted
e-3 NotificationFailed
e-4 RewardRevoked   ◀️ 補償事件
```

👉 correlationId **全部一樣**

---

## 7️⃣ Saga 實作骨架（精華）

📍 **位置**

```txt
core-engine/
└── causality/
    └── task-reward.saga.ts
```

```ts
export class TaskRewardSaga {
  handle(event: DomainEvent) {
    switch (event.type) {
      case 'TaskCompleted':
        return new GrantRewardCommand({
          correlationId: event.correlationId,
          causedBy: event.eventId
        });

      case 'NotificationFailed':
        return new RevokeRewardCommand({
          correlationId: event.correlationId,
          causedBy: event.eventId
        });
    }
  }
}
```

🔥 Saga 不做事
🔥 Saga **只決定下一步**

---

## 8️⃣ Saga 的生命週期

```txt
START
 │
 │ TaskCompleted
 ▼
RewardGranted
 │
 │ NotificationSent
 ▼
END (Success)
```

或

```txt
RewardGranted
 │
 │ NotificationFailed
 ▼
RewardRevoked
 │
 ▼
END (Compensated)
```

---

## 9️⃣ Saga 跟 Policy 的差異（必背）

|     | Policy | Saga |
| --- | ------ | ---- |
| 有狀態 | ❌      | ✅    |
| 跨時間 | ❌      | ✅    |
| 補償  | ❌      | ✅    |
| 可重播 | ✅      | ✅    |

---

## 🔟 Saga 狀態放哪？

👉 **不是 Aggregate**
👉 **不是 Projection**
👉 **是自己的儲存**

```txt
platform-adapters/
└── firebase/admin/
    └── saga-store/
        └── task-reward.saga.store.ts
```

---

## 1️⃣1️⃣ 防爆鐵律（拜託照做）

✅ Saga 用 correlationId 當主鍵
✅ Saga 永遠 idempotent
✅ 補償事件 ≠ 原事件反轉
✅ 成功與失敗都要有 END 狀態
✅ UI 只看結果，不看 Saga

---

## 1️⃣2️⃣ 一句讓你架構魂爆發的話 😏

> **Saga 不是避免失敗**
> **Saga 是承認失敗、並優雅收尾**
