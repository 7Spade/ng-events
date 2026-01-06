import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { ACLService } from '@delon/acl';

import { sessionGuard } from './session.guard';
import { SESSION_CONTEXT } from '../session-context.token';
import type { SessionContext } from '../session-context.interface';

describe('sessionGuard', () => {
  let context: SessionContext;
  let router: Router;
  let acl: ACLService;

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
            navigateByUrl: () => Promise.resolve(true),
            createUrlTree: (commands: string[]) => new UrlTree()
          } satisfies Partial<Router>
        },
        {
          provide: ACLService,
          useValue: {
            can: (_rule: any) => true,
            attachRole: () => undefined,
            attachAbility: () => undefined
          } satisfies Partial<ACLService>
        }
      ]
    });

    router = TestBed.inject(Router);
    acl = TestBed.inject(ACLService);
  });

  function runGuard(data: any) {
    return TestBed.runInInjectionContext(() =>
      sessionGuard({ data } as any, { url: '/x' } as any)
    );
  }

  it('allows when session valid and module present', () => {
    const result = runGuard({ moduleKey: 'm1' });
    expect(result).toBeTrue();
  });

  it('blocks when workspace required but missing', () => {
    context.workspaceId = null;
    const result = runGuard({ requireWorkspace: true });
    expect(result instanceof UrlTree).toBeTrue();
  });

  it('blocks when module missing', () => {
    context.modules = [];
    const result = runGuard({ moduleKey: 'm1' });
    expect(result instanceof UrlTree).toBeTrue();
  });

  it('blocks when ownership required but none present', () => {
    context.ownerAccountIds = [];
    const result = runGuard({ requireOwnership: true });
    expect(result instanceof UrlTree).toBeTrue();
  });

  it('blocks when ACL denies', () => {
    spyOn(acl, 'can').and.returnValue(false);
    const result = runGuard({ acl: 'admin' });
    expect(result instanceof UrlTree).toBeTrue();
  });

  it('blocks when expired', () => {
    context.isExpired = () => true;
    const result = runGuard({});
    expect(result instanceof UrlTree).toBeTrue();
  });
});

// END OF FILE
