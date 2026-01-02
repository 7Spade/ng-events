---

# 🧭 Saga 狀態機圖（Task → Reward → Notification）

### 🧠 心法先給你

* **狀態 = 已發生的事實集合**
* **轉移 = 收到 Event**
* **輸出 = 發 Command（不是直接做事）**

---

## 🗺️ Saga 狀態機（ASCII 版，最好記）

```txt
┌──────────────┐
│   START      │
│ (Idle)       │
└──────┬───────┘
       │ TaskCompleted
       ▼
┌────────────────────┐
│ TaskDone            │
│ - taskCompleted ✔   │
│ - rewardGranted ✘   │
│ - notified ✘        │
└──────┬─────────────┘
       │ GrantRewardCommand
       ▼
┌────────────────────┐
│ RewardGranted       │
│ - taskCompleted ✔   │
│ - rewardGranted ✔   │
│ - notified ✘        │
└──────┬─────────────┬───────────────┐
       │ NotificationSent             │ NotificationFailed
       ▼                              ▼
┌────────────────────┐        ┌────────────────────┐
│ COMPLETED ✅        │        │ COMPENSATING ⚠️    │
│ (Happy Path)       │        │                    │
└────────────────────┘        └──────┬─────────────┘
                                     │ RevokeRewardCommand
                                     ▼
                            ┌────────────────────┐
                            │ COMPENSATED 🧹      │
                            │ (End)               │
                            └────────────────────┘
```

---

## 🔁 用「事件」來看狀態轉移（超重要）

| 收到的 Event          | 當前狀態          | 下一狀態          | Saga 動作                 |
| ------------------ | ------------- | ------------- | ----------------------- |
| TaskCompleted      | START         | TaskDone      | 發 `GrantRewardCommand`  |
| RewardGranted      | TaskDone      | RewardGranted | 等通知                     |
| NotificationSent   | RewardGranted | COMPLETED     | 結束                      |
| NotificationFailed | RewardGranted | COMPENSATING  | 發 `RevokeRewardCommand` |
| RewardRevoked      | COMPENSATING  | COMPENSATED   | 結束                      |

👉 **Saga 永遠是 Event-driven**

---

## 🧬 Saga 狀態資料長相（實體）

```ts
TaskRewardSagaState {
  sagaId: string;
  correlationId: string;

  state:
    | 'IDLE'
    | 'TASK_DONE'
    | 'REWARD_GRANTED'
    | 'COMPENSATING'
    | 'COMPLETED'
    | 'COMPENSATED';

  taskId: string;
  userId: string;
}
```

---

## 🧠 Saga Handler（狀態 + 事件）

```ts
handle(event: DomainEvent, state: SagaState) {
  switch (state.state) {
    case 'IDLE':
      if (event.type === 'TaskCompleted') {
        return GrantRewardCommand(...);
      }
      break;

    case 'REWARD_GRANTED':
      if (event.type === 'NotificationFailed') {
        return RevokeRewardCommand(...);
      }
      break;
  }
}
```

👉 **沒有 if-else 地獄**
👉 **只有「狀態 × 事件」**

---

## 🔥 你系統中實際跑起來會是這樣

```txt
[ Event Store ]
      │
      ▼
[ Saga Manager ]
      │  (load saga by correlationId)
      │
      ├─ update state
      └─ emit Command
              │
              ▼
        [ Aggregate ]
              │
              ▼
           New Event
```

**重點**

* Saga 是 **被動的**
* Saga 不拉資料
* Saga 不 poll
* Saga 只等事件敲門 😽

---

## 🚨 防爆設計（一定要）

### 1️⃣ Saga 必須 Idempotent

> 同一個 Event 來兩次，狀態不能亂跳

### 2️⃣ 結束狀態是「吸收態」

```txt
COMPLETED / COMPENSATED
→ 收到任何事件都忽略
```

### 3️⃣ CorrelationId = SagaId

> 一條業務流程一個 Saga

---

## 🖤 一句讓你記一輩子的話

> **Saga 是一個會記仇的流程管理員**
> **事情沒收尾，它不會放你走**

---
