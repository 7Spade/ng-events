# Routing & Guard Templates (路由與守衛模板)

本文檔提供 Angular 路由配置與守衛的標準模板，整合多租戶與權限控制。

---

## 路由基礎結構 (Routing Base Structure)

### App 主路由配置

```typescript
/**
 * Main app routing configuration
 * 主應用路由配置
 */
import { Routes } from '@angular/router';
import { AuthGuard } from '@core/auth/guards/auth.guard';
import { BlueprintGuard } from '@core/auth/guards/blueprint.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  
  // Authentication routes (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.authRoutes)
  },
  
  // Main app routes (protected)
  {
    path: '',
    canActivate: [AuthGuard, BlueprintGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      
      // Task management
      {
        path: 'tasks',
        loadChildren: () => import('./features/task/task.routes')
          .then(m => m.taskRoutes)
      },
      
      // Payment management
      {
        path: 'payments',
        loadChildren: () => import('./features/payment/payment.routes')
          .then(m => m.paymentRoutes)
      },
      
      // Issue tracking
      {
        path: 'issues',
        loadChildren: () => import('./features/issue/issue.routes')
          .then(m => m.issueRoutes)
      },
      
      // Settings
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes')
          .then(m => m.settingsRoutes)
      }
    ]
  },
  
  // 404 fallback
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found.component')
      .then(m => m.NotFoundComponent)
  }
];
```

---

## 功能模組路由 (Feature Module Routes)

### Task 路由配置

```typescript
/**
 * Task feature routes
 * 任務功能路由
 */
import { Routes } from '@angular/router';
import { RoleGuard } from '@core/auth/guards/role.guard';

export const taskRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/task-list/task-list.component')
      .then(m => m.TaskListComponent),
    data: {
      title: 'Tasks',
      breadcrumb: 'Tasks'
    }
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/task-create/task-create.component')
      .then(m => m.TaskCreateComponent),
    canActivate: [RoleGuard],
    data: {
      title: 'Create Task',
      breadcrumb: 'Create',
      requiredRoles: ['admin', 'project-manager', 'team-member']
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/task-detail/task-detail.component')
      .then(m => m.TaskDetailComponent),
    data: {
      title: 'Task Detail',
      breadcrumb: 'Detail'
    }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/task-edit/task-edit.component')
      .then(m => m.TaskEditComponent),
    canActivate: [RoleGuard],
    data: {
      title: 'Edit Task',
      breadcrumb: 'Edit',
      requiredRoles: ['admin', 'project-manager', 'task-assignee']
    }
  }
];
```

---

## 認證守衛 (Authentication Guards)

### 1. Auth Guard (認證守衛)

```typescript
/**
 * Authentication guard
 * 認證守衛 - 確保用戶已登入
 */
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { map } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (user) {
        return true;
      }

      // 未登入，導向登入頁面
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};
```

---

### 2. Blueprint Guard (多租戶守衛)

```typescript
/**
 * Blueprint guard
 * 多租戶守衛 - 確保用戶有訪問當前 Blueprint 的權限
 */
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { BlueprintService } from '@core/tenant/services/blueprint.service';
import { map } from 'rxjs/operators';

export const BlueprintGuard: CanActivateFn = (route, state) => {
  const blueprintService = inject(BlueprintService);
  const router = inject(Router);

  return blueprintService.currentBlueprint$.pipe(
    map(blueprint => {
      if (blueprint) {
        // 用戶有權限訪問當前 Blueprint
        return true;
      }

      // 無權限，導向 Blueprint 選擇頁面
      router.navigate(['/select-blueprint'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};
```

---

### 3. Role Guard (角色守衛)

```typescript
/**
 * Role guard
 * 角色守衛 - 基於角色控制訪問
 */
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { map } from 'rxjs/operators';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRoles: string[] = route.data['requiredRoles'] || [];

  return authService.currentUser$.pipe(
    map(user => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      // 檢查用戶是否擁有所需角色
      const hasRequiredRole = requiredRoles.some(role => 
        user.roles.includes(role)
      );

      if (hasRequiredRole) {
        return true;
      }

      // 無權限，導向無權限頁面
      router.navigate(['/403']);
      return false;
    })
  );
};
```

---

### 4. Permission Guard (權限守衛)

```typescript
/**
 * Permission guard
 * 權限守衛 - 基於細粒度權限控制訪問
 */
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PermissionService } from '@core/auth/services/permission.service';
import { map } from 'rxjs/operators';

export const PermissionGuard: CanActivateFn = (route, state) => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);
  
  const requiredPermissions: string[] = route.data['requiredPermissions'] || [];

  return permissionService.currentPermissions$.pipe(
    map(permissions => {
      // 檢查用戶是否擁有所有所需權限
      const hasAllPermissions = requiredPermissions.every(permission => 
        permissions.includes(permission)
      );

      if (hasAllPermissions) {
        return true;
      }

      // 無權限，導向無權限頁面
      router.navigate(['/403']);
      return false;
    })
  );
};
```

---

### 5. Deactivate Guard (離開守衛)

```typescript
/**
 * Can deactivate guard
 * 離開守衛 - 防止用戶意外離開未保存的頁面
 */
import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

export const CanDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};

// 使用範例
export class TaskEditComponent implements CanComponentDeactivate {
  hasUnsavedChanges = false;

  canDeactivate(): boolean {
    if (this.hasUnsavedChanges) {
      return confirm('You have unsaved changes. Do you really want to leave?');
    }
    return true;
  }
}
```

---

## 多租戶路由配置 (Multi-Tenant Routing)

### 租戶選擇流程

```typescript
/**
 * Blueprint selection routes
 * 租戶選擇路由
 */
export const blueprintRoutes: Routes = [
  {
    path: 'select-blueprint',
    loadComponent: () => import('./pages/blueprint-selector.component')
      .then(m => m.BlueprintSelectorComponent),
    canActivate: [AuthGuard],  // 僅需登入
    data: {
      title: 'Select Workspace'
    }
  },
  {
    path: 'create-blueprint',
    loadComponent: () => import('./pages/blueprint-create.component')
      .then(m => m.BlueprintCreateComponent),
    canActivate: [AuthGuard],
    data: {
      title: 'Create Workspace'
    }
  }
];
```

---

## 權限配置範例 (Permission Configuration Examples)

### Task 權限配置

```typescript
/**
 * Task permissions
 * 任務權限定義
 */
export const TaskPermissions = {
  // 查看權限
  VIEW_TASKS: 'task:view',
  VIEW_OWN_TASKS: 'task:view:own',
  VIEW_TEAM_TASKS: 'task:view:team',
  
  // 建立權限
  CREATE_TASK: 'task:create',
  
  // 編輯權限
  EDIT_TASK: 'task:edit',
  EDIT_OWN_TASK: 'task:edit:own',
  EDIT_TEAM_TASK: 'task:edit:team',
  
  // 刪除權限
  DELETE_TASK: 'task:delete',
  DELETE_OWN_TASK: 'task:delete:own',
  
  // 狀態變更權限
  COMPLETE_TASK: 'task:complete',
  CANCEL_TASK: 'task:cancel',
  
  // 分配權限
  ASSIGN_TASK: 'task:assign'
} as const;

/**
 * Task routes with permissions
 */
export const taskRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/task-list.component')
      .then(m => m.TaskListComponent),
    canActivate: [PermissionGuard],
    data: {
      requiredPermissions: [TaskPermissions.VIEW_TASKS]
    }
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/task-create.component')
      .then(m => m.TaskCreateComponent),
    canActivate: [PermissionGuard],
    data: {
      requiredPermissions: [TaskPermissions.CREATE_TASK]
    }
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/task-edit.component')
      .then(m => m.TaskEditComponent),
    canActivate: [PermissionGuard],
    data: {
      requiredPermissions: [TaskPermissions.EDIT_TASK]
    }
  }
];
```

---

## 路由解析器 (Route Resolvers)

### Task Detail Resolver

```typescript
/**
 * Task detail resolver
 * 任務詳情解析器 - 在路由激活前預載資料
 */
import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { TaskApplicationService } from '@saas/task/services/task.application-service';
import { TaskDetailProjection } from '@saas/task/projections/task-detail.projection';

export const taskDetailResolver: ResolveFn<TaskDetailProjection> = (
  route: ActivatedRouteSnapshot
) => {
  const taskService = inject(TaskApplicationService);
  const taskId = route.paramMap.get('id')!;
  
  return taskService.getTaskDetail(taskId);
};

// 路由配置使用 resolver
export const taskRoutes: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./pages/task-detail.component')
      .then(m => m.TaskDetailComponent),
    resolve: {
      task: taskDetailResolver
    }
  }
];

// 組件中使用解析的資料
@Component({
  selector: 'app-task-detail',
  template: `...`
})
export class TaskDetailComponent {
  task = input.required<TaskDetailProjection>();  // Angular 19+
  
  // 或使用 ActivatedRoute
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.task = data['task'];
    });
  }
}
```

---

## 最佳實踐

### ✅ DO
- 使用功能守衛 (Functional Guards)
- 實作多租戶隔離 (Blueprint Guard)
- 基於權限的細粒度控制
- 懶加載功能模組
- 使用 Resolver 預載資料
- 離開守衛防止資料遺失

### ❌ DON'T
- 在組件中直接檢查權限
- 缺少多租戶驗證
- 過度使用同步守衛
- 忽略錯誤處理
- 硬編碼角色/權限

---

## 檢查清單

- [ ] 所有受保護路由使用 AuthGuard
- [ ] 多租戶路由使用 BlueprintGuard
- [ ] 敏感操作使用 RoleGuard/PermissionGuard
- [ ] 表單頁面使用 CanDeactivateGuard
- [ ] 詳情頁面使用 Resolver 預載
- [ ] 錯誤頁面配置 (403, 404)
- [ ] 登入重導向正確設定
- [ ] 權限定義清晰

---

**版本**: 1.0 | **更新**: 2026-01-01
