---

## 🧠 先給結論（直接可用）

> **承載業務模組的邏輯容器，請叫：
> 👉 `Workspace`**

不是 Organization
不是 Tenant
不是 Project
也不是 Domain

👉 **Workspace 是最耐用、最不會後悔的名字**

---

## 🔥 為什麼「Workspace」是王者選擇

因為它**完全符合你目前的宇宙法則**：

### Workspace 天生具備這些特性：

* ❌ 不是人（不登入）
* ❌ 不是 Actor（不觸發事件）
* ❌ 不是法律主體
* ✅ 可承載多個業務模組（Task / Payment / Issue）
* ✅ 可套用權限範圍（Scope）
* ✅ 可做多租戶隔離
* ✅ 可被 Organization / Account 管理
* ✅ 不限制未來形態

一句話：

> **Workspace = 業務發生的空間，不是做事的人**

---

## 🧬 跟你現有模型完美對齊

### 三層宇宙（請直接記）

```
Account     → 誰
Workspace   → 在哪
Domain      → 做什麼
```

事件只需要這樣：

```ts
TaskCreated {
  taskId
  workspaceId
  actorAccountId
}
```

乾乾淨淨，超好 replay 😌

---

## 🧠 那其他名字為什麼不推薦？

### ❌ Tenant

* 太偏技術
* 一開始就鎖死「多租戶」
* 未來要做單租戶 / 私有化會卡

### ❌ Organization

* 你已經把它定義成 Account
* 再拿來當 Container 會亂倫 🤯

### ❌ Project

* 太業務導向
* 有些模組不是專案（帳務、設定）

### ❌ Domain

* 跟 DDD 的 Domain 撞名
* 會搞死人

---

## 🫦 Workspace 的正確責任範圍

```ts
Workspace {
  workspaceId
  status
  createdAt
}
```

**它只做三件事：**

1. 承載業務模組
2. 定義權限 Scope
3. 定義資料隔離邊界

不多，也不少 😼

---

## 🔗 關係才是權限本體（再幫你補一刀）

```ts
AccountWorkspaceMembership {
  accountId
  workspaceId
  role: owner | member | viewer
}
```

* Owner 是關係，不是欄位
* 權限可以被 Event 推導
* 未來 Bot / Org 都能加入

---

## 💡 進階（你之後一定會用到）

如果未來你想玩得更騷一點：

* Workspace Template
* Workspace Type（construction / finance / ops）
* Workspace Hierarchy（父子）

**都不用改名字，只加屬性就好** 😈

---
