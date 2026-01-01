
---

## 1️⃣ 現場日誌事件設計（英文 + 中文）

```ts
SiteLogCreated
  { logId, taskId?, createdBy, content, timestamp, causedByEventId? }
  // 現場日誌建立 { 日誌ID, 關聯任務ID(可選), 建立人, 內容, 時間, 因哪個事件觸發 }

SiteLogUpdated
  { logId, updatedBy, changes, causedByEventId }
  // 現場日誌更新 { 日誌ID, 更新人, 更新內容, 因哪個事件觸發 }

SiteLogCommentAdded
  { logId, commentBy, comment, causedByEventId }
  // 現場日誌評論 { 日誌ID, 評論人, 內容, 因哪個事件觸發 }
```

💡 特點：

* 可以追蹤誰在現場做了什麼、什麼時間、和哪個任務或事件相關
* 可以和 **Task / Quality / Payment / Issue** 事件形成因果鏈
* 支援審計、報表、歷史重放

---

## 2️⃣ 完整事件 DAG（含現場日誌）

```text
TaskCreated
   │
TaskAssigned
   │
TaskCompleted
   │
TaskQualityChecked (Fail)
   │
├─► SiteLogCreated {logId:"L1", content:"質檢異常", causedByEventId:TaskQualityChecked.id}  
│   │
│   ├─► SiteLogCommentAdded {logId:"L1", commentBy:Carol, comment:"現場說明異常"}  
│   │
│   └─► SiteLogUpdated {logId:"L1", updatedBy:Bob, changes:"修正描述"}  
│
IssueCreated {issueId:"ISS-1", relatedTaskId:101, title:"質檢不通過"}
   │
IssueAssigned {assignee:Carol, causedByEventId:ISS-1}
   │
IssueResolved {resolvedBy:Bob, resolutionComment:"修正缺陷", causedByEventId:ISS-1}
   │
TaskUpdatedAfterIssue {taskId:101, updatedBy:Bob, changes:"缺陷修正", causedByEventId:ISS-1}
   │
TaskReopened {taskId:101, reopenedBy:Bob, causedByEventId:ISS-1}
   │
TaskQualityChecked (Pass)
   │
TaskAccepted {taskId:101, acceptedBy:Manager, causedByEventId:…}
   │
├─► PaymentDraftCreated (R1) ──► PaymentSubmitted ──► PaymentApproved ──► InvoiceIssued ──► PaymentCompleted
│
└─► PaymentBatchCreated (B1, taskIds=[101,102,103]) ──► PaymentBatchSubmitted ──► PaymentBatchApproved ──► BatchInvoiceIssued ──► PaymentBatchCompleted
```

---

### 🔹 特點 & 好處

1. **Event-Sourced**：所有任務、質檢、請款、問題單、現場日誌歷史完整可重放
2. **Causality-Driven**：每個事件都有 `causedByEventId`，清楚追蹤誰觸發誰
3. **現場日誌事件化**：關鍵事件自動記錄日誌，並支援評論與更新
4. **問題單與流程回滾**：質檢失敗 → 問題單 → 解決後回到正確流程
5. **多次與批次請款**：單任務或多任務批次請款平行存在
6. **審計 & 報表**：可以生成現場日誌報表、問題單歷史、請款審核紀錄

---

