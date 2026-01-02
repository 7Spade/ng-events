# 權限分層架構

> 來源：✨/✨✨.md

## 🧠 一句話結論（記起來）

> **權限「判斷」在 core / domain，
> 權限「驗證」在 platform adapter，
> 權限「觸發」在 UI / API。**

三個字：**分、開、做**。

---

## 🔥 正確的權限分層（超重要）

### 1️⃣ `platform-adapters/auth`

👉 **「你是誰？」**

這層只負責一件事：

```ts
// Firebase / JWT / OAuth / SSO
authenticate(request) → AuthContext
```

它會產出：

```ts
AuthContext {
  userId: string
  tenantId: string
  roles: string[]
}
```

❌ **它不應該知道：**

* Task 是什麼
* Payment 有沒有核准流程
* 誰可以完成任務

它只是個「驗身器」😌

---

### 2️⃣ `core-engine` / `saas-domain`

👉 **「你可不可以做這件事？」（靈魂所在）**

真正性感的權限在這裡 💄

#### 📍位置一（推薦）

```
saas-domain/task/
  ├── TaskAggregate.ts
  └── TaskPolicy.ts
```

```ts
export function canCompleteTask(
  actor: AuthContext,
  task: Task
) {
  return (
    actor.userId === task.assignee ||
    actor.roles.includes('admin')
  )
}
```

然後在 Aggregate 裡：

```ts
complete(actor: AuthContext) {
  if (!canCompleteTask(actor, this.state)) {
    throw new ForbiddenError('你不可以摸這個任務 😾')
  }

  return TaskCompleted(...)
}
```

👉 **這代表：**

* Event 永遠只在「合法狀態」下產生
* Event Replay 不會被 UI 欺負
* 未來換 API / 換 UI / 換 Adapter 都不怕

這叫：
💎 **Domain-Enforced Authorization**

---

### 3️⃣ `ui-angular` / API 層

👉 **「我可不可以按這個按鈕？」**

UI 的權限只做一件事：

```ts
*ngIf="canCompleteTask(user, task)"
```

⚠️ 但請記住（貼在牆上）：

> **UI 權限 ≠ 安全**
> UI 只是 UX，不是法官

就算 UI 不顯示按鈕
後端 / core 還是要再檢查一次 😈

---

## 💥 常見錯誤（你這套架構一定要避）

### ❌ 把權限全寫在 `platform/auth`

```ts
if (user.role === 'admin') {
  // allow everything
}
```

這會導致：

* 因果規則消失
* Replay 無法驗證合法性
* Domain 變成「被操控的殼」

😱 **這是 Event-Sourcing 的大忌**

---

## 🧬 正確的依賴方向（超性感）

```
ui-angular
   ↓
platform-adapters/auth   →  AuthContext
   ↓
saas-domain / core-engine
   ↓
Event (immutable, trusted)
```

**權限只會往下，不會往回看 UI**

---

## 🫦 再給你一個進階小騷包

如果你之後要做到：

* 多租戶
* 任務狀態 × 角色 × 因果事件
* 「因為哪個事件，權限改變了」

那你可以這樣玩 👇

```
core-engine/
  └── authorization/
       ├── Policy.ts
       ├── Ability.ts
       └── PermissionDerivedFromEvent.ts
```

👉 **權限本身也是 Event 的投影**

（是的，很騷，也很強）
