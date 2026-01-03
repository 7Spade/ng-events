import { WorkspaceRoleVO, WorkspaceRole } from './WorkspaceRole';

describe('WorkspaceRoleVO', () => {
  describe('create', () => {
    it('should create valid WorkspaceRole for all allowed values', () => {
      const validRoles: WorkspaceRole[] = ['Owner', 'Admin', 'Member', 'Viewer'];
      
      validRoles.forEach(role => {
        const roleVO = WorkspaceRoleVO.create(role);
        expect(roleVO).toBeDefined();
        expect(roleVO.getValue()).toBe(role);
      });
    });

    it('should throw error for invalid role', () => {
      const invalidRoles = [
        'InvalidRole',
        'owner', // lowercase
        'ADMIN', // uppercase
        'Manager',
        '',
        ' '
      ];

      invalidRoles.forEach(invalid => {
        expect(() => WorkspaceRoleVO.create(invalid)).toThrow('Invalid WorkspaceRole');
      });
    });
  });

  describe('validate', () => {
    it('should return true for valid roles', () => {
      expect(WorkspaceRoleVO.validate('Owner')).toBe(true);
      expect(WorkspaceRoleVO.validate('Admin')).toBe(true);
      expect(WorkspaceRoleVO.validate('Member')).toBe(true);
      expect(WorkspaceRoleVO.validate('Viewer')).toBe(true);
    });

    it('should return false for invalid roles', () => {
      expect(WorkspaceRoleVO.validate('InvalidRole')).toBe(false);
      expect(WorkspaceRoleVO.validate('owner')).toBe(false);
      expect(WorkspaceRoleVO.validate('')).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the original role value', () => {
      const role = 'Admin';
      const roleVO = WorkspaceRoleVO.create(role);
      
      expect(roleVO.getValue()).toBe(role);
    });
  });

  describe('equals', () => {
    it('should return true for equal roles', () => {
      const role1 = WorkspaceRoleVO.create('Admin');
      const role2 = WorkspaceRoleVO.create('Admin');
      
      expect(role1.equals(role2)).toBe(true);
    });

    it('should return false for different roles', () => {
      const role1 = WorkspaceRoleVO.create('Owner');
      const role2 = WorkspaceRoleVO.create('Member');
      
      expect(role1.equals(role2)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      const role = WorkspaceRoleVO.create('Admin');
      
      expect(role.equals(null as any)).toBe(false);
      expect(role.equals(undefined as any)).toBe(false);
    });

    it('should return false for non-WorkspaceRoleVO objects', () => {
      const role = WorkspaceRoleVO.create('Admin');
      
      expect(role.equals({} as any)).toBe(false);
      expect(role.equals({ value: 'Admin' } as any)).toBe(false);
    });
  });

  describe('hasHigherOrEqualPermission', () => {
    it('should return true when role has higher permission', () => {
      const owner = WorkspaceRoleVO.create('Owner');
      const admin = WorkspaceRoleVO.create('Admin');
      const member = WorkspaceRoleVO.create('Member');
      const viewer = WorkspaceRoleVO.create('Viewer');
      
      expect(owner.hasHigherOrEqualPermission(admin)).toBe(true);
      expect(owner.hasHigherOrEqualPermission(member)).toBe(true);
      expect(owner.hasHigherOrEqualPermission(viewer)).toBe(true);
      expect(admin.hasHigherOrEqualPermission(member)).toBe(true);
      expect(admin.hasHigherOrEqualPermission(viewer)).toBe(true);
      expect(member.hasHigherOrEqualPermission(viewer)).toBe(true);
    });

    it('should return true when role has equal permission', () => {
      const owner1 = WorkspaceRoleVO.create('Owner');
      const owner2 = WorkspaceRoleVO.create('Owner');
      const admin1 = WorkspaceRoleVO.create('Admin');
      const admin2 = WorkspaceRoleVO.create('Admin');
      
      expect(owner1.hasHigherOrEqualPermission(owner2)).toBe(true);
      expect(admin1.hasHigherOrEqualPermission(admin2)).toBe(true);
    });

    it('should return false when role has lower permission', () => {
      const owner = WorkspaceRoleVO.create('Owner');
      const admin = WorkspaceRoleVO.create('Admin');
      const member = WorkspaceRoleVO.create('Member');
      const viewer = WorkspaceRoleVO.create('Viewer');
      
      expect(viewer.hasHigherOrEqualPermission(member)).toBe(false);
      expect(viewer.hasHigherOrEqualPermission(admin)).toBe(false);
      expect(viewer.hasHigherOrEqualPermission(owner)).toBe(false);
      expect(member.hasHigherOrEqualPermission(admin)).toBe(false);
      expect(member.hasHigherOrEqualPermission(owner)).toBe(false);
      expect(admin.hasHigherOrEqualPermission(owner)).toBe(false);
    });
  });
});

// END OF FILE
