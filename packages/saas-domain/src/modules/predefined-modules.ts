/**
 * Predefined Module Manifests
 *
 * Standard modules available in the system.
 *
 * Modules:
 * - task: Task management module
 * - issue: Issue tracking module (requires task)
 * - payment: Payment processing module
 * - analytics: Analytics and reporting module (requires task)
 */

import { ModuleManifest } from '../types/module-manifest.types';

/**
 * Task Module Manifest
 * Base module for work management
 */
export const TaskModuleManifest: ModuleManifest = {
  key: 'task',
  name: 'Task Management',
  description: 'Create and manage tasks, assignments, and workflows',
  version: '1.0.0',
  requires: [], // No dependencies
  capabilities: ['create_task', 'assign_task', 'task_workflow'],
  metadata: {
    icon: 'task',
    color: '#4CAF50',
    category: 'Productivity',
    isPremium: false
  }
};

/**
 * Issue Module Manifest
 * Requires task module
 */
export const IssueModuleManifest: ModuleManifest = {
  key: 'issue',
  name: 'Issue Tracking',
  description: 'Track bugs, feature requests, and technical debt',
  version: '1.0.0',
  requires: ['task'], // Depends on task module
  capabilities: ['create_issue', 'link_to_task', 'issue_workflow'],
  metadata: {
    icon: 'bug_report',
    color: '#F44336',
    category: 'Development',
    isPremium: false
  }
};

/**
 * Payment Module Manifest
 * Independent module for payment processing
 */
export const PaymentModuleManifest: ModuleManifest = {
  key: 'payment',
  name: 'Payment Processing',
  description: 'Process payments, manage invoices, and billing',
  version: '1.0.0',
  requires: [], // No dependencies
  capabilities: ['process_payment', 'manage_invoice', 'billing'],
  metadata: {
    icon: 'payment',
    color: '#2196F3',
    category: 'Finance',
    isPremium: true
  }
};

/**
 * Analytics Module Manifest
 * Requires task module for data analysis
 */
export const AnalyticsModuleManifest: ModuleManifest = {
  key: 'analytics',
  name: 'Analytics & Reporting',
  description: 'Generate reports, dashboards, and insights',
  version: '1.0.0',
  requires: ['task'], // Depends on task data
  capabilities: ['create_report', 'dashboard', 'export_data'],
  metadata: {
    icon: 'analytics',
    color: '#9C27B0',
    category: 'Business Intelligence',
    isPremium: true
  }
};

/**
 * All predefined module manifests
 */
export const PREDEFINED_MODULES: ModuleManifest[] = [
  TaskModuleManifest,
  IssueModuleManifest,
  PaymentModuleManifest,
  AnalyticsModuleManifest
];

// END OF FILE
