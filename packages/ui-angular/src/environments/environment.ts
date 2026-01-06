// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { AppEnvironment } from './environment.type';

export const environment: AppEnvironment = {
  production: false,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  appCheck: {
    siteKey: '6LcGnSUsAAAAAMIm1aYeWqoYNEmLphGIbwEfWJlc',
    useDebugToken: true,
    debugToken: undefined,
    isTokenAutoRefreshEnabled: true
  }
};
