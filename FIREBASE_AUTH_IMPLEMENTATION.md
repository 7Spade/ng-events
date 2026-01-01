# Firebase Auth 整合實作方案

## 確認：整合策略

是的，**將 Firebase Auth 作為主要認證來源後，確實可以同時完成任務 2、3、4**：

### 為什麼可以一起做？

#### 任務 2: 使用 @delon/auth 的 DA_SERVICE_TOKEN 管理 token
- Firebase Auth 提供 ID token → 橋接到 @delon/auth
- 統一的 token 管理介面
- 自動處理 token 刷新

#### 任務 3: 移除不必要的 social login 功能
- Firebase Auth 支援 Email/Password 登入
- 不需要額外的 social login callback 元件
- 簡化登入流程為單一入口

#### 任務 4: 簡化 startup service 的認證流程
- Firebase Auth 的 `onAuthStateChanged` 自動同步狀態
- 移除 mock 登入 endpoint (`/login/account`)
- 直接從 Firebase 獲取用戶資料

### 跳轉功能保證

**未登入用戶會自動跳轉到登入頁面** ✅

現有機制：
```typescript
// routes.ts
{
  path: '',
  component: LayoutBasicComponent,
  canActivate: [authSimpleCanActivate],        // ← 這裡檢查登入狀態
  canActivateChild: [authSimpleCanActivateChild],
  children: [...]
}

// app.config.ts
alainConfig: AlainConfig = {
  auth: { login_url: '/passport/login' }  // ← 未登入時跳轉到這裡
}
```

**實作後的行為：**
1. 用戶訪問受保護的路由（如 `/dashboard`）
2. `authSimpleCanActivate` 檢查 `DA_SERVICE_TOKEN` 是否有 token
3. 如果沒有 token → 自動跳轉到 `/passport/login`
4. 登入成功 → Firebase Auth 提供 token → 橋接到 @delon/auth → 跳轉回原頁面

---

## 實作計畫（整合方案）

### Phase 1: Firebase Auth 橋接服務（Week 1）

#### 步驟 1.1: 建立橋接服務

**檔案：** `src/app/core/auth/firebase-auth-bridge.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthBridgeService {
  private auth = inject(Auth);
  private tokenService = inject(DA_SERVICE_TOKEN);
  private router = inject(Router);

  /**
   * 初始化 Firebase Auth 狀態監聽
   * 自動同步到 @delon/auth
   */
  init(): void {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        // 用戶已登入
        const token = await user.getIdToken();
        const tokenExpiration = await this.getTokenExpiration(user);
        
        this.tokenService.set({
          token,
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email,
          avatar: user.photoURL,
          expired: tokenExpiration
        });
      } else {
        // 用戶已登出
        this.tokenService.clear();
      }
    });
  }

  /**
   * 獲取 token 過期時間（毫秒時間戳）
   */
  private async getTokenExpiration(user: User): Promise<number> {
    const idTokenResult = await user.getIdTokenResult();
    return new Date(idTokenResult.expirationTime).getTime();
  }

  /**
   * 強制刷新 token
   */
  async refreshToken(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    const token = await user.getIdToken(true); // 強制刷新
    return token;
  }

  /**
   * 獲取當前用戶
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}

// END OF FILE
```

#### 步驟 1.2: 在 app.config.ts 中初始化橋接

**檔案：** `src/app/app.config.ts`

```typescript
// 在現有的 imports 中添加
import { APP_INITIALIZER } from '@angular/core';
import { FirebaseAuthBridgeService } from '@core/auth/firebase-auth-bridge.service';

// 在 providers 陣列中添加（在 Firebase providers 之後）
providers.push({
  provide: APP_INITIALIZER,
  useFactory: (bridge: FirebaseAuthBridgeService) => () => bridge.init(),
  deps: [FirebaseAuthBridgeService],
  multi: true
});
```

#### 步驟 1.3: 更新登入元件

**檔案：** `src/app/routes/passport/login/login.component.ts`

```typescript
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { StartupService } from '@core';
import { ReuseTabService } from '@delon/abc/reuse-tab';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    // ... 其他 imports
  ]
})
export class UserLoginComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  private readonly startupSrv = inject(StartupService);
  private readonly reuseTabService = inject(ReuseTabService, { optional: true });
  private readonly cdr = inject(ChangeDetectorRef);

  form = inject(FormBuilder).nonNullable.group({
    userName: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [true]
  });
  
  error = '';
  loading = false;

  submit(): void {
    this.error = '';
    const { userName, password } = this.form.controls;
    
    userName.markAsDirty();
    userName.updateValueAndValidity();
    password.markAsDirty();
    password.updateValueAndValidity();
    
    if (userName.invalid || password.invalid) {
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    // 使用 Firebase Auth 登入
    signInWithEmailAndPassword(this.auth, userName.value, password.value)
      .then(async (credential) => {
        // 清空路由復用信息
        this.reuseTabService?.clear();
        
        // Token 已經由 FirebaseAuthBridgeService 自動設定到 @delon/auth
        // 重新載入 StartupService
        this.startupSrv.load().subscribe(() => {
          let url = this.tokenService.referrer!.url || '/';
          if (url.includes('/passport')) {
            url = '/';
          }
          this.router.navigateByUrl(url);
        });
      })
      .catch((error) => {
        this.loading = false;
        this.error = this.getFirebaseErrorMessage(error.code);
        this.cdr.detectChanges();
      });
  }

  /**
   * 將 Firebase 錯誤碼轉換為友善的訊息
   */
  private getFirebaseErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': '無效的電子郵件地址',
      'auth/user-disabled': '此帳號已被停用',
      'auth/user-not-found': '找不到此帳號',
      'auth/wrong-password': '密碼錯誤',
      'auth/invalid-credential': '帳號或密碼錯誤',
      'auth/too-many-requests': '登入嘗試次數過多，請稍後再試',
      'auth/network-request-failed': '網路連線失敗',
    };
    
    return errorMessages[errorCode] || '登入失敗，請稍後再試';
  }
}

// END OF FILE
```

---

### Phase 2: 移除 Social Login（Week 1-2）

#### 步驟 2.1: 刪除 callback 元件

```bash
# 移除社交登入 callback 元件
rm -rf src/app/routes/passport/callback/
```

#### 步驟 2.2: 更新路由配置

**檔案：** `src/app/routes/passport/routes.ts`

```typescript
import { Routes } from '@angular/router';
import { UserLockComponent } from './lock/lock.component';
import { UserLoginComponent } from './login/login.component';
import { UserRegisterComponent } from './register/register.component';
import { UserRegisterResultComponent } from './register-result/register-result.component';
import { LayoutPassportComponent } from '../../layout';

export const routes: Routes = [
  {
    path: 'passport',
    component: LayoutPassportComponent,
    children: [
      {
        path: 'login',
        component: UserLoginComponent,
        data: { title: '登入', titleI18n: 'app.login.login' }
      },
      {
        path: 'register',
        component: UserRegisterComponent,
        data: { title: '註冊', titleI18n: 'app.register.register' }
      },
      {
        path: 'register-result',
        component: UserRegisterResultComponent,
        data: { title: '註冊結果', titleI18n: 'app.register.register' }
      },
      {
        path: 'lock',
        component: UserLockComponent,
        data: { title: '鎖屏', titleI18n: 'app.lock' }
      }
    ]
  }
  // ❌ 移除：{ path: 'passport/callback/:type', component: CallbackComponent }
];

// END OF FILE
```

#### 步驟 2.3: 刪除未使用的 import

**檔案：** `src/app/routes/passport/routes.ts`

```typescript
// ❌ 移除：import { CallbackComponent } from './callback.component';
```

---

### Phase 3: 簡化 Startup Service（Week 2-3）

#### 步驟 3.1: 更新 startup.service.ts

**檔案：** `src/app/core/startup/startup.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { MenuService, SettingsService } from '@delon/theme';
import { ACLService } from '@delon/acl';
import { I18NService } from '../i18n/i18n.service';

interface UserProfile {
  name?: string;
  avatar?: string;
  email?: string;
  role?: string;
}

@Injectable()
export class StartupService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private menuService = inject(MenuService);
  private settingService = inject(SettingsService);
  private aclService = inject(ACLService);
  private i18n = inject(I18NService);

  load(): Observable<void> {
    return from(this.loadAsync()).pipe(
      catchError((error) => {
        console.error('Startup service failed:', error);
        return of(void 0);
      })
    );
  }

  private async loadAsync(): Promise<void> {
    // 1. 載入語言資料
    const defaultLang = 'zh-CN';
    const langData = await this.i18n.loadLangData(defaultLang).toPromise();
    this.i18n.use(defaultLang, langData);

    // 2. 等待 Firebase Auth 初始化
    const user = await this.waitForAuthState();

    // 3. 設定應用資訊
    this.settingService.setApp({
      name: 'NG-EVENTS',
      description: 'Event Management Application'
    });

    // 4. 根據登入狀態載入資料
    if (user) {
      await this.loadAuthenticatedUserData(user);
    } else {
      await this.loadAnonymousUserData();
    }

    // 5. 設定 ACL 權限
    this.aclService.setFull(true);
  }

  /**
   * 等待 Firebase Auth 初始化完成
   */
  private waitForAuthState(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  /**
   * 載入已登入用戶的資料
   */
  private async loadAuthenticatedUserData(user: User): Promise<void> {
    try {
      // 從 Firestore 載入用戶資料
      const userProfile = await this.getUserProfile(user.uid);

      // 設定用戶資訊
      this.settingService.setUser({
        name: userProfile.name || user.displayName || user.email,
        avatar: userProfile.avatar || user.photoURL || './assets/tmp/img/avatar.jpg',
        email: user.email || ''
      });

      // 載入用戶特定的選單
      const menu = await this.loadUserMenu(user.uid, userProfile.role);
      this.menuService.add(menu);
    } catch (error) {
      console.error('Failed to load user data:', error);
      // 載入預設選單作為 fallback
      this.loadDefaultMenu();
    }
  }

  /**
   * 載入未登入用戶的資料
   */
  private async loadAnonymousUserData(): Promise<void> {
    // 未登入時載入預設選單
    this.loadDefaultMenu();
  }

  /**
   * 從 Firestore 獲取用戶資料
   */
  private async getUserProfile(uid: string): Promise<UserProfile> {
    const docRef = doc(this.firestore, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    
    return {};
  }

  /**
   * 根據用戶角色載入選單
   */
  private async loadUserMenu(uid: string, role?: string): Promise<any[]> {
    // TODO: 根據用戶角色從 Firestore 或 Remote Config 載入選單
    // 目前使用預設選單
    return this.getDefaultMenu();
  }

  /**
   * 載入預設選單
   */
  private loadDefaultMenu(): void {
    this.menuService.add(this.getDefaultMenu());
  }

  /**
   * 獲取預設選單結構
   */
  private getDefaultMenu(): any[] {
    return [
      {
        text: '主選單',
        group: true,
        children: [
          {
            text: '儀表板',
            link: '/dashboard',
            icon: { type: 'icon', value: 'appstore' }
          }
        ]
      }
    ];
  }
}

// END OF FILE
```

#### 步驟 3.2: 移除 mock 登入 endpoint

由於現在使用 Firebase Auth，不再需要 `/login/account` endpoint。

**移除或更新環境配置：**
- 從 `environment.ts` 移除 mock API 配置
- 移除任何指向 mock server 的設定

---

### Phase 4: 註冊功能更新（Week 2）

#### 步驟 4.1: 更新註冊元件

**檔案：** `src/app/routes/passport/register/register.component.ts`

```typescript
import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'passport-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    // ... 其他 imports
  ]
})
export class UserRegisterComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly cdr = inject(ChangeDetectorRef);

  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required, Validators.minLength(6)]],
    name: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  error = '';
  loading = false;

  submit(): void {
    this.error = '';
    
    // 驗證表單
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    const { email, password, name } = this.form.value;
    this.loading = true;
    this.cdr.detectChanges();

    // 使用 Firebase Auth 建立帳號
    createUserWithEmailAndPassword(this.auth, email!, password!)
      .then(async (credential) => {
        // 更新用戶 profile
        await updateProfile(credential.user, {
          displayName: name
        });

        // 在 Firestore 建立用戶資料
        await setDoc(doc(this.firestore, 'users', credential.user.uid), {
          name: name,
          email: email,
          createdAt: new Date(),
          role: 'user'
        });

        // 跳轉到註冊成功頁面
        this.router.navigate(['/passport/register-result'], {
          queryParams: { email }
        });
      })
      .catch((error) => {
        this.loading = false;
        this.error = this.getFirebaseErrorMessage(error.code);
        this.cdr.detectChanges();
      });
  }

  /**
   * 密碼確認驗證器
   */
  private passwordMatchValidator(form: any): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirm = form.get('confirm');
    
    if (!password || !confirm) {
      return null;
    }
    
    return password.value === confirm.value ? null : { passwordMismatch: true };
  }

  /**
   * 將 Firebase 錯誤碼轉換為友善的訊息
   */
  private getFirebaseErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': '此電子郵件已被使用',
      'auth/invalid-email': '無效的電子郵件地址',
      'auth/operation-not-allowed': '註冊功能未啟用',
      'auth/weak-password': '密碼強度不足（至少 6 個字元）',
      'auth/network-request-failed': '網路連線失敗',
    };
    
    return errorMessages[errorCode] || '註冊失敗，請稍後再試';
  }
}

// END OF FILE
```

---

## 跳轉功能驗證

### 現有機制保持運作

**1. 路由守衛檢查**
```typescript
// routes.ts
{
  path: '',
  component: LayoutBasicComponent,
  canActivate: [authSimpleCanActivate],  // ← 檢查 DA_SERVICE_TOKEN
  children: [...]
}
```

**2. 登入頁面配置**
```typescript
// app.config.ts
alainConfig: AlainConfig = {
  auth: { login_url: '/passport/login' }  // ← 跳轉目標
}
```

**3. 自動跳轉流程**
```
用戶訪問 /dashboard
  ↓
authSimpleCanActivate 檢查 token
  ↓
token 不存在？
  ↓
跳轉到 /passport/login（記住原始 URL）
  ↓
登入成功 → Firebase Auth 提供 token
  ↓
FirebaseAuthBridgeService 同步到 @delon/auth
  ↓
跳轉回原始 URL（/dashboard）
```

### 測試場景

**場景 1: 未登入訪問受保護頁面**
```
訪問 http://localhost:4200/dashboard
  ↓
自動跳轉到 http://localhost:4200/passport/login
  ↓
登入後回到 http://localhost:4200/dashboard
```

**場景 2: 已登入直接訪問**
```
訪問 http://localhost:4200/dashboard
  ↓
@delon/auth 檢查 token 存在
  ↓
直接顯示 dashboard 頁面
```

**場景 3: Token 過期**
```
Token 過期
  ↓
Firebase Auth 自動刷新 token
  ↓
FirebaseAuthBridgeService 更新到 @delon/auth
  ↓
用戶無感知繼續使用
```

---

## 檢查清單

### Week 1
- [ ] 建立 `FirebaseAuthBridgeService`
- [ ] 在 `app.config.ts` 中初始化橋接
- [ ] 更新 `login.component.ts` 使用 Firebase Auth
- [ ] 測試登入流程
- [ ] 測試跳轉功能（未登入 → 登入頁面 → 原頁面）
- [ ] 移除 social login callback 元件
- [ ] 更新 `passport/routes.ts`

### Week 2
- [ ] 更新 `register.component.ts` 使用 Firebase Auth
- [ ] 測試註冊流程
- [ ] 更新 `startup.service.ts` 移除 mock 資料
- [ ] 從 Firestore 載入真實用戶資料
- [ ] 測試應用啟動流程

### Week 3
- [ ] 完整測試所有流程
- [ ] 修復發現的問題
- [ ] 更新文件
- [ ] Code review
- [ ] 部署到測試環境

---

## 預期效益

### 技術債務消除
- ✅ 移除 mock 登入 endpoint
- ✅ 移除 social login callback 元件（~500 行程式碼）
- ✅ 移除 mock 資料檔案
- ✅ 簡化 startup service 邏輯

### 程式碼品質提升
- ✅ 單一認證來源（Firebase Auth）
- ✅ 自動 token 管理和刷新
- ✅ 清晰的資料流向
- ✅ 更好的型別安全

### 用戶體驗改善
- ✅ 更快的登入速度（直接 Firebase Auth）
- ✅ 更可靠的認證機制
- ✅ 自動 token 刷新（用戶無感知）
- ✅ 完整的跳轉功能保持運作

---

## 結論

**確認：可以同時完成任務 2、3、4** ✅

將 Firebase Auth 作為主要認證來源後：
1. **任務 2** - 透過 `FirebaseAuthBridgeService` 自動完成
2. **任務 3** - 移除所有 social login 相關程式碼
3. **任務 4** - 簡化 `startup.service.ts`，從 Firebase/Firestore 載入資料

**跳轉功能完全保留** ✅
- `authSimpleCanActivate` 路由守衛持續運作
- 未登入用戶自動跳轉到 `/passport/login`
- 登入成功後回到原頁面
- Token 自動刷新和同步

這個方案完全符合奧卡姆剃刀原則，提供最簡單、最直接的解決方案。

// END OF FILE
