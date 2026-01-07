import type { ModuleKey } from '@core-engine/src/module-system/module-key';

import type { CommandMetadata } from './index';

export interface EnableModuleCommand {
  readonly workspaceId: string;
  readonly moduleKey: ModuleKey;
  readonly actorAccountId: string;
  readonly blueprintId: string;
  readonly metadata?: CommandMetadata;
}

// END OF FILE
