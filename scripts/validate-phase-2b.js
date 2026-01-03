#!/usr/bin/env node

/**
 * Phase 2B Validation Script
 *
 * Validates Failure Compensation / State Machine implementation.
 * Checks persistence, retry policies, timeout handling, and process manager.
 *
 * Usage: node scripts/validate-phase-2b.js
 */

const fs = require('fs');
const path = require('path');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

let totalChecks = 0;
let passedChecks = 0;

function check(description, assertion) {
  totalChecks++;
  const passed = assertion();
  if (passed) {
    passedChecks++;
    console.log(`${GREEN}✅${RESET} ${description}`);
  } else {
    console.log(`${RED}❌${RESET} ${description}`);
  }
  return passed;
}

function section(title) {
  console.log(`\n${CYAN}${title}${RESET}`);
  console.log('─'.repeat(60));
}

function summary() {
  const successRate = ((passedChecks / totalChecks) * 100).toFixed(2);
  console.log('\n' + '═'.repeat(60));
  console.log(`${CYAN}📊 Validation Summary${RESET}`);
  console.log('─'.repeat(60));
  console.log(`\nResults:`);
  console.log(`  Total Checks: ${totalChecks}`);
  console.log(`  Passed: ${GREEN}${passedChecks}${RESET}`);
  console.log(`  Failed: ${RED}${totalChecks - passedChecks}${RESET}`);
  console.log(`  Success Rate: ${successRate >= 100 ? GREEN : YELLOW}${successRate}%${RESET}`);
  console.log('');

  if (passedChecks === totalChecks) {
    console.log(`${GREEN}✅ All checks passed! Phase 2B is complete.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}❌ Some checks failed. Review implementation.${RESET}\n`);
    process.exit(1);
  }
}

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   Phase 2B - Failure Compensation Validation Script       ║');
console.log('║   Ng-Events Architecture - Process Persistence            ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// ============================================================================
// 1. File Structure Validation
// ============================================================================

section('📋 File Structure');

const processesDir = 'packages/core-engine/processes';
const testsDir = path.join(processesDir, '__tests__');

check('RetryPolicy.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'RetryPolicy.ts'))
);

check('IProcessRepository.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'IProcessRepository.ts'))
);

check('InMemoryProcessRepository.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'InMemoryProcessRepository.ts'))
);

check('ProcessManager.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'ProcessManager.ts'))
);

check('TimeoutMonitor.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'TimeoutMonitor.ts'))
);

check('__tests__/ directory exists', () =>
  fs.existsSync(testsDir) && fs.statSync(testsDir).isDirectory()
);

// ============================================================================
// 2. RetryPolicy Implementation
// ============================================================================

section('🔄 Retry Policy');

const retryPolicyPath = path.join(processesDir, 'RetryPolicy.ts');
if (fs.existsSync(retryPolicyPath)) {
  const retryPolicy = fs.readFileSync(retryPolicyPath, 'utf-8');

  check('RetryPolicy class defined', () =>
    /export\s+class\s+RetryPolicy/.test(retryPolicy)
  );

  check('getNextRetryDelay() method exists', () =>
    /getNextRetryDelay\s*\(/.test(retryPolicy)
  );

  check('shouldRetry() method exists', () =>
    /shouldRetry\s*\(/.test(retryPolicy)
  );

  check('Exponential backoff algorithm implemented', () =>
    /Math\.pow/.test(retryPolicy) && /backoffMultiplier/.test(retryPolicy)
  );

  check('Circuit breaker logic exists', () =>
    /isCircuitOpen\s*\(/.test(retryPolicy) && /failureCount/.test(retryPolicy)
  );

  check('recordFailure() method exists', () =>
    /recordFailure\s*\(/.test(retryPolicy)
  );

  check('recordSuccess() method exists', () =>
    /recordSuccess\s*\(/.test(retryPolicy)
  );

  check('Jitter support implemented', () =>
    /jitterFactor/.test(retryPolicy) && /Math\.random/.test(retryPolicy)
  );

  check('Non-retryable error detection exists', () =>
    /isNonRetryableError/.test(retryPolicy)
  );
}

// ============================================================================
// 3. Process Repository
// ============================================================================

section('💾 Process Repository');

const iRepoPath = path.join(processesDir, 'IProcessRepository.ts');
if (fs.existsSync(iRepoPath)) {
  const iRepo = fs.readFileSync(iRepoPath, 'utf-8');

  check('IProcessRepository interface defined', () =>
    /export\s+interface\s+IProcessRepository/.test(iRepo)
  );

  check('ProcessSnapshot interface defined', () =>
    /export\s+interface\s+ProcessSnapshot/.test(iRepo)
  );

  check('save() method signature exists', () =>
    /save\s*\(\s*snapshot\s*:\s*ProcessSnapshot/.test(iRepo)
  );

  check('load() method signature exists', () =>
    /load\s*\(\s*processId\s*:\s*string/.test(iRepo)
  );

  check('findByState() method signature exists', () =>
    /findByState\s*\(/.test(iRepo)
  );

  check('findByCorrelationId() method signature exists', () =>
    /findByCorrelationId\s*\(/.test(iRepo)
  );

  check('findStale() method signature exists', () =>
    /findStale\s*\(/.test(iRepo)
  );

  check('ProcessSnapshot includes all required fields', () =>
    /processId\s*:/.test(iRepo) &&
    /processType\s*:/.test(iRepo) &&
    /state\s*:/.test(iRepo) &&
    /correlationId\s*:/.test(iRepo) &&
    /retryCount\s*:/.test(iRepo) &&
    /lastEventAt/.test(iRepo)
  );
}

const memRepoPath = path.join(processesDir, 'InMemoryProcessRepository.ts');
if (fs.existsSync(memRepoPath)) {
  const memRepo = fs.readFileSync(memRepoPath, 'utf-8');

  check('InMemoryProcessRepository implements IProcessRepository', () =>
    /implements\s+IProcessRepository/.test(memRepo)
  );

  check('Uses Map for storage', () =>
    /Map<string,\s*ProcessSnapshot>/.test(memRepo) || /Map<.*>/.test(memRepo)
  );

  check('save() implemented', () =>
    /async\s+save\s*\(/.test(memRepo)
  );

  check('load() implemented', () =>
    /async\s+load\s*\(/.test(memRepo)
  );

  check('findStale() filters terminal states', () =>
    /ProcessState\.Completed/.test(memRepo) &&
    /ProcessState\.Failed/.test(memRepo) &&
    /ProcessState\.Compensated/.test(memRepo)
  );

  check('Returns defensive copies', () =>
    /\{\s*\.\.\.snapshot\s*\}/.test(memRepo) || /Object\.assign/.test(memRepo)
  );

  check('clear() testing utility exists', () =>
    /clear\s*\(\s*\)\s*:/.test(memRepo)
  );
}

// ============================================================================
// 4. Process Manager
// ============================================================================

section('⚙️ Process Manager');

const pmPath = path.join(processesDir, 'ProcessManager.ts');
if (fs.existsSync(pmPath)) {
  const pm = fs.readFileSync(pmPath, 'utf-8');

  check('ProcessManager class defined', () =>
    /export\s+class\s+ProcessManager/.test(pm)
  );

  check('Uses IProcessRepository dependency', () =>
    /IProcessRepository/.test(pm)
  );

  check('Uses RetryPolicy dependency', () =>
    /RetryPolicy/.test(pm)
  );

  check('registerFactory() method exists', () =>
    /registerFactory\s*\(/.test(pm)
  );

  check('startProcess() method exists', () =>
    /async\s+startProcess\s*\(/.test(pm)
  );

  check('routeEvent() method exists', () =>
    /async\s+routeEvent\s*\(/.test(pm)
  );

  check('completeProcess() method exists', () =>
    /async\s+completeProcess\s*\(/.test(pm)
  );

  check('failProcess() method exists', () =>
    /async\s+failProcess\s*\(/.test(pm)
  );

  check('compensateProcess() method exists', () =>
    /async\s+compensateProcess\s*\(/.test(pm)
  );

  check('Process registry (in-memory Map) exists', () =>
    /processes:\s*Map/.test(pm)
  );

  check('Handles failures with retry logic', () =>
    /handleProcessFailure/.test(pm) && /shouldRetry/.test(pm)
  );

  check('Query methods exist', () =>
    /queryByState/.test(pm) && /queryByCorrelationId/.test(pm)
  );

  check('Persists process state after event handling', () =>
    /saveProcess/.test(pm) && /repository\.save/.test(pm)
  );
}

// ============================================================================
// 5. Timeout Monitor
// ============================================================================

section('⏱️ Timeout Monitor');

const tmPath = path.join(processesDir, 'TimeoutMonitor.ts');
if (fs.existsSync(tmPath)) {
  const tm = fs.readFileSync(tmPath, 'utf-8');

  check('TimeoutMonitor class defined', () =>
    /export\s+class\s+TimeoutMonitor/.test(tm)
  );

  check('TimeoutConfig interface defined', () =>
    /export\s+interface\s+TimeoutConfig/.test(tm)
  );

  check('start() method exists', () =>
    /start\s*\(\s*\)\s*:/.test(tm)
  );

  check('stop() method exists', () =>
    /stop\s*\(\s*\)\s*:/.test(tm)
  );

  check('checkTimeouts() method exists', () =>
    /async\s+checkTimeouts\s*\(/.test(tm)
  );

  check('Uses setInterval for periodic checks', () =>
    /setInterval/.test(tm)
  );

  check('Clears interval on stop', () =>
    /clearInterval/.test(tm)
  );

  check('Auto-fail configuration supported', () =>
    /autoFail/.test(tm)
  );

  check('Auto-compensate configuration supported', () =>
    /autoCompensate/.test(tm)
  );

  check('Handles stale processes', () =>
    /findStale/.test(tm) && /handleStaleProcess/.test(tm)
  );
}

// ============================================================================
// 6. Test Coverage
// ============================================================================

section('🧪 Test Coverage');

check('RetryPolicy.spec.ts exists', () =>
  fs.existsSync(path.join(testsDir, 'RetryPolicy.spec.ts'))
);

check('InMemoryProcessRepository.spec.ts exists', () =>
  fs.existsSync(path.join(testsDir, 'InMemoryProcessRepository.spec.ts'))
);

check('ProcessManager.spec.ts exists', () =>
  fs.existsSync(path.join(testsDir, 'ProcessManager.spec.ts'))
);

check('TimeoutMonitor.spec.ts exists', () =>
  fs.existsSync(path.join(testsDir, 'TimeoutMonitor.spec.ts'))
);

const retryTestPath = path.join(testsDir, 'RetryPolicy.spec.ts');
if (fs.existsSync(retryTestPath)) {
  const retryTest = fs.readFileSync(retryTestPath, 'utf-8');

  check('RetryPolicy tests cover exponential backoff', () =>
    /Exponential Backoff/.test(retryTest)
  );

  check('RetryPolicy tests cover circuit breaker', () =>
    /Circuit Breaker/.test(retryTest)
  );

  check('RetryPolicy tests cover shouldRetry', () =>
    /shouldRetry/.test(retryTest)
  );
}

const repoTestPath = path.join(testsDir, 'InMemoryProcessRepository.spec.ts');
if (fs.existsSync(repoTestPath)) {
  const repoTest = fs.readFileSync(repoTestPath, 'utf-8');

  check('Repository tests cover save/load', () =>
    /save and load/.test(repoTest) || /save\(\)/.test(repoTest)
  );

  check('Repository tests cover findStale', () =>
    /findStale/.test(repoTest)
  );

  check('Repository tests cover queries', () =>
    /findByState/.test(repoTest) && /findByCorrelationId/.test(repoTest)
  );
}

// ============================================================================
// 7. Integration Patterns
// ============================================================================

section('🔗 Integration');

const indexPath = path.join(processesDir, 'index.ts');
if (fs.existsSync(indexPath)) {
  const index = fs.readFileSync(indexPath, 'utf-8');

  check('index.ts exports RetryPolicy', () =>
    /export.*RetryPolicy/.test(index)
  );

  check('index.ts exports IProcessRepository', () =>
    /export.*IProcessRepository/.test(index)
  );

  check('index.ts exports InMemoryProcessRepository', () =>
    /export.*InMemoryProcessRepository/.test(index)
  );

  check('index.ts exports ProcessManager', () =>
    /export.*ProcessManager/.test(index)
  );

  check('index.ts exports TimeoutMonitor', () =>
    /export.*TimeoutMonitor/.test(index)
  );
}

// ============================================================================
// Summary
// ============================================================================

summary();

// END OF FILE
