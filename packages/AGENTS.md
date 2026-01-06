# Packages 邊界說明

此文件說明 `/packages` 下各個子 package 的責任範圍與依賴邊界，方便協作與維護。

## packages 結構

```

packages/
├── account-domain
├── core-engine
├── platform-adapters
├── saas-domain
├── ui-angular
├── .gitkeep
├── AGENTS.md
└── README.md

```

---

## 依賴圖示

```

account-domain       core-engine
│                   │
▼                   ▼
saas-domain           platform-adapters
│
▼
ui-angular

```

**解讀**：  
- `account-domain` 與 `core-engine` 提供基礎給 `saas-domain`。  
- `platform-adapters` 依賴 `core-engine` 提供的聚合與事件框架。  
- `ui-angular` 依賴 `saas-domain`（及間接的 account-domain/core-engine）提供的業務服務。  
- 無 package 跨界依賴，保持單一責任與清晰邊界。

---

## package 職責概覽

### account-domain
- 核心帳號與組織業務模型（Entity、Value Object、Domain Service）  
- 純業務邏輯，封裝驗證與規則  
- 不依賴 UI 或平台

### core-engine
- 提供 CQRS、Event Sourcing、事件存儲、聚合、投影等基礎架構  
- 供 domain 與上層應用層使用  
- 不包含 UI 或平台邏輯

### platform-adapters
- 對接外部系統、資料庫、API 或第三方 SDK  
- 實作 repository、adapter、gateway  
- 不包含業務邏輯

### saas-domain
- SaaS 專用業務邏輯（多租戶、方案、訂閱管理等）  
- 擴展 account-domain  
- 不直接依賴 UI 或平台

### ui-angular
- Angular 前端應用層，提供頁面與用戶互動  
- 實作登入、組織切換器等功能  
- 依賴 domain / saas-domain 提供的服務與 API

---

## 原則

1. **Domain-first**：業務邏輯在 domain，UI 與平台僅做呈現或橋接  
2. **單一責任**：每個 package 專注一件事  
3. **明確依賴**：只依賴明確上層或下層，禁止跨界依賴
