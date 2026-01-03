/**
 * Projection Builders Exports
 * 
 * Central export point for all projection builders.
 */

// Base projection builder
export { ProjectionBuilder } from './ProjectionBuilder';

// Account domain projection builders
export { 
  AccountProjectionBuilder,
  type AccountProjection 
} from './account/AccountProjectionBuilder';

export { 
  WorkspaceProjectionBuilder,
  type WorkspaceProjection 
} from './account/WorkspaceProjectionBuilder';

export { 
  MembershipProjectionBuilder,
  type MembershipProjection 
} from './account/MembershipProjectionBuilder';

export { 
  ModuleRegistryProjectionBuilder,
  type ModuleRegistryProjection 
} from './account/ModuleRegistryProjectionBuilder';

// SaaS domain projection builders
export { 
  TaskProjectionBuilder,
  type TaskProjection 
} from './saas/TaskProjectionBuilder';

export { 
  PaymentProjectionBuilder,
  type PaymentProjection 
} from './saas/PaymentProjectionBuilder';

export { 
  IssueProjectionBuilder,
  type IssueProjection 
} from './saas/IssueProjectionBuilder';

// END OF FILE
