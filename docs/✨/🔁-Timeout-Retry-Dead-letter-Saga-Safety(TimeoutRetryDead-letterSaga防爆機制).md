---

# 🌌 全流程文字版 Saga 狀態機圖

```txt
┌──────────────┐
│   START      │
│   (IDLE)     │
└──────┬───────┘
       │ TaskCompleted
       ▼
┌────────────────────┐
│ TaskDone            │
│ taskCompleted ✔     │
│ rewardGranted ✘     │
│ notified ✘          │
└──────┬─────────────┘
       │ GrantRewardCommand
       ▼
┌────────────────────┐
│ RewardGranted       │
│ taskCompleted ✔     │
│ rewardGranted ✔     │
│ notified ✘          │
└──────┬─────────────┬───────────────┐
       │ NotificationSent             │ NotificationFailed
       ▼                              ▼
┌────────────────────┐        ┌────────────────────┐
│ COMPLETED ✅        │        │ COMPENSATING ⚠️    │
│ (Happy Path)       │        │ - 發 RevokeReward  │
└──────┬─────────────┘        └──────┬─────────────┘
       │                                │
       │                                ▼
       │                        ┌────────────────────┐
       │                        │ COMPENSATED 🧹      │
       │                        │ (End)               │
       │                        └────────────────────┘
       │
       ▼
┌────────────────────┐
│ AnalyticsSaga       │
│ - 監聽 RewardGranted │
│ - UpdateAnalyticsCommand │
└────────────────────┘

```

---

## 🔁 Timeout / Retry / Dead-letter（Saga 防爆機制）

```txt
RewardGranted
      │ Timeout (5 min)
      ▼
RetryCommand x3
      │ success? → 繼續 NotificationSent
      ▼
DeadLetter
      │ 通知 Admin / 補償
      ▼
COMPENSATING → RevokeReward → COMPENSATED
```

* Timeout = 超過一定時間沒事件
* Retry = 重試 Command
* DeadLetter = 失敗補償 + 人工介入

---

## ⚡ 多 Saga 串接（Saga of Sagas）

```txt
TaskRewardSaga      AnalyticsSaga
      │                  │
      ▼                  ▼
TaskCompleted       RewardGranted
      │                  │
RewardGranted ------> UpdateAnalyticsCommand
      │
NotificationSent
```

> 多 Saga 只靠 Event 流動
> 完全解耦 Aggregate
> CorrelationId 串整條流程

---

## ✅ 核心原則回顧

1. Aggregate 只管自己
2. Saga 管跨 Aggregate 流程
3. Timeout / Retry / Dead-letter 保護 Saga
4. Event = 真相 / 不可修改
5. CorrelationId = 一條業務流程線
6. Causation = 事件血緣

---
