import { Injectable } from '@angular/core';
import { MembershipRepository } from '@ng-events/core-engine';

/**
 * Membership Command Service
 * Handles write operations for Membership aggregate
 * SKELETON ONLY - No business logic implementation
 */
@Injectable({
  providedIn: 'root'
})
export class MembershipCommandService {
  constructor(
    // Inject Repository interface (NOT Firestore implementation)
    // private readonly membershipRepository: MembershipRepository
  ) {}

  /**
   * Add member to workspace
   * TODO: Load aggregate → execute business method → save
   */
  async addMember(params: {
    memberId: string;
    workspaceId: string;
    role: string; // 'admin' | 'member' | 'guest'
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. Membership.create()
    // 2. membershipRepository.save(membership)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Change member role
   * TODO: Load aggregate → changeRole() → save
   */
  async changeMemberRole(params: {
    membershipId: string;
    newRole: string;
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. membershipRepository.load(membershipId)
    // 2. membership.changeRole(newRole)
    // 3. membershipRepository.save(membership)
    throw new Error('Not implemented - skeleton only');
  }
}
