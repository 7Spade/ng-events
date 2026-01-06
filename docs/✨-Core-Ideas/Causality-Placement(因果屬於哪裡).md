---
```
Account ──▶ Workspace ──▶ Module ──▶ Entity
```

* **Account**：使用者 / 身份
* **Workspace**：租戶 / 範圍
* **Module**：業務模組
* **Entity**：實際資料 / 核心物件

---

### 因果 (Causality) 屬於哪裡？

**核心原則**：因果存在於 **事件(Event)之間**，它是「操作發生的原因和結果關係」，而事件是 **由 Aggregate / Entity 產生**。

所以：

* **因果不是 Account**，它只是事件的 Actor（誰做的）
* **因果不是 Workspace**，它只是事件的範圍
* **因果不是 Module**，Module 是承載邏輯的容器
* **因果是 Entity / Aggregate 的事件序列裡的屬性**

換句話說：

```
Entity / Aggregate → 產生 Event → Event.metadata.causality
```

* `causedBy` / `causedByUser` / `causedByAction` 都記在 **Event Metadata**
* Workspace / Module / Account 提供上下文，但因果本身在 **事件連鎖中**

---

💡 總結一句話：

> **因果是事件的屬性，屬於 Aggregate/Entity 的事件流，不屬於 Module、Workspace 或 Account 本身。**

---

```
Account (使用者 / Actor)
│
│ 觸發操作 / 發出 Command
▼
Workspace (租戶 / 範圍)
│
│ 事件發生的上下文 (哪個 Workspace)
▼
Module (業務模組)
│
│ 處理 Command、套用業務邏輯
▼
Entity / Aggregate (核心物件)
│
│ 根據 Command 產生 Event
▼
Event (事件 / Event Sourcing)
│
│ - metadata:
│     causedBy: 上一個事件 ID (父事件)
│     causedByUser: Actor (誰觸發)
│     causedByAction: Command 名稱 (什麼動作)
│     workspaceId: 事件範圍
│     timestamp: 發生時間
│
│ - data: 事件內容 (業務資料)
▼
Causality (因果鏈)
│
│ - 建立事件間的因果關係
│ - 可重建歷史 / 模擬 / 審計
│ - 屬於 Event Metadata，而非 Module 或 Entity
```

---

✨ 特點：

1. **Account** → Actor，只提供「誰做的」
2. **Workspace** → 範圍，事件的 context
3. **Module** → 業務邏輯容器
4. **Entity / Aggregate** → 產生事件的地方
5. **Event** → 保存所有「什麼發生了」以及 metadata
6. **Causality** → Event Metadata 層面的因果鏈，連接事件序列

---
