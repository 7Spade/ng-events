/**
 * Workspace Domain Module
 *
 * Manages workspaces owned by accounts and their lifecycle state.
 * Supports:
 * - Workspace creation tied to an account
 * - Workspace lifecycle (initializing → ready → restricted → archived)
 */

export * from './aggregates/Workspace';
export * from './value-objects/WorkspaceId';
export * from './value-objects/WorkspaceRole';
export * from './events/WorkspaceCreated';
export * from './events/WorkspaceArchived';
