# Documentation Policy (文件政策)

> **防止未來衝突的文件管理規範**

---

## 🎯 目的 (Purpose)

本政策確保文件組織清晰、命名一致、無重複衝突，降低技術債務並提升可維護性。

---

## 📋 三層文件系統 (Three-Tier Documentation System)

### 1️⃣ ✨ 知識精華 (Knowledge Essence Files)

**定義**: 從 ✨/ 目錄提取的核心知識點

**命名格式**:
```
##-✨EnglishName-中文名称.md
```

**範例**:
- `07-✨Account-Model-账户模型.md`
- `09-✨Event-Essence-事件本质.md`

**規範**:
- ✅ MUST: 檔案大小 ≤ 4,000 bytes
- ✅ MUST: 使用 ✨ 前綴
- ✅ MUST: 中英對照命名
- ✅ MUST: 聚焦核心概念，快速閱讀（5 分鐘內理解）
- ❌ MUST NOT: 修改已發布的 ✨ 文件（不可變知識）
- ❌ MUST NOT: 包含實作細節或大量範例

**用途**:
- 快速參考手冊
- 團隊入職「醒腦」材料
- 技術決策核心依據

---

### 2️⃣ V2 規範定義 (Canonical V2 Files)

**定義**: 當前權威的技術定義與規範

**命名格式**:
```
##-EnglishName-名称V2.md
```

**範例**:
- `01-Event-Model-事件模型V2.md`
- `02-Causality-Model-因果模型V2.md`

**規範**:
- ✅ MUST: V2 後綴表示最新版本
- ✅ MUST: 中英對照命名
- ✅ SHOULD: 檔案大小 <10,000 bytes（建議）
- ✅ MUST: 當有 V2 時，刪除或歸檔舊版本（無 V2 後綴）
- ❌ MUST NOT: 同時存在 V2 與非 V2 版本

**用途**:
- 技術規範參考
- API 定義與接口
- 系統架構標準

---

### 3️⃣ 詳解文件 (Detailed Guide Files)

**定義**: 深入實作指南與完整範例

**命名格式**:
```
##-EnglishName-Detailed-名称详解.md
或
##-EnglishName-中文名称.md (無 Detailed 後綴，內容詳盡)
```

**範例**:
- `05-Account-Model-Detailed-账户模型详解.md`
- `05-Authorization-Layers-Detailed-权限分层详解.md`

**規範**:
- ✅ MUST: 中英對照命名
- ✅ SHOULD: 檔案大小 <15,000 bytes（避免過長）
- ✅ MUST: 包含實作範例、程式碼片段
- ✅ SHOULD: 連結至相關的 ✨ 或 V2 文件

**用途**:
- 深入學習材料
- 實作步驟指南
- 程式碼範例庫

---

## 🔢 編號規則 (Numbering Rules)

### 檔案編號格式

```
##-[Type]-EnglishName-中文名称.md
```

- `##`: 兩位數字，01-99
- `[Type]`: ✨ 或空白或 Detailed
- `EnglishName`: 英文名稱（PascalCase）
- `中文名称`: 中文名稱

### 編號分配策略

**docs/03-architecture/**:
- 01-06: ✨ 知識文件
- 05, 07-14: Detailed 文件（避開 ✨ 文件編號）

**docs/04-core-model/**:
- 01-04: V2 規範文件
- 05-06: Detailed 文件
- 07-17: ✨ 知識文件
- 18-21: 保留（已刪除舊版）

**docs/05-process-layer/**:
- 01-04: 一般文件
- 05-08: ✨ 知識文件

**docs/10-reference/**:
- 01-03, 08-09: 一般文件
- 04-07: ✨ 知識文件

---

## 🚫 禁止事項 (Prohibited Actions)

### ❌ 絕對禁止

1. **重複內容**: 同一主題不得有多個未標明版本的文件
   - ❌ 錯誤: `Event-Model.md` 與 `Event-Model-事件模型.md` 同時存在
   - ✅ 正確: 保留 `01-Event-Model-事件模型V2.md`

2. **混用命名**: 所有文件必須中英對照
   - ❌ 錯誤: `account-model.md` (僅英文)
   - ✅ 正確: `05-Account-Model-Detailed-账户模型详解.md`

3. **✨ 檔案超過大小限制**
   - ❌ 錯誤: ✨ 文件 > 4,000 bytes
   - ✅ 正確: 精簡內容或拆分為 Detailed 文件

4. **V2 與非 V2 共存**
   - ❌ 錯誤: `Event-Model.md` 與 `Event-Model-V2.md` 同時存在
   - ✅ 正確: 刪除舊版，僅保留 V2

5. **空白佔位符文件**
   - ❌ 錯誤: 建立 < 200 bytes 的空文件作為 TODO
   - ✅ 正確: 完整實作後再建立文件

---

## ✅ 新增文件流程 (Adding New Files)

### Step 1: 確定文件類型

問自己:
- 這是核心知識精華嗎？ → ✨ 文件
- 這是技術規範定義嗎？ → V2 文件
- 這是實作詳解嗎？ → Detailed 文件

### Step 2: 選擇適當編號

1. 查看目標目錄現有文件編號
2. 選擇未使用的編號
3. 避免與 ✨ 文件衝突（若為 Detailed）

### Step 3: 命名文件

使用對應格式:
- ✨: `##-✨EnglishName-中文名称.md`
- V2: `##-EnglishName-名称V2.md`
- Detailed: `##-EnglishName-Detailed-名称详解.md`

### Step 4: 更新索引

1. 更新 `docs/00-index/01-✨Knowledge-Index-知识索引.md` (若為 ✨ 文件)
2. 更新對應目錄的 `README.md`
3. 新增交叉引用至相關文件

### Step 5: 驗證

- [ ] 檔案大小符合規範
- [ ] 命名格式正確（中英對照）
- [ ] 無重複內容
- [ ] 索引已更新
- [ ] 交叉引用完整

---

## 🔄 更新文件流程 (Updating Files)

### 更新 ✨ 文件

❌ **禁止**: ✨ 文件是不可變的知識點
✅ **替代方案**: 
- 若需重大修改 → 建立新的 V2 或 Detailed 文件
- 若需小幅修正 → 與團隊討論是否必要

### 更新 V2 文件

- 使用 V3, V4... 後綴建立新版本
- 保留舊版本一段時間（至少 1 個月）
- 更新所有引用指向新版本
- 在舊版本開頭加上棄用警告

### 更新 Detailed 文件

- 可直接修改（非不可變）
- 建議在 commit message 說明重大變更
- 保持與 ✨ 和 V2 文件的一致性

---

## 📂 目錄組織規範 (Directory Organization)

### 標準目錄結構

```
docs/
├── 00-index/          # 總索引與導讀
├── 01-vision/         # 願景與目標
├── 03-architecture/   # 架構設計
├── 04-core-model/     # 核心領域模型
├── 05-process-layer/  # 流程層模式
├── 06-projection-decision/ # 投影決策
├── 10-reference/      # 參考資料
└── 99-appendix/       # 附錄
```

### 每個目錄必須包含

1. **README.md**: 目錄說明、檔案組織、學習路徑
2. **至少一個實質內容文件** (非空白佔位符)
3. **編號一致性**: 編號範圍不重疊、邏輯清晰

---

## 🔍 衝突檢測清單 (Conflict Detection Checklist)

在 PR merge 前檢查:

### 檔案命名衝突
- [ ] 無相同檔名（忽略 ✨/V2/Detailed 前綴）
- [ ] 所有檔案均為中英對照
- [ ] 編號無重複

### 內容衝突
- [ ] 無相同主題的多個未標版本文件
- [ ] ✨ 文件與 Detailed 文件內容一致（概念層面）
- [ ] V2 文件已替代舊版本

### 大小限制
- [ ] 所有 ✨ 文件 ≤ 4,000 bytes
- [ ] Detailed 文件 <15,000 bytes (建議)

### 索引完整性
- [ ] 新增文件已加入對應索引
- [ ] 交叉引用雙向完整
- [ ] README.md 已更新

---

## 📝 Commit Message 規範 (Commit Message Format)

### 新增文件
```
docs: Add ✨ file for [Topic] - [ChineseTopic]

- Location: docs/##-category/
- File: ##-✨EnglishName-中文名称.md
- Size: ### bytes (≤4000 ✅)
- Purpose: [簡述用途]
```

### 更新文件
```
docs: Update [FileType] file - [Topic]

- File: docs/##-category/##-Name.md
- Changes: [變更摘要]
- Impact: [影響範圍]
```

### 刪除文件
```
docs: Remove duplicate file - superseded by V2

- Deleted: docs/##-category/##-Name.md
- Reason: Superseded by ##-Name-V2.md
- Impact: [影響說明]
```

---

## 🎓 最佳實踐 (Best Practices)

### ✨ 文件撰寫

1. **一句話摘要**: 開頭必須有「醒腦」結論
2. **核心概念優先**: 避免實作細節
3. **圖文並茂**: 使用簡潔的 ASCII 圖或表格
4. **實例說明**: 一個精準的反例 > 十個正例

### Detailed 文件撰寫

1. **結構清晰**: 使用層級標題 (H2, H3)
2. **程式碼範例**: 完整可執行，附註解
3. **參考連結**: 連結至 ✨ 和 V2 文件
4. **故障排除**: 包含常見問題與解決方案

### README 維護

1. **更新頻率**: 每次新增/刪除文件時更新
2. **導讀路徑**: 提供推薦閱讀順序
3. **檔案說明**: 每個文件一句話摘要

---

## 📞 問題回報 (Issue Reporting)

### 發現文件衝突

1. 建立 Issue: `[DOCS] Conflict: [Description]`
2. 標記為 `documentation` + `conflict`
3. 附上衝突文件清單
4. 建議解決方案（選填）

### 文件品質問題

1. 建立 Issue: `[DOCS] Quality: [Description]`
2. 標記為 `documentation` + `quality`
3. 說明問題（過時、錯誤、不清晰）
4. 建議改進方案（選填）

---

## 🔄 定期審查 (Periodic Review)

### 每季度檢查

- [ ] 所有 ✨ 文件仍符合大小限制
- [ ] V2 文件是否需要更新至 V3
- [ ] Detailed 文件是否需要補充新實作
- [ ] 索引系統是否完整
- [ ] 無遺留空白佔位符
- [ ] 交叉引用無失效連結

### 年度大掃除

- [ ] 歸檔超過 1 年未更新的 Detailed 文件
- [ ] 刪除已棄用的 V2 文件（保留 1 年後）
- [ ] 重新組織目錄結構（若有需要）
- [ ] 更新文件政策（本文件）

---

## 📚 參考資源 (References)

- **Master Index**: `docs/00-index/01-✨Knowledge-Index-知识索引.md`
- **Architecture README**: `docs/03-architecture/README.md`
- **Core Model README**: `docs/04-core-model/README.md`

---

**最後更新**: 2026-01-02  
**版本**: 1.0  
**維護者**: Development Team
