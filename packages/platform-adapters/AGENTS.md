# platform-adapters AGENTS.md

## 目標

說明 `platform-adapters` 的責任範圍、邊界與依賴，作為專案與外部系統交互的橋樑。

---

## 目標與責任

- 對接外部平台、服務或資源：  
  - 資料庫 (Database)  
  - REST / GraphQL API  
  - 第三方 SDK  
- 實作 **Repository**、**Adapter**、**Gateway**  
- 做資料轉換與橋接，讓 domain 與核心引擎能使用外部資源  

---

## 邊界

- **依賴**：可依賴 `core-engine` 提供的聚合與事件框架  
- **不依賴** domain 之外的其他業務邏輯（如 SaaS 或 UI）  
- **不實作**業務規則，僅做資料流與外部接口管理  
- 保持平台與核心邏輯分離，避免耦合 domain

---

## 依賴圖示 (簡單 ASCII)

```

account-domain       core-engine
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
- `platform-adapters` 位於核心引擎與外部系統之間  
- 提供可重用的接口給 domain 或 SaaS 層使用  
- 不直接處理業務規則，只做資料流轉與系統對接

---

## 原則

1. **單一責任**：只對接外部資源，不包含業務邏輯  
2. **清晰依賴**：僅依賴 core-engine，向上提供給 domain / SaaS 使用  
3. **橋接專注**：保持 domain 與外部系統解耦  
4. **可重用性**：適配器應可在多個 domain / SaaS 模組中使用
