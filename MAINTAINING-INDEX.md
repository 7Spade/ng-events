# 文件索引維護指南

> 本文件說明如何維護 ng-events 的文件索引系統

**最後更新**: 2026-01-02

---

## 📋 文件索引系統概覽

ng-events 的文件索引系統包含以下核心文件：

### 1. 根目錄導航文件

| 文件 | 用途 | 維護頻率 |
|------|------|---------|
| `README.md` | 專案首頁，快速導航 | 每季度或重大更新 |
| `FILE-INDEX.md` | 完整文件索引 | 每次新增/移除文件 |
| `QUICK-START.md` | 快速開始指南 | 每季度或架構變更 |

### 2. 文件導航文件 (docs/00-index/)

| 文件 | 用途 | 維護頻率 |
|------|------|---------|
| `00-Index(索引).md` | 文件總索引 | 每季度 |
| `01-Reading-Path(閱讀路徑).md` | 角色導向閱讀路徑 | 每季度 |
| `Navigation-Map(導航地圖).md` | 依主題分類導航 | 每季度 |
| `Quick-Reference(快速參考).md` | 快速參考資訊 | 每月 |
| `01-Knowledge-Index(知識索引).md` | 知識點索引 | 依需求更新 |

### 3. 程式碼文件

| 文件 | 用途 | 維護頻率 |
|------|------|---------|
| `packages/README.md` | Packages 架構說明 | 架構變更時 |
| `packages/*/README.md` | 各套件說明 | 套件更新時 |

---

## 🔄 維護流程

### 新增文件時

1. **建立文件** - 在適當的目錄建立 Markdown 文件
2. **更新 FILE-INDEX.md** - 在對應分類下新增項目
3. **更新導航文件** - 如果是重要文件，加入導航地圖
4. **測試連結** - 確保所有連結可用
5. **提交變更** - 提交 PR 並註明新增文件

### 移除文件時

1. **確認影響** - 搜尋所有引用該文件的連結
2. **更新引用** - 更新或移除所有引用
3. **更新索引** - 從 FILE-INDEX.md 移除項目
4. **更新導航** - 從導航文件移除連結
5. **提交變更** - 提交 PR 並註明移除原因

### 重新命名文件時

1. **使用 git mv** - 保留 Git 歷史: `git mv old.md new.md`
2. **全域搜尋替換** - 搜尋舊檔名，替換為新檔名
3. **更新索引** - 更新 FILE-INDEX.md 中的項目
4. **更新導航** - 更新所有導航文件中的連結
5. **測試連結** - 確保所有連結正常
6. **提交變更** - 提交 PR 並註明重新命名

### 重組目錄時

1. **規劃結構** - 先規劃新的目錄結構
2. **批次移動** - 使用腳本批次移動檔案
3. **全域更新連結** - 使用腳本更新所有相對路徑
4. **更新索引** - 完整重建 FILE-INDEX.md
5. **更新導航** - 完整檢查所有導航文件
6. **徹底測試** - 測試所有關鍵路徑的連結
7. **提交變更** - 分批提交 PR，保持可追蹤性

---

## 🔍 連結檢查

### 手動檢查

定期手動檢查重要文件的連結：

```bash
# 檢查 README.md 中的連結
cd /home/runner/work/ng-events/ng-events
grep -o '\[.*\](.*\.md)' README.md | while read line; do
  file=$(echo $line | sed 's/.*(\(.*\))/\1/')
  test -f "$file" || echo "BROKEN: $line"
done
```

### 自動化檢查 (建議未來實作)

考慮使用工具自動化連結檢查：
- [markdown-link-check](https://github.com/tcort/markdown-link-check)
- [awesome_bot](https://github.com/dkhamsing/awesome_bot)
- GitHub Actions workflow

---

## 📊 文件統計

### 當前狀態 (2026-01-02)

- **總文件數**: ~260 個 Markdown 文件
- **主要分類**: 12 個 (00-index 至 99-appendix)
- **程式碼套件**: 5 個 (core-engine, saas-domain, platform-adapters, ui-angular, account-domain)
- **索引文件**: 7 個

### 文件分布

```
docs/
├── 00-index/          6 個文件
├── 01-vision/         5 個文件
├── 02-paradigm/       8 個文件
├── 03-architecture/   19 個文件
├── 04-core-model/     23 個文件
├── 05-process-layer/  8 個文件
├── 06-projection-decision/ 9 個文件
├── 07-operability/    6 個文件
├── 08-governance/     23 個文件 (包含 ADR)
├── 09-anti-patterns/  7 個文件
├── 10-reference/      15 個文件
└── 其他特殊目錄      ~130 個文件
```

---

## ✅ 品質檢查清單

### 每季度檢查

- [ ] README.md 反映當前專案狀態
- [ ] FILE-INDEX.md 包含所有重要文件
- [ ] 所有導航文件連結正常
- [ ] QUICK-START.md 步驟可執行
- [ ] 沒有死連結或 404 錯誤
- [ ] 文件分類邏輯清晰
- [ ] 各角色閱讀路徑完整

### 每月檢查

- [ ] Quick-Reference 資訊最新
- [ ] 新增文件已加入索引
- [ ] 移除文件已從索引刪除
- [ ] 重新命名文件已全域更新

---

## 🚀 改進建議

### 短期 (1-3 個月)

1. **新增自動化連結檢查** - GitHub Actions workflow
2. **建立文件模板** - 標準化新文件格式
3. **增加視覺圖表** - 架構圖、流程圖
4. **新增搜尋功能** - 簡單的 grep 腳本

### 中期 (3-6 個月)

1. **建立文件網站** - 使用 MkDocs 或 Docusaurus
2. **版本控制** - 文件版本與程式碼版本對應
3. **貢獻指南** - 詳細的文件撰寫指南
4. **翻譯支援** - 英文版文件

### 長期 (6-12 個月)

1. **互動式教學** - 線上互動課程
2. **影片教學** - 關鍵概念影片
3. **API 文件自動生成** - TypeDoc 整合
4. **社群貢獻** - 開放社群貢獻文件

---

## 📞 聯絡資訊

如有文件索引相關問題或建議：

- **Issues**: [GitHub Issues](https://github.com/7Spade/ng-events/issues)
- **Pull Requests**: [GitHub PRs](https://github.com/7Spade/ng-events/pulls)
- **討論**: [GitHub Discussions](https://github.com/7Spade/ng-events/discussions)

---

## 🔗 相關資源

- [文件撰寫政策](docs/Documentation-Policy(文檔政策).md)
- [貢獻指南](Contributing(貢獻指南).md)
- [Copilot 記憶指南](docs/🤖-copilot/Copilot-Memory-Guide.md)

---

**維護者**: ng-events Documentation Team  
**最後更新**: 2026-01-02
