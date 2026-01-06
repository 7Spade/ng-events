# Documentation Renaming Plan

**Date:** 2026-01-02  
**Context:** Phase 2 of naming consistency following PR #19  
**Total Files:** 260 markdown files  
**Files Needing Changes:** ~54 with emoji + duplicates

## Analysis Summary

### Issues Identified

1. **54 files with emoji in filename** (should be in directory name only)
2. **~50+ potential duplicate files** (unnumbered versions when numbered exists)
3. **Mixed case in compound words** (e.g., `multi-Tenant` instead of `Multi-Tenant`)
4. **Simplified Chinese** in some files (应使用繁體)

### Categories by Priority

## Priority 1: Remove Emoji from Filenames (54 files)

These files have ✨ or other emoji in the filename, violating Rule 2.

### 10-reference Directory (6 files)

| Current | New | Reason |
|---------|-----|--------|
| `07-✨Testing-Strategy-测试策略.md` | `07-Testing-Strategy(測試策略).md` | Remove emoji + use traditional Chinese |
| `04-✨best-Practices-最佳实践(...)` | `04-Best-Practices(最佳實踐).md` | Remove emoji + Title-Case + traditional Chinese |
| `01-✨命名規範-Part1(全域命名規範).md` | `01-Naming-Convention-Part1(全域命名規範).md` | Remove emoji + add English name |
| `02-✨命名規範-Part2(命名規範與鐵律).md` | `02-Naming-Convention-Part2(命名規範與鐵律).md` | Remove emoji + add English name |
| `06-✨Implementation-Guide-实施指南.md` | `06-Implementation-Guide(實施指南).md` | Remove emoji + traditional Chinese |
| `05-✨Advanced-Patterns-高级模式.md` | `05-Advanced-Patterns(高級模式).md` | Remove emoji + traditional Chinese |

### 04-core-model Directory (8 files)

| Current | New | Reason |
|---------|-----|--------|
| `01-✨account核心概念(Account 的核心概念).md` | `01-Account-Core-Concepts(Account核心概念).md` | Remove emoji + standardize |
| `02-✨邏輯容器角色(邏輯容器的角色定位).md` | `02-Logical-Container-Role(邏輯容器角色).md` | Remove emoji + add English |
| `03-✨account與entity區別(Account、Entity、Actor 的區別).md` | `03-Account-Entity-Distinction(Account與Entity區別).md` | Remove emoji + add English |
| `04-✨moduleregistry型別(ModuleRegistry 型別定義).md` | `04-Module-Registry-Type(ModuleRegistry型別).md` | Remove emoji + Title-Case |
| `05-✨ownership與membership(Ownership 與 Membership).md` | `05-Ownership-And-Membership(Ownership與Membership).md` | Remove emoji + Title-Case |
| `06-✨stateless解法(Stateless 的設計解法).md` | `06-Stateless-Solution(Stateless解法).md` | Remove emoji + add English |
| `07-✨workspace資料(Workspace 的資料層).md` | `07-Workspace-Data-Layer(Workspace資料).md` | Remove emoji + add English |
| `08-✨causality因果關係(Causality 因果關係).md` | `08-Causality-Relationship(Causality因果關係).md` | Remove emoji + add English |

### 03-architecture Directory (5 files)

| Current | New | Reason |
|---------|-----|--------|
| `01-✨core-Not-Angular-核心不属于angular(...)` | `01-Core-Not-Angular(核心不屬於Angular).md` | Remove emoji + Title-Case + traditional |
| `01-✨架構分層問題(架構分層問題分析).md` | `01-Architecture-Layering-Issues(架構分層問題).md` | Remove emoji + add English |
| `02-✨authorization-Layers-权限分层(...)` | `02-Authorization-Layers(權限分層).md` | Remove emoji + Title-Case + traditional |
| `02-✨workspace設計(Workspace 設計原則).md` | `02-Workspace-Design(Workspace設計).md` | Remove emoji + add English |
| `03-✨packages-Structure-目录结构(...)` | `03-Packages-Structure(Packages目錄結構).md` | Remove emoji + Title-Case + traditional |

### 01-vision Directory (1 file)

| Current | New | Reason |
|---------|-----|--------|
| `01-✨multi-Tenant-Vision-多租户愿景(...)` | `01-Multi-Tenant-Vision(多租戶願景).md` | Remove emoji + Title-Case + traditional |

### ✨-Core-Ideas Directory (31 files)

All files in this directory are in an emoji-prefixed directory, which is correct. However, some individual files also have emoji:

| Current | New | Reason |
|---------|-----|--------|
| `🔑-Annotations-2(標註).md` | `Annotations-Part2(標註).md` | Remove emoji from filename + add numbering |
| `🔁-Timeout-Retry-Dead-letter-Flow(流程).md` | `Timeout-Retry-Dead-Letter-Flow(流程).md` | Remove emoji + Title-Case |
| `🔥-Event-Store-Responsibility(...)` | `Event-Store-Responsibility(Event-Store職責).md` | Remove emoji |
| (Continue for remaining ~28 files with emoji) | | |

### Other Directories

Similar pattern for remaining emoji files in:
- `05-process-layer/` (3 files)
- `06-projection-decision/` (2 files)
- `08-governance/` (4 files)
- `📦-Project-Knowledge/` (5 files)
- `🗃️-Reference/` (8 files)

## Priority 2: Remove Duplicate Files (Estimated ~20 files)

Keep numbered version, remove unnumbered duplicate.

### 02-paradigm Directory

| Keep | Remove | Reason |
|------|--------|--------|
| `04-Core-Principles(核心原則).md` | `Core-Principles(核心原則).md` | Numbered version preferred |
| `01-System-Definition(系統定義).md` | `System-Definition(系統定義).md` | Numbered version preferred |
| `02-Why-Not-Crud(為何不用CRUD).md` | `Why-Not-Crud(為何不用CRUD).md` | Numbered version preferred |
| `03-Why-Not-Pure-Es(為何不用純ES).md` | `Why-Not-Pure-Es(為何不用純ES).md` | Numbered version preferred |

### Other Directories

Check and remove duplicates in:
- `03-architecture/`
- `04-core-model/`
- `05-process-layer/`
- `06-projection-decision/`

## Priority 3: Fix Title-Case Issues (Estimated ~15 files)

Files with lowercase letters in compound words.

| Current | New | Reason |
|---------|-----|--------|
| `authorization-Layers(...)` | `Authorization-Layers(...)` | Capitalize first word |
| `multi-Tenant-Vision(...)` | `Multi-Tenant-Vision(...)` | Capitalize first word |
| `packages-Structure(...)` | `Packages-Structure(...)` | Capitalize first word |

## Priority 4: Add Missing English Names (Estimated ~10 files)

Files with only Chinese names should get English equivalents.

| Current | Proposed | Reason |
|---------|----------|--------|
| `00-知識提取索引.md` | `00-Knowledge-Extraction-Index(知識提取索引).md` | Add English name |
| `命名規範-Part1(...)` | `Naming-Convention-Part1(...)` | Add English name |

## Implementation Strategy

### Phase 1: Inventory (✅ Completed)
- [x] Created 8 inventory files listing all 260 docs
- [x] Identified files needing changes

### Phase 2: Document Standards (✅ Completed)
- [x] Created `naming-standard-rules.md`
- [x] Defined 5 core rules with examples

### Phase 3: Systematic Renaming (Next)

Execute in this order to minimize disruption:

1. **Remove emoji from filenames** (Priority 1)
   - Start with `10-reference/` (6 files)
   - Then `04-core-model/` (8 files)
   - Then `03-architecture/` (5 files)
   - Continue with remaining directories

2. **Remove duplicates** (Priority 2)
   - Start with `02-paradigm/` (4 files)
   - Check and process other directories

3. **Fix Title-Case** (Priority 3)
   - Process files with mixed case

4. **Add English names** (Priority 4)
   - Process Chinese-only files

### Phase 4: Update References

After each directory is renamed:

1. Search for references to old filenames in all docs
2. Update cross-references
3. Update `docs清單.md`
4. Test internal links

### Phase 5: Validation

- [ ] All renamed files accessible
- [ ] No broken links
- [ ] docs清單.md accurate
- [ ] Git history preserved
- [ ] All cross-references updated

## Execution Commands

```bash
# Example for renaming a file with emoji
cd /home/runner/work/ng-events/ng-events
git mv "docs/10-reference/07-✨Testing-Strategy-测试策略.md" \
       "docs/10-reference/07-Testing-Strategy(測試策略).md"

# Update references
grep -r "07-✨Testing-Strategy" docs/ --include="*.md" | \
  sed 's/07-✨Testing-Strategy/07-Testing-Strategy/g'

# For duplicates - just remove the unnumbered version
git rm "docs/02-paradigm/Core-Principles(核心原則).md"
```

## Risk Mitigation

1. **Use `git mv`** to preserve file history
2. **Process incrementally** - one directory at a time
3. **Update references immediately** after each rename
4. **Test links** before moving to next batch
5. **Commit frequently** with clear messages

## Success Criteria

- All 260 docs follow the naming standard
- No emoji in filenames (only in directory names)
- No duplicate files (numbered vs unnumbered)
- All files are Title-Case
- Traditional Chinese used (繁體 not 简体)
- All cross-references updated and working
- Git history preserved for all renames

// END OF FILE
