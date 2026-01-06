---

# 🌌 全套文字版流程表格（TaskReward + Analytics + Timeout/Retry/Dead-letter + 多 Saga）

| 步驟 | Event / Command                               | Saga 狀態                    | 補償 / Dead-letter              | CorrelationId / causedBy                     | 對應檔案 / 位置                                                   |
| -- | --------------------------------------------- | -------------------------- | ----------------------------- | -------------------------------------------- | ----------------------------------------------------------- |
| ①  | Command: CompleteTaskCommand                  | IDLE → TaskDone            | ❌                             | correlationId: C-999 / causedBy: UI cmd-1    | ui-angular/src/app/features/task/                           |
| ②  | Event: TaskCompleted                          | TaskDone                   | ❌                             | correlationId: C-999 / causedBy: cmd-1       | core-engine/projection/task.read-model.ts                   |
| ③  | Command: GrantRewardCommand                   | TaskDone → RewardGranted   | ❌                             | correlationId: C-999 / causedBy: e-1         | core-engine/causality/task-reward.saga.ts                   |
| ④  | Event: RewardGranted                          | RewardGranted              | Timeout / Retry / Dead-letter | correlationId: C-999 / causedBy: e-2         | platform-adapters/firebase/admin/task.projection.adapter.ts |
| ⑤  | Event: NotificationSent                       | COMPLETED                  | ❌                             | correlationId: C-999 / causedBy: e-3         | ui-angular/src/app/features/task/                           |
| ⑥  | Timeout Trigger                               | RewardGranted              | RetryCommand / Dead-letter    | correlationId: C-999 / causedBy: Saga timer  | core-engine/causality/task-reward.saga.ts                   |
| ⑦  | RetryCommand Attempt N                        | RewardGranted              | Dead-letter after max retries | correlationId: C-999 / causedBy: Saga retry  | core-engine/causality/task-reward.saga.ts                   |
| ⑧  | DeadLetterEvent → RevokeReward                | COMPENSATING → COMPENSATED | ✅ 補償事件                        | correlationId: C-999 / causedBy: Saga failed | platform-adapters/firebase/admin/saga-store/                |
| ⑨  | Event: RewardGranted → UpdateAnalyticsCommand | AnalyticsSaga              | ❌                             | correlationId: C-999 / causedBy: e-2         | platform-adapters/firebase/admin/analytics/                 |

---

## 🔑 核心原則與對照

1. **Aggregate 永遠只管自己**
2. **Saga 管跨 Aggregate 流程 + 長交易補償**
3. **Timeout / Retry / Dead-letter 保護 Saga**
4. **Event = 真實事實 / 不可改**
5. **CorrelationId = 串整條流程的線索**
6. **Causation = 事件血緣，方便追蹤誰害了誰**
7. **多 Saga 串接靠 Event + Correlation，不互相呼叫**

---

這張表格的優勢：

* **開發者對照表**：知道每個事件 / 命令要去哪個檔案
* **測試設計對照表**：可以直接用 correlationId / causedBy 模擬流程
* **補償策略清楚**：Timeout、Retry、Dead-letter 都標明
* **多 Saga 流程明晰**：AnalyticsSaga 也整合進來

---
