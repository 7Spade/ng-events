#!/usr/bin/env node

// Quick validation script for WorkspaceId and WorkspaceRole Value Objects
// This script validates the implementation without needing the full test runner

const { WorkspaceIdVO } = require('../packages/account-domain/workspace/value-objects/WorkspaceId');
const { WorkspaceRoleVO } = require('../packages/account-domain/workspace/value-objects/WorkspaceRole');

console.log('=== Phase 1A Value Objects Validation ===\n');

let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✅ ${description}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }
}

// WorkspaceId Tests
console.log('--- WorkspaceId Tests ---');

test('WorkspaceId: Create with valid UUID', () => {
  const id = WorkspaceIdVO.create('123e4567-e89b-12d3-a456-426614174000');
  if (!id || id.getValue() !== '123e4567-e89b-12d3-a456-426614174000') {
    throw new Error('Failed to create or retrieve value');
  }
});

test('WorkspaceId: Reject invalid UUID', () => {
  try {
    WorkspaceIdVO.create('not-a-uuid');
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Invalid WorkspaceId')) {
      throw error;
    }
  }
});

test('WorkspaceId: Equality check for same IDs', () => {
  const id1 = WorkspaceIdVO.create('123e4567-e89b-12d3-a456-426614174000');
  const id2 = WorkspaceIdVO.create('123e4567-e89b-12d3-a456-426614174000');
  if (!id1.equals(id2)) {
    throw new Error('Equal IDs should return true');
  }
});

test('WorkspaceId: Equality check for different IDs', () => {
  const id1 = WorkspaceIdVO.create('123e4567-e89b-12d3-a456-426614174000');
  const id2 = WorkspaceIdVO.create('223e4567-e89b-12d3-a456-426614174000');
  if (id1.equals(id2)) {
    throw new Error('Different IDs should return false');
  }
});

// WorkspaceRole Tests
console.log('\n--- WorkspaceRole Tests ---');

test('WorkspaceRole: Create with valid role (Owner)', () => {
  const role = WorkspaceRoleVO.create('Owner');
  if (!role || role.getValue() !== 'Owner') {
    throw new Error('Failed to create Owner role');
  }
});

test('WorkspaceRole: Create with valid role (Admin)', () => {
  const role = WorkspaceRoleVO.create('Admin');
  if (!role || role.getValue() !== 'Admin') {
    throw new Error('Failed to create Admin role');
  }
});

test('WorkspaceRole: Reject invalid role', () => {
  try {
    WorkspaceRoleVO.create('InvalidRole');
    throw new Error('Should have thrown error');
  } catch (error) {
    if (!error.message.includes('Invalid WorkspaceRole')) {
      throw error;
    }
  }
});

test('WorkspaceRole: Equality check for same roles', () => {
  const role1 = WorkspaceRoleVO.create('Admin');
  const role2 = WorkspaceRoleVO.create('Admin');
  if (!role1.equals(role2)) {
    throw new Error('Equal roles should return true');
  }
});

test('WorkspaceRole: Permission hierarchy (Owner > Admin)', () => {
  const owner = WorkspaceRoleVO.create('Owner');
  const admin = WorkspaceRoleVO.create('Admin');
  if (!owner.hasHigherOrEqualPermission(admin)) {
    throw new Error('Owner should have higher permission than Admin');
  }
});

test('WorkspaceRole: Permission hierarchy (Member < Admin)', () => {
  const member = WorkspaceRoleVO.create('Member');
  const admin = WorkspaceRoleVO.create('Admin');
  if (member.hasHigherOrEqualPermission(admin)) {
    throw new Error('Member should not have higher permission than Admin');
  }
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`Total: ${passedTests + failedTests}`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! Phase 1A implementation is complete.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the implementation.');
  process.exit(1);
}

// END OF FILE
