import type { ModuleKey } from './module-key';

export interface ModuleManifest {
  readonly key: ModuleKey;
  readonly requires: ModuleKey[];
}

// END OF FILE
