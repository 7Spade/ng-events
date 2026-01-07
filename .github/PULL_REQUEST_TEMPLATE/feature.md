---
name: New Feature PR
about: Pull request template for new feature module development
---

### Feature Description
- Feature objectives and expected behavior
- Primary usage scenarios

### Related Issue
- Related issue(s): #

### Implementation Notes
- Module-level file split and responsibility description
- Copilot generation constraints (if applicable):
  - Except for Markdown (`.md`) files, any single generated file must not exceed **4000 characters**.
  - Character count is based on UTF-8 characters.
  - Files exceeding the limit must be split following the naming convention:
    - `file-part-01.ts`
    - `file-part-02.ts`
- Notable boundaries, assumptions, or risks

### Checklist
- [ ] Feature-level unit tests completed
- [ ] ESLint / Prettier checks passed
- [ ] Documentation updated as required
- [ ] Copilot-generated files comply with the 4000-character limit
