# Development Templates (開發模板)

本目錄包含 Causality-Driven Event-Sourced Process System 的完整開發模板。

---

## 📋 模板清單 (Template List)

| 模板 | 檔案 | 用途 |
|------|------|------|
| **命名規範** | <a href="./Naming-Conventions(命名規範).md">Naming-Conventions(命名規範).md</a> | 函數、類別、變數、檔案命名標準 |
| **介面與方法** | <a href="./Interface-Method-Templates(介面方法模板).md">Interface-Method-Templates(介面方法模板).md</a> | 儲存庫、服務、事件處理器介面模板 |
| **事件與命令** | <a href="./Event-Command-Templates(事件命令模板).md">Event-Command-Templates(事件命令模板).md</a> | 領域事件、命令、因果鏈模板 |
| **投影與讀模型** | <a href="./Projection-ReadModel-Templates(投影讀模型模板).md">Projection-ReadModel-Templates(投影讀模型模板).md</a> | 投影、讀模型、投影儲存庫模板 |
| **路由與守衛** | <a href="./Routing-Guard-Templates(路由守衛模板).md">Routing-Guard-Templates(路由守衛模板).md</a> | Angular 路由、認證、授權守衛模板 |
| **多租戶** | <a href="./Multi-Tenant-Templates(多租戶模板).md">Multi-Tenant-Templates(多租戶模板).md</a> | 租戶模型、隔離、權限控制模板 |

---

## 🎯 快速導覽 (Quick Navigation)

### 1. 命名規範 (Naming Conventions)

**何時使用：** 命名任何代碼元素時

**包含內容：**
- ✅ 函數命名模板 (事件處理、命令處理、查詢、驗證)
- ✅ 類別命名模板 (聚合、值對象、事件、命令、服務)
- ✅ 變數命名模板 (布林值、集合、事件/命令變數)
- ✅ 介面命名模板 (儲存庫、服務、事件處理器)
- ✅ 檔案命名模板 (kebab-case 標準)
- ✅ 多租戶命名模板 (Account, Team, Partner, Collaborator)

**關鍵原則：**
- 使用完整單字，避免縮寫
- camelCase (變數/函數)、PascalCase (類別)、kebab-case (檔案)
- 明確的前綴/後綴 (is, has, can, on, handle)
- 事件用過去式、命令用不定式

---

### 2. 介面與方法 (Interfaces & Methods)

**何時使用：** 定義服務、儲存庫、處理器介面時

**包含內容：**
- ✅ 儲存庫介面 (標準聚合根、事件儲存)
- ✅ 服務介面 (領域服務、應用服務、因果驗證)
- ✅ 事件處理器介面 (單一、泛型、事件總線)
- ✅ 命令處理器介面 (單一、泛型)
- ✅ 投影介面 (讀模型、投影儲存庫)
- ✅ 多租戶介面 (租戶隔離、多租戶儲存庫)

**關鍵原則：**
- 明確的 JSDoc 註解
- Promise 返回類型
- 泛型提高複用性
- 多租戶隔離支援

---

### 3. 事件與命令 (Events & Commands)

**何時使用：** 實作事件溯源時

**包含內容：**
- ✅ 基礎事件結構 (DomainEvent, EventMetadata)
- ✅ Task/Payment/Issue 事件範例
- ✅ 命令結構 (Command 基礎介面)
- ✅ Task/Payment 命令範例
- ✅ 因果鏈範例 (完整因果關係示範)
- ✅ 事件與命令驗證器

**關鍵原則：**
- 明確的因果元數據 (causedBy, causedByUser)
- 不可變事件
- 完整類型定義
- blueprintId 多租戶隔離

---

### 4. 投影與讀模型 (Projections & Read Models)

**何時使用：** 構建查詢優化的讀取層時

**包含內容：**
- ✅ 投影基礎結構 (IProjection 介面)
- ✅ Task 投影範例 (列表、詳情)
- ✅ Payment 投影範例 (摘要)
- ✅ Firestore 投影儲存庫實作
- ✅ 投影更新服務 (事件驅動)
- ✅ 投影重建機制 (從事件流)

**關鍵原則：**
- 一個投影對應一個查詢需求
- 事件驅動更新
- 支援重建功能
- 多租戶隔離 (blueprintId)

---

### 5. 路由與守衛 (Routing & Guards)

**何時使用：** 配置 Angular 路由與權限控制時

**包含內容：**
- ✅ App 主路由配置
- ✅ 功能模組路由 (Task, Payment)
- ✅ 認證守衛 (AuthGuard)
- ✅ 多租戶守衛 (BlueprintGuard)
- ✅ 角色守衛 (RoleGuard)
- ✅ 權限守衛 (PermissionGuard)
- ✅ 離開守衛 (CanDeactivateGuard)
- ✅ 路由解析器 (Resolver)

**關鍵原則：**
- 使用功能守衛 (Functional Guards)
- 多租戶隔離驗證
- 細粒度權限控制
- 懶加載優化

---

### 6. 多租戶 (Multi-Tenant)

**何時使用：** 實作多租戶 SaaS 平台時

**包含內容：**
- ✅ 租戶類型定義 (Account, Team, Partner, Collaborator)
- ✅ Blueprint 模型 (租戶邊界)
- ✅ Account/Team/Partner/Collaborator 模型
- ✅ 租戶隔離服務實作
- ✅ 權限檢查服務
- ✅ Firestore 多租戶資料結構

**關鍵原則：**
- Blueprint 作為租戶隔離邊界
- 支援 4 種租戶類型
- 細粒度權限控制
- 支援跨組織協作

---

## 🚀 使用指南 (Usage Guide)

### 開始新功能 (Starting New Feature)

1. **命名階段**
   - 參考：<a href="./Naming-Conventions(命名規範).md">Naming-Conventions(命名規範).md</a>
   - 決定：聚合名稱、事件名稱、命令名稱

2. **設計階段**
   - 參考：<a href="./Event-Command-Templates(事件命令模板).md">Event-Command-Templates(事件命令模板).md</a>
   - 設計：領域事件、命令、因果關係

3. **介面階段**
   - 參考：<a href="./Interface-Method-Templates(介面方法模板).md">Interface-Method-Templates(介面方法模板).md</a>
   - 定義：儲存庫、服務、事件處理器介面

4. **投影階段**
   - 參考：<a href="./Projection-ReadModel-Templates(投影讀模型模板).md">Projection-ReadModel-Templates(投影讀模型模板).md</a>
   - 建立：讀模型投影、投影儲存庫

5. **路由階段**
   - 參考：<a href="./Routing-Guard-Templates(路由守衛模板).md">Routing-Guard-Templates(路由守衛模板).md</a>
   - 配置：路由、守衛、權限

6. **多租戶階段**
   - 參考：<a href="./Multi-Tenant-Templates(多租戶模板).md">Multi-Tenant-Templates(多租戶模板).md</a>
   - 確保：租戶隔離、權限控制

---

## 📊 模板對應關係 (Template Mapping)

```
功能實作流程:
┌─────────────────────────────────────────────────────┐
│ 1. 命名規範 (Naming Conventions)                      │
│    ↓ 定義名稱                                         │
│ 2. 事件與命令 (Events & Commands)                     │
│    ↓ 設計事件流                                       │
│ 3. 介面與方法 (Interfaces & Methods)                  │
│    ↓ 定義契約                                         │
│ 4. 投影與讀模型 (Projections & Read Models)           │
│    ↓ 建立查詢層                                       │
│ 5. 路由與守衛 (Routing & Guards)                      │
│    ↓ 配置訪問控制                                     │
│ 6. 多租戶 (Multi-Tenant)                              │
│    ↓ 確保隔離                                         │
└─────────────────────────────────────────────────────┘
```

---

## 📚 相關文檔 (Related Documentation)

### Architecture Documents
- <a href="../Architecture-Specification(架構規範).md">Architecture-Specification(架構規範).md</a> - 完整架構規範
- <a href="../Implementation-Directory-Tree(實作目錄樹).md">Implementation-Directory-Tree(實作目錄樹).md</a> - 生產就緒目錄結構

### System Config
- <a href="../system-config/README.md">system-config/README.md</a> - 系統配置索引
- <a href="../system-config/When-To-Use(適用場景).md">When-To-Use(適用場景).md</a> - 適用場景指南

---

## ✅ 檢查清單 (Checklist)

使用模板前確認：

- [ ] 已閱讀 <a href="../Architecture-Specification(架構規範).md">Architecture-Specification(架構規範).md</a>
- [ ] 已理解 Event-Sourcing 與 Causality 概念
- [ ] 已確定功能所屬層級 (saas/platform/core)
- [ ] 已決定租戶隔離策略 (Blueprint)

使用模板後確認：

- [ ] 命名符合規範 (camelCase, PascalCase, kebab-case)
- [ ] 事件包含完整因果元數據 (causedBy, blueprintId)
- [ ] 所有介面包含明確 JSDoc 註解
- [ ] 投影支援事件更新與重建
- [ ] 路由配置守衛與權限
- [ ] 多租戶隔離正確實作

---

## 🔄 版本更新 (Version History)

| 版本 | 日期 | 變更內容 |
|------|------|----------|
| 1.0 | 2026-01-01 | 初始版本：完整 6 個模板文檔 |

---

## 🤝 貢獻指南 (Contributing)

如需更新模板：

1. 遵循現有格式和結構
2. 提供完整範例代碼
3. 包含 ✅ DO / ❌ DON'T 最佳實踐
4. 更新此 README 的對應章節

---

**維護者 (Maintainer)**: Architecture Team  
**最後更新 (Last Updated)**: 2026-01-01  
**版本 (Version)**: 1.0
