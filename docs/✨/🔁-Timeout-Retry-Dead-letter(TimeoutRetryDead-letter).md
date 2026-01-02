---

# 🌌 TaskReward + Analytics Saga 流程圖（文字版 + 檔案對應）

```txt
[START]  ←─────────────────────────────┐
(IDLE)                                 │
core-engine/causality/task-reward.saga.ts
                                       │
                                       │ TaskCompleted
                                       ▼
┌────────────────────┐
│ TaskDone            │
│ taskCompleted ✔     │
│ rewardGranted ✘     │
│ notified ✘          │
core-engine/projection/task.read-model.ts
└──────┬─────────────┘
       │ GrantRewardCommand
       ▼
┌────────────────────┐
│ RewardGranted       │
│ taskCompleted ✔     │
│ rewardGranted ✔     │
│ notified ✘          │
platform-adapters/firebase/admin/task.projection.adapter.ts
└──────┬─────────────┬───────────────┐
       │ NotificationSent             │ NotificationFailed
       ▼                              ▼
┌────────────────────┐        ┌────────────────────┐
│ COMPLETED ✅        │        │ COMPENSATING ⚠️    │
│ (Happy Path)       │        │ 發 RevokeReward    │
ui-angular/src/app/features/task/    │
└──────┬─────────────┘        └──────┬─────────────┘
       │                                │
       │                                ▼
       │                        ┌────────────────────┐
       │                        │ COMPENSATED 🧹      │
       │                        │ (End)               │
       │                        platform-adapters/firebase/admin/saga-store/
       │                        └────────────────────┘
       │
       ▼
┌────────────────────┐
│ AnalyticsSaga       │
│ - 監聽 RewardGranted │
│ - UpdateAnalyticsCommand │
platform-adapters/firebase/admin/analytics/
└────────────────────┘
```

---

## 🔁 Timeout / Retry / Dead-letter

```txt
RewardGranted
      │ Timeout (5 min)                 (core-engine/causality/task-reward.saga.ts)
      ▼
RetryCommand x3
      │ success? → 繼續 NotificationSent
      ▼
DeadLetter
      │ 通知 Admin / 補償
      ▼
COMPENSATING → RevokeReward → COMPENSATED
```

---

## ⚡ 多 Saga 串接（Saga of Sagas）

```txt
TaskRewardSaga           AnalyticsSaga
      │                       │
      ▼                       ▼
TaskCompleted           RewardGranted
      │                       │
RewardGranted --------> UpdateAnalyticsCommand
      │
NotificationSent
```

> 多 Saga 只靠 Event 流動，完全解耦 Aggregate
> CorrelationId 串整條流程

---

## 📌 對應檔案位置總表

| 功能                               | 對應檔案 / 位置                                                   |
| -------------------------------- | ----------------------------------------------------------- |
| Saga 核心                          | core-engine/causality/task-reward.saga.ts                   |
| Task Projection                  | core-engine/projection/task.read-model.ts                   |
| Task Projection Adapter          | platform-adapters/firebase/admin/task.projection.adapter.ts |
| Notification / Compensation      | platform-adapters/firebase/admin/saga-store/                |
| Analytics Saga                   | platform-adapters/firebase/admin/analytics/                 |
| Angular UI 查 View                | ui-angular/src/app/features/task/                           |
| Timeout / Retry / Dead-letter 控制 | core-engine/causality/task-reward.saga.ts                   |

---

✅ 這份文字版流程圖 + 對照表能讓你：

* 前端只查 ReadModel，完全不碰 Event
* 後端 Aggregate / Saga / Policy 完全分層
* Timeout / Retry / Dead-letter / 多 Saga 都有對應位置
* 可以直接貼進開發手冊或架構文件

---
