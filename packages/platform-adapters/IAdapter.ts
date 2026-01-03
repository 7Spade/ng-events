/**
 * IAdapter
 * 
 * @deprecated This file has been moved and renamed.
 * Please use: import { AdapterLifecycle } from '@platform-adapters/base';
 * 
 * Migration Path:
 * - Old: import { IAdapter } from '@platform-adapters/IAdapter';
 * - New: import { AdapterLifecycle } from '@platform-adapters/base';
 * 
 * This file will be removed in Phase 2.
 */

import { AdapterLifecycle } from './base/AdapterLifecycle';

/**
 * @deprecated Use AdapterLifecycle from @platform-adapters/base instead
 */
export interface IAdapter extends AdapterLifecycle {}

// Re-export for backward compatibility
export type { AdapterLifecycle };

// END OF FILE
