# File Size Compliance Skill

- Except for Markdown (`.md`) files, any single file must not exceed **4000 characters**.
- Character count is based on UTF-8 characters.
- When a file exceeds the limit, it must be split into multiple files using the naming convention:
  - `file-part-01.ts`
  - `file-part-02.ts`
- All related tests and lint checks must pass after splitting.
