# 全域命名規範

> 來源：✨/✨✨✨✨✨✨✨✨✨✨.md (Part 1/2)

# 🧭 全域命名總原則（請刻在牆上）

> **名字要回答問題，而不是描述實作。**

而且只回答其中一個：

* 誰（Account）
* 在哪（Workspace）
* 能不能用（Module）
* 做什麼（Entity / Command）
* 發生了什麼（Event）

---

# 0️⃣ 基本語言規則（全專案通用）

| 項目   | 規則                                                    |
| ---- | ----------------------------------------------------- |
| 語言   | **全英文**                                               |
| 命名風格 | `camelCase`（變數 / 函數）<br>`PascalCase`（型別 / 類別 / Event） |
| 縮寫   | 禁止（`ctx`、`mgr`、`svc` ❌）                               |
| 動詞   | 明確、可唸（`assign` > `set`）                               |
| 否定   | 不用 `notXxx`，用 `isXxx`                                 |

---

# 1️⃣ Account 層命名（誰）

### 🔖 型別

```ts
type AccountId = string;
```

### 🔖 關係

```ts
AccountWorkspaceMembership
AccountOrganizationMembership
```

### 🔖 權限

```ts
WorkspaceRole = 'owner' | 'member' | 'viewer'
```

### 🔖 函數

```ts
assertAccountIsActive()
assertWorkspaceAccess()
canAccessWorkspace()
```

❌ 禁止：

```ts
UserPermission
OrgUser
CurrentUser
```

👉 **Account 永遠是主體，不用 User**

---

# 2️⃣ Workspace 層命名（在哪）

### 🔖 實體

```ts
Workspace
WorkspaceState
WorkspaceId
```

### 🔖 行為（指令）

```ts
CreateWorkspace
EnableWorkspaceModule
ArchiveWorkspace
```

### 🔖 事件（Past Tense）

```ts
WorkspaceCreated
WorkspaceModuleEnabled
WorkspaceArchived
```

### 🔖 狀態欄位

```ts
enabledModules
status
createdAt
```

❌ 禁止：

```ts
Tenant
OrgSpace
ProjectSpace
```

---

# 3️⃣ Module 層命名（能不能用什麼）

### 🔖 Module Key（唯一）

```ts
type ModuleKey = 'task' | 'payment' | 'issue';
```

### 🔖 Manifest

```ts
TaskModuleManifest
PaymentModuleManifest
```

### 🔖 Module Service（唯一對外入口）

```ts
TaskModuleService
PaymentModuleService
```

### 🔖 守門函數

```ts
assertModuleEnabled()
canEnableModule()
```

❌ 禁止：

```ts
TaskManager
PaymentHandler
TaskService  // 沒有 Module 前綴
```

---

# 4️⃣ Entity / Aggregate 命名（做什麼）

### 🔖 Entity

```ts
Task
Payment
Issue
```

### 🔖 Aggregate

```ts
TaskAggregate
PaymentAggregate
```

### 🔖 Aggregate Method（動詞）

```ts
assign()
complete()
approve()
cancel()
```

### 🔖 Command（現在式）

```ts
AssignTask
CompleteTask
ApprovePayment
```

### 🔖 Event（過去式）

```ts
TaskAssigned
TaskCompleted
PaymentApproved
```

❌ 禁止：

```ts
UpdateTask
HandlePayment
DoApprove
```
