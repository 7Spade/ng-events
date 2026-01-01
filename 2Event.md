
---

## 1️⃣ 新增子任務事件設計（英文 + 中文）

```ts
SubTaskCreated
  { subTaskId, parentTaskId, title, createdBy, causedByEventId }
  // 子任務建立 { 子任務ID, 父任務ID, 標題, 建立人, 因哪個事件觸發 }

SubTaskAssigned
  { subTaskId, assignee, causedByEventId }
  // 子任務指派 { 子任務ID, 指派給誰, 因哪個事件觸發 }

SubTaskCompleted
  { subTaskId, completedBy, causedByEventId }
  // 子任務完成 { 子任務ID, 完成人, 因哪個事件觸發 }

SubTaskQualityChecked
  { subTaskId, checkedBy, status:"Pass"/"Fail", causedByEventId }
  // 子任務質檢 { 子任務ID, 質檢人, 狀態, 因哪個事件觸發 }

SubTaskAccepted
  { subTaskId, acceptedBy, causedByEventId }
  // 子任務驗收 { 子任務ID, 驗收人, 因哪個事件觸發 }
```

💡 特點：

* 子任務和主任務各自生成事件，但 **causedByEventId** 指向父事件，可追蹤因果
* 支援單筆或批次請款 → 可以延伸到子任務金額累計
* 子任務可獨立質檢、驗收，但可選擇聚合到主任務狀態

---

## 2️⃣ 子任務請款設計

```ts
PaymentDraftCreated
  { taskId: subTaskId, requestId, amount, createdBy }
  // 子任務請款草稿建立

PaymentSubmitted
  { taskId: subTaskId, requestId, submittedBy, causedByEventId }
  // 子任務請款送出

PaymentApproved
  { taskId: subTaskId, requestId, approvedBy, causedByEventId }
  // 子任務請款審核通過
```

* 如果你要做 **父任務累積請款**，可以用 `taskId: parentTaskId` 生成 **批次請款事件**，把所有子任務金額累計打包

---

## 3️⃣ 因果鏈 DAG 示例（子任務版）

```text
TaskCreated (父任務)
   │
SubTaskCreated (子任務A) ──► SubTaskAssigned ──► SubTaskCompleted ──► SubTaskQualityChecked ──► SubTaskAccepted
   │
SubTaskCreated (子任務B) ──► ...
   │
TaskAccepted (父任務, 可選聚合子任務狀態)
   │
PaymentBatchCreated (包含子任務) ──► PaymentBatchSubmitted ──► PaymentBatchApproved ──► BatchInvoiceIssued ──► PaymentBatchCompleted
```

* 子任務事件可以 **平行存在**
* 父任務可選擇 **等待所有子任務完成 + 驗收** 才進行請款

---

## 4️⃣ 好處

1. **事件可追蹤**：每個子任務都有獨立歷史，保留父任務因果
2. **彈性請款**：子任務完成可單獨請款，也可累計到父任務批次請款
3. **質檢與驗收分層**：子任務可獨立質檢，父任務聚合
4. **可視化清楚**：DAG 可呈現父任務 + 多子任務的完整流程

---