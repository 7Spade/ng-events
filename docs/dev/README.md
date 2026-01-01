# Development Documentation Index (開發文件索引)

本目錄包含 **Causality-Driven Event-Sourced Process System** 的完整架構與開發文件。

---

## 🚨 CRITICAL DISTINCTION: Directory Structures (關鍵區別：目錄結構)

### 📍 Current vs Recommended (當前 vs 推薦)

| Document | Structure Type | Use When |
|----------|---------------|----------|
| [Directory-Tree-Structure(目錄樹結構).md](./Directory-Tree-Structure(目錄樹結構).md) | **CURRENT ACTUAL** (當前實際結構)<br>ng-alain based: `core/layout/routes/shared` | Understanding current codebase |
| [Implementation-Directory-Tree(實作目錄樹).md](./Implementation-Directory-Tree(實作目錄樹).md) | **RECOMMENDED FUTURE** (推薦未來結構)<br>Event-Sourcing: `saas/platform/core` | Implementing new Event-Sourcing features |

⚠️ **These are DIFFERENT structures!** Choose the right one for your task.

---

## ⚠️ IMPORTANT: Documentation Hierarchy (重要：文件層級)

### 🎯 PRIMARY SOURCE OF TRUTH (主要真理來源)

**FOR IMPLEMENTATION - ALWAYS FOLLOW THESE (實作時永遠遵循這些):**

1. ✅ **Architecture Documents (架構文件)** - 定義目錄結構與系統架構
2. ✅ **Constraints & Guidelines (約束文件)** - 開發約束與規則
3. 🔵 **Consolidated Documents (整合文件)** - 技術參考，但 **NOT** 用於目錄結構決策

**📋 Conflict Resolution (衝突解決):**  
如有衝突，請參閱 [CONFLICT-RESOLUTION(衝突解決).md](./CONFLICT-RESOLUTION(衝突解決).md)

---

## 📚 Documentation Structure (文件結構)

### 🏗️ Architecture Documents (架構文件) - ⭐ PRIMARY

核心架構設計文件，定義系統整體架構與設計決策。**實作時必須遵循**。

| File | Purpose (用途) |
|------|---------------|
| [Architecture-Guide(架構指南).md](./Architecture-Guide(架構指南).md) | Master navigation guide for all architecture documentation<br>架構文件導覽主索引 |
| [Architecture-Specification(架構規範).md](./Architecture-Specification(架構規範).md) | Comprehensive architecture specification with diagrams<br>完整架構規範與圖表 |
| [Architecture-Summary(架構摘要).md](./Architecture-Summary(架構摘要).md) | Quick reference summary (bilingual)<br>快速參考摘要（中英對照） |
| [Directory-Structure-Comparison(目錄結構比較).md](./Directory-Structure-Comparison(目錄結構比較).md) | Detailed comparison of directory structure options<br>目錄結構選項詳細比較 |

### 📋 Constraints & Guidelines (約束與指南)

系統設計約束、限制與開發指南文件。

| File | Purpose (用途) |
|------|---------------|
| [Constraints-Architecture-Layers(架構分層).md](./Constraints-Architecture-Layers(架構分層).md) | Architecture layering constraints and patterns<br>架構分層約束與模式 |
| [Constraints-Causality-System(因果驅動系統).md](./Constraints-Causality-System(因果驅動系統).md) | Causality-driven system constraints<br>因果驅動系統約束 |
| [Constraints-Directory(目錄結構).md](./Constraints-Directory(目錄結構).md) | Directory structure constraints and rules<br>目錄結構約束與規則 |
| [Constraints-Implementation-Status(實作狀態).md](./Constraints-Implementation-Status(實作狀態).md) | Implementation status and readiness<br>實作狀態與準備度 |
| [Constraints-Restructuring-Report(重組報告).md](./Constraints-Restructuring-Report(重組報告).md) | Restructuring analysis and report<br>重組分析與報告 |
| [Constraints-SaaS-Platform(多租戶平台).md](./Constraints-SaaS-Platform(多租戶平台).md) | Multi-tenant SaaS platform constraints<br>多租戶 SaaS 平台約束 |
| [Constraints-Task-Domain(任務領域).md](./Constraints-Task-Domain(任務領域).md) | Task domain constraints and business rules<br>任務領域約束與業務規則 |

### 📖 Additional References (額外參考)

| File | Purpose (用途) |
|------|---------------|
| [Task-Hierarchy-Guide(任務階層指南).md](./Task-Hierarchy-Guide(任務階層指南).md) | Task hierarchy and organization guide<br>任務階層與組織指南 |
| [Directory-Tree-Structure(目錄樹結構).md](./Directory-Tree-Structure(目錄樹結構).md) | **📍 CURRENT ACTUAL structure in repository (ng-alain based)**<br>**當前實際結構（基於 ng-alain）** |
| [Implementation-Directory-Tree(實作目錄樹).md](./Implementation-Directory-Tree(實作目錄樹).md) | **🌳 RECOMMENDED FUTURE structure for Event-Sourcing implementation**<br>**推薦未來結構（事件溯源實作用）** |

### 📂 Supporting Directories (支援目錄)

| Directory | Status | Purpose (用途) |
|-----------|--------|---------------|
| [system-config/](./system-config/) | ✅ Active | System configuration guidelines (When to use, Optional features, Best practices)<br>系統配置指南（使用場景、可選功能、最佳實踐） |
| [analysis/](./analysis/) | 🔵 Reference | Project analysis documentation using Sequential-Thinking and Software-Planning tools<br>使用 Sequential-Thinking 與 Software-Planning 工具進行的專案分析文件 |
| [consolidated/](./consolidated/) | 🔵 **LEGACY REFERENCE** | ⚠️ Technical patterns & DDD examples only. **DO NOT follow directory structure suggestions**<br>⚠️ 僅供技術模式參考，**不要遵循目錄結構建議** |

---

## ⚠️ KEY DECISION: Directory Structure (關鍵決策：目錄結構)

### ✅ RECOMMENDED STRUCTURE (推薦結構)

**Source (來源):** [Architecture-Specification(架構規範).md](./Architecture-Specification(架構規範).md)

```
src/app/
├── saas/              # 🏢 SaaS Layer (業務功能層)
├── platform/          # 🔧 Platform Layer (基礎設施層)
└── core/              # ⚙️ Core Layer (核心層)
    ├── causality/     # 因果驅動核心
    ├── event-store/   # 事件溯源核心
    ├── aggregate/     # 聚合根
    └── projection/    # 投影
```

### ❌ DEPRECATED STRUCTURE (已廢棄結構)

**Source (來源):** consolidated/00-專案結構索引.md (LEGACY - DO NOT USE)

```
src/app/
├── core/              ❌ Different meaning than Architecture docs
├── infrastructure/    ❌ Should be inside platform/
├── platform/          ⚠️ Different contents
└── features/          ❌ Should be named saas/
```

**⚠️ Why Deprecated (為何廢棄):**  
See [CONFLICT-RESOLUTION(衝突解決).md](./CONFLICT-RESOLUTION(衝突解決).md) for full explanation.

---

## 🚀 Quick Start Guide (快速開始)

### For Architects (架構師)
1. 閱讀 [Architecture-Guide(架構指南).md](./Architecture-Guide(架構指南).md) 獲得整體導覽
2. 詳細研究 [Architecture-Specification(架構規範).md](./Architecture-Specification(架構規範).md)
3. 檢視 [Directory-Structure-Comparison(目錄結構比較).md](./Directory-Structure-Comparison(目錄結構比較).md) 了解目錄結構選擇

### For Team Leads (團隊主管)
1. 閱讀 [Architecture-Summary(架構摘要).md](./Architecture-Summary(架構摘要).md) 快速理解
2. 檢視 [Constraints-Implementation-Status(實作狀態).md](./Constraints-Implementation-Status(實作狀態).md) 了解實作準備度
3. 參考 [analysis/EXECUTIVE_SUMMARY.md](./analysis/EXECUTIVE_SUMMARY.md) 了解專案狀態

### For Developers (開發者)
1. 從 [Architecture-Summary(架構摘要).md](./Architecture-Summary(架構摘要).md) 開始
2. 閱讀相關的 Constraints 文件了解開發約束
3. 參考 [consolidated/](./consolidated/) 目錄獲取詳細技術實作指南

---

## 📊 Documentation Quality Standards (文件品質標準)

### Naming Convention (命名規範)
所有文件遵循 `English(中文).md` 雙語命名格式：
- ✅ `Architecture-Guide(架構指南).md`
- ✅ `Constraints-Task-Domain(任務領域).md`
- ❌ `README_ARCHITECTURE.md` (舊格式)
- ❌ `ng-events_Architecture.md` (舊格式)

### Organization Principles (組織原則)
1. **清晰分類**: 架構文件、約束文件、分析文件分別放置
2. **一致命名**: 所有文件使用雙語格式
3. **明確目的**: 每個文件都有清楚的單一職責
4. **易於導覽**: README 提供完整索引

### File Size Guidelines (檔案大小指南)
- 架構文件: 目標 <20KB，提供完整規範
- 約束文件: 目標 <30KB，涵蓋詳細約束
- 分析文件: 可較大，提供深度分析
- 整合文件: 避免單檔 >4000 字元（Copilot 限制）

---

## 🔄 Migration & Updates (遷移與更新)

### Recent Changes (最近更新)
- ✅ 2026-01-01: 重命名所有架構文件為雙語格式
- ✅ 2026-01-01: 移動文件至 `docs/dev/` 統一管理
- ✅ 2026-01-01: 建立 README 索引與導覽

### Deprecated Files (已廢棄檔案)
以下檔案已整合或重命名，不再維護：
- ❌ `README_ARCHITECTURE.md` → `Architecture-Guide(架構指南).md`
- ❌ `ng-events_Architecture.md` → `Architecture-Specification(架構規範).md`
- ❌ `ARCHITECTURE_SUMMARY.md` → `Architecture-Summary(架構摘要).md`
- ❌ `DIRECTORY_STRUCTURE_COMPARISON.md` → `Directory-Structure-Comparison(目錄結構比較).md`

---

## 🎯 Key Architectural Decisions (關鍵架構決策)

### Recommended Directory Structure (推薦目錄結構)
```
src/app/
├── saas/              # 🏢 SaaS Layer - Multi-tenant features
├── platform/          # 🔧 Platform Layer - Infrastructure
└── core/              # ⚙️ Core Layer - Event-Sourcing + Causality
    ├── causality/     # Causality-Driven core
    └── event-store/   # Event-Sourced core
```

### Technology Stack (技術堆疊)
- **Frontend**: Angular 20+ with Signals, TypeScript 5.9+
- **Backend**: Firebase (Firestore, Auth, Hosting)
- **State Management**: RxJS 7.8+, Angular Signals
- **UI Components**: ng-zorro-antd
- **Testing**: Jasmine, Karma, Cypress/Playwright

### Non-Functional Requirements Targets (非功能需求目標)
| NFR | Target | Validation |
|-----|--------|------------|
| Scalability | 1M events/day/blueprint | Load testing |
| Security | Multi-tenant isolation | Firestore rules + pentest |
| Performance | <100ms event append | APM monitoring |
| Reliability | 99.95% uptime | Firebase SLA |
| Maintainability | >80% test coverage | Coverage reports |

---

## 📞 Support & Contribution (支援與貢獻)

### Questions (問題)
- 架構相關: 參考 [Architecture-Guide(架構指南).md](./Architecture-Guide(架構指南).md)
- 實作相關: 參考 [consolidated/](./consolidated/) 目錄
- 分析相關: 參考 [analysis/](./analysis/) 目錄

### Contributing (貢獻)
1. 遵循雙語命名格式 `English(中文).md`
2. 更新 README.md 索引
3. 保持文件結構一致性
4. 添加清晰的文件用途說明

---

**Last Updated (最後更新)**: 2026-01-01  
**Version (版本)**: 2.0  
**Status (狀態)**: ✅ Standardized & Consistent (已標準化與一致化)
