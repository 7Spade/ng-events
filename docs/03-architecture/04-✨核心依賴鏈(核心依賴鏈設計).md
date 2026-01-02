# 核心依賴鏈設計

> 來源：✨/✨✨✨✨✨✨✨✨✨.md

# 🧠 核心依賴鏈（先定錨）

```
Account ──▶ Workspace ──▶ Module ──▶ Entity
   誰           在哪          做什麼         狀態
```

👉 **每一層只能「往右用」，不能「往左知道」**

---

# 1️⃣ Account → Workspace

## 「誰」在「哪裡」做事

### 🔖 命名規範

| 類型 | 命名                           |
| -- | ---------------------------- |
| 關係 | `AccountWorkspaceMembership` |
| 查詢 | `isMemberOfWorkspace`        |
| 權限 | `WorkspaceRole`              |

### 📦 型別

```ts
type AccountId = string;
type WorkspaceId = string;

type WorkspaceRole = 'owner' | 'member' | 'viewer';
```

```ts
interface AccountWorkspaceMembership {
  accountId: AccountId;
  workspaceId: WorkspaceId;
  role: WorkspaceRole;
}
```

### 🧠 函數模板（權限入口）

```ts
function assertWorkspaceAccess(
  actor: AccountId,
  workspaceId: WorkspaceId,
  memberships: AccountWorkspaceMembership[],
  required: WorkspaceRole[]
): void {
  const membership = memberships.find(
    m => m.accountId === actor && m.workspaceId === workspaceId
  );

  if (!membership || !required.includes(membership.role)) {
    throw new Error('Forbidden: workspace access denied 😾');
  }
}
```

👉 **這層只回答：你能不能進這個 Workspace**

---

# 2️⃣ Workspace → Module

## 「在哪裡」能不能用「這個功能」

### 🔖 命名規範

| 類型 | 命名                       |
| -- | ------------------------ |
| 狀態 | `enabledModules`         |
| 指令 | `EnableModuleCommand`    |
| 事件 | `WorkspaceModuleEnabled` |

### 📦 Workspace 狀態

```ts
interface WorkspaceState {
  workspaceId: WorkspaceId;
  enabledModules: ModuleKey[];
}
```

### 🧠 函數模板（模組守門）

```ts
function assertModuleEnabled(
  workspace: WorkspaceState,
  module: ModuleKey
): void {
  if (!workspace.enabledModules.includes(module)) {
    throw new Error(`Module not enabled: ${module} 😾`);
  }
}
```

👉 **Workspace 不知道模組怎麼運作，只知道「有沒有裝」**

---

# 3️⃣ Module → Entity

## 「功能」如何操作「狀態」

### 🔖 命名規範（超重要）

| 東西        | 規則                    |
| --------- | --------------------- |
| Command   | `Verb + Entity`       |
| Aggregate | `EntityAggregate`     |
| Method    | `verb()`              |
| Event     | `EntityVerbPastTense` |

### 📦 Entity（Task）

```ts
interface Task {
  taskId: string;
  workspaceId: WorkspaceId;
  status: 'open' | 'completed';
}
```

### 🧠 Aggregate 模板

```ts
class TaskAggregate {
  constructor(private state: Task) {}

  complete(actor: AccountId): DomainEvent {
    if (this.state.status === 'completed') {
      throw new Error('Task already completed 😼');
    }

    return {
      type: 'TaskCompleted',
      taskId: this.state.taskId,
      workspaceId: this.state.workspaceId,
      actorAccountId: actor,
    };
  }
}
```

👉 **Entity 永遠不知道 Workspace 以外的世界**

---

**（續：參見 05-✨核心依賴鏈-Part2.md）**
