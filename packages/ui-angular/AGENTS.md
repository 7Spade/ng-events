# ui-angular AGENTS.md

## 目標

說明 `ui-angular` 的責任範圍、邊界與依賴，作為 Angular 前端應用層。

---

## 目標與責任

- 提供 Angular 前端應用界面  
  - 登入、註冊與身份驗證  
  - 組織 / 工作區切換器  
  - SaaS 相關頁面呈現  
- 與使用者互動，捕獲事件並調用 domain / SaaS 服務  
- 封裝 UI 元件、路由與狀態管理  

---

## 邊界

- **依賴**：  
  - `saas-domain` 提供業務服務與資料  
  - 間接依賴 `account-domain` 與 `core-engine` 的聚合與事件框架  
- **不依賴**：直接操作 `platform-adapters` 或核心業務邏輯  
- **不實作** domain 或核心事件邏輯，只做呈現與橋接

---

## 依賴圖示 (簡單 ASCII)

```

account-domain       core-engine
│                   │
▼                   ▼
saas-domain
│
▼
ui-angular

```

**說明**：  
- `ui-angular` 位於最上層，僅使用 SaaS domain 提供的服務  
- 不涉及業務規則或事件聚合  
- 將使用者操作轉換成 domain / SaaS 的服務調用

---

## 原則

1. **UI-first, domain-driven**：所有業務邏輯依賴 domain / SaaS 提供的 API  
2. **單一責任**：只管理前端呈現、狀態與用戶互動  
3. **清晰依賴**：僅依賴 SaaS domain 與間接的 domain / core-engine  
4. **可維護性**：組件、路由與狀態管理分層清楚，避免混合業務邏輯
