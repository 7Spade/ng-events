---

# 1️⃣ Timeout / Retry / Dead-letter

這三個其實是 Saga 的「三大防爆機制」 🛡️

---

### 🔹 Timeout

**用途：**

* 某個 Saga 長時間沒收到下一個事件，認定可能失敗
* 自動觸發補償或警告

**實作概念：**

```ts
class TaskRewardSaga {
  state: 'REWARD_GRANTED';
  lastUpdated: Date;

  checkTimeout(now: Date) {
    if (this.state === 'REWARD_GRANTED' &&
        now.getTime() - this.lastUpdated.getTime() > 5 * 60 * 1000) {
      // 超過 5 分鐘沒通知 → Dead-letter / Retry
      return new HandleTimeoutCommand({ sagaId: this.sagaId });
    }
  }
}
```

> 核心：Timeout **不改 Aggregate**，只是發 Command 處理下一步。

---

### 🔹 Retry

**用途：**

* 發送 Command 或 Event 處理失敗，可自動重試

```ts
class RetryPolicy {
  maxRetries = 3;
  handle(event, sagaState, attempt = 0) {
    if (attempt < this.maxRetries) {
      return RetryCommand({ ...event.payload, attempt: attempt + 1 });
    } else {
      return DeadLetterCommand({ sagaId: sagaState.sagaId });
    }
  }
}
```

> Saga 永遠保留狀態（retry 次數、lastAttempt）

---

### 🔹 Dead-letter

**用途：**

* 無法完成的 Saga，存進 Dead-letter queue，人工介入或自動補償

```ts
DeadLetterSaga {
  sagaId: 'S-1001',
  correlationId: 'C-999',
  failedAt: Date,
  reason: 'NotificationFailed after 3 retries',
  payload: {...}
}
```

> Dead-letter 是 **最後的安全網**，不影響其他流程。

---

### 🔗 三者結合

```txt
[REWARD_GRANTED] --Timeout--> HandleTimeoutCommand --> RetryCommand x3 --> Dead-letter
```

✅ 可視化狀態機和補償事件都在 Saga 中
✅ Event / Correlation 不變，核心仍然無 SDK

---

# 2️⃣ 多 Saga 串接（Saga of Sagas）

當一條業務流程跨多個 Saga，或多 Aggregate 牽涉多流程時，就需要 **Saga of Sagas** 🧬

---

### 🔹 範例：Task → Payment → Notification → Analytics

```txt
Saga A: TaskRewardSaga
  - TaskCompleted → RewardGranted → NotificationSent

Saga B: AnalyticsSaga
  - RewardGranted → UpdateAnalytics
```

> 兩個 Saga 之間 **不直接呼叫 Aggregate**，靠 **Event + Correlation** 連結

---

### 🔹 Correlation / Causation

```txt
Event: RewardGranted
  correlationId: C-999
  causedBy: e-1 (TaskCompleted)
  -> Saga A: update state
  -> Saga B: trigger UpdateAnalyticsCommand
```

> 多個 Saga 看到同一個 correlationId，可以自行決定是否響應

---

### 🔹 實作概念

```ts
class AnalyticsSaga {
  handle(event: DomainEvent) {
    if (event.type === 'RewardGranted') {
      // 產生新的 Command 給 AnalyticsAggregate
      return new UpdateAnalyticsCommand({ correlationId: event.correlationId });
    }
  }
}
```

> 完全遵守「Event-Driven / Idempotent / 跨 Aggregate 不互相呼叫」原則

---

### 🔹 狀態圖（概念版）

```txt
TaskRewardSaga       AnalyticsSaga
      │                    │
      ▼                    ▼
TaskCompleted            RewardGranted
      │                    │
RewardGranted --------> UpdateAnalytics
      │
NotificationSent
```

> 跨 Saga 只靠 Event + Correlation 流動
> Saga 之間 **完全解耦**

---

# 3️⃣ 核心原則總結

1. **Timeout / Retry / Dead-letter = Saga 防爆三寶**
2. **多 Saga 串接 = Event 是唯一通道，保持解耦**
3. **CorrelationId = 連接整條流程的「線索」**
4. **Causation = 誰生了誰，維護血緣脈絡**
5. **Aggregate 永遠只管自己，Saga 管跨 Aggregate 流程**

---
