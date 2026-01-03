import { WorkspaceIdVO } from './WorkspaceId';

describe('WorkspaceIdVO', () => {
  describe('create', () => {
    it('should create a valid WorkspaceId with UUID format', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const workspaceId = WorkspaceIdVO.create(validUuid);
      
      expect(workspaceId).toBeDefined();
      expect(workspaceId.getValue()).toBe(validUuid);
    });

    it('should throw error for invalid UUID format', () => {
      const invalidUuids = [
        'not-a-uuid',
        '123',
        '',
        'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // wrong format
        '123e4567-e89b-12d3-a456', // too short
        '123e4567-e89b-12d3-a456-426614174000-extra' // too long
      ];

      invalidUuids.forEach(invalid => {
        expect(() => WorkspaceIdVO.create(invalid)).toThrow('Invalid WorkspaceId format');
      });
    });

    it('should be case-insensitive for UUID validation', () => {
      const upperCaseUuid = '123E4567-E89B-12D3-A456-426614174000';
      const lowerCaseUuid = '123e4567-e89b-12d3-a456-426614174000';
      
      expect(() => WorkspaceIdVO.create(upperCaseUuid)).not.toThrow();
      expect(() => WorkspaceIdVO.create(lowerCaseUuid)).not.toThrow();
    });
  });

  describe('validate', () => {
    it('should return true for valid UUID', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(WorkspaceIdVO.validate(validUuid)).toBe(true);
    });

    it('should return false for invalid UUID', () => {
      expect(WorkspaceIdVO.validate('not-a-uuid')).toBe(false);
      expect(WorkspaceIdVO.validate('')).toBe(false);
      expect(WorkspaceIdVO.validate('123')).toBe(false);
    });
  });

  describe('getValue', () => {
    it('should return the original value', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const workspaceId = WorkspaceIdVO.create(uuid);
      
      expect(workspaceId.getValue()).toBe(uuid);
    });
  });

  describe('equals', () => {
    it('should return true for equal WorkspaceIds', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const id1 = WorkspaceIdVO.create(uuid);
      const id2 = WorkspaceIdVO.create(uuid);
      
      expect(id1.equals(id2)).toBe(true);
    });

    it('should return false for different WorkspaceIds', () => {
      const id1 = WorkspaceIdVO.create('123e4567-e89b-12d3-a456-426614174000');
      const id2 = WorkspaceIdVO.create('223e4567-e89b-12d3-a456-426614174000');
      
      expect(id1.equals(id2)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      const id = WorkspaceIdVO.create('123e4567-e89b-12d3-a456-426614174000');
      
      expect(id.equals(null as any)).toBe(false);
      expect(id.equals(undefined as any)).toBe(false);
    });

    it('should return false for non-WorkspaceIdVO objects', () => {
      const id = WorkspaceIdVO.create('123e4567-e89b-12d3-a456-426614174000');
      
      expect(id.equals({} as any)).toBe(false);
      expect(id.equals({ value: id.getValue() } as any)).toBe(false);
    });
  });
});

// END OF FILE
