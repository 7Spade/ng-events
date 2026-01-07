import type { ModuleManifest } from './module-manifest';
import type { ModuleKey } from './module-key';

export class ModuleRegistry {
  /**
   * Validates whether a module can be enabled given the manifests and currently enabled modules.
   */
  static canEnable(moduleKey: ModuleKey, enabledModules: ModuleKey[], manifests: ModuleManifest[]): boolean {
    const manifest = manifests.find((item) => item.key === moduleKey);
    if (!manifest) {
      return true;
    }

    return (manifest.requires ?? []).every((required) => enabledModules.includes(required));
  }
}

// END OF FILE
