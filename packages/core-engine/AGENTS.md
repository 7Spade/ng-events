# core-engine AGENTS.md

## 目標

說明 `core-engine` 的責任範圍、邊界與依賴，作為專案的核心基礎架構層。

---

## 目標與責任

- 提供 **CQRS / Event Sourcing** 基礎設施  
  - 聚合根 (Aggregate Root)  
  - 事件存儲 (Event Store)  
  - 投影 (Projection)  
  - 命令 (Command) 處理與事件分發 (Event Dispatcher)  
- 支援 domain 層進行業務操作  
- 提供可重用的核心架構給上層應用與平台適配器使用

---

## 邊界

- **依賴**：可依賴 `account-domain` 提供的聚合與模型  
- **不依賴** UI (`ui-angular`) 或平台 (`platform-adapters`)  
- 核心邏輯獨立，保持純粹基礎架構層角色  
- 提供統一事件流與聚合管理，避免 domain 層重複實作

---

## 依賴圖示 (簡單 ASCII)

```

account-domain
│
▼
core-engine
│
▼
platform-adapters
│
▼
saas-domain
│
▼
ui-angular

```

**說明**：  
- `core-engine` 位於 domain 與外部平台之間，提供事件與聚合管理  
- `platform-adapters` 對接資料庫與外部服務，依賴 core-engine 提供的框架  
- `saas-domain` 與 `ui-angular` 間接依賴 core-engine 的事件與聚合管理

---

## 原則

1. **框架專注**：只提供事件、聚合、命令、投影等核心架構  
2. **Domain-first**：依賴 domain，但不包含 UI 或平台邏輯  
3. **單一責任**：保持核心引擎純粹，不混合業務或外部接口  
4. **明確依賴**：僅向上依賴 domain，向下提供接口給平台與應用層
