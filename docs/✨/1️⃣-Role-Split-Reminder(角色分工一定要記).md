---

# 🌉 什麼叫「跨 Aggregate 的因果流」

一句話版本：

> **一個 Aggregate 發生的事件，
> 引發「另一個 Aggregate」產生新事件，
> 但它們不互相呼叫、不互相依賴。**

👉 靠的就是 **Event + Causation / Correlation**

---

## 1️⃣ 角色分工（一定要先記）

| 角色                       | 做什麼        |
| ------------------------ | ---------- |
| Aggregate                | 只管「自己是否合法」 |
| Event                    | 描述「事實」     |
| Policy / Process Manager | 聽事件、決定下一步  |
| Causation                | 誰生了誰       |
| Correlation              | 同一條業務流程    |

**⚠️ 關鍵**

> Aggregate **不能**直接操作另一個 Aggregate

---

## 2️⃣ 經典範例（Task → Payment → Notification）

我們來一條你未來一定會用到的流程 💋

### 🎬 使用者完成任務

```txt
TaskAggregate
└── TaskCompleted
```

### 🎬 系統自動發獎勵

```txt
PaymentAggregate
└── RewardGranted
```

### 🎬 系統通知使用者

```txt
NotificationAggregate
└── NotificationSent
```

三個 Aggregate
**完全不認識彼此**

---

## 3️⃣ 實際事件鍊（重點來了 😽）

```txt
Command: CompleteTask (cmd-1)
  │
  ▼
Event e-1: TaskCompleted
  aggregateId: task-1
  correlationId: C-999
  causedBy: cmd-1
```

🔥 **跨 Aggregate 開始**

```txt
Event e-2: RewardGranted
  aggregateId: payment-88
  correlationId: C-999
  causedBy: e-1
```

```txt
Event e-3: NotificationSent
  aggregateId: notify-5
  correlationId: C-999
  causedBy: e-2
```

---

## 4️⃣ 關鍵角色：Policy / Process Manager 🧠

📍 **位置**

```txt
core-engine/
└── causality/
    └── task-reward.policy.ts
```

```ts
// task-reward.policy.ts
export class TaskRewardPolicy {
  handle(event: DomainEvent) {
    if (event.type !== 'TaskCompleted') return;

    return new GrantRewardCommand({
      taskId: event.aggregateId,
      userId: event.payload.completedBy,
      correlationId: event.correlationId,
      causedBy: event.eventId,
    });
  }
}
```

👉 它：

* 聽 **Task 的事件**
* 發 **Payment 的 Command**
* 不碰 DB
* 不碰 SDK

---

## 5️⃣ Command 是「跨 Aggregate 的信使」📨

```ts
GrantRewardCommand {
  commandId: 'cmd-2',
  targetAggregate: 'Payment',
  correlationId: C-999,
  causedBy: e-1
}
```

👉 PaymentAggregate 收到後才自己決定能不能發 `RewardGranted`

---

## 6️⃣ 為什麼一定要這樣「繞一圈」

### ❌ 錯誤做法

```ts
task.complete();
payment.grantReward(); // 🚨 爆炸
```

### ✅ 正確做法

```txt
TaskCompleted → Policy → GrantRewardCommand → RewardGranted
```

**好處：**

* 可回放
* 可測試
* 可插 AI
* 可加新流程不動舊 Aggregate

---

## 7️⃣ Projection 怎麼跟？

Projection 只看 Event，不管 Aggregate 👀

```ts
if (event.type === 'TaskCompleted') { ... }
if (event.type === 'RewardGranted') { ... }
```

UI 只查：

```txt
taskViews/
rewardViews/
notificationViews/
```

---

## 8️⃣ 防爆守則（請照貼）

✅ Aggregate 只改自己
✅ 跨界一定靠 Event
✅ Command 是唯一跨門票
✅ Policy 無狀態、可重播
✅ Correlation 永遠往下傳

---

## 9️⃣ 一句騷但專業的總結 😏

> **Aggregate 是孤島**
> **Event 是海浪**
> **Policy 是洋流**
> **Correlation 是航線**
