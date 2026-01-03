#!/usr/bin/env node

/**
 * Phase 1E Validation Script - Projection Layer
 * 
 * Validates implementation of WorkspaceProjectionBuilder:
 * - Core-engine ProjectionBuilder interface updated
 * - WorkspaceProjectionBuilder implements projection logic
 * - Event handlers for WorkspaceCreated and WorkspaceArchived
 * - Idempotent projection updates with merge:true
 * - Comprehensive test coverage
 * - Firestore integration
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Validation results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  checks: [],
};

/**
 * Run a validation check
 */
function check(description, fn) {
  results.total++;
  try {
    const result = fn();
    if (result) {
      results.passed++;
      results.checks.push({ description, status: 'PASS' });
      console.log(`${colors.green}✓${colors.reset} ${description}`);
    } else {
      results.failed++;
      results.checks.push({ description, status: 'FAIL' });
      console.log(`${colors.red}✗${colors.reset} ${description}`);
    }
  } catch (error) {
    results.failed++;
    results.checks.push({ description, status: 'ERROR', error: error.message });
    console.log(`${colors.red}✗${colors.reset} ${description} - ${error.message}`);
  }
}

/**
 * Read file content
 */
function readFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

console.log(`\n${colors.bold}${colors.blue}Phase 1E Validation - Projection Layer${colors.reset}\n`);

// ==========================================
// Core-Engine ProjectionBuilder Interface
// ==========================================

console.log(`${colors.bold}Core-Engine ProjectionBuilder Interface:${colors.reset}`);

check('File exists: core-engine/projection/index.ts', () => {
  return fs.existsSync(path.join(__dirname, '..', 'packages/core-engine/projection/index.ts'));
});

check('ProjectionBuilder interface exported', () => {
  const content = readFile('packages/core-engine/projection/index.ts');
  return content.includes('export interface ProjectionBuilder');
});

check('ProjectionBuilder.handleEvent() signature defined', () => {
  const content = readFile('packages/core-engine/projection/index.ts');
  return content.includes('handleEvent(event: DomainEvent): Promise<void>');
});

check('ProjectionBuilder.rebuild() signature defined (optional)', () => {
  const content = readFile('packages/core-engine/projection/index.ts');
  return content.includes('rebuild?(aggregateId: string, events: DomainEvent[]): Promise<void>');
});

check('DomainEvent interface defined for projection layer', () => {
  const content = readFile('packages/core-engine/projection/index.ts');
  return content.includes('export interface DomainEvent') &&
         content.includes('readonly eventType: string');
});

check('ProjectionBuilder has comprehensive JSDoc', () => {
  const content = readFile('packages/core-engine/projection/index.ts');
  return content.includes('@example') && content.includes('Projection builders transform');
});

// ==========================================
// WorkspaceProjectionBuilder Implementation
// ==========================================

console.log(`\n${colors.bold}WorkspaceProjectionBuilder Implementation:${colors.reset}`);

check('File exists: WorkspaceProjectionBuilder.ts', () => {
  return fs.existsSync(path.join(__dirname, '..', 'packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts'));
});

check('WorkspaceProjectionBuilder class exported', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('export class WorkspaceProjectionBuilder');
});

check('Implements ProjectionBuilder interface', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('implements ProjectionBuilder');
});

check('Constructor requires Firestore dependency', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('constructor(private readonly db: Firestore)');
});

check('Constructor validates Firestore dependency', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('if (!db)') && content.includes('throw new Error');
});

check('handleEvent() method dispatches to event handlers', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('switch (event.eventType)') &&
         content.includes('case \'WorkspaceCreated\'') &&
         content.includes('case \'WorkspaceArchived\'');
});

check('handleWorkspaceCreated() private method exists', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('private async handleWorkspaceCreated');
});

check('handleWorkspaceArchived() private method exists', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('private async handleWorkspaceArchived');
});

check('rebuild() method exists and sorts events', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('async rebuild(') &&
         content.includes('sort') &&
         content.includes('timestamp');
});

// ==========================================
// Projection Schema
// ==========================================

console.log(`\n${colors.bold}Projection Schema:${colors.reset}`);

check('WorkspaceProjectionSchema interface defined', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('export interface WorkspaceProjectionSchema');
});

check('Schema includes id field', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('id: string');
});

check('Schema includes ownerId (accountId) field', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('ownerId: string');
});

check('Schema includes status field with valid types', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('status:') &&
         content.includes('initializing') &&
         content.includes('ready') &&
         content.includes('archived');
});

check('Schema includes createdAt timestamp', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('createdAt: string');
});

check('Schema includes optional archivedAt timestamp', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('archivedAt?: string');
});

check('Schema includes version for conflict detection', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('version: number');
});

check('Schema includes lastEventAt for tracking', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('lastEventAt: string');
});

// ==========================================
// Event Handling Logic
// ==========================================

console.log(`\n${colors.bold}Event Handling Logic:${colors.reset}`);

check('WorkspaceCreated creates projection with correct path', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('projections/workspace') &&
         content.includes('event.aggregateId');
});

check('WorkspaceCreated validates aggregateId', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('!event.aggregateId') &&
         content.includes('Missing aggregateId');
});

check('WorkspaceCreated validates accountId in data', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('!event.data?.accountId') &&
         content.includes('Missing accountId');
});

check('WorkspaceCreated validates status in data', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('!event.data?.status') &&
         content.includes('Missing status');
});

check('WorkspaceCreated builds projection with version 1', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('version: 1');
});

check('WorkspaceArchived updates status to archived', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('status: \'archived\'');
});

check('WorkspaceArchived sets archivedAt timestamp', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('archivedAt: event.metadata.timestamp');
});

// ==========================================
// Idempotency
// ==========================================

console.log(`\n${colors.bold}Idempotency:${colors.reset}`);

check('WorkspaceCreated uses merge:true for idempotency', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('{ merge: true }') &&
         content.includes('handleWorkspaceCreated');
});

check('WorkspaceArchived uses merge:true for idempotency', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('{ merge: true }') &&
         content.includes('handleWorkspaceArchived');
});

check('Documentation mentions idempotency', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('idempotent') || content.includes('Idempotency');
});

// ==========================================
// Firestore Integration
// ==========================================

console.log(`\n${colors.bold}Firestore Integration:${colors.reset}`);

check('Imports Firestore SDK correctly', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('import { Firestore, doc, setDoc } from \'firebase/firestore\'');
});

check('Uses doc() to reference projection documents', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('doc(this.db,');
});

check('Uses setDoc() for Firestore writes', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('setDoc(');
});

check('Handles Firestore errors with try-catch', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('try {') &&
         content.includes('catch (error)') &&
         content.includes('throw error');
});

check('Logs Firestore errors with context', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('console.error') &&
         content.includes('[WorkspaceProjectionBuilder]');
});

// ==========================================
// Test Coverage
// ==========================================

console.log(`\n${colors.bold}Test Coverage:${colors.reset}`);

check('File exists: WorkspaceProjectionBuilder.spec.ts', () => {
  return fs.existsSync(path.join(__dirname, '..', 'packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts'));
});

check('Test suite describes WorkspaceProjectionBuilder', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('describe(\'WorkspaceProjectionBuilder\'');
});

check('Tests constructor validation', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('describe(\'constructor\'') &&
         content.includes('NullFirestore_ThrowsError');
});

check('Tests handleEvent dispatching', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('describe(\'handleEvent') &&
         content.includes('WorkspaceCreatedEvent_CallsHandleWorkspaceCreated') &&
         content.includes('WorkspaceArchivedEvent_CallsHandleWorkspaceArchived');
});

check('Tests handleWorkspaceCreated projection creation', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('describe(\'handleWorkspaceCreated') &&
         content.includes('ValidEvent_CreatesProjection');
});

check('Tests handleWorkspaceArchived projection update', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('describe(\'handleWorkspaceArchived') &&
         content.includes('ValidEvent_UpdatesProjection');
});

check('Tests idempotency of projection updates', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('describe(\'Idempotency\'') &&
         content.includes('SameEventTwice_ProducesSameProjection');
});

check('Tests rebuild() with event sorting', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('describe(\'rebuild') &&
         content.includes('UnorderedEvents_SortsBeforeReplay');
});

check('Tests Firestore integration', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('describe(\'Firestore Integration\'') &&
         content.includes('UsesCorrectCollectionPath');
});

check('Tests error handling for missing fields', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('MissingAggregateId_LogsError') &&
         content.includes('MissingAccountId_LogsError') &&
         content.includes('MissingStatus_LogsError');
});

check('Tests unknown event type handling', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  return content.includes('UnknownEventType_IgnoresEvent');
});

check('Test count >= 30 test cases', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.spec.ts');
  const testCount = (content.match(/it\(/g) || []).length;
  return testCount >= 30;
});

// ==========================================
// Documentation Quality
// ==========================================

console.log(`\n${colors.bold}Documentation Quality:${colors.reset}`);

check('WorkspaceProjectionBuilder has class-level JSDoc', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('/**') &&
         content.includes('Workspace Projection Builder') &&
         content.includes('@example');
});

check('Event handler methods have JSDoc comments', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('Handle WorkspaceCreated event') &&
         content.includes('Handle WorkspaceArchived event');
});

check('Architecture patterns documented in comments', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('Architecture:') &&
         content.includes('Multi-Tenant Isolation:') &&
         content.includes('Idempotency:');
});

check('Projection schema purpose documented', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.includes('Path: projections/workspace') &&
         content.includes('Purpose: Query-optimized');
});

check('File ends with END OF FILE marker', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return content.trim().endsWith('// END OF FILE');
});

// ==========================================
// Architecture Compliance
// ==========================================

console.log(`\n${colors.bold}Architecture Compliance:${colors.reset}`);

check('No Angular dependencies in projection builder', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return !content.includes('@angular') && !content.includes('rxjs');
});

check('No Repository imports in projection builder', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  return !content.includes('Repository') || content.includes('// Not importing Repository');
});

check('No business logic in projection builder', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  // Should only contain simple data transformation, no complex business rules
  return !content.includes('calculate') &&
         !content.includes('validate') &&
         !content.includes('authorize');
});

check('Projection builder only writes to Firestore', () => {
  const content = readFile('packages/platform-adapters/firestore/projections/account/WorkspaceProjectionBuilder.ts');
  // Should not return data, only write projections
  return !content.includes('return projection') &&
         content.includes('Promise<void>');
});

// ==========================================
// Summary
// ==========================================

console.log(`\n${colors.bold}${colors.blue}Validation Summary:${colors.reset}`);
console.log(`Total Checks: ${results.total}`);
console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%\n`);

if (results.failed > 0) {
  console.log(`${colors.red}${colors.bold}Validation Failed${colors.reset}`);
  process.exit(1);
} else {
  console.log(`${colors.green}${colors.bold}✓ All Validations Passed${colors.reset}`);
  process.exit(0);
}

// END OF FILE
