#!/usr/bin/env node

/**
 * Phase 1B Validation Script
 * 
 * Validates Workspace Aggregate implementation with Event Sourcing pattern.
 * 
 * Run: node scripts/validate-phase-1b.js
 */

const path = require('path');

console.log('🧪 Phase 1B: Workspace Aggregate Validation\n');
console.log('='.repeat(60));

// File paths to validate
const filesToCheck = [
  {
    path: 'packages/account-domain/workspace/aggregates/Workspace.ts',
    description: 'Workspace Aggregate Implementation',
    checks: [
      { pattern: /class Workspace extends AggregateRoot/, description: 'Extends AggregateRoot' },
      { pattern: /static create\(/, description: 'Has static create() factory method' },
      { pattern: /static fromEvents\(/, description: 'Has static fromEvents() for event replay' },
      { pattern: /protected applyEvent\(/, description: 'Has applyEvent() for state mutation' },
      { pattern: /archive\(/, description: 'Has archive() business method' },
      { pattern: /raiseEvent\(/, description: 'Raises domain events' },
      { pattern: /getUncommittedEvents\(\)/, description: 'Manages uncommitted events' },
      { pattern: /readonly id: WorkspaceId/, description: 'Has aggregate id' },
      { pattern: /readonly type = 'Workspace'/, description: 'Has aggregate type' },
    ],
  },
  {
    path: 'packages/account-domain/workspace/aggregates/Workspace.spec.ts',
    description: 'Workspace Aggregate Tests',
    checks: [
      { pattern: /describe\('Workspace Aggregate'/, description: 'Has test suite' },
      { pattern: /describe\('create\(\)'/, description: 'Tests create() method' },
      { pattern: /describe\('fromEvents\(\)'/, description: 'Tests fromEvents() method' },
      { pattern: /describe\('archive\(\)'/, description: 'Tests archive() method' },
      { pattern: /describe\('Event Sourcing Pattern'/, description: 'Tests event sourcing' },
      { pattern: /describe\('Causality Chain'/, description: 'Tests causality metadata' },
    ],
  },
  {
    path: 'packages/core-engine/aggregates/AggregateRoot.ts',
    description: 'AggregateRoot Base Class',
    checks: [
      { pattern: /protected uncommittedEvents/, description: 'Has uncommittedEvents array' },
      { pattern: /getUncommittedEvents\(\)/, description: 'Has getUncommittedEvents()' },
      { pattern: /clearUncommittedEvents\(\)/, description: 'Has clearUncommittedEvents()' },
      { pattern: /protected raiseEvent\(/, description: 'Has raiseEvent()' },
      { pattern: /replay\(/, description: 'Has replay() for event replay' },
      { pattern: /protected abstract applyEvent/, description: 'Has abstract applyEvent()' },
    ],
  },
  {
    path: 'packages/account-domain/workspace/events/WorkspaceCreated.ts',
    description: 'WorkspaceCreated Event',
    checks: [
      { pattern: /export type WorkspaceCreated/, description: 'Has WorkspaceCreated type' },
      { pattern: /WorkspaceCreatedPayload/, description: 'Has payload interface' },
      { pattern: /eventType: 'WorkspaceCreated'/, description: 'Has event type' },
      { pattern: /aggregateType: 'Workspace'/, description: 'Has aggregate type' },
    ],
  },
  {
    path: 'packages/account-domain/workspace/events/WorkspaceArchived.ts',
    description: 'WorkspaceArchived Event',
    checks: [
      { pattern: /export type WorkspaceArchived/, description: 'Has WorkspaceArchived type' },
      { pattern: /WorkspaceArchivedPayload/, description: 'Has payload interface' },
      { pattern: /eventType: 'WorkspaceArchived'/, description: 'Has event type' },
      { pattern: /aggregateType: 'Workspace'/, description: 'Has aggregate type' },
    ],
  },
];

const fs = require('fs');

let totalChecks = 0;
let passedChecks = 0;
let filesMissing = 0;

filesToCheck.forEach(file => {
  console.log(`\n📄 ${file.description}`);
  console.log(`   File: ${file.path}`);
  
  const fullPath = path.join(process.cwd(), file.path);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`   ❌ FILE NOT FOUND`);
    filesMissing++;
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  
  file.checks.forEach(check => {
    totalChecks++;
    const passed = check.pattern.test(content);
    if (passed) {
      passedChecks++;
      console.log(`   ✅ ${check.description}`);
    } else {
      console.log(`   ❌ ${check.description}`);
    }
  });
});

console.log('\n' + '='.repeat(60));
console.log('📊 Validation Summary');
console.log('='.repeat(60));
console.log(`Total Checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks} ✅`);
console.log(`Failed: ${totalChecks - passedChecks} ❌`);
console.log(`Missing Files: ${filesMissing} 📄`);

const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
console.log(`Success Rate: ${successRate}%`);

if (passedChecks === totalChecks && filesMissing === 0) {
  console.log('\n✅ Phase 1B: VALIDATION PASSED');
  console.log('   All checks completed successfully!');
  console.log('   Ready to proceed to Phase 1C (Domain Events)');
  process.exit(0);
} else {
  console.log('\n❌ Phase 1B: VALIDATION FAILED');
  console.log('   Some checks did not pass.');
  console.log('   Review the output above for details.');
  process.exit(1);
}

// END OF FILE
