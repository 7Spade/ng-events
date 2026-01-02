
---

## 1️⃣ 任務事件設計（英文 + 中文）

```ts
TaskCreated
  { taskId, title, createdBy }
  // 任務建立 { 任務ID, 標題, 建立人 }

TaskAssigned
  { taskId, assignee, causedByEventId }
  // 任務指派 { 任務ID, 指派給誰, 因哪個事件觸發 }

TaskCompleted
  { taskId, completedBy, causedByEventId }
  // 任務完成 { 任務ID, 完成人, 因哪個事件觸發 }

TaskQualityChecked
  { taskId, checkedBy, status: "Pass"/"Fail", causedByEventId }
  // 任務質檢 { 任務ID, 質檢人, 狀態: 通過/不通過, 因哪個事件觸發 }

TaskAccepted
  { taskId, acceptedBy, causedByEventId }
  // 任務驗收 { 任務ID, 驗收人, 因哪個事件觸發 }
```

---

## 2️⃣ 單筆請款事件設計（英文 + 中文）

```ts
PaymentDraftCreated
  { taskId, requestId, amount, createdBy }
  // 請款草稿建立 { 任務ID, 請款ID, 金額, 建立人 }

PaymentSubmitted
  { taskId, requestId, submittedBy, causedByEventId }
  // 請款送出 { 任務ID, 請款ID, 送出人, 因哪個事件觸發 }

PaymentApproved
  { taskId, requestId, approvedBy, causedByEventId }
  // 請款審核通過 { 任務ID, 請款ID, 審核人, 因哪個事件觸發 }

InvoiceIssued
  { taskId, requestId, invoiceNumber, causedByEventId }
  // 開立發票 { 任務ID, 請款ID, 發票號碼, 因哪個事件觸發 }

PaymentCompleted
  { taskId, requestId, amount, completedBy, causedByEventId }
  // 請款付款完成 { 任務ID, 請款ID, 金額, 完成人, 因哪個事件觸發 }
```

---

## 3️⃣ 批次請款事件設計（英文 + 中文）

```ts
PaymentBatchCreated
  { batchId, taskIds[], createdBy }
  // 批次請款建立 { 批次ID, 任務ID陣列, 建立人 }

PaymentBatchSubmitted
  { batchId, submittedBy, causedByEventId }
  // 批次請款送出 { 批次ID, 送出人, 因哪個事件觸發 }

PaymentBatchApproved
  { batchId, approvedBy, causedByEventId }
  // 批次請款審核通過 { 批次ID, 審核人, 因哪個事件觸發 }

BatchInvoiceIssued
  { batchId, invoiceNumber, causedByEventId }
  // 批次開立發票 { 批次ID, 發票號碼, 因哪個事件觸發 }

PaymentBatchCompleted
  { batchId, completedBy, causedByEventId }
  // 批次付款完成 { 批次ID, 完成人, 因哪個事件觸發 }
```

---

## 4️⃣ 事件序列範例（英文 + 中文）

```text
// 任務流程
1️⃣ TaskCreated {taskId:101, createdBy:Alice} 
   // 任務建立

2️⃣ TaskAssigned {taskId:101, assignee:Bob, causedByEventId:1} 
   // 任務指派

3️⃣ TaskCompleted {taskId:101, completedBy:Bob, causedByEventId:2} 
   // 任務完成

4️⃣ TaskQualityChecked {taskId:101, checkedBy:Carol, status:"Pass", causedByEventId:3} 
   // 質檢通過

5️⃣ TaskAccepted {taskId:101, acceptedBy:Manager, causedByEventId:4} 
   // 驗收完成，任務可請款

// 單筆請款 R1
6️⃣ PaymentDraftCreated {taskId:101, requestId:"R1", amount:500, createdBy:Manager} 
   // 請款 R1 草稿建立

7️⃣ PaymentSubmitted {taskId:101, requestId:"R1", submittedBy:Manager, causedByEventId:6} 
   // 請款 R1 送出

8️⃣ PaymentApproved {taskId:101, requestId:"R1", approvedBy:FinanceManager, causedByEventId:7} 
   // 請款 R1 審核通過

9️⃣ InvoiceIssued {taskId:101, requestId:"R1", invoiceNumber:"INV-1001", causedByEventId:8} 
   // 請款 R1 開立發票

🔟 PaymentCompleted {taskId:101, requestId:"R1", amount:500, completedBy:Finance, causedByEventId:9} 
   // 請款 R1 完成付款

// 多任務打包批次請款
11️⃣ TaskAccepted {taskId:102, acceptedBy:Manager, causedByEventId:…} 
12️⃣ TaskAccepted {taskId:103, acceptedBy:Manager, causedByEventId:…} 
      │
      ▼
13️⃣ PaymentBatchCreated {batchId:"B1", taskIds:[101,102,103], createdBy:Manager} 
      // 批次請款建立，包含多個任務

14️⃣ PaymentBatchSubmitted {batchId:"B1", submittedBy:Manager, causedByEventId:13} 
      // 批次請款送出

15️⃣ PaymentBatchApproved {batchId:"B1", approvedBy:FinanceManager, causedByEventId:14} 
      // 批次審核通過

16️⃣ BatchInvoiceIssued {batchId:"B1", invoiceNumber:"INV-2001", causedByEventId:15} 
      // 批次開立發票

17️⃣ PaymentBatchCompleted {batchId:"B1", completedBy:Finance, causedByEventId:16} 
      // 批次付款完成
```

---

## 5️⃣ 因果鏈 DAG（任務 + 單筆請款 + 批次請款）

```text
TaskCreated
   │
TaskAssigned
   │
TaskCompleted
   │
TaskQualityChecked
   │
TaskAccepted
   ├── PaymentDraftCreated (R1) ──► PaymentSubmitted (R1) ──► PaymentApproved (R1) ──► InvoiceIssued (R1) ──► PaymentCompleted (R1)
   └── PaymentBatchCreated (B1, taskIds=[101,102,103]) ──► PaymentBatchSubmitted ──► PaymentBatchApproved ──► BatchInvoiceIssued ──► PaymentBatchCompleted
```

---

💡 **特點 & 好處**

1. **Event-Sourced**：任務、請款、批次流程完整歷史，可重放
2. **Causality-Driven**：每個事件都有 `causedByEventId` → 追蹤誰觸發誰
3. **多次請款 & 批次請款**：單任務或多任務打包都可管理
4. **審計 & 自動化**：

   * 草稿 → 送出 → 審核 → 開票 → 付款
   * 系統可自動檢查流程完整性或生成報表
5. **分層事件管理**：

   * Task Aggregate → 任務狀態
   * Payment Aggregate → 單筆請款
   * PaymentBatch Aggregate → 批次請款

---

如果你想，我可以幫你畫一張 **完整可視化流程圖**，上下層分開：任務事件層、單筆請款層、批次請款層，箭頭清楚顯示因果鏈，中英文對照萌萌版 😽

你想要我畫嗎？
