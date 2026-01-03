import { WorkspaceCreatedEvent, WorkspaceCreatedData, WorkspaceStatus } from './WorkspaceCreated';
import { CausalityMetadata } from '@ng-events/core-engine';
import { WorkspaceId } from '../value-objects/WorkspaceId';
import { AccountId } from '../../account/value-objects/AccountId';

describe('WorkspaceCreatedEvent', () => {
  const validEventId = '550e8400-e29b-41d4-a716-446655440000';
  const validWorkspaceId = '550e8400-e29b-41d4-a716-446655440001' as WorkspaceId;
  const validAccountId = '550e8400-e29b-41d4-a716-446655440002' as AccountId;
  const validTimestamp = '2024-01-01T00:00:00.000Z';

  const validMetadata: CausalityMetadata = {
    causedBy: 'system',
    causedByUser: 'user-123',
    causedByAction: 'workspace.create',
    timestamp: validTimestamp,
    blueprintId: 'blueprint-456'
  };

  describe('create()', () => {
    it('should create event with valid parameters', () => {
      const event = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: {
          accountId: validAccountId,
          status: 'initializing' as WorkspaceStatus
        },
        metadata: validMetadata
      });

      expect(event).toBeDefined();
      expect(event.getEvent().id).toBe(validEventId);
      expect(event.getEvent().aggregateId).toBe(validWorkspaceId);
      expect(event.getEvent().eventType).toBe('WorkspaceCreated');
      expect(event.getEvent().aggregateType).toBe('Workspace');
    });

    it('should create event with each valid status', () => {
      const statuses: WorkspaceStatus[] = ['initializing', 'ready', 'restricted', 'archived'];

      statuses.forEach(status => {
        const event = WorkspaceCreatedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { accountId: validAccountId, status },
          metadata: validMetadata
        });

        expect(event.getEvent().data.status).toBe(status);
      });
    });

    it('should throw error if event id is missing', () => {
      expect(() => {
        WorkspaceCreatedEvent.create({
          id: '',
          aggregateId: validWorkspaceId,
          data: { accountId: validAccountId, status: 'initializing' },
          metadata: validMetadata
        });
      }).toThrow('Event id is required');
    });

    it('should throw error if aggregate id is missing', () => {
      expect(() => {
        WorkspaceCreatedEvent.create({
          id: validEventId,
          aggregateId: '' as WorkspaceId,
          data: { accountId: validAccountId, status: 'initializing' },
          metadata: validMetadata
        });
      }).toThrow('Aggregate id is required');
    });

    it('should throw error if account id is missing', () => {
      expect(() => {
        WorkspaceCreatedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { accountId: '' as AccountId, status: 'initializing' },
          metadata: validMetadata
        });
      }).toThrow('Account id is required in payload');
    });

    it('should throw error if status is invalid', () => {
      expect(() => {
        WorkspaceCreatedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { accountId: validAccountId, status: 'invalid' as WorkspaceStatus },
          metadata: validMetadata
        });
      }).toThrow('Invalid status: invalid');
    });

    it('should throw error if causedBy is missing', () => {
      expect(() => {
        WorkspaceCreatedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { accountId: validAccountId, status: 'initializing' },
          metadata: { ...validMetadata, causedBy: '' }
        });
      }).toThrow('Causality metadata causedBy is required');
    });

    it('should throw error if causedByUser is missing', () => {
      expect(() => {
        WorkspaceCreatedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { accountId: validAccountId, status: 'initializing' },
          metadata: { ...validMetadata, causedByUser: '' }
        });
      }).toThrow('Causality metadata causedByUser is required');
    });

    it('should throw error if causedByAction is missing', () => {
      expect(() => {
        WorkspaceCreatedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { accountId: validAccountId, status: 'initializing' },
          metadata: { ...validMetadata, causedByAction: '' }
        });
      }).toThrow('Causality metadata causedByAction is required');
    });

    it('should throw error if blueprintId is missing', () => {
      expect(() => {
        WorkspaceCreatedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { accountId: validAccountId, status: 'initializing' },
          metadata: { ...validMetadata, blueprintId: '' }
        });
      }).toThrow('Causality metadata blueprintId is required');
    });
  });

  describe('toData()', () => {
    it('should serialize event to plain object', () => {
      const event = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'initializing' },
        metadata: validMetadata
      });

      const data = event.toData();

      expect(data.id).toBe(validEventId);
      expect(data.aggregateId).toBe(validWorkspaceId);
      expect(data.eventType).toBe('WorkspaceCreated');
      expect(data.aggregateType).toBe('Workspace');
      expect(data.version).toBe(1);
      expect(data.data.accountId).toBe(validAccountId);
      expect(data.data.status).toBe('initializing');
      expect(data.metadata.causedBy).toBe('system');
      expect(data.metadata.causedByUser).toBe('user-123');
      expect(data.metadata.causedByAction).toBe('workspace.create');
      expect(data.metadata.timestamp).toBe(validTimestamp);
      expect(data.metadata.blueprintId).toBe('blueprint-456');
    });

    it('should include optional correlationId if present', () => {
      const metadataWithCorrelation = {
        ...validMetadata,
        correlationId: 'corr-789'
      };

      const event = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'initializing' },
        metadata: metadataWithCorrelation
      });

      const data = event.toData();
      expect(data.metadata.correlationId).toBe('corr-789');
    });
  });

  describe('fromData()', () => {
    it('should deserialize event from plain object', () => {
      const data: WorkspaceCreatedData = {
        id: validEventId,
        aggregateId: validWorkspaceId,
        eventType: 'WorkspaceCreated',
        aggregateType: 'Workspace',
        version: 1,
        data: {
          accountId: validAccountId,
          status: 'initializing'
        },
        metadata: {
          causedBy: 'system',
          causedByUser: 'user-123',
          causedByAction: 'workspace.create',
          timestamp: validTimestamp,
          blueprintId: 'blueprint-456'
        }
      };

      const event = WorkspaceCreatedEvent.fromData(data);

      expect(event.getEvent().id).toBe(validEventId);
      expect(event.getEvent().aggregateId).toBe(validWorkspaceId);
      expect(event.getEvent().data.accountId).toBe(validAccountId);
      expect(event.getEvent().data.status).toBe('initializing');
      expect(event.getEvent().metadata.causedBy).toBe('system');
    });

    it('should throw error if event id is missing in data', () => {
      const invalidData = {
        id: '',
        aggregateId: validWorkspaceId,
        eventType: 'WorkspaceCreated',
        aggregateType: 'Workspace',
        version: 1,
        data: { accountId: validAccountId, status: 'initializing' as WorkspaceStatus },
        metadata: {
          causedBy: 'system',
          causedByUser: 'user-123',
          causedByAction: 'workspace.create',
          timestamp: validTimestamp,
          blueprintId: 'blueprint-456'
        }
      };

      expect(() => {
        WorkspaceCreatedEvent.fromData(invalidData);
      }).toThrow('Event id is required in data');
    });

    it('should throw error if event type is incorrect', () => {
      const invalidData = {
        id: validEventId,
        aggregateId: validWorkspaceId,
        eventType: 'WrongEventType',
        aggregateType: 'Workspace',
        version: 1,
        data: { accountId: validAccountId, status: 'initializing' as WorkspaceStatus },
        metadata: {
          causedBy: 'system',
          causedByUser: 'user-123',
          causedByAction: 'workspace.create',
          timestamp: validTimestamp,
          blueprintId: 'blueprint-456'
        }
      };

      expect(() => {
        WorkspaceCreatedEvent.fromData(invalidData);
      }).toThrow('Invalid event type: WrongEventType');
    });

    it('should throw error if aggregate type is incorrect', () => {
      const invalidData = {
        id: validEventId,
        aggregateId: validWorkspaceId,
        eventType: 'WorkspaceCreated',
        aggregateType: 'WrongAggregate',
        version: 1,
        data: { accountId: validAccountId, status: 'initializing' as WorkspaceStatus },
        metadata: {
          causedBy: 'system',
          causedByUser: 'user-123',
          causedByAction: 'workspace.create',
          timestamp: validTimestamp,
          blueprintId: 'blueprint-456'
        }
      };

      expect(() => {
        WorkspaceCreatedEvent.fromData(invalidData);
      }).toThrow('Invalid aggregate type: WrongAggregate');
    });
  });

  describe('Round-trip serialization', () => {
    it('should preserve all data through create → toData → fromData', () => {
      const originalEvent = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'ready' },
        metadata: { ...validMetadata, correlationId: 'corr-xyz' }
      });

      const serialized = originalEvent.toData();
      const deserialized = WorkspaceCreatedEvent.fromData(serialized);

      expect(deserialized.getEvent().id).toBe(originalEvent.getEvent().id);
      expect(deserialized.getEvent().aggregateId).toBe(originalEvent.getEvent().aggregateId);
      expect(deserialized.getEvent().data.accountId).toBe(originalEvent.getEvent().data.accountId);
      expect(deserialized.getEvent().data.status).toBe(originalEvent.getEvent().data.status);
      expect(deserialized.getEvent().metadata.causedBy).toBe(originalEvent.getEvent().metadata.causedBy);
      expect(deserialized.getEvent().metadata.correlationId).toBe(originalEvent.getEvent().metadata.correlationId);
    });
  });

  describe('equals()', () => {
    it('should return true for events with same id', () => {
      const event1 = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'initializing' },
        metadata: validMetadata
      });

      const event2 = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'initializing' },
        metadata: validMetadata
      });

      expect(event1.equals(event2)).toBe(true);
    });

    it('should return false for events with different ids', () => {
      const event1 = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'initializing' },
        metadata: validMetadata
      });

      const event2 = WorkspaceCreatedEvent.create({
        id: '550e8400-e29b-41d4-a716-446655440099',
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'initializing' },
        metadata: validMetadata
      });

      expect(event1.equals(event2)).toBe(false);
    });

    it('should return false for null', () => {
      const event = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'initializing' },
        metadata: validMetadata
      });

      expect(event.equals(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const event = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'initializing' },
        metadata: validMetadata
      });

      expect(event.equals(undefined)).toBe(false);
    });
  });

  describe('getVersion()', () => {
    it('should return event version 1', () => {
      expect(WorkspaceCreatedEvent.getVersion()).toBe(1);
    });
  });

  describe('getEvent()', () => {
    it('should return the underlying event object', () => {
      const event = WorkspaceCreatedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { accountId: validAccountId, status: 'initializing' },
        metadata: validMetadata
      });

      const underlyingEvent = event.getEvent();

      expect(underlyingEvent.id).toBe(validEventId);
      expect(underlyingEvent.aggregateId).toBe(validWorkspaceId);
      expect(underlyingEvent.eventType).toBe('WorkspaceCreated');
      expect(underlyingEvent.aggregateType).toBe('Workspace');
      expect(underlyingEvent.data.accountId).toBe(validAccountId);
      expect(underlyingEvent.metadata.causedBy).toBe('system');
    });
  });
});

// END OF FILE
