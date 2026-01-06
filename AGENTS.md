# 專案 Packages 邊界說明

此文件用來明確說明專案中各個 package 的責任範圍與邊界，以方便維護與開發協作。

## packages

根目錄，所有子 package 的集合。  
不包含實際程式碼，僅用於管理與統一建構配置。

---

## account-domain

**責任**：  
- 定義帳號、使用者、組織、角色等核心業務模型。  
- 實作 Value Object、Entity、Domain Service 等純領域邏輯。  

**邊界**：  
- 不依賴 UI 或第三方平台。  
- 僅提供純粹的業務概念與規則給上層或其他 domain 使用。

---

## core-engine

**責任**：  
- 核心事件、聚合、命令、投影、事件存儲（Event Store）等基礎架構。  
- 提供 CQRS / Event Sourcing 的通用框架。  

**邊界**：  
- 與 domain 輕度耦合（聚合根操作），但不含任何 UI 或特定平台代碼。  
- 供 domain 與上層應用層使用。

---

## platform-adapters

**責任**：  
- 對接外部平台或服務，如資料庫、HTTP API、第三方 SDK。  
- 實作 repository、adapter、gateway 等。  

**邊界**：  
- 不含業務邏輯，只做資料轉換與外部接口。  
- 依賴 core-engine 提供的聚合 / 事件框架。

---

## saas-domain

**責任**：  
- 特定 SaaS 功能相關的業務邏輯，如多租戶、方案設定、訂閱管理等。  
- 擴展 account-domain 的基礎概念。  

**邊界**：  
- 依賴 account-domain 及 core-engine，但不依賴 UI。  
- 專注於 SaaS 業務，避免與平台適配器直接耦合。

---

## ui-angular

**責任**：  
- Angular 前端應用層。  
- 提供登入、組織切換器、頁面呈現與用戶互動。  

**邊界**：  
- 僅依賴 domain 與 saas-domain 提供的服務 / API。  
- 不實作 domain 或 core-engine 核心邏輯。

---

> 💡 原則：
> 1. **Domain-first**：業務邏輯在 domain，UI/平台只做呈現與橋接。  
> 2. **不可跨界依賴**：每個 package 只依賴明確上層或下層。  
> 3. **單一責任**：每個 package 專注一件事情，避免混合多種角色。
