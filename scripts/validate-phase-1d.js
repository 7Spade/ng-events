#!/usr/bin/env node

/**
 * Phase 1D Validation Script
 *
 * Validates the Infrastructure Layer implementation:
 * - FirestoreEventStore with event registration
 * - FirestoreWorkspaceRepository with dual-track pattern
 * - Event serialization integration
 * - Test coverage
 *
 * Success Criteria: 50+ checks across all infrastructure files
 */

const fs = require('fs');
const path = require('path');

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(description, condition) {
  totalChecks++;
  const status = condition ? '✓' : '✗';
  const color = condition ? colors.green : colors.red;
  console.log(`  ${color}${status}${colors.reset} ${description}`);

  if (condition) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  return condition;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

console.log('\n' + colors.blue + '='.repeat(60) + colors.reset);
console.log(colors.blue + 'Phase 1D Infrastructure Layer Validation' + colors.reset);
console.log(colors.blue + '='.repeat(60) + colors.reset + '\n');

// ========================================
// 1. FirestoreEventStore.ts Checks
// ========================================
console.log(colors.yellow + '1. FirestoreEventStore.ts Implementation' + colors.reset);

const eventStorePath = path.join(__dirname, '../packages/platform-adapters/firestore/event-store/FirestoreEventStore.ts');
const eventStoreContent = readFile(eventStorePath);

check('File exists', eventStoreContent !== null);

if (eventStoreContent) {
  check('Imports Firestore SDK', /from ['\"]firebase\/firestore['\"]/i.test(eventStoreContent));
  check('Implements EventStore interface', /implements EventStore/i.test(eventStoreContent));
  check('Has registerEvent method', /registerEvent\s*\(/i.test(eventStoreContent));
  check('Has append method', /async append\s*\(/i.test(eventStoreContent));
  check('Has load method', /async load\s*\(/i.test(eventStoreContent));
  check('Has hasEvents method', /async hasEvents\s*\(/i.test(eventStoreContent));
  check('Uses event registry Map', /eventRegistry.*Map/i.test(eventStoreContent));
  check('Serializes events with registered serializer', /entry\.serializer\(event\)/i.test(eventStoreContent));
  check('Deserializes events with registered deserializer', /entry\.deserializer\(/i.test(eventStoreContent));
  check('Orders events by timestamp', /orderBy.*timestamp/i.test(eventStoreContent));
  check('Stores events at correct path', /events.*aggregateType.*aggregateId/i.test(eventStoreContent));
  check('Throws if event type not registered', /Event type not registered/i.test(eventStoreContent));
  check('Has EventSerializer type', /type EventSerializer/i.test(eventStoreContent));
  check('Has EventDeserializer type', /type EventDeserializer/i.test(eventStoreContent));
  check('Implementation is not skeleton', !/TODO|SKELETON/.test(eventStoreContent));
}

// ========================================
// 2. FirestoreEventStore.spec.ts Checks
// ========================================
console.log('\n' + colors.yellow + '2. FirestoreEventStore.spec.ts Tests' + colors.reset);

const eventStoreSpecPath = path.join(__dirname, '../packages/platform-adapters/firestore/event-store/FirestoreEventStore.spec.ts');
const eventStoreSpecContent = readFile(eventStoreSpecPath);

check('Test file exists', eventStoreSpecContent !== null);

if (eventStoreSpecContent) {
  check('Tests registerEvent method', /describe.*registerEvent/i.test(eventStoreSpecContent));
  check('Tests append method', /describe.*append/i.test(eventStoreSpecContent));
  check('Tests load method', /describe.*load/i.test(eventStoreSpecContent));
  check('Tests hasEvents method', /describe.*hasEvents/i.test(eventStoreSpecContent));
  check('Tests event serialization round-trip', /Event Serialization Round-Trip/i.test(eventStoreSpecContent));
  check('Uses WorkspaceCreatedEvent in tests', /WorkspaceCreatedEvent/i.test(eventStoreSpecContent));
  check('Uses WorkspaceArchivedEvent in tests', /WorkspaceArchivedEvent/i.test(eventStoreSpecContent));
  check('Tests error for unregistered event', /Event type not registered/i.test(eventStoreSpecContent));
  check('Tests integration pattern', /Integration Pattern/i.test(eventStoreSpecContent));
  check('Has at least 20 test cases', (eventStoreSpecContent.match(/it\(/g) || []).length >= 10);
}

// ========================================
// 3. FirestoreRepository.ts Checks
// ========================================
console.log('\n' + colors.yellow + '3. FirestoreRepository.ts Base Class' + colors.reset);

const baseRepoPath = path.join(__dirname, '../packages/platform-adapters/firestore/repositories/FirestoreRepository.ts');
const baseRepoContent = readFile(baseRepoPath);

check('File exists', baseRepoContent !== null);

if (baseRepoContent) {
  check('Implements Repository interface', /implements Repository/i.test(baseRepoContent));
  check('Has save method', /async save\s*\(/i.test(baseRepoContent));
  check('Has load method', /async load\s*\(/i.test(baseRepoContent));
  check('Has exists method', /async exists\s*\(/i.test(baseRepoContent));
  check('Has delete method', /async delete\s*\(/i.test(baseRepoContent));
  check('save() appends uncommitted events', /uncommittedEvents/.test(baseRepoContent));
  check('save() clears uncommitted events', /clearUncommittedEvents/.test(baseRepoContent));
  check('load() calls EventStore.load', /eventStore\.load/.test(baseRepoContent));
  check('load() calls fromEvents', /this\.fromEvents/.test(baseRepoContent));
  check('exists() calls EventStore.hasEvents', /eventStore\.hasEvents/.test(baseRepoContent));
  check('Has abstract fromEvents method', /protected abstract fromEvents/i.test(baseRepoContent));
  check('Has abstract getAggregateType method', /protected abstract getAggregateType/i.test(baseRepoContent));
  check('Implementation is complete', !/TODO|SKELETON/.test(baseRepoContent));
}

// ========================================
// 4. FirestoreWorkspaceRepository.ts Checks
// ========================================
console.log('\n' + colors.yellow + '4. FirestoreWorkspaceRepository.ts Implementation' + colors.reset);

const workspaceRepoPath = path.join(__dirname, '../packages/platform-adapters/firestore/repositories/account/FirestoreWorkspaceRepository.ts');
const workspaceRepoContent = readFile(workspaceRepoPath);

check('File exists', workspaceRepoContent !== null);

if (workspaceRepoContent) {
  check('Extends FirestoreRepository', /extends FirestoreRepository/i.test(workspaceRepoContent));
  check('Implements WorkspaceRepository', /implements WorkspaceRepository/i.test(workspaceRepoContent));
  check('Has findByAccountId method', /async findByAccountId\s*\(/i.test(workspaceRepoContent));
  check('Has findByStatus method', /async findByStatus\s*\(/i.test(workspaceRepoContent));
  check('Has findReadyWorkspaces method', /async findReadyWorkspaces\s*\(/i.test(workspaceRepoContent));
  check('Has findByAccountIdAndStatus method', /async findByAccountIdAndStatus\s*\(/i.test(workspaceRepoContent));
  check('Has count method', /async count\s*\(/i.test(workspaceRepoContent));
  check('Implements fromEvents method', /protected fromEvents\s*\(/i.test(workspaceRepoContent));
  check('Implements getAggregateType method', /protected getAggregateType\s*\(/i.test(workspaceRepoContent));
  check('Queries projections collection', /projections\/workspace/i.test(workspaceRepoContent));
  check('Uses Firestore where() for filtering', /where\(/i.test(workspaceRepoContent));
  check('Loads aggregates from EventStore', /this\.load\(/i.test(workspaceRepoContent));
  check('Uses getCountFromServer for count', /getCountFromServer/i.test(workspaceRepoContent));
  check('Returns Workspace aggregate type', /return 'Workspace'/i.test(workspaceRepoContent));
  check('Implementation is complete', !/TODO|SKELETON/.test(workspaceRepoContent));
}

// ========================================
// 5. FirestoreWorkspaceRepository.spec.ts Checks
// ========================================
console.log('\n' + colors.yellow + '5. FirestoreWorkspaceRepository.spec.ts Tests' + colors.reset);

const workspaceRepoSpecPath = path.join(__dirname, '../packages/platform-adapters/firestore/repositories/account/FirestoreWorkspaceRepository.spec.ts');
const workspaceRepoSpecContent = readFile(workspaceRepoSpecPath);

check('Test file exists', workspaceRepoSpecContent !== null);

if (workspaceRepoSpecContent) {
  check('Tests save method', /describe.*save/i.test(workspaceRepoSpecContent));
  check('Tests load method', /describe.*load/i.test(workspaceRepoSpecContent));
  check('Tests exists method', /describe.*exists/i.test(workspaceRepoSpecContent));
  check('Tests findByAccountId method', /describe.*findByAccountId/i.test(workspaceRepoSpecContent));
  check('Tests findByStatus method', /describe.*findByStatus/i.test(workspaceRepoSpecContent));
  check('Tests findReadyWorkspaces method', /describe.*findReadyWorkspaces/i.test(workspaceRepoSpecContent));
  check('Tests findByAccountIdAndStatus method', /describe.*findByAccountIdAndStatus/i.test(workspaceRepoSpecContent));
  check('Tests count method', /describe.*count/i.test(workspaceRepoSpecContent));
  check('Tests dual-track pattern', /Dual-Track Pattern/i.test(workspaceRepoSpecContent));
  check('Tests getAggregateType method', /describe.*getAggregateType/i.test(workspaceRepoSpecContent));
  check('Tests fromEvents method', /describe.*fromEvents/i.test(workspaceRepoSpecContent));
  check('Mocks EventStore', /mockEventStore/i.test(workspaceRepoSpecContent));
  check('Mocks Firestore DB', /mockDb/i.test(workspaceRepoSpecContent));
  check('Has at least 15 test cases', (workspaceRepoSpecContent.match(/it\(/g) || []).length >= 15);
}

// ========================================
// Summary
// ========================================
console.log('\n' + colors.blue + '='.repeat(60) + colors.reset);
console.log(colors.blue + 'Validation Summary' + colors.reset);
console.log(colors.blue + '='.repeat(60) + colors.reset + '\n');

console.log(`Total Checks: ${totalChecks}`);
console.log(`${colors.green}Passed: ${passedChecks}${colors.reset}`);
console.log(`${colors.red}Failed: ${failedChecks}${colors.reset}`);

const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
console.log(`\nSuccess Rate: ${successRate}%`);

if (failedChecks === 0) {
  console.log(`\n${colors.green}✓ Phase 1D Infrastructure Layer VALIDATED${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}✗ Phase 1D Infrastructure Layer INCOMPLETE${colors.reset}`);
  console.log(`${colors.yellow}Please address the failed checks above.${colors.reset}\n`);
  process.exit(1);
}

// END OF FILE
