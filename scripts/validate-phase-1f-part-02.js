/**
 * Phase 1F Validation Script - Part 2
 * Validates WorkspaceCommandService and WorkspaceStoreService
 */

// Continue from Part 1...

section('WorkspaceQueryService Tests');
if (checkFileExists(queryServiceTestPath, 'WorkspaceQueryService test suite')) {
  checkFileContains(
    queryServiceTestPath,
    /describe.*WorkspaceQueryService/,
    'Test suite uses describe block'
  );

  checkFileContains(
    queryServiceTestPath,
    /it.*should.*get.*workspace.*by.*id/i,
    'Tests getWorkspaceById method'
  );

  checkFileContains(
    queryServiceTestPath,
    /it.*should.*get.*workspaces.*by.*owner/i,
    'Tests getWorkspacesByOwnerId method'
  );

  checkFileContains(
    queryServiceTestPath,
    /it.*should.*get.*workspaces.*by.*status/i,
    'Tests getWorkspacesByStatus method'
  );

  checkFileContains(
    queryServiceTestPath,
    /Mock.*Firestore/i,
    'Mocks Firestore dependency'
  );
}

// WorkspaceCommandService Validation
const commandServicePath = 'packages/ui-angular/src/app/core/services/commands/workspace-command.service.ts';
const commandServiceTest1Path = 'packages/ui-angular/src/app/core/services/commands/workspace-command.service-part-01.spec.ts';
const commandServiceTest2Path = 'packages/ui-angular/src/app/core/services/commands/workspace-command.service-part-02.spec.ts';

section('WorkspaceCommandService Implementation');
if (checkFileExists(commandServicePath, 'WorkspaceCommandService')) {
  checkFileContains(
    commandServicePath,
    /@Injectable.*providedIn.*root/,
    'Service uses @Injectable with providedIn: root'
  );

  checkFileContains(
    commandServicePath,
    /import.*WorkspaceRepository.*from.*@ng-events\/account-domain/,
    'Imports WorkspaceRepository from domain'
  );

  checkFileContains(
    commandServicePath,
    /import.*Workspace.*from.*@ng-events\/account-domain/,
    'Imports Workspace aggregate from domain'
  );

  checkFileContains(
    commandServicePath,
    /constructor.*WorkspaceRepository/,
    'Injects WorkspaceRepository in constructor'
  );

  checkFileContains(
    commandServicePath,
    /async createWorkspace/,
    'Implements createWorkspace command method'
  );

  checkFileContains(
    commandServicePath,
    /async archiveWorkspace/,
    'Implements archiveWorkspace command method'
  );

  checkFileContains(
    commandServicePath,
    /Workspace\.create/,
    'Uses Workspace.create() factory method'
  );

  checkFileContains(
    commandServicePath,
    /workspaceRepository\.save/,
    'Calls repository.save() to persist events'
  );

  checkFileContains(
    commandServicePath,
    /workspaceRepository\.load/,
    'Calls repository.load() to retrieve aggregate'
  );

  checkFileContains(
    commandServicePath,
    /workspace\.archive/,
    'Calls workspace.archive() business method'
  );

  // Check NO Firestore dependency (CQRS separation)
  const content = fs.readFileSync(commandServicePath, 'utf-8');
  const hasFirestoreImport = /import.*Firestore|import.*@angular\/fire\/firestore/.test(content);
  
  if (!hasFirestoreImport) {
    checkPassed('NO Firestore dependency (CQRS compliance)');
  } else {
    checkFailed('Has Firestore dependency (CQRS violation)');
  }

  // Check NO Projection queries (CQRS separation)
  const hasQueryServiceImport = /import.*QueryService|from.*QueryService|: QueryService/.test(content);
  
  if (!hasQueryServiceImport) {
    checkPassed('NO QueryService dependency (CQRS compliance)');
  } else {
    checkFailed('Has QueryService dependency (CQRS violation)');
  }

  checkFileContains(
    commandServicePath,
    /try.*catch/,
    'Implements error handling with try-catch'
  );

  checkFileContains(
    commandServicePath,
    /console\.error/,
    'Logs errors with context'
  );

  checkFileContains(
    commandServicePath,
    /\/\/ END OF FILE/,
    'File ends with END OF FILE marker'
  );
}

section('WorkspaceCommandService Tests');
if (checkFileExists(commandServiceTest1Path, 'WorkspaceCommandService test suite part 1')) {
  checkFileContains(
    commandServiceTest1Path,
    /describe.*WorkspaceCommandService/,
    'Test suite uses describe block'
  );

  checkFileContains(
    commandServiceTest1Path,
    /it.*should.*create.*workspace/i,
    'Tests createWorkspace command'
  );

  checkFileContains(
    commandServiceTest1Path,
    /it.*should.*archive.*workspace/i,
    'Tests archiveWorkspace command'
  );

  checkFileContains(
    commandServiceTest1Path,
    /Mock.*Repository/i,
    'Mocks WorkspaceRepository dependency'
  );
}

if (checkFileExists(commandServiceTest2Path, 'WorkspaceCommandService test suite part 2')) {
  checkFileContains(
    commandServiceTest2Path,
    /it.*should.*mark.*workspace.*ready/i,
    'Tests markWorkspaceReady command'
  );

  checkFileContains(
    commandServiceTest2Path,
    /Error Handling/,
    'Tests error handling scenarios'
  );
}

