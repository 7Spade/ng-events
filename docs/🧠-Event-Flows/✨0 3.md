---

# 一、Saga 狀態機圖（含失敗補償）🧠🔥

## 🎯 Saga 名稱

> **AccountOnboardingSaga**
> （帳號建立 → Workspace 就緒 → Task 可用）

---

## 🧩 參與 Aggregate / Domain

* `Account`（account-domain）
* `Workspace`（account-domain）
* `Membership`（account-domain）
* `ModuleRegistry`（account-domain）
* `Task`（saas-domain）

---

## 🗺️ Saga 狀態機（文字圖版，精準可實作）

```txt
[Start]
  |
  | CreateAccount
  v
(AccountCreated)
  |
  | on success
  v
[CreatingDefaultWorkspace]
  |
  | CreateWorkspace
  v
(WorkspaceCreated)
  |
  | on success
  v
[AssigningOwnerMembership]
  |
  | AddMember(owner)
  v
(MemberJoinedWorkspace)
  |
  | on success
  v
[EnablingDefaultModules]
  |
  | EnableModule(task)
  v
(ModuleEnabled)
  |
  | on success
  v
[Completed ✅]
```

到這裡是 **happy path**
下面來的是你最在意、也最性感的地方 👀

---

## 💥 失敗補償（Compensation Flow）

### ❌ 情境 1：Workspace 建立失敗

```txt
(AccountCreated)
  |
  | CreateWorkspace ❌
  v
[Compensate]
  |
  | SuspendAccount
  v
(AccountSuspended)
```

👉 原因：
Account 存在但沒有世界可以住，是「半殘狀態」
👉 解法：**直接凍結 Account**

---

### ❌ 情境 2：Membership 建立失敗

```txt
(WorkspaceCreated)
  |
  | AddMember(owner) ❌
  v
[Compensate]
  |
  | ArchiveWorkspace
  v
(WorkspaceArchived)
```

👉 沒有 Owner 的 Workspace 是孤兒
👉 寧可刪掉，不留爛尾樓

---

### ❌ 情境 3：Module 啟用失敗（Task）

```txt
(MemberJoinedWorkspace)
  |
  | EnableModule(task) ❌
  v
[Compensate]
  |
  | DisableWorkspaceUsage
  v
(WorkspaceRestricted)
```

👉 Workspace 存在
👉 但 **Task / Issue 全部不可用**
👉 這時 UI 會看到「尚未完成初始化」

---

## 🧬 Saga 狀態（給你一個 enum 心法）

```ts
type AccountOnboardingSagaState =
  | 'Started'
  | 'WorkspaceCreated'
  | 'OwnerAssigned'
  | 'ModulesEnabled'
  | 'Completed'
  | 'Compensated'
```

👉 **Saga 本身也是一個狀態機**
👉 Projection 會追這個狀態，UI 只看結果

---

# 二、接到 Firebase admin / Angular query 🔥

（你問得很對：前端就是用 `@angular/fire`）

這一段我會用 **你現有結構 + 正確分層** 來接。

---

## 一句話先定錨 🧷

> **Angular 不碰 Saga、不碰 Aggregate**
> **Angular 只 Query「結果世界」**

---

# 1️⃣ Firebase Admin（Backend / Infra）

📍 位置

```txt
packages/platform-adapters/firebase/admin/
├── event-store/
├── projection/
└── sagas/
```

---

### 🔥 Saga Runner（Firebase Functions）

```ts
// AccountOnboardingSagaHandler.ts
onEvent(AccountCreated)
  → createWorkspace()

onEvent(WorkspaceCreated)
  → addOwnerMembership()

onEvent(MemberJoinedWorkspace)
  → enableModule('task')
```

👉 每一步都是：

* 讀 Event
* 發 Command
* 寫新 Event

👉 **完全符合 Event → Command → Event**

---

### 🔎 Projection（給前端查）

```txt
projection/
├── workspace-read-model/
│   ├── WorkspaceSummary.ts
│   └── MembershipView.ts
```

Firestore 會長這樣（舉例）：

```txt
workspaces/{workspaceId}
  - status
  - enabledModules
  - accountId

memberships/{workspaceId}_{userId}
  - role
```

---

# 2️⃣ Angular Query（@angular/fire）💕

你猜得完全對，而且我會直接跟你說：

> **這層「只用 @angular/fire 就夠了」**

---

## 📍 Angular Adapter

```txt
platform-adapters/firebase/angular-fire/
├── query/
│   ├── workspace.query.ts
│   └── membership.query.ts
```

```ts
@Injectable()
export class WorkspaceQuery {
  workspace$(workspaceId: string) {
    return docData(
      doc(this.firestore, `workspaces/${workspaceId}`)
    );
  }
}
```

---

## 📍 UI 使用（Container）

```ts
this.workspace$ = this.workspaceQuery.workspace$(id);
```

👉 UI 根本不知道：

* Saga
* Event Store
* Aggregate

👉 它只知道：

> 「我現在在哪個 Workspace，它準備好了沒？」

---

## 🔐 權限判斷（Membership）

```ts
canCreateTask$ =
  combineLatest([
    workspace$,
    membership$
  ]).pipe(
    map(([ws, m]) =>
      ws.enabledModules.includes('task') &&
      m.role !== 'Viewer'
    )
  );
```

😽 **這一段就是你整個系統「使用者體感」的關鍵**

---

# 三、最後一句（請收進心臟）

> **Saga 是系統的神經系統
> Projection 是視覺皮層
> Angular 只是眼睛，不是大腦**

你現在這套已經是：

* 真・多 Workspace
* 真・多身分
* 真・可補償
* 真・可營運 SaaS
