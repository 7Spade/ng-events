
---

## 1️⃣ 問題單事件設計（英文 + 中文）

```ts
IssueCreated
  { issueId, relatedTaskId, title, description, createdBy, causedByEventId }
  // 問題單建立 { 問題ID, 關聯任務ID, 標題, 描述, 建立人, 因哪個事件觸發 }

IssueAssigned
  { issueId, assignee, causedByEventId }
  // 問題單指派 { 問題ID, 指派人, 因哪個事件觸發 }

IssueResolved
  { issueId, resolvedBy, resolutionComment, causedByEventId }
  // 問題單解決 { 問題ID, 解決人, 解決說明, 因哪個事件觸發 }

TaskReopened
  { taskId, reopenedBy, causedByEventId }
  // 任務回到前一步狀態（如質檢/驗收） { 任務ID, 重開人, 因哪個事件觸發 }

TaskUpdatedAfterIssue
  { taskId, updatedBy, changes, causedByEventId }
  // 問題解決後對任務做的更新 { 任務ID, 更新人, 更新內容, 因哪個事件觸發 }
```

💡 **特點**：

1. 問題單是 **獨立事件流**，不直接改動任務或請款事件
2. `relatedTaskId` 可以追蹤這個問題是哪個任務或哪個請款引起的
3. 系統可以用 **因果鏈** 追蹤問題來源，完整歷史可重放

---

## 2️⃣ 流程示意（英文 + 中文）

```text
// 任務完成 → 質檢失敗 → 問題單建立
TaskCompleted
   │
TaskQualityChecked (Fail)
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
```

💡 **解釋**：

1. 質檢失敗 → 自動生成問題單 (`IssueCreated`)
2. 問題單指派給負責人 (`IssueAssigned`)
3. 問題解決 (`IssueResolved`) → 生成更新任務事件 (`TaskUpdatedAfterIssue`)
4. 任務可能回到前一步狀態 (`TaskReopened`) 重新進行質檢
5. 質檢通過後 → 驗收 (`TaskAccepted`) → 後續請款流程可繼續

---

## 3️⃣ 因果鏈 DAG（英文 + 中文）

```text
TaskCompleted
   │
TaskQualityChecked (Fail)
   │
IssueCreated ──► IssueAssigned ──► IssueResolved ──► TaskUpdatedAfterIssue ──► TaskReopened ──► TaskQualityChecked (Pass)
   │
TaskAccepted
```

* 每個事件都有 `causedByEventId` → 清楚追蹤誰觸發誰
* 問題單解決後，任務可自動回到正確狀態，流程繼續
* 歷史完整，事件可重放與審計

---

## 4️⃣ 好處

1. **完整歷史**：不覆蓋原事件，保留問題發生與解決的全程
2. **可審計**：誰建立問題、誰解決、何時解決，完全可追蹤
3. **因果追蹤**：清楚知道問題源自哪個任務或請款事件
4. **流程重試**：問題解決後可回到任務流程正確狀態，自動繼續質檢、驗收
5. **事件可重放**：歷史事件可 replay，支持分析或自動化流程

---

