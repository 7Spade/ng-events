import { TestBed } from '@angular/core/testing';
import { DA_SERVICE_TOKEN, ITokenModel, ITokenService } from '@delon/auth';

import { DelonSessionContextAdapter } from './delon-session-context.adapter';

type MockPayload = ITokenModel & {
  uid?: string;
  accountId?: string;
  accountType?: 'user' | 'organization' | 'bot';
  workspaceId?: string;
  workspaceType?: 'organization' | 'container';
  roles?: string[];
  abilities?: string[];
  modules?: string[];
  expired?: number;
};

class MockTokenService implements Pick<ITokenService, 'get'> {
  constructor(private readonly payload: MockPayload | null = null) {}
  get(): ITokenModel | null {
    return this.payload ?? null;
  }
}

describe('DelonSessionContextAdapter', () => {
  const projectionFixture = {
    workspaceId: 'ws-1',
    workspaceType: 'container' as const,
    roles: ['admin', 'member'],
    abilities: ['event:read', 'event:write'],
    modules: ['dashboard', 'events']
  };

  const orgWorkspaceFixture = {
    workspaceId: 'ws-org',
    workspaceType: 'organization' as const,
    roles: ['viewer'],
    abilities: ['event:read'],
    modules: ['dashboard']
  };

  const buildAdapter = (payload?: MockPayload): DelonSessionContextAdapter => {
    TestBed.configureTestingModule({
      providers: [DelonSessionContextAdapter, { provide: DA_SERVICE_TOKEN, useValue: new MockTokenService(payload) }]
    });
    return TestBed.inject(DelonSessionContextAdapter);
  };

  it('maps workspaceId, roles, abilities, modules, and uid', () => {
    const now = Date.now();
    const adapter = buildAdapter({
      token: 't',
      uid: 'acct-1',
      accountId: 'acct-1',
      accountType: 'user',
      workspaceId: 'ws-1',
      workspaceType: 'organization',
      roles: ['admin'],
      abilities: ['x'],
      modules: ['mod-a'],
      expired: now
    });

    expect(adapter.isAuthenticated).toBeTrue();
    expect(adapter.userId).toBe('acct-1');
    expect(adapter.accountId).toBe('acct-1');
    expect(adapter.accountType).toBe('user');
    expect(adapter.workspaceId).toBe('ws-1');
    expect(adapter.workspaceType).toBe('organization');
    expect(adapter.roles).toEqual(['admin']);
    expect(adapter.abilities).toEqual(['x']);
    expect(adapter.modules).toEqual(['mod-a']);
    expect(adapter.expiresAt?.getTime()).toBe(now);
    expect(adapter.isExpired()).toBeFalse();
  });

  it('TODO: maps projection-fed membership and enabled module payloads per workspace', () => {
    pending(
      'Load mocked projection fixture for workspace ws-1 roles/abilities/modules/workspaceType (organization vs container) and assert adapter output'
    );
    void projectionFixture;
    void orgWorkspaceFixture;
  });

  it('TODO: maps accountId/accountType from projection-fed Account data', () => {
    pending('Inject Account projection fixture and assert adapter.accountId/accountType are populated without any casts');
  });

  it('falls back to empty or null when token fields are missing', () => {
    const adapter = buildAdapter({ token: 't' });

    expect(adapter.userId).toBeNull();
    expect(adapter.workspaceId).toBeNull();
    expect(adapter.roles).toEqual([]);
    expect(adapter.abilities).toEqual([]);
    expect(adapter.modules).toEqual([]);
    expect(adapter.expiresAt).toBeUndefined();
  });

  it('treats null token as unauthenticated', () => {
    const adapter = buildAdapter(null);

    expect(adapter.isAuthenticated).toBeFalse();
    expect(adapter.userId).toBeNull();
    expect(adapter.workspaceId).toBeNull();
    expect(adapter.roles).toEqual([]);
    expect(adapter.abilities).toEqual([]);
  });
});

// END OF FILE
