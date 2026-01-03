#!/usr/bin/env node

/**
 * Phase 1F Master Validation Script
 * 
 * Validates complete Angular Services Layer implementation:
 * - WorkspaceQueryService (CQRS Query side)
 * - WorkspaceCommandService (CQRS Command side)
 * - WorkspaceStoreService (Reactive state management)
 * 
 * Runs all validation parts and aggregates results.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(80));
console.log('Phase 1F: Angular Services Layer - Complete Validation');
console.log('='.repeat(80) + '\n');

// Combine all three parts into a single validation
const part1 = fs.readFileSync(path.join(__dirname, 'validate-phase-1f-part-01.js'), 'utf-8');
const part2 = fs.readFileSync(path.join(__dirname, 'validate-phase-1f-part-02.js'), 'utf-8');
const part3 = fs.readFileSync(path.join(__dirname, 'validate-phase-1f-part-03.js'), 'utf-8');

// Remove duplicate header from parts 2 and 3
const part2Clean = part2.replace(/^[\s\S]*?\/\/ Continue from Part 1\.\.\.\n/, '');
const part3Clean = part3.replace(/^[\s\S]*?\/\/ WorkspaceStoreService Validation\n/, '');

// Combine into single script
const combinedScript = part1 + '\n' + part2Clean + '\n' + part3Clean;

// Execute combined validation
try {
  const tempScriptPath = path.join(__dirname, 'validate-phase-1f-temp.js');
  fs.writeFileSync(tempScriptPath, combinedScript);
  
  execSync(`node ${tempScriptPath}`, { stdio: 'inherit', cwd: process.cwd() });
  
  // Cleanup temp file
  fs.unlinkSync(tempScriptPath);
  
  process.exit(0);
} catch (error) {
  process.exit(1);
}

// END OF FILE
