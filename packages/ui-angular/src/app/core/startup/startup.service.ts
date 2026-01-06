import { Injectable, inject, APP_INITIALIZER } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { ACLService } from '@delon/acl';
import { MenuService, SettingsService, TitleService, ALAIN_I18N_TOKEN } from '@delon/theme';
import { Observable, firstValueFrom, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthStateFacade } from '../../adapters/auth-state.facade';
import { FirebaseAuthBridgeService } from '../auth/firebase-auth-bridge.service';
import { I18NService } from '../i18n/i18n.service';
import { SESSION_CONTEXT } from '../session-context.token';

interface UserProfile {
  name?: string;
  avatar?: string;
  email?: string;
  role?: string;
}

interface MenuGroup {
  text: string;
  group: true;
  children: Array<{
    text: string;
    link: string;
    icon: { type: 'icon'; value: string };
  }>;
}

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
export function provideStartup() {
  return [
    StartupService,
    {
      provide: APP_INITIALIZER,
      useFactory: (startupService: StartupService) => () => startupService.load(),
      deps: [StartupService],
      multi: true
    }
  ];
}

@Injectable()
export class StartupService {
  private firestore = inject(Firestore);
  private menuService = inject(MenuService);
  private settingService = inject(SettingsService);
  private aclService = inject(ACLService);
  private titleService = inject(TitleService);
  private router = inject(Router);
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private authBridge = inject(FirebaseAuthBridgeService);
  private authState = inject(AuthStateFacade, { optional: true });
  private session = inject(SESSION_CONTEXT);

  load(): Observable<void> {
    return from(this.loadAsync()).pipe(
      catchError(error => {
        console.error('Startup service failed:', error);
        setTimeout(() => this.router.navigateByUrl(`/exception/500`));
        return of(void 0);
      })
    );
  }

  private async loadAsync(): Promise<void> {
    // 1. 載入語言資料
    const defaultLang = this.i18n.defaultLang;
    const langData = await firstValueFrom(this.i18n.loadLangData(defaultLang));
    this.i18n.use(defaultLang, langData);

    // 2. 等待 Firebase Auth 初始化（統一從 bridge 取得，避免重複監聽）
    this.authBridge.init(); // 保證唯一註冊且可被 APP_INITIALIZER 或其它入口共用
    this.authState?.init(); // Skeleton: optional unified path
    const user = (await this.authState?.waitForAuthState()) ?? (await this.authBridge.waitForAuthState());

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

    // 5. 設定 ACL 權限 (derive from SessionContext roles/abilities/modules; setFull disabled)
    this.refreshAclFromSession();
    // TODO(#29/#41 Phase3): when an external workspaceId change is emitted (container workspace type only),
    // call refreshAclFromSession(); emit future Event Sourcing hooks only for container workspaceType.
    // Hook only, no selector/service/context added.
    // TODO(Phase0-Account): if accountId/accountType changes (actor), refresh roles/abilities from SessionContext without setFull().
    // TODO(Phase3-Owner): when ownerAccountIds/member projections arrive, re-evaluate ACL scope (still setRole/setAbility only).

    // 6. 設定頁面標題
    this.titleService.default = '';
    this.titleService.suffix = 'NG-EVENTS';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async loadUserMenu(_uid: string, _role?: string): Promise<MenuGroup[]> {
    // TODO: 根據用戶角色從 Firestore 或 Remote Config 載入選單
    // 目前使用預設選單，保留參數以便未來擴充角色/用戶專屬選單
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
  private getDefaultMenu(): MenuGroup[] {
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

  private refreshAclFromSession(): void {
    const roles = Array.isArray(this.session.roles) ? this.session.roles : [];
    const abilities = Array.isArray(this.session.abilities) ? this.session.abilities : [];
    this.aclService.setRole(roles);
    this.aclService.setAbility(abilities);
    // setFull() intentionally disabled to keep ACL scoped (#29/#41).
  }
}

// END OF FILE
