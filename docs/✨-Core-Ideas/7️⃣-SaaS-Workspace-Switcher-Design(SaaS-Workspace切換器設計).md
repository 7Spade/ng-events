---

## **7️⃣ SaaS <> Workspace 切換器設計**

```
SaaS Platform (入口層)
 ├── User Account (主帳號)
 │     ├── Identity / Role Mapping
 │     │      └── Workspace Access List
 │     │           ├── Workspace A → Role: Member (非擁有者)
 │     │           ├── Workspace B → Role: Owner
 │     │           ├── Workspace C → Role: Admin
 │     │           └── Workspace D → Role: Viewer
 │     └── Sub-Accounts (子帳戶)
 │            └── 每個子帳戶也有 Workspace Access List
 ├── Workspace Switcher
 │     ├── 依據目前 User / Sub-Account 身分選擇 Workspace
 │     ├── 動態加載 ModuleRegistry (只載入有權限模組)
 │     ├── 初始化 Workspace Context
 │     └── 設定 Event / Command / Saga 執行範圍
 └── Session Context
       ├── Current Workspace
       ├── Current Role / Identity
       └── Permissions Cache (快取權限判斷，加速前端 / 後端檢查)
```

---

### **關鍵設計要點**

1. **多身分 / 多 Workspace 支援**

   * 一個帳號或子帳戶可以同時是多 Workspace 的不同身分。
   * 每個身分對 Workspace 的權限不同（Owner / Admin / Member / Viewer）。
   * Workspace Switcher 根據當前身分動態切換。

2. **Workspace Context 初始化**

   * 切換時會初始化：

     * ModuleRegistry（只載入該 Workspace 有權限的模組）
     * Event / Saga / Projection 的執行範圍
     * 前端 Angular Query 訂閱（只訂閱當前 Workspace 相關 Projection）

3. **Event / Command / Saga 範圍限制**

   * Command 只允許當前 Workspace 有權限的身分執行
   * Event 僅在 Workspace 範圍內產生，跨 Workspace Event 需透過 Saga 或特定共享事件路由
   * Saga 可以跨 Workspace，但必須檢查權限與身分

4. **子帳戶管理**

   * 主帳號可分派子帳戶給不同 Workspace
   * 每個子帳戶的 Workspace 切換也會經過同一套 Workspace Switcher
   * Session Context 儲存目前身分和子帳戶對 Workspace 的權限

---

### **整合到原始架構**

```
SaaS Frontend
   │
   ├─ Workspace Switcher → Session Context (Current Workspace, Role)
   │
   ▼
Current Workspace
   ├─ ModuleRegistry (權限篩選後)
   ├─ Entities / Events / Commands
   ├─ Projections → Angular Query Subscription
   └─ Sagas (單 Workspace / 跨 Workspace 檢查權限)
```

這樣就能完整表達：

* SaaS 平台入口 → 帳號 / 子帳號 → 身分 → Workspace 切換
* Workspace 內部仍然遵循我們之前討論的 Module / Entity / Event / Saga 流程
* 多 Workspace / 多身分 / 權限控制完全串接到事件流與前端 Query

---
