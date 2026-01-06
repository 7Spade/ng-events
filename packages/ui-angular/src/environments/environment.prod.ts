import { AppEnvironment } from './environment.type';

export const environment: AppEnvironment = {
  production: true,
  useHash: true,
  api: {
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  appCheck: {
    siteKey: '6LcGnSUsAAAAAMIm1aYeWqoYNEmLphGIbwEfWJlc',
    useDebugToken: false,
    debugToken: undefined,
    isTokenAutoRefreshEnabled: true
  }
};
