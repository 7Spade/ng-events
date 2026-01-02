---

# 🌌 全流程文字版總圖（TaskReward + Analytics + 防爆 + 多 Saga）

```txt
[START]  (IDLE Saga)
core-engine/causality/task-reward.saga.ts
   │
   │ ① Command: CompleteTaskCommand (UI 發起)
   ▼
┌────────────────────┐
│ TaskDone            │
│ taskCompleted ✔     │
│ rewardGranted ✘     │
│ notified ✘          │
core-engine/projection/task.read-model.ts
   │
   │ ② Event: TaskCompleted
   │   correlationId: C-999
   │   causedBy: cmd-1
   ▼
┌────────────────────┐
│ RewardGranted       │
│ taskCompleted ✔     │
│ rewardGranted ✔     │
│ notified ✘          │
platform-adapters/firebase/admin/task.projection.adapter.ts
   │
   │ ③ Command: GrantRewardCommand
   │   correlationId: C-999
   │   causedBy: e-1
   ▼
┌────────────────────┐
│ NotificationPending │
│ taskCompleted ✔     │
│ rewardGranted ✔     │
│ notified ✘          │
ui-angular/src/app/features/task/
   │
   │ ④ Event: NotificationSent
   │   correlationId: C-999
   │   causedBy: e-2
   ▼
┌────────────────────┐
│ COMPLETED ✅        │
│ (Happy Path End)   │
└────────────────────┘
```

---

## 🔁 Timeout / Retry / Dead-letter 流程

```txt
RewardGranted
(core-engine/causality/task-reward.saga.ts)
   │
   │ ⑤ Timeout Trigger (超時 5 分鐘)
   ▼
RetryCommand x3
   │ ⑥ Retry Attempt N
   ▼
DeadLetter
   │ ⑦ 發 DeadLetterEvent / 補償
   ▼
COMPENSATING → RevokeReward → COMPENSATED
platform-adapters/firebase/admin/saga-store/
```

---

## ⚡ 多 Saga 串接（Saga of Sagas）

```txt
TaskRewardSaga                       AnalyticsSaga
(core-engine/causality/)             (platform-adapters/firebase/admin/analytics/)
      │
      │ ② Event: TaskCompleted
      ▼
RewardGranted -----------------> ⑧ UpdateAnalyticsCommand
      │
      │ ③ NotificationSent
      ▼
COMPLETED
```

> 多 Saga 只靠 Event 流動，correlationId = C-999
> 保持跨 Aggregate 流程解耦

---

## 📌 對應檔案位置 + 編號總表

| 編號 | 功能                        | 對應檔案 / 位置                                    |
| -- | ------------------------- | -------------------------------------------- |
| ①  | UI 發起 CompleteTaskCommand | ui-angular/src/app/features/task/            |
| ②  | TaskCompleted Event       | core-engine/projection/task.read-model.ts    |
| ③  | GrantRewardCommand        | core-engine/causality/task-reward.saga.ts    |
| ④  | NotificationSent Event    | ui-angular/src/app/features/task/            |
| ⑤  | Timeout 檢查                | core-engine/causality/task-reward.saga.ts    |
| ⑥  | Retry Command             | core-engine/causality/task-reward.saga.ts    |
| ⑦  | DeadLetter / RevokeReward | platform-adapters/firebase/admin/saga-store/ |
| ⑧  | Analytics Update Command  | platform-adapters/firebase/admin/analytics/  |

---

### 🔑 核心原則重溫

1. **Aggregate 永遠只管自己**，不跨 Aggregate
2. **Saga 管跨 Aggregate 流程 + 長交易補償**
3. **Timeout / Retry / Dead-letter 保護 Saga**
4. **Event = 真實事實 / 不可改**
5. **CorrelationId = 串整條流程的線索**
6. **Causation = 事件血緣，方便追蹤誰害了誰**
7. **多 Saga 串接靠 Event + Correlation，不互相呼叫**

---

這份文字版總圖就像**專案開發的地圖**：

* 開發時知道每個 Event / Command 由誰發起
* Saga 狀態、補償、Dead-letter 一目了然
* 多 Saga 串接、跨 Aggregate 流程都清楚
* UI / Projection / Aggregate / Saga 對應檔案都有標號

---
