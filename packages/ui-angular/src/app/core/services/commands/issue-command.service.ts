import { Injectable } from '@angular/core';
import { IssueRepository } from '@ng-events/core-engine';

/**
 * Issue Command Service
 * Handles write operations for Issue aggregate
 * SKELETON ONLY - No business logic implementation
 */
@Injectable({
  providedIn: 'root'
})
export class IssueCommandService {
  constructor(
    // Inject Repository interface (NOT Firestore implementation)
    // private readonly issueRepository: IssueRepository
  ) {}

  /**
   * Create new issue
   * TODO: Load aggregate → execute business method → save
   */
  async createIssue(params: {
    workspaceId: string; // MANDATORY multi-tenant parameter
    title: string;
    description: string;
    reporterId: string;
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. IssueEntity.create()
    // 2. issueRepository.save(issue)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Resolve issue
   * TODO: Load aggregate → resolve() → save
   */
  async resolveIssue(params: {
    issueId: string;
    workspaceId: string; // MANDATORY for validation
  }): Promise<void> {
    // TODO: Implement command flow
    // 1. issueRepository.load(issueId)
    // 2. issue.resolve()
    // 3. issueRepository.save(issue)
    throw new Error('Not implemented - skeleton only');
  }

  /**
   * Close issue
   * TODO: Load aggregate → close() → save
   */
  async closeIssue(params: {
    issueId: string;
    workspaceId: string; // MANDATORY for validation
  }): Promise<void> {
    // TODO: Implement command flow
    throw new Error('Not implemented - skeleton only');
  }
}
