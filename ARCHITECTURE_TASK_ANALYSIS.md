# Architecture vs Task-New Document Analysis

**Analysis Date**: 2025-01-22  
**Analyst**: GitHub Copilot (@copilot)  
**Request**: Comparison between `ng-events_Architecture.md` and `docs/dev/task-new.md`

---

## Executive Summary

After comprehensive analysis of both documents, **NO CONFLICTS OR CONTRADICTIONS** were found. The documents complement each other:

- **ng-events_Architecture.md** (1,452 lines): System-level architecture blueprint
- **docs/dev/task-new.md** (2,069 lines): Domain-specific Task management detailed guide

Both documents align on core architectural principles (Event Sourcing, Causality Tracking, CQRS) and can coexist as:
- Architecture document = **System blueprint** (how to build)
- Task-new document = **Domain guide** (what to build for Task domain)

---

## Document Scope Comparison

### ng-events_Architecture.md (System-Wide)
**Focus**: Complete system architecture covering ALL domains

**Coverage**:
- System Context (external actors, system boundary)
- Architecture Overview (3-layer: Fact/Process/Projection)
- Component Architecture (all aggregates, services, repositories)
- Deployment Strategy (Firebase infrastructure)
- Data Flow (CQRS write/read paths)
- Sequence Diagrams for Task, Payment, Issue lifecycles
- Event Flow with causality chains
- NFR requirements (Scalability, Performance, Security, Reliability)
- Multi-domain: Task, Payment, Invoice, Issue, FieldLog, BatchPayment

**Purpose**: Authoritative reference for implementing `core-system/` folder structure

---

### docs/dev/task-new.md (Task Domain-Specific)
**Focus**: Deep dive into Task domain business logic

**Coverage**:
- Task hierarchical structure (parent-child-grandchild)
- Task splitting strategies (ByLocation, ByPhase, ByQuantity, ByDiscipline, ByTime)
- Collaborator management (contractors, subcontractors, teams, individuals)
- Payment workflows (staged payments, invoicing, collection tracking)
- Acceptance/QC procedures (multi-stage validation)
- Financial calculations (quantity-based, lump-sum, hourly billing)
- Daily logs auto-aggregation
- Milestone tracking and progress calculation
- Practical examples from real SCADA engineering contracts

**Purpose**: Implementation guide for Task aggregate business rules and workflows

---

## Alignment Analysis

### ✅ Aligned: Core Architectural Principles

Both documents agree on foundational principles:

| Principle | ng-events_Architecture.md | task-new.md |
|-----------|---------------------------|-------------|
| **Event Sourcing** | ✅ All state changes as events | ✅ TaskSplit, TaskCreated, TaskCompleted events |
| **Causality Tracking** | ✅ causedByEventId in metadata | ✅ Event causality chains documented |
| **CQRS** | ✅ Separate write/read models | ✅ Implies read models for queries |
| **Immutability** | ✅ Events never modified | ✅ Events are append-only |
| **Multi-Tenancy** | ✅ blueprintId filtering | ✅ Blueprint isolation mentioned |
| **Aggregate Pattern** | ✅ TaskAggregate defined | ✅ Task as consistency boundary |

**Conclusion**: Perfect alignment on architecture philosophy.

---

### ✅ Aligned: Task Event Design

Architecture document defines TaskAggregate and events. Task-new provides detailed event semantics:

**Architecture Document Events**:
- TaskCreated
- TaskAssigned
- TaskCompleted
- TaskQualityChecked
- TaskAccepted

**Task-New Document Events**:
- TaskCreated (with parentTaskId, contractItemId)
- TaskSplit (splitting strategy and child tasks)
- TaskStatusChanged
- TaskProgressUpdated
- TaskBlocked, TaskUnblocked
- TaskCancelled
- TaskDeadlineChanged
- TaskBudgetAdjusted
- InternalAcceptancePassed/Failed
- ClientApproved/Rejected
- PaymentRequested, PaymentReceived

**Analysis**: Task-new extends architecture with business-specific events. No contradiction - architecture provides framework, task-new fills in domain details.

---

### ✅ Aligned: Data Structure

**Architecture Document**:
```typescript
interface TaskAggregate {
  taskId: string;
  // ... aggregate methods
}
```

**Task-New Document**:
```typescript
interface Task {
  taskId: string;
  title: string;
  parentTaskId: string | null;  // Hierarchical support
  childTaskIds: string[];
  taskLevel: number;
  taskPath: string;
  status: TaskStatus;
  isDecomposed: boolean;
  totalAmount: number;
  // ... detailed fields
}
```

**Analysis**: Task-new provides implementation details for TaskAggregate structure. Complements architecture.

---

### ✅ Aligned: Causality and Event Flow

**Architecture Document**:
- Provides high-level Event Flow diagram
- Shows causality DAG structure
- Defines causedByEventId metadata

**Task-New Document**:
- Shows detailed causality examples:
  ```
  TaskSplit → TaskCreated (children)
  TaskCompleted (child) → TaskProgressUpdated (parent)
  InternalAcceptanceFailed → TaskBlocked → TaskRiskDetected
  ```

**Analysis**: Task-new illustrates architecture's causality principle with concrete examples. No conflict.

---

### ✅ Complementary: Process Management

**Architecture Document**:
- Defines SagaManager and ProcessManager components
- Shows Saga pattern in sequence diagrams
- Mentions "Process & Policy Layer"

**Task-New Document**:
- Describes Process templates (Standard SCADA installation flow)
- Shows how Process suggests task splitting
- Defines hierarchical process tiers (Tier 1: Total, Tier 2: Regional, Tier 3: Phase)

**Analysis**: Architecture provides mechanism, task-new provides business logic. Complementary.

---

### ✅ Complementary: Collaborator Management

**Architecture Document**:
- Focuses on multi-tenancy (blueprintId)
- Defines role-based access control (RBAC)
- Mentions "Different views for different roles"

**Task-New Document**:
- Details collaborator types (Company, Team, Individual)
- Describes contractor-subcontractor hierarchy
- Defines view isolation (Owner sees all, Contractor sees assigned tasks)

**Analysis**: Architecture provides security framework, task-new implements business roles. Aligned.

---

### ✅ Complementary: Payment Integration

**Architecture Document**:
- Defines PaymentAggregate, InvoiceAggregate
- Shows Payment sequence diagram
- Mentions "Payment workflows"

**Task-New Document**:
- Details staged payment rules (50% materials, 30% completion, 20% acceptance)
- Describes invoice tracking (requested, approved, received)
- Explains payment calculation engine

**Analysis**: Architecture defines domain boundaries, task-new fills in business rules. No conflict.

---

## Areas of Expansion (Not Conflicts)

### 1. Task Hierarchy Depth

**Architecture Document**: Silent on hierarchy levels  
**Task-New Document**: Explicitly supports unlimited depth (parent → child → grandchild → ...)

**Recommendation**: Architecture should clarify TaskAggregate supports recursive parent-child relationships. This is an **enhancement**, not a conflict.

---

### 2. Acceptance Workflow Detail

**Architecture Document**: Mentions "TaskQualityChecked" event  
**Task-New Document**: Describes multi-stage acceptance:
1. Self-inspection by worker
2. QC inspection by quality team
3. Client acceptance by owner
4. Each stage may trigger partial payments

**Recommendation**: Architecture should reference task-new for detailed acceptance business rules. This is **elaboration**, not contradiction.

---

### 3. Milestone Tracking

**Architecture Document**: Silent on milestones  
**Task-New Document**: Describes milestone mechanism:
- Milestones defined as groups of tasks
- Progress calculated from child task completion
- Automatic alerts for delays

**Recommendation**: Architecture could add MilestoneAggregate as future Phase 2+ feature. This is **new scope**, not conflict.

---

### 4. Daily Log Aggregation

**Architecture Document**: Defines FieldLogAggregate  
**Task-New Document**: Describes automatic daily log generation:
- System aggregates all task events at 23:50 daily
- Generates structured report with progress, issues, photos
- Requires manual manager comments

**Recommendation**: Architecture should clarify FieldLogAggregate includes auto-aggregation feature. This is **specification**, not conflict.

---

## Integration Recommendations

### Recommended Actions

1. **Cross-Reference Documents**
   - Add link in architecture: "See `docs/dev/task-new.md` for detailed Task domain business rules"
   - Add link in task-new: "System built following `ng-events_Architecture.md` architecture"

2. **Clarify Document Roles**
   - Architecture = System blueprint (for all developers)
   - Task-new = Domain guide (for Task feature team)

3. **Future Domain Guides**
   - Consider creating similar detailed guides for Payment, Issue, FieldLog domains
   - Maintain consistent structure: Events → Business Rules → Workflows → Examples

4. **Architecture Enhancements** (Optional, Low Priority)
   - Add TaskAggregate hierarchy support explicitly
   - Mention acceptance workflow stages
   - Consider MilestoneAggregate for future phases

---

## Conclusion

**No Conflicts Detected**. The two documents serve different purposes and complement each other:

- **ng-events_Architecture.md**: Provides system-wide technical architecture, component design, and infrastructure strategy
- **docs/dev/task-new.md**: Provides domain-specific business logic, workflow details, and practical implementation guidance for the Task domain

**Relationship**: Architecture document is the **foundation**, task-new is a **specialized implementation guide** for one domain (Task).

**Recommendation for PR**: 
✅ **No changes needed to PR description**. The architecture document provides the complete blueprint for `core-system/` implementation. Task-new serves as a complementary reference for Task domain business logic.

**Suggested PR Update** (Optional):
If you want to make the relationship explicit, you could add a note in Implementation Notes:

```markdown
### Implementation Notes
...existing content...

**關於 Task 領域實作細節**:
完整 Task 業務邏輯詳見 `docs/dev/task-new.md`，包含階層化任務、協作者管理、驗收流程、請款計算等實務場景。本架構文件提供系統級設計框架，task-new.md 提供領域級實作指引。
```

---

**Analysis Complete**: No conflicts found. Documents are complementary and aligned.
