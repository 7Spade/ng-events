---

# 一、`account-domain` 完整資料夾結構（含 `.gitkeep`）✅

> 定位一句話：
> **Account Domain = SaaS 世界的「存在條件與規則」**

```txt
packages/
└── account-domain/
    ├── account/
    │   ├── aggregates/
    │   │   ├── Account.ts
    │   │   └── .gitkeep
    │   ├── value-objects/
    │   │   ├── AccountId.ts
    │   │   ├── AccountStatus.ts
    │   │   └── .gitkeep
    │   ├── events/
    │   │   ├── AccountCreated.ts
    │   │   ├── AccountSuspended.ts
    │   │   └── .gitkeep
    │   └── __tests__/
    │       └── .gitkeep

    ├── workspace/
    │   ├── aggregates/
    │   │   ├── Workspace.ts
    │   │   └── .gitkeep
    │   ├── value-objects/
    │   │   ├── WorkspaceId.ts
    │   │   ├── WorkspaceRole.ts
    │   │   └── .gitkeep
    │   ├── events/
    │   │   ├── WorkspaceCreated.ts
    │   │   ├── WorkspaceArchived.ts
    │   │   └── .gitkeep
    │   └── __tests__/
    │       └── .gitkeep

    ├── membership/
    │   ├── aggregates/
    │   │   ├── Membership.ts
    │   │   └── .gitkeep
    │   ├── value-objects/
    │   │   ├── MemberId.ts
    │   │   ├── Role.ts
    │   │   └── .gitkeep
    │   ├── events/
    │   │   ├── MemberJoinedWorkspace.ts
    │   │   ├── MemberRoleChanged.ts
    │   │   └── .gitkeep
    │   └── __tests__/
    │       └── .gitkeep

    ├── module-registry/
    │   ├── aggregates/
    │   │   ├── ModuleRegistry.ts
    │   │   └── .gitkeep
    │   ├── value-objects/
    │   │   ├── ModuleId.ts
    │   │   ├── ModuleStatus.ts
    │   │   └── .gitkeep
    │   ├── events/
    │   │   ├── ModuleEnabled.ts
    │   │   ├── ModuleDisabled.ts
    │   │   └── .gitkeep
    │   └── __tests__/
    │       └── .gitkeep

    └── __tests__/
        └── .gitkeep
```

🫶 **這個結構的好處**

* Domain 邊界非常乾淨
* 不跟 `saas-domain/task` 發生依賴循環
* 未來訂閱、帳單、方案直接加在這包也合理

---

# 二、三大 Aggregate 的「正確責任定義」🧬

## 1️⃣ Account Aggregate（最高層存在）

> **Account = 一個 SaaS 合約主體**

### 責任

* 擁有多個 Workspace
* 決定是否「整個帳號」可用
* 不關心 Task、Issue、Payment 細節

```ts
Account
- accountId
- status (Active | Suspended | Closed)
- ownerId
```

### 事件

* `AccountCreated`
* `AccountSuspended`

⚠️ Account **不直接管理成員**
→ 成員是 Workspace 層級的事

---

## 2️⃣ Workspace Aggregate（實際工作空間）

> **Workspace = 實際發生事情的世界**

### 責任

* 隸屬於 Account
* 決定哪些模組可用
* 承載 Task / Issue / Payment 的「容器身分」

```ts
Workspace
- workspaceId
- accountId
- status
```

### 事件

* `WorkspaceCreated`
* `WorkspaceArchived`

👉 **Task 一定發生在 Workspace 內**
👉 不存在「沒有 Workspace 的 Task」

---

## 3️⃣ Membership Aggregate（人 × 空間 × 角色）

> **Membership = 使用者在某個 Workspace 的身分**

這顆很重要，你抓得很準才會問到 😏

### 責任

* User 是否屬於 Workspace
* Role 是什麼（Owner / Admin / Member / Viewer）
* 不負責 Auth（那是 SDK）

```ts
Membership
- memberId (userId)
- workspaceId
- role
```

### 事件

* `MemberJoinedWorkspace`
* `MemberRoleChanged`

👉 **同一個 User**

* 在 A Workspace 是 Owner
* 在 B Workspace 是 Viewer
  這件事只能由 Membership 表達，其他 Aggregate 都不該知道

---

# 三、重頭戲：「Account → Workspace → Task」因果事件流 🔥

來了來了，這是我們一直在鋪的那條線。

---

## 🎯 目標情境

> 使用者建立帳號 → 建立工作空間 → 在該空間建立任務

---

## 🧠 因果流（文字版 Saga）

### ① Account Created

```txt
Command: CreateAccount
→ Event: AccountCreated
```

```ts
AccountCreated {
  accountId,
  ownerId,
  eventId
}
```

---

### ② Workspace Created（因 Account）

```txt
AccountCreated
→ CreateWorkspace (default)
→ WorkspaceCreated
```

```ts
WorkspaceCreated {
  workspaceId,
  accountId,
  causedBy: AccountCreated.eventId
}
```

---

### ③ Membership Created（Owner）

```txt
WorkspaceCreated
→ AddMember (owner)
→ MemberJoinedWorkspace
```

```ts
MemberJoinedWorkspace {
  memberId,
  workspaceId,
  role: 'Owner',
  causedBy: WorkspaceCreated.eventId
}
```

---

### ④ Module Enabled（Task）

```txt
WorkspaceCreated
→ EnableModule(Task)
→ ModuleEnabled
```

```ts
ModuleEnabled {
  workspaceId,
  moduleId: 'task',
  causedBy: WorkspaceCreated.eventId
}
```

---

### ⑤ Task Created（進入 SaaS Domain）

```txt
UserAction: CreateTask
(precondition)
- Workspace exists
- Membership allows
- Module 'task' enabled

→ TaskCreated
```

```ts
TaskCreated {
  taskId,
  workspaceId,
  createdBy,
  correlationId
}
```

✨ **這一刻才正式跨進 `saas-domain/task`**

---

## 四、一句超重要的架構真理（請收好）

> **Account 決定「你能不能進這個世界」
> Workspace 決定「你現在在哪個世界」
> Task 決定「你在這個世界做了什麼事」**

你現在這套結構已經是：

* 能畫 Saga
* 能加 Projection
* 能支援多 Workspace 多身分
* 能做真正的 SaaS
