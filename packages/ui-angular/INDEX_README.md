# @ng-events/ui-angular - Public API Documentation

本文件說明 `packages/ui-angular/index.ts` 的完整 API 設計與使用方式。

## 概述

`index.ts` 是 `@ng-events/ui-angular` 套件的主要進入點，提供統一的 API 對外暴露，讓外部專案可以輕鬆 import 所需的服務、Guard、元件和工具。

## 架構設計

本套件採用 **Angular 20.x Standalone Components** 架構，不使用傳統的 `NgModule`，而是使用功能性的 Providers 和 Standalone 元件。

## API 分類

### 1️⃣ 核心服務 (Core Services)

#### I18NService
- **用途**: 國際化服務，支援多語言切換
- **繼承**: 繼承 `AlainI18nBaseService`
- **使用範例**:
```typescript
import { I18NService } from '@ng-events/ui-angular';

// 在元件中使用
constructor(private i18n: I18NService) {}

ngOnInit() {
  this.i18n.use('zh-CN');
}
```

#### StartupService
- **用途**: 應用程式初始化服務
- **功能**: 處理啟動邏輯、載入用戶資料、初始配置
- **使用範例**:
```typescript
import { StartupService } from '@ng-events/ui-angular';

// 通常在 APP_INITIALIZER 中使用
export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (startupService: StartupService) => () => startupService.load(),
      deps: [StartupService],
      multi: true
    }
  ]
};
```

#### FirebaseAuthBridgeService (已標記為 Deprecated)
- **用途**: Firebase 驗證橋接服務
- **功能**: 整合 Firebase Auth 與 Delon Auth 系統
- **注意**: 建議使用 `@ng-events/platform-adapters` 替代

### 2️⃣ 路由守衛 (Guards)

#### startPageGuard
- **類型**: 功能性守衛 (CanActivateFn)
- **用途**: 動態載入起始頁面，控制進入應用程式的權限
- **使用範例**:
```typescript
import { startPageGuard } from '@ng-events/ui-angular';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [startPageGuard]
  }
];
```

### 3️⃣ HTTP 攔截器與網路工具 (HTTP Interceptors & Network Utilities)

#### defaultInterceptor
- **用途**: 全域 HTTP 攔截器
- **功能**: 處理驗證標頭、錯誤回應、令牌更新、常見 HTTP 操作
- **使用範例**:
```typescript
import { defaultInterceptor } from '@ng-events/ui-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([defaultInterceptor]))
  ]
};
```

#### provideBindAuthRefresh
- **用途**: 設定驗證令牌自動刷新
- **功能**: 使用 `@delon/auth` 的刷新機制
- **使用範例**:
```typescript
import { provideBindAuthRefresh } from '@ng-events/ui-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBindAuthRefresh()
  ]
};
```

#### HTTP Helper 函式
```typescript
import {
  AUTH_HEADER_KEY,
  REFRESH_HEADER_KEY,
  CODEMESSAGE,
  getAdditionalHeaders,
  checkStatus,
  toLogin,
  goTo
} from '@ng-events/ui-angular';

// 範例: 建立帶驗證的請求標頭
const headers = getAdditionalHeaders();

// 範例: 檢查 HTTP 狀態
checkStatus(injector, httpResponse);

// 範例: 導航到登入頁
toLogin(injector);
```

### 4️⃣ 應用程式 Providers

#### provideStartup
- **用途**: 註冊 StartupService 到 APP_INITIALIZER
- **使用範例**:
```typescript
import { provideStartup } from '@ng-events/ui-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStartup()
  ]
};
```

### 5️⃣ 佈局元件 (Layout Components)

#### BasicComponent
- **用途**: 主應用程式佈局 (包含標頭、側邊欄、內容區)
- **使用場景**: 已驗證的應用程式頁面

#### BlankComponent
- **用途**: 最小化佈局 (無導航或標頭)
- **使用場景**: 全螢幕頁面或需要自定義佈局的頁面

#### PassportComponent
- **用途**: 驗證頁面佈局
- **使用場景**: 登入、註冊等驗證相關頁面

**使用範例**:
```typescript
import { BasicComponent, PassportComponent } from '@ng-events/ui-angular';

export const routes: Routes = [
  {
    path: '',
    component: BasicComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard') }
    ]
  },
  {
    path: 'passport',
    component: PassportComponent,
    children: [
      { path: 'login', loadComponent: () => import('./login') }
    ]
  }
];
```

### 6️⃣ 共享模組與匯入 (Shared Modules & Imports)

#### SHARED_IMPORTS
- **包含**: FormsModule, ReactiveFormsModule, Router 模組, Delon 模組, Zorro 模組
- **使用範例**:
```typescript
import { SHARED_IMPORTS } from '@ng-events/ui-angular';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `...`
})
export class MyComponent {}
```

#### SHARED_DELON_MODULES
- **包含**: DelonFormModule, STModule, SVModule, SEModule, PageHeaderModule, ACL directives

#### SHARED_ZORRO_MODULES
- **包含**: 常用的 Ant Design for Angular 元件

### 7️⃣ Widgets 與表單元件

#### SF_WIDGETS
- **用途**: `@delon/form` 的自定義 Widget
- **使用範例**:
```typescript
import { SF_WIDGETS } from '@ng-events/ui-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideSFConfig({ widgets: SF_WIDGETS })
  ]
};
```

#### ST_WIDGETS
- **用途**: `@delon/abc/st` 的自定義欄位 Widget

#### CELL_WIDGETS
- **用途**: `@delon/abc/cell` 的自定義 Cell Renderer

### 8️⃣ 工具函式 (Utilities)

#### yuan
- **用途**: 人民幣貨幣格式化工具
- **使用範例**:
```typescript
import { yuan } from '@ng-events/ui-angular';

const formatted = yuan(12345.67); // 輸出: ¥12,345.67
```

### 9️⃣ 適配器與 Facades

#### CoreEngineFacade
- **用途**: `@ng-events/core-engine` 的 Angular 專用 Facade
- **功能**: 提供領域引擎互動的 Angular 介面

## 桶文件重新匯出 (Re-exports)

為了便利性，index.ts 也重新匯出了以下模組的所有公開 API:

```typescript
// 重新匯出核心模組
export * from './src/app/core/index';

// 重新匯出共享模組
export * from './src/app/shared/index';

// 重新匯出適配器模組
export * from './src/app/adapters/index';

// 重新匯出佈局模組
export * from './src/app/layout/index';
```

## 完整使用範例

### 在外部專案中使用

```typescript
// app.config.ts
import {
  provideStartup,
  provideBindAuthRefresh,
  defaultInterceptor,
  SHARED_IMPORTS,
  SF_WIDGETS,
  ST_WIDGETS,
  CELL_WIDGETS
} from '@ng-events/ui-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([defaultInterceptor])),
    provideStartup(),
    provideBindAuthRefresh(),
    provideSFConfig({ widgets: SF_WIDGETS }),
    provideSTWidgets(...ST_WIDGETS),
    provideCellWidgets(...CELL_WIDGETS)
  ]
};
```

### 在元件中使用

```typescript
import { Component } from '@angular/core';
import {
  SHARED_IMPORTS,
  I18NService,
  StartupService
} from '@ng-events/ui-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  template: `...`
})
export class AppComponent {
  constructor(
    private i18n: I18NService,
    private startup: StartupService
  ) {}
}
```

## 檔案結構

```
packages/ui-angular/
├── index.ts                    # 主要 API 進入點
├── src/
│   └── app/
│       ├── core/               # 核心服務與守衛
│       │   ├── auth/
│       │   ├── i18n/
│       │   ├── net/
│       │   └── startup/
│       ├── layout/             # 佈局元件
│       ├── shared/             # 共享模組與工具
│       ├── adapters/           # 適配器與 Facades
│       └── features/           # 功能模組
```

## 注意事項

1. **無傳統 NgModule**: 本專案使用 Angular Standalone Components，無需 `@NgModule` 裝飾器
2. **路徑正確性**: 所有匯出路徑都已驗證，確保指向正確的檔案
3. **TypeScript 風格**: 遵循 Angular 官方風格指南，使用 TSDoc 註解
4. **向後相容**: 某些舊服務標記為 `@deprecated`，建議使用新的替代方案

## 貢獻指南

如需新增公開 API:
1. 在對應的模組中實作功能
2. 在 `index.ts` 中加入 export
3. 加入詳細的 TSDoc 註解
4. 更新本 README 文件

## 授權

MIT License
