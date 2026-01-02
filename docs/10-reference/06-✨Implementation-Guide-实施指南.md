---

# 🌌 TaskReward + Analytics Saga 流程圖（箭頭標號版）

```txt
[START]  (IDLE)
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
│ NotificationSent    │
│ taskCompleted ✔     │
│ rewardGranted ✔     │
│ notified ✔          │
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

## 🔁 Timeout / Retry / Dead-letter 標號版

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

## ⚡ 多 Saga 串接（Saga of Sagas）標號版

```txt
TaskRewardSaga                     AnalyticsSaga
(core-engine/causality/)           (platform-adapters/firebase/admin/analytics/)
      │
      │ ② Event: TaskCompleted
      ▼
RewardGranted -----------------> ⑧ UpdateAnalyticsCommand
      │
      │ ③ NotificationSent
      ▼
COMPLETED
```

> 多 Saga 只靠 Event 流動
> correlationId = C-999，整條流程保持一致

---

## 📌 對應檔案位置總表（箭頭對應）

| 編號 | 功能                        | 對應檔案 / 位置                                    |
| -- | ------------------------- | -------------------------------------------- |
| ①  | UI 發起 Command             | ui-angular/src/app/features/task/            |
| ②  | TaskCompleted Event       | core-engine/projection/task.read-model.ts    |
| ③  | GrantRewardCommand        | core-engine/causality/task-reward.saga.ts    |
| ④  | NotificationSent Event    | ui-angular/src/app/features/task/            |
| ⑤  | Timeout                   | core-engine/causality/task-reward.saga.ts    |
| ⑥  | Retry Command             | core-engine/causality/task-reward.saga.ts    |
| ⑦  | DeadLetter / RevokeReward | platform-adapters/firebase/admin/saga-store/ |
| ⑧  | Analytics Command         | platform-adapters/firebase/admin/analytics/  |

---

💡 **好處**：

1. 每個箭頭都是事件或命令，對應檔案清楚
2. 開發時知道哪裡要用 correlationId / causedBy
3. Timeout / Retry / Dead-letter / 多 Saga 都看得一目了然
4. UI / Projection / Aggregate / Saga 全部分層明確

---
