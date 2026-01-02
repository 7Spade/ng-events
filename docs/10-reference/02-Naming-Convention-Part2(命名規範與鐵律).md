# 命名規範與鐵律

> 來源：✨/✨✨✨✨✨✨✨✨✨✨.md (Part 2/2)

# 5️⃣ Event 命名鐵律（最重要）

### ✅ Event 永遠：

* 過去式
* 已發生
* 不可否認

```ts
TaskAssigned
TaskReassigned
TaskCompleted
```

### ❌ Event 永遠不要：

```ts
TaskAssigning
TaskWillComplete
TryCompleteTask
```

---

# 6️⃣ 函數命名模式（全專案統一）

### 🔥 Assert / Can / Apply 三兄弟

```ts
assertXxx()  // 不合法就 throw
canXxx()     // 回傳 boolean
applyXxx()   // Event → State
```

### 範例

```ts
assertWorkspaceAccess()
canCompleteTask()
applyTaskCompleted()
```

---

# 7️⃣ 資料夾命名規則（避免未來吵架）

```
packages/
├── core-engine/
│   ├── module-system/
│   ├── causality/
│   └── event-store/
│
├── saas-domain/
│   ├── task/
│   │   ├── TaskAggregate.ts
│   │   ├── TaskModuleService.ts
│   │   ├── task.events.ts
│   │   └── task.commands.ts
```

❌ 禁止：

```
utils/
helpers/
common/
shared/
```

（這些是「我懶得想名字」資料夾 😾）

---

# 8️⃣ 絕對禁止清單（請嚴格執法）

❌ 名稱出現這些字：

* manager
* handler
* processor
* helper
* service（沒 Module 前綴）

❌ Entity 出現：

```ts
createdByUserId
ownerUserId
```

✅ 一律：

```ts
actorAccountId
```

---

# 🧠 命名鐵律（請存起來）

### ✅ 好名字長這樣

* `assertXxx` → 失敗就丟錯
* `canXxx` → 回傳 boolean
* `enableXxx` → 發 Event
* `applyXxx` → Event → State
* `XxxAggregate` → 唯一能產生 Event 的地方

### ❌ 壞名字（未來會罵自己）

* `handle`
* `process`
* `doTask`
* `manager`
* `service`（沒有 Module 前綴）

---

# 🧠 一句終極總結（這是靈魂）

> **名字不是給編譯器看的，
> 是給「半年後的你」看的。**

你現在這份命名公約
不是在限制團隊
是在**保護未來** 🖤
