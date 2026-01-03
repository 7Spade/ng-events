/**
 * Phase 1F Validation Script - Part 1
 * 
 * Validates Angular Services Layer Implementation (Command/Query/Store)
 * 
 * Checks:
 * - WorkspaceQueryService implementation
 * - WorkspaceCommandService implementation  
 * - WorkspaceStoreService implementation
 * - CQRS separation compliance
 * - Test coverage
 * 
 * Total Checks: 60+ automated validations
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
  cyan: '\x1b[36m'
};

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function checkPassed(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
  totalChecks++;
  passedChecks++;
}

function checkFailed(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
  totalChecks++;
  failedChecks++;
}

function section(title) {
  console.log(`\n${colors.cyan}${title}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    checkPassed(`${description} exists`);
    return true;
  } else {
    checkFailed(`${description} missing: ${filePath}`);
    return false;
  }
}

function checkFileContains(filePath, pattern, description) {
  if (!fs.existsSync(filePath)) {
    checkFailed(`Cannot check ${description} - file missing`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = new RegExp(pattern, 's');

  if (regex.test(content)) {
    checkPassed(description);
    return true;
  } else {
    checkFailed(description);
    return false;
  }
}

// Part 1: WorkspaceQueryService Validation
section('='.repeat(80));
section('Phase 1F: Angular Services Layer - Part 1 (Query Service)');
section('='.repeat(80));

const queryServicePath = 'packages/ui-angular/src/app/core/services/queries/workspace-query.service.ts';
const queryServiceTestPath = 'packages/ui-angular/src/app/core/services/queries/workspace-query.service.spec.ts';

section('WorkspaceQueryService Implementation');
if (checkFileExists(queryServicePath, 'WorkspaceQueryService')) {
  // Check Injectable decorator
  checkFileContains(
    queryServicePath,
    /@Injectable.*providedIn.*root/,
    'Service uses @Injectable with providedIn: root'
  );

  // Check Firestore import
  checkFileContains(
    queryServicePath,
    /import.*Firestore.*from.*@angular\/fire\/firestore/,
    'Imports Firestore from @angular/fire/firestore'
  );

  // Check projection schema export
  checkFileContains(
    queryServicePath,
    /export interface WorkspaceProjectionSchema/,
    'Exports WorkspaceProjectionSchema interface'
  );

  // Check schema fields
  checkFileContains(
    queryServicePath,
    /id:\s*string/,
    'Schema includes id field'
  );

  checkFileContains(
    queryServicePath,
    /ownerId:\s*string/,
    'Schema includes ownerId field (multi-tenant)'
  );

  checkFileContains(
    queryServicePath,
    /status:.*initializing.*ready.*restricted.*archived/,
    'Schema includes status union type'
  );

  checkFileContains(
    queryServicePath,
    /version:\s*number/,
    'Schema includes version field'
  );

  // Check collection path
  checkFileContains(
    queryServicePath,
    /projections\/workspace/,
    'Uses correct projection path: projections/workspace'
  );

  // Check methods
  checkFileContains(
    queryServicePath,
    /async getWorkspaceById.*Promise.*WorkspaceProjectionSchema.*null/,
    'Implements getWorkspaceById method'
  );

  checkFileContains(
    queryServicePath,
    /async getWorkspacesByOwnerId.*Promise.*WorkspaceProjectionSchema\[\]/,
    'Implements getWorkspacesByOwnerId method'
  );

  checkFileContains(
    queryServicePath,
    /async getWorkspacesByStatus.*Promise.*WorkspaceProjectionSchema\[\]/,
    'Implements getWorkspacesByStatus method'
  );

  checkFileContains(
    queryServicePath,
    /async getWorkspacesByOwnerIdAndStatus/,
    'Implements getWorkspacesByOwnerIdAndStatus method'
  );

  checkFileContains(
    queryServicePath,
    /async getReadyWorkspacesByOwnerId/,
    'Implements getReadyWorkspacesByOwnerId method'
  );

  checkFileContains(
    queryServicePath,
    /async getWorkspaceCountByOwnerId/,
    'Implements getWorkspaceCountByOwnerId method'
  );

  checkFileContains(
    queryServicePath,
    /async workspaceExists/,
    'Implements workspaceExists method'
  );

  // Check Firestore operations
  checkFileContains(
    queryServicePath,
    /getDoc/,
    'Uses Firestore getDoc for single document retrieval'
  );

  checkFileContains(
    queryServicePath,
    /getDocs/,
    'Uses Firestore getDocs for query results'
  );

  checkFileContains(
    queryServicePath,
    /getCountFromServer/,
    'Uses getCountFromServer for count queries'
  );

  // Check multi-tenant filtering
  checkFileContains(
    queryServicePath,
    /where.*ownerId.*==/,
    'Applies ownerId filter for multi-tenant isolation'
  );

  // Check error handling
  checkFileContains(
    queryServicePath,
    /try.*catch/,
    'Implements try-catch error handling'
  );

  checkFileContains(
    queryServicePath,
    /console\.error/,
    'Logs errors with console.error'
  );

  // Check NO Repository dependency (CQRS separation)
  const content = fs.readFileSync(queryServicePath, 'utf-8');
  const hasRepoImport = /import.*Repository|from.*Repository|: Repository|new Repository/.test(content);
  
  if (!hasRepoImport) {
    checkPassed('NO Repository dependency (CQRS compliance)');
  } else {
    checkFailed('Has Repository dependency (CQRS violation)');
  }

  // Check END OF FILE marker
  checkFileContains(
    queryServicePath,
    /\/\/ END OF FILE/,
    'File ends with END OF FILE marker'
  );
}

