#!/usr/bin/env node

/**
 * validate-adapter-architecture.js
 * 
 * Validates Clean Architecture compliance for Platform Adapters base abstractions.
 * 
 * Checks:
 * 1. base/ directory exists
 * 2. AdapterLifecycle.ts and RepositoryAdapterCapability.ts exist
 * 3. index.ts properly exports base abstractions
 * 4. Old files (IAdapter.ts, IRepositoryAdapter.ts) marked as deprecated
 * 5. Documentation exists
 */

const fs = require('fs');
const path = require('path');

const BASE_PATH = path.join(__dirname, '../packages/platform-adapters/base');
const PLATFORM_PATH = path.join(__dirname, '../packages/platform-adapters');

let passedChecks = 0;
let totalChecks = 0;

function check(description, assertion) {
  totalChecks++;
  const status = assertion ? '✅' : '❌';
  console.log(`${status} ${description}`);
  if (assertion) passedChecks++;
  return assertion;
}

console.log('\n📋 Platform Adapters Architecture Validation\n');
console.log('─'.repeat(60));

// Check 1: base/ directory exists
check('base/ directory exists', fs.existsSync(BASE_PATH));

// Check 2: AdapterLifecycle.ts exists
const adapterLifecyclePath = path.join(BASE_PATH, 'AdapterLifecycle.ts');
const adapterLifecycleExists = check('AdapterLifecycle.ts exists', fs.existsSync(adapterLifecyclePath));

if (adapterLifecycleExists) {
  const content = fs.readFileSync(adapterLifecyclePath, 'utf8');
  check('AdapterLifecycle.ts exports interface', content.includes('export interface AdapterLifecycle'));
  check('AdapterLifecycle.ts has initialize() method', content.includes('initialize(config: any): Promise<void>'));
  check('AdapterLifecycle.ts has healthCheck() method', content.includes('healthCheck(): Promise<boolean>'));
  check('AdapterLifecycle.ts has dispose() method', content.includes('dispose(): Promise<void>'));
  check('AdapterLifecycle.ts has getName() method', content.includes('getName(): string'));
  check('AdapterLifecycle.ts has END OF FILE marker', content.includes('// END OF FILE'));
}

// Check 3: RepositoryAdapterCapability.ts exists
const repoCapabilityPath = path.join(BASE_PATH, 'RepositoryAdapterCapability.ts');
const repoCapabilityExists = check('RepositoryAdapterCapability.ts exists', fs.existsSync(repoCapabilityPath));

if (repoCapabilityExists) {
  const content = fs.readFileSync(repoCapabilityPath, 'utf8');
  check('RepositoryAdapterCapability.ts exports interface', content.includes('export interface RepositoryAdapterCapability'));
  check('RepositoryAdapterCapability.ts extends AdapterLifecycle', content.includes('extends AdapterLifecycle'));
  check('RepositoryAdapterCapability.ts has beginTransaction() method', content.includes('beginTransaction(): Promise<any>'));
  check('RepositoryAdapterCapability.ts has commit() method', content.includes('commit(transaction: any): Promise<void>'));
  check('RepositoryAdapterCapability.ts has rollback() method', content.includes('rollback(transaction: any): Promise<void>'));
  check('RepositoryAdapterCapability.ts has query() method', content.includes('query(queryString: string'));
  check('RepositoryAdapterCapability.ts has isConnected() method', content.includes('isConnected(): boolean'));
  check('RepositoryAdapterCapability.ts has END OF FILE marker', content.includes('// END OF FILE'));
}

// Check 4: base/index.ts exports
const baseIndexPath = path.join(BASE_PATH, 'index.ts');
const baseIndexExists = check('base/index.ts exists', fs.existsSync(baseIndexPath));

if (baseIndexExists) {
  const content = fs.readFileSync(baseIndexPath, 'utf8');
  check('base/index.ts exports AdapterLifecycle', content.includes("export * from './AdapterLifecycle'"));
  check('base/index.ts exports RepositoryAdapterCapability', content.includes("export * from './RepositoryAdapterCapability'"));
  check('base/index.ts has END OF FILE marker', content.includes('// END OF FILE'));
}

// Check 5: README documentation
const readmePath = path.join(BASE_PATH, 'README.md');
const readmeExists = check('base/README.md exists', fs.existsSync(readmePath));

if (readmeExists) {
  const content = fs.readFileSync(readmePath, 'utf8');
  check('README documents Clean Architecture principle', content.includes('Clean Architecture'));
  check('README documents AdapterLifecycle', content.includes('AdapterLifecycle'));
  check('README documents RepositoryAdapterCapability', content.includes('RepositoryAdapterCapability'));
  check('README documents migration from old names', content.includes('IAdapter') && content.includes('deprecated'));
}

// Check 6: Old files marked as deprecated
const oldAdapterPath = path.join(PLATFORM_PATH, 'IAdapter.ts');
const oldAdapterExists = check('IAdapter.ts exists (for backward compatibility)', fs.existsSync(oldAdapterPath));

if (oldAdapterExists) {
  const content = fs.readFileSync(oldAdapterPath, 'utf8');
  check('IAdapter.ts marked as deprecated', content.includes('@deprecated'));
  check('IAdapter.ts re-exports from base/', content.includes("from './base/AdapterLifecycle'"));
}

const oldRepoAdapterPath = path.join(PLATFORM_PATH, 'IRepositoryAdapter.ts');
const oldRepoAdapterExists = check('IRepositoryAdapter.ts exists (for backward compatibility)', fs.existsSync(oldRepoAdapterPath));

if (oldRepoAdapterExists) {
  const content = fs.readFileSync(oldRepoAdapterPath, 'utf8');
  check('IRepositoryAdapter.ts marked as deprecated', content.includes('@deprecated'));
  check('IRepositoryAdapter.ts re-exports from base/', content.includes("from './base/RepositoryAdapterCapability'"));
}

// Check 7: Main index.ts updated
const mainIndexPath = path.join(PLATFORM_PATH, 'index.ts');
const mainIndexExists = check('platform-adapters/index.ts exists', fs.existsSync(mainIndexPath));

if (mainIndexExists) {
  const content = fs.readFileSync(mainIndexPath, 'utf8');
  check('platform-adapters/index.ts exports base/', content.includes("export * from './base'"));
  check('platform-adapters/index.ts documents Clean Architecture', content.includes('Clean Architecture'));
}

console.log('─'.repeat(60));
console.log(`\n📊 Results: ${passedChecks}/${totalChecks} checks passed (${Math.round(passedChecks/totalChecks*100)}%)\n`);

if (passedChecks === totalChecks) {
  console.log('✅ All checks passed! Architecture refactoring successful.\n');
  console.log('Next Steps:');
  console.log('  1. Phase 1G: E2E Validation and Testing');
  console.log('  2. Update adapter implementations to use new imports');
  console.log('  3. Document migration path for existing code\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please review the output above.\n');
  process.exit(1);
}

// END OF FILE
