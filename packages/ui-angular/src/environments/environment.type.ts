import { Environment } from '@delon/theme';

export type AppEnvironment = Environment & {
  appCheck?: {
    siteKey?: string;
    useDebugToken?: boolean;
    debugToken?: string | boolean;
    isTokenAutoRefreshEnabled?: boolean;
  };
};

// END OF FILE
