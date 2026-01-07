import type { ModuleManifest } from '@core-engine/src/module-system/module-manifest';

export const paymentManifest: ModuleManifest = {
  key: 'payment',
  requires: ['task']
};

// END OF FILE
