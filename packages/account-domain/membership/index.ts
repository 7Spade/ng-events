/**
 * Membership Domain Module
 *
 * Captures user roles and participation within a workspace.
 * Ensures each workspace has members with explicit roles.
 */

export * from './aggregates/Membership';
export * from './value-objects/MemberId';
export * from './value-objects/Role';
export * from './events/MemberJoinedWorkspace';
export * from './events/MemberRoleChanged';
export * from './repositories/MembershipRepository';

// END OF FILE
