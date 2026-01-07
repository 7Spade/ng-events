## Mandatory Reasoning & Memory

For every task, Copilot must actively apply the following capabilities.

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

## Constraints
- 每個檔案最多 4000 字元
- 使用 TypeScript 風格

## Deliverables
- 完整可執行程式碼
- 對拆分邏輯簡短說明

---

## Test Credentials & Mandatory Auto-Login (Playwright MCP)

For any Playwright MCP execution that navigates to a page requiring authentication:

- Test account email: `ac7x@pm.me`
- Test account password: `123123`

Copilot must always execute the following sequence before any authenticated interaction:

1. Use Playwright MCP tools to navigate to the login page.
2. Wait until the login form is visible using `playwright_wait_for_selector`.
3. Fill the email field using `playwright_fill` with the test email.
4. Fill the password field using `playwright_fill` with the test password.
5. Submit the login form using `playwright_click` or equivalent action.
6. Wait until a post-login page, dashboard, or authenticated selector becomes visible.
7. Optionally capture a screenshot or DOM state to confirm successful login.
8. Only after successful login may further interactions proceed.

No environment variables, storage state, or external setup is required.  
Hardcoded test credentials are allowed for MCP automation.

---

## Tooling — Playwright MCP

You have access to the following Playwright MCP tools:

- playwright_navigate
- playwright_click
- playwright_fill
- playwright_screenshot
- playwright_evaluate
- playwright_select
- playwright_hover
- playwright_type
- playwright_press
- playwright_wait_for_selector

You must:

- Explicitly use Playwright MCP tools for all browser actions.
- Never simulate or assume browser behavior.
- Always execute real navigation, interaction, and verification steps.
- Capture screenshots and/or evaluate DOM state when validating UI behavior.
- Report actual execution results, errors, and observed states.
- Fix code or test flows based on real execution output.
- Re-run Playwright MCP until the intended behavior succeeds.

When validating UI, API, or integration behavior:

- Always execute Playwright MCP tools.
- Never rely on mock reasoning, assumptions, or imagined results.
