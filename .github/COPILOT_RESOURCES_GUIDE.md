# GitHub Copilot Resources Guide

## Overview

This document provides a comprehensive guide to the GitHub Copilot customizations pulled from the [awesome-copilot](https://github.com/github/awesome-copilot) repository. These resources significantly enhance GitHub Copilot's capabilities for the ng-events project.

## 📦 Resources Summary

We have integrated the following resources:

- **131 Custom Agents** - Specialized AI agents for specific development workflows
- **152 Instructions** - Coding standards and best practices that auto-apply to file patterns
- **126 Prompts** - Task-specific prompts for code generation and problem-solving

## 🗂️ Directory Structure

```
.github/
├── agents/           # 131 custom agent definitions
├── instructions/     # 152 coding standard files
└── prompts/          # 126 task-specific prompts
```

## 🤖 Custom Agents

### What are Custom Agents?

Custom agents are specialized GitHub Copilot agents that integrate with MCP (Model Context Protocol) servers to provide enhanced capabilities for specific workflows and tools.

### Key Agents for Angular/TypeScript Development

#### Core Development Agents

1. **angular-specialist.agent.md**
   - Expert in Angular framework best practices
   - Assists with Angular component development
   - Usage: `@angular-specialist help me build a reactive form component`

2. **typescript-expert.agent.md**
   - Deep TypeScript expertise
   - Type system optimization
   - Usage: `@typescript-expert review my type definitions`

3. **frontend-performance-expert.agent.md**
   - Web performance optimization
   - Bundle size analysis
   - Usage: `@frontend-performance-expert optimize this component`

4. **accessibility.agent.md**
   - WCAG compliance and a11y best practices
   - Usage: `@accessibility audit this component for accessibility`

#### Architecture & Design Agents

5. **arch.agent.md**
   - Software architecture guidance
   - System design patterns
   - Usage: `@arch design a scalable event sourcing architecture`

6. **api-architect.agent.md**
   - RESTful API design
   - API best practices
   - Usage: `@api-architect design endpoints for task management`

7. **domain-driven-design.agent.md**
   - DDD patterns and practices
   - Bounded context design
   - Usage: `@domain-driven-design help model the task aggregate`

#### Event Sourcing & Backend Agents

8. **event-sourcing-expert.agent.md** ⭐ (Already in project)
   - Event sourcing patterns
   - CQRS implementation
   - Usage: `@event-sourcing-expert implement event replay logic`

9. **firebase-specialist.agent.md**
   - Firebase/Firestore integration
   - Real-time database patterns
   - Usage: `@firebase-specialist optimize Firestore queries`

10. **database-optimization.agent.md**
    - Database query optimization
    - Indexing strategies
    - Usage: `@database-optimization analyze query performance`

#### Code Quality & Testing Agents

11. **code-reviewer.agent.md**
    - Automated code review
    - Best practice enforcement
    - Usage: `@code-reviewer review this pull request`

12. **playwright-tester.agent.md** ⭐ (Already in project)
    - E2E test generation
    - Test automation
    - Usage: `@playwright-tester create tests for user authentication`

13. **unit-test-generator.agent.md**
    - Unit test creation
    - Test coverage improvement
    - Usage: `@unit-test-generator create tests for this service`

14. **security-auditor.agent.md**
    - Security vulnerability scanning
    - OWASP compliance
    - Usage: `@security-auditor audit authentication flow`

#### DevOps & CI/CD Agents

15. **devops-expert.agent.md**
    - CI/CD pipeline design
    - DevOps best practices
    - Usage: `@devops-expert create GitHub Actions workflow`

16. **docker-expert.agent.md**
    - Container optimization
    - Docker best practices
    - Usage: `@docker-expert optimize this Dockerfile`

### How to Use Custom Agents

#### In VS Code / VS Code Insiders

1. **Activate an agent in chat:**
   ```
   @agent-name your question or request
   ```

2. **Example workflow:**
   ```
   @angular-specialist Create a reactive form with validation
   @accessibility Review the form for accessibility
   @unit-test-generator Generate tests for the form component
   ```

#### In GitHub Copilot Coding Agent (CCA)

When assigning an issue to Copilot, select the custom agent from the provided list in the agent selection dropdown.

### Installation Links

Most agents can be installed directly via VS Code Insiders:
```
vscode-insiders://github.copilot-chat/open?agent=<agent-name>
```

## 📋 Instructions Files

### What are Instructions?

Instructions are coding standards and best practices that automatically apply to specific file patterns. They provide contextual guidance based on file types and naming patterns.

### Key Instructions for ng-events

#### Angular Development

1. **angular.instructions.md** ⭐ (Already in project)
   - Applies to: `**/*.ts, **/*.html, **/*.scss`
   - Angular best practices
   - Component architecture guidelines

2. **typescript-5-es2022.instructions.md** ⭐ (Already in project)
   - Applies to: `**/*.ts`
   - TypeScript 5 features
   - ES2022 syntax standards

#### Event Sourcing & Architecture

3. **event-sourcing-patterns.instructions.md** ⭐ (Already in project)
   - Applies to: `**/*.ts`
   - Event sourcing implementation patterns
   - Causality tracking guidelines

4. **domain-driven-design.instructions.md**
   - Applies to: `**/*.ts`
   - DDD patterns
   - Aggregate design rules

5. **cqrs.instructions.md**
   - Applies to: `**/*.ts`
   - Command/Query separation
   - Event handler patterns

#### Code Quality

6. **code-review-generic.instructions.md** ⭐ (Already in project)
   - Applies to: `**`
   - General code review standards
   - Best practices enforcement

7. **self-explanatory-code-commenting.instructions.md** ⭐ (Already in project)
   - Applies to: `**`
   - Comment guidelines
   - Self-documenting code principles

8. **object-calisthenics.instructions.md** ⭐ (Already in project)
   - Applies to: `**/*.{cs,ts,java}`
   - Object-oriented design rules
   - Code organization principles

#### Testing

9. **playwright-typescript.instructions.md** ⭐ (Already in project)
   - Applies to: `**/*.spec.ts`
   - E2E testing patterns
   - Playwright best practices

10. **unit-testing.instructions.md**
    - Applies to: `**/*.spec.ts`
    - Unit testing patterns
    - Test structure guidelines

#### Security & Performance

11. **security-and-owasp.instructions.md** ⭐ (Already in project)
    - Applies to: `**`
    - OWASP Top 10 guidelines
    - Security best practices

12. **performance-optimization.instructions.md** ⭐ (Already in project)
    - Applies to: `**`
    - Performance tuning
    - Optimization strategies

#### DevOps & CI/CD

13. **devops-core-principles.instructions.md** ⭐ (Already in project)
    - Applies to: `**`
    - DevOps principles
    - DORA metrics

14. **github-actions-ci-cd-best-practices.instructions.md** ⭐ (Already in project)
    - Applies to: `.github/workflows/*.yml`
    - GitHub Actions patterns
    - CI/CD best practices

#### Documentation

15. **markdown.instructions.md** ⭐ (Already in project)
    - Applies to: `**/*.md`
    - Markdown formatting
    - Documentation standards

16. **update-docs-on-code-change.instructions.md** ⭐ (Already in project)
    - Applies to: `**/*.{md,js,ts,py,java,cs,go,rb,php,rs,cpp,c,h,hpp}`
    - Documentation sync
    - Changelog management

### How Instructions Work

Instructions automatically activate based on file patterns. When you open a file matching the `applyTo` pattern, the instructions become part of Copilot's context.

**Example:**
- Open any `.ts` file → `angular.instructions.md` and `typescript-5-es2022.instructions.md` activate
- Open `.github/workflows/ci.yml` → `github-actions-ci-cd-best-practices.instructions.md` activates

## 🎯 Prompts

### What are Prompts?

Prompts are pre-built, task-specific commands that help you accomplish common development tasks quickly and consistently.

### Key Prompts for ng-events

#### Code Generation

1. **create-component.prompt.md**
   - Generate Angular components with best practices
   - Usage: `/create-component user-profile`

2. **create-service.prompt.md**
   - Generate Angular services
   - Usage: `/create-service task-management`

3. **create-interface.prompt.md**
   - Generate TypeScript interfaces
   - Usage: `/create-interface Task`

#### Architecture & Design

4. **architecture-blueprint-generator.prompt.md**
   - Generate architecture documentation
   - Usage: `/architecture-blueprint-generator for event sourcing system`

5. **create-architectural-decision-record.prompt.md**
   - Create ADR documents
   - Usage: `/create-architectural-decision-record for state management`

6. **design-pattern-selector.prompt.md**
   - Recommend appropriate design patterns
   - Usage: `/design-pattern-selector for user authentication`

#### Testing

7. **breakdown-test.prompt.md**
   - Generate comprehensive test plans
   - Usage: `/breakdown-test for task aggregate`

8. **create-unit-tests.prompt.md**
   - Generate unit tests
   - Usage: `/create-unit-tests for TaskService`

9. **create-e2e-tests.prompt.md**
   - Generate E2E tests
   - Usage: `/create-e2e-tests for login flow`

#### Documentation

10. **create-readme.prompt.md**
    - Generate README files
    - Usage: `/create-readme for task-management module`

11. **generate-api-documentation.prompt.md**
    - Create API documentation
    - Usage: `/generate-api-documentation for REST endpoints`

12. **add-educational-comments.prompt.md**
    - Add explanatory comments to code
    - Usage: `/add-educational-comments to event-store.ts`

#### Project Management

13. **breakdown-epic-arch.prompt.md**
    - Break down epics from architecture perspective
    - Usage: `/breakdown-epic-arch implement event sourcing`

14. **breakdown-feature-implementation.prompt.md**
    - Create implementation plans
    - Usage: `/breakdown-feature-implementation user authentication`

15. **create-github-issue-feature-from-specification.prompt.md**
    - Generate GitHub issues from specs
    - Usage: `/create-github-issue-feature-from-specification`

#### Code Quality

16. **conventional-commit.prompt.md**
    - Generate conventional commit messages
    - Usage: `/conventional-commit for this change`

17. **code-review.prompt.md**
    - Perform automated code reviews
    - Usage: `/code-review for src/app/task-management`

18. **refactor-legacy-code.prompt.md**
    - Refactor old code
    - Usage: `/refactor-legacy-code in task.component.ts`

### How to Use Prompts

In GitHub Copilot Chat, use the `/` command:

```
/prompt-name [arguments]
```

**Example workflow:**
```bash
# 1. Create a new feature
/breakdown-feature-implementation task filtering

# 2. Generate the component
/create-component task-filter

# 3. Add tests
/create-unit-tests for TaskFilterComponent

# 4. Generate documentation
/create-readme for task filtering feature

# 5. Create commit message
/conventional-commit for task filtering implementation
```

## 🚀 Practical Workflows

### Workflow 1: New Feature Development

```bash
# Step 1: Architecture Planning
@arch design the task filtering architecture

# Step 2: Create Implementation Plan
/breakdown-feature-implementation task filtering with event sourcing

# Step 3: Generate Components
/create-component task-filter
@angular-specialist add reactive forms to TaskFilterComponent

# Step 4: Implement Event Sourcing
@event-sourcing-expert implement TaskFiltered event
@domain-driven-design validate aggregate boundaries

# Step 5: Add Tests
/breakdown-test for task filtering
@unit-test-generator create tests for TaskFilterComponent
@playwright-tester create E2E tests for task filtering

# Step 6: Security & Performance Review
@security-auditor review task filtering for vulnerabilities
@frontend-performance-expert optimize filter performance

# Step 7: Documentation
/create-readme for task filtering
/create-architectural-decision-record for filter strategy

# Step 8: Code Review
@code-reviewer review entire task filtering implementation
```

### Workflow 2: Bug Fix & Refactoring

```bash
# Step 1: Understand the Issue
@arch analyze the bug in task-service.ts

# Step 2: Review Code Quality
@code-reviewer identify issues in task-service.ts

# Step 3: Fix Implementation
@typescript-expert fix type safety issues
@event-sourcing-expert ensure proper event ordering

# Step 4: Add Tests
@unit-test-generator create regression tests

# Step 5: Performance Check
@frontend-performance-expert verify no performance regression

# Step 6: Documentation
/add-educational-comments to fixed code
/conventional-commit for bug fix
```

### Workflow 3: Security Audit

```bash
# Step 1: Full Security Scan
@security-auditor audit entire authentication system

# Step 2: Fix Vulnerabilities
@security-auditor fix OWASP issues in auth-service.ts

# Step 3: Access Control Review
@security-auditor verify role-based access control

# Step 4: Test Security
@playwright-tester create security test cases

# Step 5: Documentation
/create-architectural-decision-record for security improvements
```

### Workflow 4: Performance Optimization

```bash
# Step 1: Performance Analysis
@frontend-performance-expert analyze bundle size
@database-optimization analyze Firestore queries

# Step 2: Optimize Code
@angular-specialist implement lazy loading
@frontend-performance-expert optimize change detection

# Step 3: Database Optimization
@firebase-specialist optimize Firestore indexes
@database-optimization implement query caching

# Step 4: Verify Improvements
@playwright-tester create performance tests

# Step 5: Documentation
/create-architectural-decision-record for performance strategy
```

### Workflow 5: Testing & Quality Assurance

```bash
# Step 1: Generate Test Plan
/breakdown-test for entire application

# Step 2: Unit Tests
@unit-test-generator create tests for all services
@unit-test-generator create tests for all components

# Step 3: E2E Tests
@playwright-tester create E2E tests for user flows
@playwright-tester create E2E tests for edge cases

# Step 4: Code Quality
@code-reviewer review test coverage
@accessibility audit tests for a11y coverage

# Step 5: Documentation
/generate-test-documentation
```

### Workflow 6: CI/CD Pipeline Setup

```bash
# Step 1: Pipeline Design
@devops-expert design CI/CD pipeline for Angular app

# Step 2: Create Workflow
/create-github-action-workflow-specification for build and deploy

# Step 3: Docker Configuration
@docker-expert create Dockerfile for Angular app

# Step 4: Testing Integration
@devops-expert integrate Playwright tests in CI

# Step 5: Security Scanning
@security-auditor add security scanning to pipeline

# Step 6: Documentation
/create-readme for CI/CD setup
```

### Workflow 7: Event Sourcing Implementation

```bash
# Step 1: Architecture Design
@arch design event sourcing architecture
@event-sourcing-expert design event store schema

# Step 2: Domain Modeling
@domain-driven-design model task aggregate
@event-sourcing-expert define domain events

# Step 3: Implementation
@event-sourcing-expert implement event replay
@typescript-expert ensure type safety for events

# Step 4: Testing
@unit-test-generator create event handler tests
@playwright-tester create E2E tests for event flows

# Step 5: Documentation
/create-architectural-decision-record for event sourcing
/create-readme for event sourcing implementation
```

### Workflow 8: Code Migration & Refactoring

```bash
# Step 1: Analysis
@arch analyze current architecture
@code-reviewer identify refactoring opportunities

# Step 2: Plan Migration
/breakdown-feature-implementation for migration
@angular-specialist plan Angular upgrade strategy

# Step 3: Execute Refactoring
@typescript-expert migrate to latest TypeScript
@angular-specialist migrate to standalone components

# Step 4: Test Migration
@unit-test-generator update tests for refactored code
@playwright-tester verify E2E tests still pass

# Step 5: Documentation
/update-migration-documentation
/conventional-commit for migration changes
```

## 🎓 Best Practices

### 1. Combine Multiple Resources

Don't use resources in isolation. Combine agents, instructions, and prompts for powerful workflows:

```bash
# Bad: Single resource
@angular-specialist create a component

# Good: Combined approach
@angular-specialist create a component
# Then immediately:
@accessibility audit the component
@unit-test-generator create tests
/create-readme for the component
```

### 2. Use Instructions as Foundation

Instructions provide automatic context. Build on them with agents and prompts:

```bash
# Instructions auto-apply based on file type
# Open task.component.ts → angular.instructions.md activates
# Then use agents for specific tasks:
@angular-specialist optimize this component
```

### 3. Follow Project-Specific Patterns

Many instructions reference the ✨ files in your project:

```bash
# Instructions are aware of your architecture
# They reference your event sourcing patterns
# They understand your DDD boundaries
```

### 4. Leverage Multi-Agent Workflows

Chain multiple agents for complex tasks:

```bash
@arch → @domain-driven-design → @event-sourcing-expert → @typescript-expert
```

### 5. Document with Prompts

Use prompts to maintain documentation:

```bash
/create-architectural-decision-record
/update-docs-on-code-change
/add-educational-comments
```

## 🔧 Configuration & Customization

### Agent Configuration

Agents can be customized in their respective `.agent.md` files:

```yaml
---
description: "Custom description"
tools: ["*"]
model: "gpt-4"
---
```

### Instruction Configuration

Instructions can target specific file patterns:

```yaml
---
description: "Custom instruction"
applyTo: "**/*.ts, **/*.html"
---
```

### Prompt Configuration

Prompts can specify agents and tools:

```yaml
---
agent: 'agent'
description: "Custom prompt"
tools: ["editor", "browser"]
model: "gpt-4"
---
```

## 📚 Additional Resources

### Official Documentation

- [GitHub Copilot Chat Documentation](https://docs.github.com/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide)
- [Custom Instructions Guide](https://code.visualstudio.com/docs/copilot/copilot-customization)
- [Awesome Copilot Repository](https://github.com/github/awesome-copilot)

### MCP Server

Install the awesome-copilot MCP server for searching and installing resources:

- [VS Code Installation](https://aka.ms/awesome-copilot/mcp/vscode)
- [VS Code Insiders Installation](https://aka.ms/awesome-copilot/mcp/vscode-insiders)

## 🎯 Quick Reference

### Most Useful Agents for ng-events

1. `@angular-specialist` - Angular development
2. `@event-sourcing-expert` - Event sourcing patterns
3. `@firebase-specialist` - Firestore optimization
4. `@arch` - Architecture guidance
5. `@typescript-expert` - TypeScript best practices
6. `@playwright-tester` - E2E testing
7. `@security-auditor` - Security reviews
8. `@accessibility` - Accessibility audits

### Most Useful Prompts

1. `/breakdown-feature-implementation` - Feature planning
2. `/create-component` - Component generation
3. `/breakdown-test` - Test planning
4. `/create-architectural-decision-record` - ADR creation
5. `/conventional-commit` - Commit messages
6. `/create-readme` - Documentation

### Auto-Applied Instructions

These automatically apply when editing:
- TypeScript files: `angular.instructions.md`, `typescript-5-es2022.instructions.md`, `event-sourcing-patterns.instructions.md`
- Test files: `playwright-typescript.instructions.md`
- Markdown files: `markdown.instructions.md`
- Workflow files: `github-actions-ci-cd-best-practices.instructions.md`

## 🚀 Getting Started

1. **Explore Agents**: Start with `@angular-specialist` for Angular tasks
2. **Try Prompts**: Use `/create-component` to generate your first component
3. **Review Instructions**: Open a `.ts` file and see auto-applied instructions
4. **Build Workflows**: Combine agents, prompts, and instructions
5. **Customize**: Adjust configurations to match your project needs

## 📝 Notes

- All files are copied as-is from awesome-copilot repository
- Files maintain their original structure and naming
- Instructions auto-apply based on file patterns
- Agents require activation with `@agent-name`
- Prompts require `/prompt-name` command
- Combine resources for maximum effectiveness

---

**Last Updated**: 2026-01-01
**Source**: [github/awesome-copilot](https://github.com/github/awesome-copilot)
**Total Resources**: 409 (131 agents + 152 instructions + 126 prompts)
