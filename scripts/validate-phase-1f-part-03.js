/**
 * Phase 1F Validation Script - Part 3
 * Validates WorkspaceStoreService and generates summary
 */

// WorkspaceStoreService Validation
const storeServicePath = 'packages/ui-angular/src/app/core/services/state-management/workspace-store.service.ts';
const storeServiceTest1Path = 'packages/ui-angular/src/app/core/services/state-management/workspace-store.service-part-01.spec.ts';
const storeServiceTest2Path = 'packages/ui-angular/src/app/core/services/state-management/workspace-store.service-part-02.spec.ts';

section('WorkspaceStoreService Implementation');
if (checkFileExists(storeServicePath, 'WorkspaceStoreService')) {
  checkFileContains(
    storeServicePath,
    /@Injectable.*providedIn.*root/,
    'Service uses @Injectable with providedIn: root'
  );

  checkFileContains(
    storeServicePath,
    /import.*BehaviorSubject.*Observable.*from.*rxjs/,
    'Imports RxJS BehaviorSubject and Observable'
  );

  checkFileContains(
    storeServicePath,
    /import.*WorkspaceQueryService/,
    'Imports WorkspaceQueryService'
  );

  checkFileContains(
    storeServicePath,
    /BehaviorSubject.*WorkspaceProjectionSchema/,
    'Uses BehaviorSubject for workspace state'
  );

  checkFileContains(
    storeServicePath,
    /workspaces\$.*Observable.*WorkspaceProjectionSchema/,
    'Provides workspaces$ observable stream'
  );

  checkFileContains(
    storeServicePath,
    /selectedWorkspaceId\$.*Observable/,
    'Provides selectedWorkspaceId$ observable stream'
  );

  checkFileContains(
    storeServicePath,
    /async loadWorkspacesByOwnerId/,
    'Implements loadWorkspacesByOwnerId method'
  );

  checkFileContains(
    storeServicePath,
    /async loadReadyWorkspacesByOwnerId/,
    'Implements loadReadyWorkspacesByOwnerId method'
  );

  checkFileContains(
    storeServicePath,
    /async refreshWorkspaces/,
    'Implements refreshWorkspaces method'
  );

  checkFileContains(
    storeServicePath,
    /selectWorkspace.*string/,
    'Implements selectWorkspace method'
  );

  checkFileContains(
    storeServicePath,
    /clearSelection/,
    'Implements clearSelection method'
  );

  checkFileContains(
    storeServicePath,
    /selectWorkspaceById.*Observable/,
    'Implements selectWorkspaceById observable method'
  );

  checkFileContains(
    storeServicePath,
    /selectWorkspacesByStatus.*Observable/,
    'Implements selectWorkspacesByStatus observable method'
  );

  checkFileContains(
    storeServicePath,
    /getWorkspacesSnapshot/,
    'Implements getWorkspacesSnapshot method'
  );

  checkFileContains(
    storeServicePath,
    /clear.*void/,
    'Implements clear method'
  );

  checkFileContains(
    storeServicePath,
    /\.pipe\(.*map\(/,
    'Uses RxJS pipe and map operators'
  );

  checkFileContains(
    storeServicePath,
    /queryService\.getWorkspacesByOwnerId/,
    'Calls QueryService methods'
  );

  // Check NO Repository dependency (Store should use QueryService)
  const storeContent = fs.readFileSync(storeServicePath, 'utf-8');
  const hasRepoImport = /import.*Repository|from.*Repository|: Repository|new Repository/.test(storeContent);
  
  if (!hasRepoImport) {
    checkPassed('NO Repository dependency (correct layering)');
  } else {
    checkFailed('Has Repository dependency (architecture violation)');
  }

  // Check NO Command Service dependency
  const hasCommandServiceImport = /import.*CommandService|from.*CommandService|: CommandService|new CommandService/.test(storeContent);
  
  if (!hasCommandServiceImport) {
    checkPassed('NO CommandService dependency (correct layering)');
  } else {
    checkFailed('Has CommandService dependency (architecture violation)');
  }

  checkFileContains(
    storeServicePath,
    /\/\/ END OF FILE/,
    'File ends with END OF FILE marker'
  );
}

section('WorkspaceStoreService Tests');
if (checkFileExists(storeServiceTest1Path, 'WorkspaceStoreService test suite part 1')) {
  checkFileContains(
    storeServiceTest1Path,
    /describe.*WorkspaceStoreService/,
    'Test suite uses describe block'
  );

  checkFileContains(
    storeServiceTest1Path,
    /Observable Streams/,
    'Tests observable streams'
  );

  checkFileContains(
    storeServiceTest1Path,
    /it.*should.*load.*workspaces/i,
    'Tests loadWorkspacesByOwnerId method'
  );

  checkFileContains(
    storeServiceTest1Path,
    /Mock.*QueryService/i,
    'Mocks WorkspaceQueryService dependency'
  );
}

if (checkFileExists(storeServiceTest2Path, 'WorkspaceStoreService test suite part 2')) {
  checkFileContains(
    storeServiceTest2Path,
    /it.*should.*refresh.*workspaces/i,
    'Tests refreshWorkspaces method'
  );

  checkFileContains(
    storeServiceTest2Path,
    /Snapshot Methods/,
    'Tests snapshot methods'
  );

  checkFileContains(
    storeServiceTest2Path,
    /it.*should.*clear.*cache/i,
    'Tests clear method'
  );
}

// Summary
section('='.repeat(80));
section('Phase 1F Validation Summary');
section('='.repeat(80));

console.log(`\nTotal Checks: ${totalChecks}`);
console.log(`${colors.green}Passed: ${passedChecks}${colors.reset}`);
console.log(`${colors.red}Failed: ${failedChecks}${colors.reset}`);
console.log(`Success Rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%\n`);

if (failedChecks > 0) {
  console.log(`${colors.yellow}⚠ Phase 1F has ${failedChecks} failing checks${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`${colors.green}✓ Phase 1F validation passed!${colors.reset}\n`);
  process.exit(0);
}

