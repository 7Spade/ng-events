import { TestBed } from '@angular/core/testing';

import { StartupService } from './startup.service';

describe('StartupService Phase 3 ACL refresh (scaffold)', () => {
  it('TODO: should refresh ACL roles/abilities on auth change using SessionContext data', () => {
    pending('Provide membership projection-fed SessionContext and assert setRole/setAbility calls');
  });

  it('TODO: should refresh ACL on workspaceId switch (external source)', () => {
    pending(
      'Emit workspace change event (workspaceType container) and verify ACL update without using setFull(); organization type should not emit future Event Sourcing hooks'
    );
  });

  it('TODO: should ignore modules[] for ACL but keep mapping available for guard assertions', () => {
    pending('Ensure refreshAclFromSession only sets roles/abilities while modules remain in SessionContext for guards');
  });

  it('TODO: should refresh ACL when accountId/accountType changes', () => {
    pending('Emit account change and ensure refreshAclFromSession re-applies roles/abilities without setFull()');
  });
});

// END OF FILE
