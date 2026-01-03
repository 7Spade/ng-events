/**
 * IRepositoryAdapter
 * 
 * @deprecated This file has been moved and renamed.
 * Please use: import { RepositoryAdapterCapability } from '@platform-adapters/base';
 * 
 * Migration Path:
 * - Old: import { IRepositoryAdapter } from '@platform-adapters/IRepositoryAdapter';
 * - New: import { RepositoryAdapterCapability } from '@platform-adapters/base';
 * 
 * This file will be removed in Phase 2.
 */

import { RepositoryAdapterCapability } from './base/RepositoryAdapterCapability';
import { AdapterLifecycle } from './base/AdapterLifecycle';

/**
 * @deprecated Use RepositoryAdapterCapability from @platform-adapters/base instead
 */
export interface IRepositoryAdapter extends RepositoryAdapterCapability {}

// Re-export for backward compatibility
export type { RepositoryAdapterCapability, AdapterLifecycle };

// END OF FILE
