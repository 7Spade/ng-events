---
title: Note-to-Task Traceability Specification
version: 1.0
date_created: 2026-01-06
last_updated: 2026-01-06
owner: Architecture & Documentation
tags: [process, governance, documentation]
---

# Introduction

Defines mandatory traceability so every note links to a created task waiting for implementation.

## 1. Purpose & Scope

Scope: notes under `docs/`, root design files (e.g., `0.md`, `ng-events_Architecture.md`), and future `/spec/` items.

## 2. Definitions

- **Note**: Markdown knowledge artifact that can generate work.
- **Task**: Planned work tracked via `.copilot-tracking/plans/*.md`.
- **Mapping Index**: JSON file `.copilot-tracking/notes-tasks-map.json` linking notes ↔ tasks.
- **Note ID**: Lowercase hyphenated slug from relative path.
- **Task ID**: Plan filename stem (e.g., `20260106-0md-implementation`).
- **Statuses**: Notes draft/active/retired; Tasks pending/in-progress/blocked/done.

## 3. Requirements, Constraints & Guidelines

- **REQ-001**: Every in-scope note MUST map to ≥1 existing `taskId` in the Mapping Index.
- **REQ-002**: Every task MUST list its `sourceNotes` and appear in the Mapping Index with task status recorded.
- **REQ-003**: Mapping Index MUST be updated in the same commit as note/task changes.
- **REQ-004**: Plan files MUST include a “Source Notes” section referencing `noteId`s from the index.
- **SEC-001**: Mapping data MUST contain no secrets or personal data.
- **CON-001**: Mapping files MUST stay <4,000 characters; split as `notes-tasks-map-part-01.json` etc. if needed.
- **PAT-001**: Traceability is bidirectional: Note → Task via index, Task → Note via plan metadata; orphaned items are prohibited.

## 4. Interfaces & Data Contracts

Mapping Index schema (JSON array stored at `.copilot-tracking/notes-tasks-map.json`):

```json
[
  {
    "noteId": "docs-roadmap",
    "notePath": "docs/roadmap.md",
    "noteStatus": "active",
    "taskIds": ["20260106-0md-implementation"],
    "taskStatus": ["pending"],
    "lastSynced": "2026-01-06T00:00:00Z"
  }
]
```

Fields are mandatory; new ones require a spec update.

## 5. Acceptance Criteria

- **AC-001**: Validation lists every note in the Mapping Index with ≥1 `taskId` whose plan file exists.
- **AC-002**: Each task plan lists `sourceNotes` matching Mapping Index entries and is `pending`/`in-progress` until delivered.
- **AC-003**: Validator fails CI when any orphan note/task or missing cross-reference is detected.

## 6. Test Automation Strategy

- Validation script plus unit tests for parsers.
- Use `ts-node` + `vitest` (or existing runner) to enforce schema and cross-references.
- Fixtures live under `scripts/__fixtures__/notes-tasks-map.json`.
- GitHub Actions job runs `pnpm ts-node scripts/validate-note-task-map.ts` on PRs touching notes, plans, or the Mapping Index.

## 7. Rationale & Context

Notes span docs and architecture files while tasks live in `.copilot-tracking`; explicit links prevent loss of actionable work.

## 8. Dependencies & External Integrations

- **INF-001**: Git version control for `.copilot-tracking` artifacts.
- **DAT-001**: Documentation policy at `docs/Documentation-Policy(文檔政策).md` governs naming.
- **PLT-001**: Node.js/TypeScript runtime for validation.

## 9. Examples & Edge Cases

Edge cases: multiple tasks per note; retired notes keep historical mappings until linked tasks are `done`; binary assets are exempt unless they introduce work.

## 10. Validation Criteria

- Mapping Index exists and matches Section 4 schema.
- Every in-scope note has ≥1 `taskId` recorded.
- Every task plan references ≥1 `noteId` from the index.
- Validator fails CI on missing or mismatched cross-references.

## 11. Related Specifications / Further Reading

- [Documentation Policy](../docs/Documentation-Policy(文檔政策).md)
- [.copilot-tracking Plan Example](../.copilot-tracking/plans/20260106-0md-implementation-plan.instructions.md)
- [Architecture Plan](../ng-events_Architecture.md)

// END OF FILE
