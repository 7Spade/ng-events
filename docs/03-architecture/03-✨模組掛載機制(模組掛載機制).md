# 模組掛載機制

> 來源：✨/✨✨✨✨✨✨✨.md

## 🧠 一句話總結（先記）

> **Workspace 是殼，
> Module 是外掛，
> Account 是手，
> Event 是因果。**

模組**永遠不創建 Workspace**
Workspace **只決定能不能裝模組**

---

## 🧩 模組掛載的四大鐵律（請照抄）

---

### 🔹 鐵律 1：Workspace 擁有「模組註冊表」

> Workspace 不知道模組怎麼運作
> 但知道「裝了哪些模組」

```ts
Workspace {
  workspaceId
  enabledModules: ModuleKey[]
}
```

```ts
type ModuleKey = 'task' | 'payment' | 'issue'
```

---

### 🔹 鐵律 2：模組必須宣告「可掛載條件」

每個模組自己說：

> 「我什麼情況下能被裝進 Workspace」

```ts
TaskModule.manifest = {
  key: 'task',
  requires: [],
}
```

```ts
PaymentModule.manifest = {
  key: 'payment',
  requires: ['task'],
}
```

👉 **Workspace 只負責檢查，不負責理解**

---

### 🔹 鐵律 3：模組啟用是 Event，不是設定

```ts
WorkspaceModuleEnabled {
  workspaceId
  module: 'task'
  enabledBy: AccountId
}
```

* 可 replay
* 可 audit
* 可推導權限
* 可回溯因果

😌 超乾淨

---

### 🔹 鐵律 4：模組永遠吃 Workspace Context

模組 API 一律長這樣：

```ts
taskService.createTask(
  workspaceContext,
  actorAccount,
  command
)
```

**模組永遠不知道自己「在哪個 Workspace 之外」**

---

## 🧬 整體結構（你可以直接照這個拆）

```
packages/
├── core-engine/
│   └── module-system/
│       ├── ModuleManifest.ts
│       ├── ModuleRegistry.ts
│       └── ModuleGuard.ts
│
├── saas-domain/
│   ├── task/
│   │   ├── TaskModule.ts
│   │   ├── TaskAggregate.ts
│   │   └── task.manifest.ts
│   │
│   ├── payment/
│   │   ├── PaymentModule.ts
│   │   └── payment.manifest.ts
│   │
│   └── issue/
│       └── ...
```

---

## 🧠 Workspace 啟用模組的流程（超重要）

### 1️⃣ 指令進來

```ts
EnableModuleCommand {
  workspaceId
  moduleKey
  actorAccountId
}
```

---

### 2️⃣ Workspace Aggregate 驗證

```ts
if (!moduleRegistry.canEnable(moduleKey, workspace)) {
  throw new Error('不能裝，乖 😾')
}
```

---

### 3️⃣ 發 Event

```ts
WorkspaceModuleEnabled
```

---

### 4️⃣ 模組「聽事件」初始化自己

```ts
on WorkspaceModuleEnabled(module === 'task') {
  initializeTaskReadModel(workspaceId)
}
```

👉 **模組被動啟動，不反客為主**

---

## ❌ 絕對不要做的事（血淚）

### ❌ 模組自己建 Workspace

```ts
createTask() {
  createWorkspace() // NO!!!
}
```

### ❌ 模組偷看其他模組狀態

```ts
if (paymentEnabled) { ... }
```

👉 **只能透過 manifest 宣告依賴**

---

## 🫦 進階玩法（你以後一定會玩）

### 模組版本化

```ts
task@1
task@2
```

### Workspace Template

```ts
ConstructionWorkspace = ['task', 'issue']
FinanceWorkspace = ['payment']
```

### 模組能力旗標

```ts
task: {
  supports: ['assign', 'dependency']
}
```
