
---

## 🌈 DAG 結構說明

### 1️⃣ 父任務層 (Task Aggregate)

```
TaskCreated (父任務)
   │
TaskAssigned
   │
TaskCompleted
   │
TaskQualityChecked
   │
TaskAccepted (聚合子任務狀態)
```

### 2️⃣ 子任務層 (SubTask Aggregate)

```
SubTaskCreated (子任務A) ──► SubTaskAssigned ──► SubTaskCompleted ──► SubTaskQualityChecked ──► SubTaskAccepted
SubTaskCreated (子任務B) ──► ...
```

* 每個子任務事件都有 `causedByEventId` 指向父任務或批次事件
* 可平行存在，多個子任務同時進行

### 3️⃣ 單筆請款層 (Payment Aggregate)

```
PaymentDraftCreated (單筆請款)
   │
PaymentSubmitted
   │
PaymentApproved
   │
InvoiceIssued
   │
PaymentCompleted
```

* 子任務也可以單獨請款
* `taskId` 對應子任務 ID

### 4️⃣ 批次請款層 (PaymentBatch Aggregate)

```
PaymentBatchCreated (B1, taskIds=[父任務+子任務])
   │
PaymentBatchSubmitted
   │
PaymentBatchApproved
   │
BatchInvoiceIssued
   │
PaymentBatchCompleted
```

* 聚合父任務 + 所有子任務金額
* 支援多任務批次請款
* 每個事件都有 `causedByEventId` 保持因果鏈

---

### 5️⃣ 現場日誌 + 問題單層

```
SiteLogCreated ──► SiteLogUpdated ──► SiteLogCommentAdded
IssueCreated ──► IssueAssigned ──► IssueResolved
```

* 可關聯父任務或子任務
* 支援因質檢失敗或施工異常自動生成

---

### 6️⃣ 整體 DAG 連線示意

```
TaskCreated
   │
SubTaskCreated A ──► SubTaskCompleted ──► SubTaskAccepted
SubTaskCreated B ──► ...
   │
TaskCompleted
   │
TaskQualityChecked
   │
TaskAccepted
   ├── PaymentDraftCreated (R1) ──► PaymentSubmitted ──► PaymentApproved ──► InvoiceIssued ──► PaymentCompleted
   └── PaymentBatchCreated (B1, taskIds=[父+子任務]) ──► PaymentBatchSubmitted ──► PaymentBatchApproved ──► BatchInvoiceIssued ──► PaymentBatchCompleted
   │
SiteLogCreated / IssueCreated (可平行產生)
```

---
