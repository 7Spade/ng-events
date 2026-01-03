#!/usr/bin/env node

/**
 * Phase 2A Validation Script
 *
 * Validates Process/Saga skeleton implementation.
 * Checks file structure, patterns, and test coverage.
 *
 * Usage: node scripts/validate-phase-2a.js
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
    console.log(`${GREEN}✅ All checks passed! Phase 2A skeleton is complete.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}❌ Some checks failed. Review implementation.${RESET}\n`);
    process.exit(1);
  }
}

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║       Phase 2A - Process/Saga Validation Script           ║');
console.log('║       Ng-Events Architecture - Process Layer              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// ============================================================================
// 1. File Structure Validation
// ============================================================================

section('📋 File Structure');

const processesDir = 'packages/core-engine/processes';
const examplesDir = path.join(processesDir, 'examples');

check('processes/ directory exists', () =>
  fs.existsSync(processesDir) && fs.statSync(processesDir).isDirectory()
);

check('processes/examples/ directory exists', () =>
  fs.existsSync(examplesDir) && fs.statSync(examplesDir).isDirectory()
);

check('ProcessState.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'ProcessState.ts'))
);

check('ProcessCommand.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'ProcessCommand.ts'))
);

check('ProcessBase.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'ProcessBase.ts'))
);

check('CreateAccountProcess.ts exists', () =>
  fs.existsSync(path.join(examplesDir, 'CreateAccountProcess.ts'))
);

check('JoinWorkspaceProcess.ts exists', () =>
  fs.existsSync(path.join(examplesDir, 'JoinWorkspaceProcess.ts'))
);

check('processes/index.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'index.ts'))
);

check('processes/examples/index.ts exists', () =>
  fs.existsSync(path.join(examplesDir, 'index.ts'))
);

check('ProcessBase.spec.ts exists', () =>
  fs.existsSync(path.join(processesDir, 'ProcessBase.spec.ts'))
);

// ============================================================================
// 2. ProcessState Implementation
// ============================================================================

section('🎯 ProcessState Implementation');

const processStateContent = fs.readFileSync(
  path.join(processesDir, 'ProcessState.ts'),
  'utf-8'
);

check('ProcessState enum defined', () =>
  /export enum ProcessState/.test(processStateContent)
);

check('ProcessState has Pending state', () =>
  /Pending\s*=\s*['"]Pending['"]/.test(processStateContent)
);

check('ProcessState has Running state', () =>
  /Running\s*=\s*['"]Running['"]/.test(processStateContent)
);

check('ProcessState has Completed state', () =>
  /Completed\s*=\s*['"]Completed['"]/.test(processStateContent)
);

check('ProcessState has Failed state', () =>
  /Failed\s*=\s*['"]Failed['"]/.test(processStateContent)
);

check('ProcessState has Compensating state', () =>
  /Compensating\s*=\s*['"]Compensating['"]/.test(processStateContent)
);

check('ProcessState has Compensated state', () =>
  /Compensated\s*=\s*['"]Compensated['"]/.test(processStateContent)
);

check('isTerminalState helper function exists', () =>
  /export function isTerminalState/.test(processStateContent)
);

check('canCompensate helper function exists', () =>
  /export function canCompensate/.test(processStateContent)
);

// ============================================================================
// 3. ProcessCommand Implementation
// ============================================================================

section('📨 ProcessCommand Implementation');

const processCommandContent = fs.readFileSync(
  path.join(processesDir, 'ProcessCommand.ts'),
  'utf-8'
);

check('ProcessCommand interface defined', () =>
  /export interface ProcessCommand/.test(processCommandContent)
);

check('ProcessCommand has id field', () =>
  /id:\s*string/.test(processCommandContent)
);

check('ProcessCommand has commandType field', () =>
  /commandType:\s*string/.test(processCommandContent)
);

check('ProcessCommand has data field', () =>
  /data:\s*TPayload/.test(processCommandContent)
);

check('ProcessCommand has metadata field', () =>
  /metadata:\s*CausalityMetadata/.test(processCommandContent)
);

check('ProcessCommandFactory exists', () =>
  /export class ProcessCommandFactory/.test(processCommandContent)
);

check('ProcessCommandFactory has create method', () =>
  /static create/.test(processCommandContent)
);

// ============================================================================
// 4. ProcessBase Implementation
// ============================================================================

section('🏗️ ProcessBase Implementation');

const processBaseContent = fs.readFileSync(
  path.join(processesDir, 'ProcessBase.ts'),
  'utf-8'
);

check('ProcessBase is abstract class', () =>
  /export abstract class ProcessBase/.test(processBaseContent)
);

check('ProcessBase has processId property', () =>
  /protected processId:\s*string/.test(processBaseContent)
);

check('ProcessBase has state property', () =>
  /protected state:\s*ProcessState/.test(processBaseContent)
);

check('ProcessBase has correlationId property', () =>
  /protected correlationId:\s*string/.test(processBaseContent)
);

check('ProcessBase has start() method', () =>
  /start\(\):\s*void/.test(processBaseContent)
);

check('ProcessBase has react() method', () =>
  /async react\(event:\s*DomainEvent\)/.test(processBaseContent)
);

check('ProcessBase has complete() method', () =>
  /complete\(\):\s*void/.test(processBaseContent)
);

check('ProcessBase has fail() method', () =>
  /fail\(reason:\s*string\)/.test(processBaseContent)
);

check('ProcessBase has compensate() method', () =>
  /async compensate\(\)/.test(processBaseContent)
);

check('ProcessBase has abstract handleEvent() method', () =>
  /protected abstract handleEvent/.test(processBaseContent)
);

check('ProcessBase has emitCommand() protected method', () =>
  /protected emitCommand\(command:\s*ProcessCommand\)/.test(processBaseContent)
);

check('ProcessBase has getState() accessor', () =>
  /getState\(\):\s*ProcessState/.test(processBaseContent)
);

// ============================================================================
// 5. CreateAccountProcess Implementation
// ============================================================================

section('🏢 CreateAccountProcess Implementation');

const createAccountContent = fs.readFileSync(
  path.join(examplesDir, 'CreateAccountProcess.ts'),
  'utf-8'
);

check('CreateAccountProcess extends ProcessBase', () =>
  /export class CreateAccountProcess extends ProcessBase/.test(createAccountContent)
);

check('CreateAccountProcess has state interface', () =>
  /interface CreateAccountProcessState/.test(createAccountContent)
);

check('CreateAccountProcess has static create() factory', () =>
  /static create\(processId:\s*string/.test(createAccountContent)
);

check('CreateAccountProcess handles AccountCreated event', () =>
  /case 'AccountCreated':/.test(createAccountContent)
);

check('CreateAccountProcess handles WorkspaceCreated event', () =>
  /case 'WorkspaceCreated':/.test(createAccountContent)
);

check('CreateAccountProcess handles MembershipCreated event', () =>
  /case 'MembershipCreated':/.test(createAccountContent)
);

check('CreateAccountProcess implements handleEvent()', () =>
  /protected async handleEvent\(event:\s*DomainEvent\)/.test(createAccountContent)
);

check('CreateAccountProcess implements onCompensate()', () =>
  /protected async onCompensate\(\)/.test(createAccountContent)
);

check('CreateAccountProcess emits CreateWorkspace command', () =>
  /commandType:\s*['"]CreateWorkspace['"]/.test(createAccountContent)
);

check('CreateAccountProcess emits CreateMembership command', () =>
  /commandType:\s*['"]CreateMembership['"]/.test(createAccountContent)
);

check('CreateAccountProcess uses idempotency checks', () =>
  /stepCompleted\.has\(/.test(createAccountContent)
);

check('CreateAccountProcess uses causality tracking', () =>
  /CausalityMetadataFactory/.test(createAccountContent)
);

// ============================================================================
// 6. JoinWorkspaceProcess Implementation
// ============================================================================

section('👥 JoinWorkspaceProcess Implementation');

const joinWorkspaceContent = fs.readFileSync(
  path.join(examplesDir, 'JoinWorkspaceProcess.ts'),
  'utf-8'
);

check('JoinWorkspaceProcess extends ProcessBase', () =>
  /export class JoinWorkspaceProcess extends ProcessBase/.test(joinWorkspaceContent)
);

check('JoinWorkspaceProcess has state interface', () =>
  /interface JoinWorkspaceProcessState/.test(joinWorkspaceContent)
);

check('JoinWorkspaceProcess has static create() factory', () =>
  /static create\(processId:\s*string/.test(joinWorkspaceContent)
);

check('JoinWorkspaceProcess handles InvitationAccepted event', () =>
  /case 'InvitationAccepted':/.test(joinWorkspaceContent)
);

check('JoinWorkspaceProcess handles MembershipCreated event', () =>
  /case 'MembershipCreated':/.test(joinWorkspaceContent)
);

check('JoinWorkspaceProcess handles NotificationSent event', () =>
  /case 'NotificationSent':/.test(joinWorkspaceContent)
);

check('JoinWorkspaceProcess implements onCompensate()', () =>
  /protected async onCompensate\(\)/.test(joinWorkspaceContent)
);

check('JoinWorkspaceProcess emits SendNotification command', () =>
  /commandType:\s*['"]SendNotification['"]/.test(joinWorkspaceContent)
);

check('JoinWorkspaceProcess uses idempotency checks', () =>
  /stepCompleted\.has\(/.test(joinWorkspaceContent)
);

// ============================================================================
// 7. Test Coverage
// ============================================================================

section('🧪 Test Coverage');

const testContent = fs.readFileSync(
  path.join(processesDir, 'ProcessBase.spec.ts'),
  'utf-8'
);

check('Test file has lifecycle tests', () =>
  /describe\(['"]Lifecycle Management['"]/.test(testContent)
);

check('Test file has event handling tests', () =>
  /describe\(['"]Event Handling/.test(testContent)
);

check('Test file has compensation tests', () =>
  /describe\(['"]Compensation Logic['"]/.test(testContent)
);

check('Test validates Pending state initialization', () =>
  /expect\(process\.getState\(\)\)\.toBe\(ProcessState\.Pending\)/.test(testContent)
);

check('Test validates start() transition', () =>
  /expect\(process\.getState\(\)\)\.toBe\(ProcessState\.Running\)/.test(testContent)
);

check('Test validates complete() transition', () =>
  /expect\(process\.getState\(\)\)\.toBe\(ProcessState\.Completed\)/.test(testContent)
);

check('Test validates fail() transition', () =>
  /expect\(process\.getState\(\)\)\.toBe\(ProcessState\.Failed\)/.test(testContent)
);

check('Test validates compensate() transition', () =>
  /expect\(process\.getState\(\)\)\.toBe\(ProcessState\.Compensated\)/.test(testContent)
);

check('Test validates command emission via react()', () =>
  /const commands = await process\.react\(testEvent\)/.test(testContent)
);

check('Test validates terminal state error handling', () =>
  /toThrow\(\/terminal state\/\)/.test(testContent)
);

// ============================================================================
// 8. Exports and Index Files
// ============================================================================

section('📦 Exports and Index Files');

const processesIndexContent = fs.readFileSync(
  path.join(processesDir, 'index.ts'),
  'utf-8'
);

check('processes/index.ts exports ProcessBase', () =>
  /export \* from ['"]\.\/ProcessBase['"]/.test(processesIndexContent)
);

check('processes/index.ts exports ProcessState', () =>
  /export \* from ['"]\.\/ProcessState['"]/.test(processesIndexContent)
);

check('processes/index.ts exports ProcessCommand', () =>
  /export \* from ['"]\.\/ProcessCommand['"]/.test(processesIndexContent)
);

check('processes/index.ts exports examples', () =>
  /export \* from ['"]\.\/examples['"]/.test(processesIndexContent)
);

const examplesIndexContent = fs.readFileSync(
  path.join(examplesDir, 'index.ts'),
  'utf-8'
);

check('examples/index.ts exports CreateAccountProcess', () =>
  /export \* from ['"]\.\/CreateAccountProcess['"]/.test(examplesIndexContent)
);

check('examples/index.ts exports JoinWorkspaceProcess', () =>
  /export \* from ['"]\.\/JoinWorkspaceProcess['"]/.test(examplesIndexContent)
);

const coreEngineIndexContent = fs.readFileSync(
  'packages/core-engine/index.ts',
  'utf-8'
);

check('core-engine/index.ts exports processes', () =>
  /export \* from ['"]\.\/processes['"]/.test(coreEngineIndexContent)
);

// ============================================================================
// Summary
// ============================================================================

summary();

// END OF FILE
