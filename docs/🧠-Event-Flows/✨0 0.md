---

# 一、先給你結論（讓你心安）🫶

### ✅ `payment`、`issue` 放在 **saas-domain**

**是「正確而且高級」的決策**

### ✅ `workspace-switcher / module-registry / identity-context`

**不是 SaaS Domain，也不是 core-engine**

👉 **它們是「帳號 / 存取 / 組織語境」層**

> **應該獨立成一個「account / identity domain」**

---

# 二、三個東西到底是什麼「層級的存在」？

我先用一句話讓你秒懂 👇

| 名稱                 | 本質是什麼                 | 跟 Task / Payment 的關係 |
| ------------------ | --------------------- | -------------------- |
| identity-context   | 「我是誰」                 | Task 不該知道            |
| workspace-switcher | 「我現在站在哪個空間」           | Task 不該知道            |
| module-registry    | 「這個 Workspace 有開哪些能力」 | Task **被動受影響**       |

👉 它們 **都不是業務本身**
👉 它們是 **業務的生存環境**

---

# 三、正確的「歸屬位置」✨（這段很關鍵）

## ✅ 建議新增一個 package（不是塞進現有）

```txt
packages/
├── core-engine/        # 純因果、純狀態
├── saas-domain/        # Task / Payment / Issue
├── account-domain/    # 🆕 身分 × 組織 × 模組
├── platform-adapters/
└── ui-angular/
```

這一包我會叫它：

> **account-domain**
> 或
> **identity-domain**（看你喜歡哪個字）

---

## 四、三個東西「各自放哪」才不亂倫 💋

### 1️⃣ identity-context ✅（一定是 Domain）

```txt
account-domain/
├── identity/
│   ├── aggregates/
│   │   ├── UserIdentity.ts
│   │   ├── Account.ts
│   │   └── Membership.ts   # user ↔ workspace
│   ├── value-objects/
│   │   ├── UserId.ts
│   │   ├── WorkspaceId.ts
│   │   └── Role.ts
│   ├── events/
│   │   └── UserJoinedWorkspace.ts
│   └── __tests__/
```

👉 **誰是誰、屬於哪、擁有什麼角色**
👉 這是 Domain，不是 SDK

---

### 2️⃣ workspace-switcher ✅（Domain + UI 各一份）

#### Domain（事實狀態）

```txt
account-domain/
├── workspace/
│   ├── aggregates/
│   │   └── Workspace.ts
│   ├── value-objects/
│   │   └── WorkspaceContext.ts
│   ├── events/
│   │   └── WorkspaceSwitched.ts
```

#### UI（操作體驗）

```txt
ui-angular/
└── app/
    └── shared/
        └── workspace-switcher/
            ├── components/
            ├── containers/
            └── services/
```

👉 **Domain 管「事實」**
👉 **UI 管「怎麼切」**

---

### 3️⃣ module-registry ✅（超重要，但不屬於 Task）

```txt
account-domain/
├── module-registry/
│   ├── aggregates/
│   │   └── ModuleRegistry.ts
│   ├── value-objects/
│   │   ├── ModuleId.ts
│   │   ├── ModuleStatus.ts
│   │   └── Capability.ts
│   ├── events/
│   │   ├── ModuleEnabled.ts
│   │   └── ModuleDisabled.ts
```

👉 Workspace 開了哪些模組
👉 Task/Payment **只是被允許或不被允許**

---

## 五、那 Task / Payment / Issue 放 SaaS Domain 對嗎？

### ✅ 絕對正確，而且你直覺是對的

我們來用一句話定義：

| 模組      | 為什麼是 SaaS Domain |
| ------- | ---------------- |
| task    | 核心業務能力           |
| issue   | 任務的衍生問題空間        |
| payment | SaaS 收費模型        |

👉 **它們是「賣給客戶的東西」**
👉 而不是「我是誰 / 我在哪」

所以你這段：

```txt
saas-domain/
├── task/
├── payment/
├── issue/
```

我會直接蓋章：

> **✔ 正確
> ✔ 可維護
> ✔ 可擴展
> ✔ 不後悔**

---

## 六、一句總結（貼在腦內的那種）

> **Identity / Workspace / Module 是「世界規則」
> Task / Payment / Issue 是「在這個世界裡發生的事」**
