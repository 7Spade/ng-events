---

## 🎯 設計目標（先對齊）

* ✅ 純 TS，無框架
* ✅ 不知道 Workspace 實作細節
* ✅ 只負責：

  * 註冊模組
  * 驗證是否可啟用
* ❌ 不啟用、不發 Event、不初始化資料

---

## 🧱 型別定義（核心骨架）

```ts
// core-engine/module-system/types.ts

export type ModuleKey = string;

export interface ModuleManifest {
  key: ModuleKey;
  requires?: ModuleKey[];
}
```

---

## 🧠 Workspace 視角（Registry 只需要這些）

```ts
// core-engine/module-system/WorkspaceModuleState.ts

import { ModuleKey } from './types';

export interface WorkspaceModuleState {
  enabledModules: ModuleKey[];
}
```

---

## 🔥 ModuleRegistry（主角登場）

```ts
// core-engine/module-system/ModuleRegistry.ts

import { ModuleKey, ModuleManifest } from './types';
import { WorkspaceModuleState } from './WorkspaceModuleState';

export class ModuleRegistry {
  private manifests = new Map<ModuleKey, ModuleManifest>();

  register(manifest: ModuleManifest): void {
    if (this.manifests.has(manifest.key)) {
      throw new Error(`Module already registered: ${manifest.key}`);
    }

    this.manifests.set(manifest.key, manifest);
  }

  canEnable(
    moduleKey: ModuleKey,
    workspace: WorkspaceModuleState
  ): boolean {
    const manifest = this.manifests.get(moduleKey);
    if (!manifest) return false;

    const enabled = new Set(workspace.enabledModules);

    return (manifest.requires ?? []).every(dep =>
      enabled.has(dep)
    );
  }

  getRegisteredModules(): ModuleKey[] {
    return Array.from(this.manifests.keys());
  }
}
```

---

## 🧪 使用範例（你一看就會用）

### 1️⃣ 註冊模組（系統啟動時）

```ts
const registry = new ModuleRegistry();

registry.register({
  key: 'task',
});

registry.register({
  key: 'payment',
  requires: ['task'],
});
```

---

### 2️⃣ Workspace 驗證（Aggregate 裡）

```ts
function enableModule(
  workspace: WorkspaceModuleState,
  moduleKey: ModuleKey,
  registry: ModuleRegistry
) {
  if (!registry.canEnable(moduleKey, workspace)) {
    throw new Error('Module requirements not satisfied 😾');
  }

  // 發 WorkspaceModuleEnabled Event
}
```

---

## 🧠 為什麼這樣就夠了？

因為：

* 依賴宣告在模組
* 狀態在 Workspace
* 判斷邏輯集中
* Event 還在你 Aggregate 裡

👉 Registry **不碰因果、不碰事件**

這就是它該有的尺寸 😌

---

## ❌ Registry 絕對不要做的事（請刻在腦裡）

* ❌ 存 Workspace
* ❌ 發 Event
* ❌ 初始化 Read Model
* ❌ 知道模組內部 API

---

## 🫦 進階（等你要再來）

等你之後想升級，我可以幫你加：

* 模組停用（disable）
* 模組版本（task@2）
* 模組能力旗標（capabilities）
* 模組衝突（conflicts）

**但現在這版，剛剛好，不會太騷也不會太肥** 😼

---
