#!/usr/bin/env node

/**
 * Phase 1C Validation Script
 *
 * Validates WorkspaceCreated and WorkspaceArchived event implementations
 * with serialization support (toData/fromData).
 *
 * Success Criteria:
 * - Event classes exist with create(), toData(), fromData()
 * - Type exports preserved for backward compatibility
 * - Event versioning implemented
 * - Comprehensive test coverage
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(description, condition) {
  totalChecks++;
  const status = condition ? `${GREEN}✅${RESET}` : `${RED}❌${RESET}`;
  const result = condition ? 'PASS' : 'FAIL';

  console.log(`  ${status} ${description} - ${result}`);

  if (condition) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  return condition;
}

function section(title) {
  console.log(`\n${CYAN}━━━ ${title} ━━━${RESET}`);
}

function summary() {
  console.log(`\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`${YELLOW}Phase 1C Validation Summary${RESET}`);
  console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Passed: ${GREEN}${passedChecks} ✅${RESET}`);
  console.log(`Failed: ${RED}${failedChecks} ❌${RESET}`);
  console.log(`Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
  console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

  if (failedChecks === 0) {
    console.log(`${GREEN}✅ Phase 1C: VALIDATION PASSED${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}❌ Phase 1C: VALIDATION FAILED${RESET}\n`);
    process.exit(1);
  }
}

// File paths
const basePath = path.join(__dirname, '..');
const workspaceEventsPath = path.join(basePath, 'packages/account-domain/workspace/events');

const workspaceCreatedPath = path.join(workspaceEventsPath, 'WorkspaceCreated.ts');
const workspaceArchivedPath = path.join(workspaceEventsPath, 'WorkspaceArchived.ts');
const workspaceCreatedSpecPath = path.join(workspaceEventsPath, 'WorkspaceCreated.spec.ts');
const workspaceArchivedSpecPath = path.join(workspaceEventsPath, 'WorkspaceArchived.spec.ts');

console.log(`${YELLOW}Phase 1C: Workspace Events with Serialization Validation${RESET}`);
console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);

// ========================================
// WorkspaceCreated Event Implementation
// ========================================
section('WorkspaceCreated.ts - Event Implementation');

let workspaceCreatedContent = '';
try {
  workspaceCreatedContent = fs.readFileSync(workspaceCreatedPath, 'utf8');
} catch (e) {
  check('WorkspaceCreated.ts file exists', false);
}

if (workspaceCreatedContent) {
  check('WorkspaceCreated.ts file exists', true);

  // Type export preserved
  check(
    'WorkspaceCreated type export exists',
    /export type WorkspaceCreated\s*=/.test(workspaceCreatedContent)
  );

  check(
    'WorkspaceCreatedPayload interface exists',
    /export interface WorkspaceCreatedPayload/.test(workspaceCreatedContent)
  );

  // Class implementation
  check(
    'WorkspaceCreatedEvent class exists',
    /export class WorkspaceCreatedEvent/.test(workspaceCreatedContent)
  );

  check(
    'WorkspaceCreatedEvent has create() factory method',
    /static create\(/.test(workspaceCreatedContent)
  );

  check(
    'WorkspaceCreatedEvent has fromData() deserialization',
    /static fromData\(.*WorkspaceCreatedData/.test(workspaceCreatedContent)
  );

  check(
    'WorkspaceCreatedEvent has toData() serialization',
    /toData\(\):\s*WorkspaceCreatedData/.test(workspaceCreatedContent)
  );

  check(
    'WorkspaceCreatedEvent has getEvent() accessor',
    /getEvent\(\):\s*WorkspaceCreated/.test(workspaceCreatedContent)
  );

  check(
    'WorkspaceCreatedEvent has getVersion() static method',
    /static getVersion\(\):\s*number/.test(workspaceCreatedContent)
  );

  check(
    'WorkspaceCreatedEvent has equals() method',
    /equals\(.*WorkspaceCreatedEvent/.test(workspaceCreatedContent)
  );

  // Event versioning
  check(
    'Event version constant exists',
    /const WORKSPACE_CREATED_VERSION\s*=\s*1/.test(workspaceCreatedContent)
  );

  // Serialization interface
  check(
    'WorkspaceCreatedData interface exists',
    /export interface WorkspaceCreatedData/.test(workspaceCreatedContent)
  );

  // Validation
  check(
    'Validates event id',
    /Event id is required/.test(workspaceCreatedContent)
  );

  check(
    'Validates causality metadata',
    /Causality metadata causedBy is required/.test(workspaceCreatedContent)
  );
}

// ========================================
// WorkspaceArchived Event Implementation
// ========================================
section('WorkspaceArchived.ts - Event Implementation');

let workspaceArchivedContent = '';
try {
  workspaceArchivedContent = fs.readFileSync(workspaceArchivedPath, 'utf8');
} catch (e) {
  check('WorkspaceArchived.ts file exists', false);
}

if (workspaceArchivedContent) {
  check('WorkspaceArchived.ts file exists', true);

  // Type export preserved
  check(
    'WorkspaceArchived type export exists',
    /export type WorkspaceArchived\s*=/.test(workspaceArchivedContent)
  );

  check(
    'WorkspaceArchivedPayload interface exists',
    /export interface WorkspaceArchivedPayload/.test(workspaceArchivedContent)
  );

  // Class implementation
  check(
    'WorkspaceArchivedEvent class exists',
    /export class WorkspaceArchivedEvent/.test(workspaceArchivedContent)
  );

  check(
    'WorkspaceArchivedEvent has create() factory method',
    /static create\(/.test(workspaceArchivedContent)
  );

  check(
    'WorkspaceArchivedEvent has fromData() deserialization',
    /static fromData\(.*WorkspaceArchivedData/.test(workspaceArchivedContent)
  );

  check(
    'WorkspaceArchivedEvent has toData() serialization',
    /toData\(\):\s*WorkspaceArchivedData/.test(workspaceArchivedContent)
  );

  check(
    'WorkspaceArchivedEvent has getEvent() accessor',
    /getEvent\(\):\s*WorkspaceArchived/.test(workspaceArchivedContent)
  );

  check(
    'WorkspaceArchivedEvent has getVersion() static method',
    /static getVersion\(\):\s*number/.test(workspaceArchivedContent)
  );

  check(
    'WorkspaceArchivedEvent has equals() method',
    /equals\(.*WorkspaceArchivedEvent/.test(workspaceArchivedContent)
  );

  // Event versioning
  check(
    'Event version constant exists',
    /const WORKSPACE_ARCHIVED_VERSION\s*=\s*1/.test(workspaceArchivedContent)
  );

  // Serialization interface
  check(
    'WorkspaceArchivedData interface exists',
    /export interface WorkspaceArchivedData/.test(workspaceArchivedContent)
  );

  // Validation
  check(
    'Validates previous status',
    /Previous status is required in payload/.test(workspaceArchivedContent)
  );

  check(
    'Validates causality metadata',
    /Causality metadata causedBy is required/.test(workspaceArchivedContent)
  );
}

// ========================================
// WorkspaceCreated Test Suite
// ========================================
section('WorkspaceCreated.spec.ts - Test Coverage');

let workspaceCreatedSpecContent = '';
try {
  workspaceCreatedSpecContent = fs.readFileSync(workspaceCreatedSpecPath, 'utf8');
} catch (e) {
  check('WorkspaceCreated.spec.ts file exists', false);
}

if (workspaceCreatedSpecContent) {
  check('WorkspaceCreated.spec.ts file exists', true);

  check(
    'Tests create() factory method',
    /describe\(['"]create\(\)/.test(workspaceCreatedSpecContent)
  );

  check(
    'Tests toData() serialization',
    /describe\(['"]toData\(\)/.test(workspaceCreatedSpecContent)
  );

  check(
    'Tests fromData() deserialization',
    /describe\(['"]fromData\(\)/.test(workspaceCreatedSpecContent)
  );

  check(
    'Tests round-trip serialization',
    /describe\(['"]Round-trip serialization/.test(workspaceCreatedSpecContent)
  );

  check(
    'Tests equals() method',
    /describe\(['"]equals\(\)/.test(workspaceCreatedSpecContent)
  );

  check(
    'Tests getVersion() method',
    /describe\(['"]getVersion\(\)/.test(workspaceCreatedSpecContent)
  );

  check(
    'Tests validation errors',
    /toThrow/.test(workspaceCreatedSpecContent) &&
    /Event id is required/.test(workspaceCreatedSpecContent)
  );
}

// ========================================
// WorkspaceArchived Test Suite
// ========================================
section('WorkspaceArchived.spec.ts - Test Coverage');

let workspaceArchivedSpecContent = '';
try {
  workspaceArchivedSpecContent = fs.readFileSync(workspaceArchivedSpecPath, 'utf8');
} catch (e) {
  check('WorkspaceArchived.spec.ts file exists', false);
}

if (workspaceArchivedSpecContent) {
  check('WorkspaceArchived.spec.ts file exists', true);

  check(
    'Tests create() factory method',
    /describe\(['"]create\(\)/.test(workspaceArchivedSpecContent)
  );

  check(
    'Tests toData() serialization',
    /describe\(['"]toData\(\)/.test(workspaceArchivedSpecContent)
  );

  check(
    'Tests fromData() deserialization',
    /describe\(['"]fromData\(\)/.test(workspaceArchivedSpecContent)
  );

  check(
    'Tests round-trip serialization',
    /describe\(['"]Round-trip serialization/.test(workspaceArchivedSpecContent)
  );

  check(
    'Tests equals() method',
    /describe\(['"]equals\(\)/.test(workspaceArchivedSpecContent)
  );

  check(
    'Tests getVersion() method',
    /describe\(['"]getVersion\(\)/.test(workspaceArchivedSpecContent)
  );

  check(
    'Tests validation errors',
    /toThrow/.test(workspaceArchivedSpecContent) &&
    (/Previous status is required/.test(workspaceArchivedSpecContent) ||
     /Invalid previous status/.test(workspaceArchivedSpecContent))
  );
}

// Final summary
summary();

// END OF FILE
