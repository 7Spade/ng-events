import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { MenuService, SettingsService, TitleService } from '@delon/theme';
import { ACLService } from '@delon/acl';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { Router } from '@angular/router';

import { I18NService } from '../i18n/i18n.service';

interface UserProfile {
  name?: string;
  avatar?: string;
  email?: string;
  role?: string;
}

/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
export function provideStartup() {
  return [
    StartupService,
    {
      provide: 'APP_INITIALIZER',
      useFactory: (startupService: StartupService) => () => startupService.load(),
      deps: [StartupService],
      multi: true
    }
  ];
}

@Injectable()
export class StartupService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private menuService = inject(MenuService);
  private settingService = inject(SettingsService);
  private aclService = inject(ACLService);
  private titleService = inject(TitleService);
  private router = inject(Router);
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  load(): Observable<void> {
    return from(this.loadAsync()).pipe(
      catchError((error) => {
        console.error('Startup service failed:', error);
        setTimeout(() => this.router.navigateByUrl(`/exception/500`));
        return of(void 0);
      })
    );
  }

  private async loadAsync(): Promise<void> {
    // 1. 載入語言資料
    const defaultLang = this.i18n.defaultLang;
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

    // 6. 設定頁面標題
    this.titleService.default = '';
    this.titleService.suffix = 'NG-EVENTS';
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

