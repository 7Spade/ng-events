# Documentation Naming Standard Rules

**Version:** 2.0 (Phase 2 - Post PR #19)  
**Last Updated:** 2026-01-02  
**Context:** Building on PR #19 normalization work

## Standard Format

```
NN-Primary-Title-Case-Name(中文翻譯).md
```

### Format Components

1. **NN** = Optional two-digit number (01, 02, ...) for sequential files
2. **Primary-Title-Case-Name** = English name with all words capitalized and hyphenated
3. **(中文翻譯)** = Chinese translation in parentheses at the end
4. **.md** = Markdown file extension

## Core Rules

### Rule 1: Title-Case with Hyphens

All English words must be capitalized and separated by hyphens.

✅ **Good Examples:**
- `Multi-Tenant-Vision(多租戶願景).md`
- `Core-Not-Angular(核心不屬於Angular).md`
- `Event-Projection-Angular-Flow(事件投影流程).md`

❌ **Bad Examples:**
- `multi-Tenant-Vision(多租戶願景).md` ← mixed case
- `core-not-angular(核心不屬於Angular).md` ← lowercase
- `Event_Projection_Angular_Flow(事件投影流程).md` ← underscores

### Rule 2: Emoji Placement

Emoji prefixes belong in **directory names ONLY**, never in file names.

✅ **Good:**
```
docs/
  ✨-Core-Ideas/
    01-Design-Goals(設計目標).md
    02-Two-Fields-Shape(兩個欄位長什麼樣).md
```

❌ **Bad:**
```
docs/
  ✨-Core-Ideas/
    01-✨Design-Goals(設計目標).md  ← emoji in filename
    ✨-Two-Fields-Shape(兩個欄位長什麼樣).md  ← emoji in filename
```

### Rule 3: Chinese Translation Format

Chinese text must always be in parentheses at the end of the filename.

✅ **Good:**
- `System-Goals(系統目標).md`
- `Authorization-Layers(權限分層).md`
- `Multi-Tenant-Vision(多租戶願景).md`

❌ **Bad:**
- `系統目標-System-Goals.md` ← Chinese first
- `System-Goals-系統目標.md` ← no parentheses
- `System-Goals(系统目标).md` ← simplified characters (use traditional: 繁體)

### Rule 4: Sequential Numbering

Use two-digit numbers for files in a logical sequence within a directory.

✅ **Good:**
```
01-Problem-Statement(問題陳述).md
02-System-Goals(系統目標).md
03-Non-Goals(非目標).md
```

❌ **Bad:**
```
1-Problem-Statement(問題陳述).md  ← single digit
Problem-Statement(問題陳述).md   ← missing number when part of sequence
```

### Rule 5: No Duplicate Files

When both numbered and unnumbered versions exist, keep only the numbered version.

✅ **Keep:**
- `04-Core-Principles(核心原則).md`

❌ **Remove:**
- `Core-Principles(核心原則).md` ← duplicate without number

## Special Cases

### README Files

README files follow the standard format with capitalization:

✅ **Good:**
- `Readme(讀我).md`

❌ **Bad:**
- `README.md` ← all caps
- `readme.md` ← lowercase

### Index Files

Index files use the standard format:

✅ **Good:**
- `00-Index(索引).md`
- `Navigation-Map(導航地圖).md`

### Files with Only Chinese Names

If a file has only a Chinese name (no English equivalent yet), keep it as-is but plan to add English name:

Current: `00-知識提取索引.md`  
Planned: `00-Knowledge-Extraction-Index(知識提取索引).md`

## Migration Strategy

When renaming files to meet this standard:

1. **Preserve Git History:** Use `git mv` for all renames
2. **Update References:** Search and update all cross-references in other docs
3. **Update Index:** Modify `docs清單.md` to reflect new names
4. **Test Links:** Verify all internal links still work
5. **Commit Atomically:** Group related renames in single commits

## Validation Checklist

Before considering a file name compliant, verify:

- [ ] All English words are Title-Case
- [ ] Words separated by hyphens (not underscores or spaces)
- [ ] No emoji characters in filename (only in directory names)
- [ ] Chinese translation in parentheses at end (if bilingual)
- [ ] Traditional Chinese characters used (繁體 not 简体)
- [ ] Two-digit numbering if part of sequence
- [ ] No duplicate unnumbered version exists

## Examples: Before and After

| Before | After | Issue Fixed |
|--------|-------|-------------|
| `01-✨multi-Tenant-Vision-多租户愿景(...)` | `01-Multi-Tenant-Vision(多租戶願景).md` | Emoji + mixed case |
| `01-✨core-Not-Angular-核心不属于angular(...)` | `01-Core-Not-Angular(核心不屬於Angular).md` | Emoji + lowercase |
| `Core-Principles(核心原則).md` | _Remove (duplicate)_ | Unnumbered duplicate |
| `✨Testing-Strategy-测试策略.md` | `Testing-Strategy(測試策略).md` | Emoji + simplified Chinese |

## References

- **PR #19:** Initial underscore to hyphen normalization
- **Related Docs:**
  - `docs清單.md` - Master file listing
  - `docs/📌-plans/docs-inventory-part-*.md` - File inventory parts 01-08
  - `docs/📌-plans/renaming-plan.md` - Detailed renaming execution plan

// END OF FILE
