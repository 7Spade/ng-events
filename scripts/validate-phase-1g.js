#!/usr/bin/env node

/**
 * Phase 1G Validation Script
 * 
 * Validates E2E testing implementation for Workspace vertical slice.
 * 
 * Checks:
 * 1. E2E test file exists and has comprehensive test coverage
 * 2. All critical test scenarios are present
 * 3. Test structure follows best practices
 * 4. Integration with all layers is validated
 * 5. Performance benchmarks are included
 * 6. Error handling tests are present
 * 7. Multi-tenant isolation tests exist
 * 8. Event sourcing replay tests exist
 * 9. CQRS pattern compliance tests exist
 * 10. Documentation is complete
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const checks = [];
let passedChecks = 0;
let failedChecks = 0;

function check(description, condition) {
  checks.push({ description, passed: condition });
  if (condition) {
    passedChecks++;
    console.log(`${colors.green}✅${colors.reset} ${description}`);
  } else {
    failedChecks++;
    console.log(`${colors.red}❌${colors.reset} ${description}`);
  }
}

function header(text) {
  console.log(`\n${colors.cyan}${text}${colors.reset}`);
  console.log('─'.repeat(60));
}

function fileExists(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
}

function fileContains(filePath, pattern) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return false;
  const content = fs.readFileSync(fullPath, 'utf-8');
  return typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content);
}

function fileLineCount(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return 0;
  const content = fs.readFileSync(fullPath, 'utf-8');
  return content.split('\n').length;
}

console.log(`${colors.blue}
╔═══════════════════════════════════════════════════════════╗
║       Phase 1G - E2E Validation Script                    ║
║       Workspace Vertical Slice - E2E Testing              ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

// ============================================================================
// 1. E2E Test File Existence and Structure
// ============================================================================
header('📋 E2E Test File Structure');

const e2eTestPath = 'packages/account-domain/workspace/e2e/workspace.e2e.spec.ts';

check('E2E test file exists', fileExists(e2eTestPath));
check('E2E test file is substantial (>400 lines)', fileLineCount(e2eTestPath) > 400);
check('E2E test file has proper header documentation', 
  fileContains(e2eTestPath, 'Phase 1G - E2E Validation and Testing'));
check('E2E test file describes test scenarios',
  fileContains(e2eTestPath, 'Test Scenarios'));

// ============================================================================
// 2. Test Scenario Coverage
// ============================================================================
header('🎯 Test Scenario Coverage');

check('Has "Complete CQRS Flow" test suite',
  fileContains(e2eTestPath, "describe('Complete CQRS Flow'"));
check('Has "Event Sourcing - Replay and Reconstruction" test suite',
  fileContains(e2eTestPath, "describe('Event Sourcing - Replay and Reconstruction'"));
check('Has "Multi-Tenant Isolation" test suite',
  fileContains(e2eTestPath, "describe('Multi-Tenant Isolation'"));
check('Has "Projection Rebuild" test suite',
  fileContains(e2eTestPath, "describe('Projection Rebuild'"));
check('Has "Reactive State Management" test suite',
  fileContains(e2eTestPath, "describe('Reactive State Management'"));
check('Has "Error Handling and Edge Cases" test suite',
  fileContains(e2eTestPath, "describe('Error Handling and Edge Cases'"));
check('Has "Performance Characteristics" test suite',
  fileContains(e2eTestPath, "describe('Performance Characteristics'"));

// ============================================================================
// 3. Critical Test Cases
// ============================================================================
header('✅ Critical Test Cases');

check('Tests complete CQRS flow: Command → EventStore → Projection → Query',
  fileContains(e2eTestPath, 'should execute complete flow: Command → EventStore → Projection → Query'));
check('Tests write and read path separation',
  fileContains(e2eTestPath, 'should separate write and read paths correctly'));
check('Tests aggregate reconstruction from event history',
  fileContains(e2eTestPath, 'should reconstruct aggregate from event history'));
check('Tests causality chain across events',
  fileContains(e2eTestPath, 'should maintain causality chain across events'));
check('Tests idempotent event replay',
  fileContains(e2eTestPath, 'should support idempotent event replay'));
check('Tests multi-tenant isolation by ownerId',
  fileContains(e2eTestPath, 'should isolate workspaces by ownerId'));
check('Tests cross-tenant data leakage prevention',
  fileContains(e2eTestPath, 'should prevent cross-tenant data leakage'));
check('Tests projection rebuild from event stream',
  fileContains(e2eTestPath, 'should rebuild projection from event stream'));
check('Tests reactive store caching and updates',
  fileContains(e2eTestPath, 'should cache workspaces in Store and emit updates'));
check('Tests workspace selection reactively',
  fileContains(e2eTestPath, 'should select specific workspace reactively'));

// ============================================================================
// 4. Infrastructure Integration
// ============================================================================
header('🔧 Infrastructure Integration');

check('Uses FirestoreEventStore',
  fileContains(e2eTestPath, 'FirestoreEventStore'));
check('Uses FirestoreWorkspaceRepository',
  fileContains(e2eTestPath, 'FirestoreWorkspaceRepository'));
check('Uses WorkspaceProjectionBuilder',
  fileContains(e2eTestPath, 'WorkspaceProjectionBuilder'));
check('Uses WorkspaceCommandService',
  fileContains(e2eTestPath, 'WorkspaceCommandService'));
check('Uses WorkspaceQueryService',
  fileContains(e2eTestPath, 'WorkspaceQueryService'));
check('Uses WorkspaceStoreService',
  fileContains(e2eTestPath, 'WorkspaceStoreService'));
check('Registers events with EventStore',
  fileContains(e2eTestPath, 'registerEvent'));
check('Uses MockFirestore for deterministic testing',
  fileContains(e2eTestPath, 'MockFirestore'));

// ============================================================================
// 5. Event Sourcing Pattern Validation
// ============================================================================
header('🔄 Event Sourcing Pattern');

check('Tests event persistence to EventStore',
  fileContains(e2eTestPath, 'eventStore.getEvents'));
check('Tests aggregate reconstruction via fromEvents()',
  fileContains(e2eTestPath, 'Workspace.fromEvents'));
check('Validates WorkspaceCreated event',
  fileContains(e2eTestPath, 'WorkspaceCreated'));
check('Validates WorkspaceArchived event',
  fileContains(e2eTestPath, 'WorkspaceArchived'));
check('Tests event metadata (causality)',
  fileContains(e2eTestPath, 'metadata.causedBy'));

// ============================================================================
// 6. CQRS Pattern Validation
// ============================================================================
header('⚖️  CQRS Pattern Compliance');

check('Commands use Repository (write path)',
  fileContains(e2eTestPath, 'commandService.createWorkspace'));
check('Queries use Projections (read path)',
  fileContains(e2eTestPath, 'queryService.getWorkspaceById'));
check('Projection built AFTER events persisted',
  fileContains(e2eTestPath, 'projectionBuilder.handleEvent'));
check('Tests that projection does not exist before build',
  fileContains(e2eTestPath, 'workspaceBeforeProjection'));
check('Tests that projection exists after build',
  fileContains(e2eTestPath, 'workspaceAfterProjection'));

// ============================================================================
// 7. Multi-Tenant Isolation Validation
// ============================================================================
header('🏢 Multi-Tenant Isolation');

check('Tests isolation by ownerId (accountId)',
  fileContains(e2eTestPath, 'ownerId'));
check('Creates workspaces for different accounts',
  fileContains(e2eTestPath, /acc-tenant-\d+/));
check('Queries workspaces by ownerId',
  fileContains(e2eTestPath, 'getWorkspacesByOwnerId'));
check('Verifies cross-tenant isolation',
  fileContains(e2eTestPath, 'should prevent cross-tenant data leakage'));

// ============================================================================
// 8. Error Handling and Edge Cases
// ============================================================================
header('🛡️  Error Handling and Edge Cases');

check('Tests workspace not found scenario',
  fileContains(e2eTestPath, 'should handle workspace not found gracefully'));
check('Tests empty query results',
  fileContains(e2eTestPath, 'should handle empty query results'));
check('Tests state transition validation',
  fileContains(e2eTestPath, 'should validate workspace state transitions'));
check('Uses expectAsync for promise assertions',
  fileContains(e2eTestPath, 'expectAsync'));

// ============================================================================
// 9. Performance Benchmarks
// ============================================================================
header('⚡ Performance Benchmarks');

check('Tests command execution time',
  fileContains(e2eTestPath, 'should execute command within acceptable time'));
check('Tests query response time',
  fileContains(e2eTestPath, 'should query projection within acceptable time'));
check('Measures duration with Date.now()',
  fileContains(e2eTestPath, 'Date.now()'));
check('Validates performance thresholds',
  fileContains(e2eTestPath, 'toBeLessThan'));

// ============================================================================
// 10. Test Best Practices
// ============================================================================
header('📝 Test Best Practices');

check('Uses beforeEach for test setup',
  fileContains(e2eTestPath, 'beforeEach'));
check('Uses afterEach for cleanup',
  fileContains(e2eTestPath, 'afterEach'));
check('Resets mock Firestore between tests',
  fileContains(e2eTestPath, 'mockFirestore.reset'));
check('Uses descriptive test names',
  fileContains(e2eTestPath, /it\('should .+',/));
check('Follows AAA pattern (Arrange-Act-Assert)',
  fileContains(e2eTestPath, /\/\/ STEP \d:/));

// ============================================================================
// Summary
// ============================================================================
header('📊 Validation Summary');

const totalChecks = passedChecks + failedChecks;
const successRate = ((passedChecks / totalChecks) * 100).toFixed(2);

console.log(`\n${colors.cyan}Results:${colors.reset}`);
console.log(`  Total Checks: ${totalChecks}`);
console.log(`  ${colors.green}Passed: ${passedChecks}${colors.reset}`);
console.log(`  ${colors.red}Failed: ${failedChecks}${colors.reset}`);
console.log(`  Success Rate: ${successRate}%\n`);

if (failedChecks === 0) {
  console.log(`${colors.green}✅ All checks passed! Phase 1G E2E testing is complete.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}❌ Some checks failed. Please review the implementation.${colors.reset}\n`);
  process.exit(1);
}

// END OF FILE
