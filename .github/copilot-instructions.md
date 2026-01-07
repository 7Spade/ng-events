## Mandatory Reasoning & Memory

For every task, Copilot must actively apply the following capabilities:

### 1. Sequential-Thinking
- Break down the task into explicit, ordered steps before execution.
- Do not skip reasoning steps or assume outcomes.
- Validate each step before proceeding to the next.

### 2. Software-Planning-Tool
- Produce a concise implementation plan before writing final code.
- Identify modules, file boundaries, dependencies, and testing strategy.
- Adjust the plan when constraints or failures are discovered.

### 3. Copilot Memory
- Retrieve any relevant repository memory before planning or coding.
- Reuse existing conventions, architectural rules, and decisions.
- Persist new important insights back into memory when applicable.

These capabilities are mandatory and must not be skipped.

---

Constraints:
- 每個檔案最多 4000 字元
- 使用 TypeScript 風格

Deliverables:
- 完整可執行程式碼
- 對拆分邏輯簡短說明

---

## Test Credentials & Auto-Login

For any Playwright MCP test that navigates to a page requiring login:

- Test account email: `ac7x@pm.me`
- Test account password: `123123`
- Copilot should automatically perform login at the start of the test
- No need to setup env variables or storageState, just use these credentials directly

---

## Tooling — Playwright MCP

You have access to Playwright MCP.

You must:
- Generate Playwright tests for all UI flows
- Execute Playwright MCP to run tests
- Automatically log in using the provided test credentials before interacting with any page
- Read test output and error traces
- Fix code or tests based on execution results
- Re-run Playwright MCP until all tests pass

When validating UI, API, or integration behavior:
- Always execute Playwright MCP
- Never rely on mock reasoning or assumptions
