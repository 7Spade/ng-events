小檢查一下幾點：

1. **匯入部分**

   ```ts
   import { WorkspaceId } from '../../workspace/value-objects/WorkspaceId';
   import { ModuleId } from '../value-objects/ModuleId';
   ```

   路徑對的話，沒問題。

2. **介面定義**

   ```ts
   export interface ModuleDisabled {
     workspaceId: WorkspaceId;
     moduleId: ModuleId;
     disabledAt: string;
     reason?: string;
   }
   ```

   * `workspaceId` 與 `moduleId` 型別正確。
   * `disabledAt: string` 如果你打算存 ISO 8601 時間字串，`string` 是可行的，但如果你想用 `Date` 型別會更嚴謹。
   * `reason?` 可選屬性也沒問題。

3. **文件註解**
   JSDoc 註解清楚簡單，也正確。

唯一可以微調的是 **時間型別**，可以寫成：

```ts
disabledAt: string; // ISO 8601 timestamp
// 或者
disabledAt: Date;
```

```
Workspace (聚合根)
│
├── workspaceId: WorkspaceId
├── name: string
└── members: Map<MemberId, WorkspaceMember>

       ┌──────────────────────────────┐
       │ WorkspaceMember (值物件/子聚合) │
       ├── memberId: MemberId
       ├── role: Role                 ← 屬於 Workspace 層級
       └── joinedAt: string

事件 Event 層級：
────────────────────────────────────
MemberJoinedWorkspace
  workspaceId: WorkspaceId  ← 哪個 Workspace
  memberId: MemberId        ← 哪個成員
  role: Role                ← 成員在這個 Workspace 的角色
  joinedAt: string          ← 加入時間

MemberLeftWorkspace (類似)
  workspaceId: WorkspaceId
  memberId: MemberId
  leftAt: string

RoleChangedInWorkspace
  workspaceId: WorkspaceId
  memberId: MemberId
  oldRole: Role
  newRole: Role
  changedAt: string
────────────────────────────────────
```
