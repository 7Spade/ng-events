# Architecture Decision: Directory Structure for Causality-Driven Event-Sourced System

## 🎯 Problem Statement

設計 Angular 的 Causality-Driven Event-Sourced Process System (具備 SaaS 但 SaaS 不具備 Causality/Event-Sourced) 專案，如何設計目錄結構最容易落地？

## ✅ Recommended Solution: Three Separate Folders

```
src/app/
├── saas/              # 🏢 面向用戶的 SaaS 層
│   ├── task/          # 任務管理
│   ├── payment/       # 請款管理
│   ├── issue/         # 問題追蹤
│   └── blueprint/     # 租戶配置
│
├── platform/          # 🔧 開放的基礎架構平台
│   ├── auth/          # 身份驗證與授權
│   ├── notification/  # 通知服務
│   ├── analytics/     # 分析整合
│   └── adapter/       # 外部系統適配器
│
└── core/              # ⚙️ 核心層（因果驅動 + 事件溯源）
    ├── causality/     # 因果驅動核心（因果引擎、DAG 追蹤）
    ├── event-store/   # 事件溯源核心（事件持久化、重放）
    ├── aggregate/     # 領域聚合根（Task、Payment、Issue）
    └── projection/    # 讀模型與投影
```

## 🌟 Why This Structure?

### ✅ 優勢 (Advantages)

1. **清晰的關注點分離 (Clear Separation of Concerns)**
   - 每層都有明確、定義良好的職責
   - SaaS 層：業務功能
   - Platform 層：基礎設施服務
   - Core 層：事件溯源 + 因果追蹤

2. **團隊協作擴展性 (Team Scalability)**
   - 不同團隊可以擁有不同的層
   - 減少代碼衝突
   - 並行開發更容易

3. **可重用性 (Reusability)**
   - Core 和 Platform 可以提取為 npm 套件
   - 可在多個項目中共享
   - 促進代碼重用

4. **依賴控制 (Dependency Control)**
   - 強制單向依賴：SaaS → Platform → Core
   - 防止循環依賴
   - 更容易理解和維護

5. **未來擴展性 (Future-Proof)**
   - 添加新的 SaaS 功能不會污染 Core
   - 各層可以獨立演進
   - 易於重構

### ❌ 不推薦的替代方案

```
src/app/
├── saas/
├── platform/
└── core/              # 混合了因果和事件溯源
```

**為什麼不推薦？**
- ❌ 混合了因果和事件溯源關注點
- ❌ 更難理解模塊邊界
- ❌ 難以提取為庫
- ❌ 架構意圖不夠清晰

## 📋 Implementation Checklist

### Phase 1: MVP (4-6 週)

- [ ] 創建 Firebase 項目（dev, staging, prod）
- [ ] 實現推薦的目錄結構
- [ ] 建立事件存儲服務
- [ ] 實現 TaskAggregate（事件溯源）
- [ ] 構建 Task UI 組件
- [ ] 實現簡單的投影服務
- [ ] 添加基於 Blueprint 的多租戶
- [ ] 實現身份驗證

### Phase 2: Advanced Features (8-12 週)

- [ ] 構建完整的因果引擎（DAG）
- [ ] 實現聚合的事件重放
- [ ] 添加 Payment 工作流
- [ ] 實現 Issue 追蹤
- [ ] 集成外部系統（支付網關）
- [ ] 添加通知服務
- [ ] 實現時間旅行調試

## 🔑 Key Architectural Patterns

1. **Event-Sourcing**: 所有狀態變更存儲為事件
2. **CQRS**: 寫模型（聚合）和讀模型（投影）分離
3. **Causality DAG**: 事件依賴性的有向無環圖
4. **Multi-Tenancy**: 基於 Blueprint 的租戶隔離
5. **Domain-Driven Design**: 清晰的邊界上下文

## 📊 Technology Stack

**Frontend:**
- Angular 20+ (Signals)
- TypeScript 5.9+
- RxJS (事件流)
- ng-zorro-antd (UI)

**Backend:**
- Firebase Firestore (數據庫)
- Firebase Authentication
- Firebase Hosting (CDN)
- Cloud Functions (可選)

## 📈 Non-Functional Requirements

- **Scalability**: 每個 Blueprint 每天 1M 事件
- **Security**: Firestore 安全規則強制租戶隔離
- **Performance**: 事件追加 <100ms，查詢 <200ms
- **Reliability**: 99.95% SLA，多區域複製

## 📚 Full Documentation

詳細的架構文檔請參閱：`Ng-Events-Architecture.md`

包含：
- ✅ 系統上下文圖
- ✅ 組件架構圖
- ✅ 部署架構
- ✅ 數據流圖
- ✅ 時序圖
- ✅ NFR 分析
- ✅ 風險與緩解策略
- ✅ 技術棧建議

## 🚀 Quick Start

```bash
# 1. 創建目錄結構
cd src/app
mkdir -p saas/{task,payment,issue,blueprint}
mkdir -p platform/{auth,notification,analytics,adapter}
mkdir -p core/{causality,event-store,aggregate,projection}

# 2. 設置 Firebase
firebase projects:create ng-events-dev

# 3. 定義事件模式
# 參見 Ng-Events-Architecture.md 中的事件架構

# 4. 配置 Firestore 安全規則
# 參見架構文檔中的安全部分
```

## ✅ Conclusion

**Three Separate Folders** 結構是最佳選擇，因為它提供：
- 最清晰的架構邊界
- 最佳的長期可維護性
- 最容易的團隊協作
- 最簡單的庫提取
- 最符合 DDD 原則

從 Phase 1 MVP 開始，驗證架構後再演進到 Phase 2 高級功能。

---

**Status**: ✅ Ready for Implementation
**Document Version**: 1.0
**Date**: 2026-01-01
