import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { commandGuard } from './command.guard';
import { SESSION_CONTEXT } from '../session-context.token';
import type { SessionContext } from '../session-context.interface';

describe('commandGuard', () => {
  let context: SessionContext;
  let router: Router;

  beforeEach(() => {
    context = {
      isAuthenticated: true,
      userId: 'u1',
      accountId: 'a1',
      actorAccountId: 'a1',
      workspaceId: 'w1',
      workspaceType: 'container',
      ownerAccountIds: ['a1'],
      roles: [],
      abilities: [],
      modules: ['m1'],
      expiresAt: undefined,
      hasRole: () => false,
      isExpired: () => false
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SESSION_CONTEXT, useFactory: () => context },
        {
          provide: Router,
          useValue: {
            createUrlTree: () => new UrlTree()
          } satisfies Partial<Router>
        }
      ]
    });

    router = TestBed.inject(Router);
  });

  function runGuard(data: any) {
    return TestBed.runInInjectionContext(() =>
      commandGuard({ data } as any, { url: '/x' } as any)
    );
  }

  it('allows access when requirements are met', () => {
    const result = runGuard({ moduleKey: 'm1', requireWorkspace: true });
    expect(result).toBeTrue();
  });

  it('blocks missing module', () => {
    const result = runGuard({ moduleKey: 'other' });
    expect(result instanceof UrlTree).toBeTrue();
  });

  it('blocks missing workspace', () => {
    context.workspaceId = null;
    const result = runGuard({ requireWorkspace: true });
    expect(result instanceof UrlTree).toBeTrue();
  });

  it('blocks missing ownership for container', () => {
    context.ownerAccountIds = [];
    const result = runGuard({ requireOwnership: true });
    expect(result instanceof UrlTree).toBeTrue();
  });
});

// END OF FILE
