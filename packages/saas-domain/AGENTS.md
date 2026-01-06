# saas-domain AGENTS.md

## 目標

說明 `saas-domain` 的責任範圍、邊界與依賴，作為 SaaS 功能的業務邏輯層。

---

## 目標與責任

- 實作 SaaS 專用業務邏輯：  
  - 多租戶管理 (Tenant / Workspace)  
  - 方案與訂閱管理 (Plan / Subscription)  
  - 組織與角色擴展  
- 擴展 `account-domain` 的核心概念  
- 封裝 SaaS 特有規則與流程  
- 提供服務給 UI 層或其他應用使用

---

## 邊界

- **依賴**：  
  - `account-domain` 提供帳號、組織、角色等基礎模型  
  - `core-engine` 提供事件、聚合、投影與命令框架  
- **不依賴**：UI (`ui-angular`) 或平台適配器 (`platform-adapters`)  
- 專注 SaaS 業務邏輯，避免跨界耦合

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
- `saas-domain` 位於 domain 與前端 UI 之間，提供完整業務服務  
- 不直接處理 UI 或外部平台，保持 domain-first 原則  
- 所有 SaaS 業務邏輯統一封裝在這層

---

## 原則

1. **Domain-first**：業務邏輯在 SaaS domain，UI 僅使用服務  
2. **單一責任**：只管理 SaaS 相關概念與流程  
3. **清晰依賴**：僅依賴 account-domain 與 core-engine  
4. **可擴展性**：支援多租戶與方案管理的擴展需求

