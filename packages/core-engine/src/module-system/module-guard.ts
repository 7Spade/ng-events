export class ModuleGuard {
  static assertWorkspaceContext(workspaceId?: string): void {
    if (!workspaceId) {
      throw new Error('workspaceId is required for module operations');
    }
  }
}

// END OF FILE
