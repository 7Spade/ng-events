import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { default as ngLang } from '@angular/common/locales/zh';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  EnvironmentInjector,
  EnvironmentProviders,
  Provider,
  inject,
  runInInjectionContext
} from '@angular/core';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, provideAppCheck } from '@angular/fire/app-check';
import { getAuth, provideAuth as provideAuth_alias } from '@angular/fire/auth';
import { getDataConnect, provideDataConnect } from '@angular/fire/data-connect';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withHashLocation,
  RouterFeatures,
  withViewTransitions
} from '@angular/router';
import { I18NService, SESSION_CONTEXT, defaultInterceptor, provideBindAuthRefresh, provideStartup } from '@core';
import { provideCellWidgets } from '@delon/abc/cell';
import { provideSTWidgets } from '@delon/abc/st';
import { authSimpleInterceptor, provideAuth } from '@delon/auth';
import { provideSFConfig } from '@delon/form';
import { AlainProvideLang, provideAlain, zh_CN as delonLang } from '@delon/theme';
import { AlainConfig } from '@delon/util/config';
import { environment } from '@env/environment';
import { CELL_WIDGETS, SF_WIDGETS, ST_WIDGETS } from '@shared';
import { zhCN as dateLang } from 'date-fns/locale';
import type { AppCheck } from 'firebase/app-check';
import { NzConfig, provideNzConfig } from 'ng-zorro-antd/core/config';
import { zh_CN as zorroLang } from 'ng-zorro-antd/i18n';

import { ICONS } from '../style-icons';
import { ICONS_AUTO } from '../style-icons-auto';
import { DelonSessionContextAdapter } from './core/auth/delon-session-context.adapter';
import { FirebaseAuthBridgeService } from './core/auth/firebase-auth-bridge.service';
import { routes } from './routes/routes';

const defaultLang: AlainProvideLang = {
  abbr: 'zh-CN',
  ng: ngLang,
  zorro: zorroLang,
  date: dateLang,
  delon: delonLang
};

const alainConfig: AlainConfig = {
  st: { modal: { size: 'lg' } },
  pageHeader: { homeI18n: 'home' },
  lodop: {
    license: `A59B099A586B3851E0F0D7FDBF37B603`,
    licenseA: `C94CEE276DB2187AE6B65D56B3FC2848`
  },
  auth: { login_url: '/passport/login' }
};

const ngZorroConfig: NzConfig = {};

const routerFeatures: RouterFeatures[] = [
  withComponentInputBinding(),
  withViewTransitions(),
  withInMemoryScrolling({ scrollPositionRestoration: 'top' })
];
if (environment.useHash) routerFeatures.push(withHashLocation());

let appCheckInstance: AppCheck | null = null;

const providers: Array<Provider | EnvironmentProviders> = [
  provideHttpClient(withInterceptors([...(environment.interceptorFns ?? []), authSimpleInterceptor, defaultInterceptor])),
  provideAnimations(),
  provideRouter(routes, ...routerFeatures),
  provideAlain({ config: alainConfig, defaultLang, i18nClass: I18NService, icons: [...ICONS_AUTO, ...ICONS] }),
  provideNzConfig(ngZorroConfig),
  provideAuth(),
  provideCellWidgets(...CELL_WIDGETS),
  provideSTWidgets(...ST_WIDGETS),
  provideSFConfig({ widgets: SF_WIDGETS }),
  provideStartup(),
  {
    provide: SESSION_CONTEXT,
    useClass: DelonSessionContextAdapter
  },
  ...(environment.providers || [])
];

// If you use `@delon/auth` to refresh the token, additional registration `provideBindAuthRefresh` is required
if (environment.api?.refreshTokenEnabled && environment.api.refreshTokenType === 'auth-refresh') {
  providers.push(provideBindAuthRefresh());
}

// Firebase providers - integrated with @delon/auth
providers.push(
  provideFirebaseApp(() =>
    initializeApp({
      projectId: 'elite-chiller-455712-c4',
      appId: '1:7807661688:web:0835c399c934321d1d1f8d',
      databaseURL: 'https://elite-chiller-455712-c4-default-rtdb.asia-southeast1.firebasedatabase.app',
      storageBucket: 'elite-chiller-455712-c4.firebasestorage.app',
      apiKey: 'AIzaSyCJ-eayGjJwBKsNIh3oEAG2GjbfTrvAMEI',
      authDomain: 'elite-chiller-455712-c4.firebaseapp.com',
      messagingSenderId: '7807661688',
      measurementId: 'G-W6KXBTP3YD'
    })
  ),
  provideAuth_alias(() => getAuth()),
  provideAnalytics(() => getAnalytics()),
  ScreenTrackingService,
  UserTrackingService,
  provideAppCheck(() => {
    if (appCheckInstance) return appCheckInstance;

    const envInjector = inject(EnvironmentInjector);
    const siteKey = environment.appCheck?.siteKey ?? '6LcGnSUsAAAAAMIm1aYeWqoYNEmLphGIbwEfWJlc';
    const provider = new ReCaptchaEnterpriseProvider(siteKey);
    const initAppCheck = () => {
      if (!environment.production && environment.appCheck?.useDebugToken && typeof window !== 'undefined') {
        const debugToken = environment.appCheck.debugToken ?? true;
        if (!(window as any).FIREBASE_APPCHECK_DEBUG_TOKEN) {
          (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
        }
      }
      return initializeAppCheck(undefined, {
        provider,
        isTokenAutoRefreshEnabled: environment.appCheck?.isTokenAutoRefreshEnabled ?? true
      });
    };

    appCheckInstance = runInInjectionContext(envInjector, initAppCheck);
    return appCheckInstance;
  }),
  provideFirestore(() => getFirestore()),
  provideDatabase(() => getDatabase()),
  provideDataConnect(() => getDataConnect({ connector: 'example', location: 'asia-southeast1', service: 'ng-events' })),
  provideFunctions(() => getFunctions()),
  provideMessaging(() => getMessaging()),
  providePerformance(() => getPerformance()),
  provideStorage(() => getStorage()),
  provideRemoteConfig(() => getRemoteConfig()),
  provideVertexAI(() => getVertexAI())
);

// Firebase Auth Bridge - sync Firebase Auth to @delon/auth
providers.push({
  provide: APP_INITIALIZER,
  useFactory: (bridge: FirebaseAuthBridgeService) => () => bridge.init(),
  deps: [FirebaseAuthBridgeService],
  multi: true
});

export const appConfig: ApplicationConfig = {
  providers
};
