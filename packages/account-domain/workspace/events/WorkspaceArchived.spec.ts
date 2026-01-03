import { WorkspaceArchivedEvent, WorkspaceArchivedData, WorkspaceStatus } from './WorkspaceArchived';
import { CausalityMetadata } from '@ng-events/core-engine';
import { WorkspaceId } from '../value-objects/WorkspaceId';

describe('WorkspaceArchivedEvent', () => {
  const validEventId = '550e8400-e29b-41d4-a716-446655440000';
  const validWorkspaceId = '550e8400-e29b-41d4-a716-446655440001' as WorkspaceId;
  const validTimestamp = '2024-01-01T00:00:00.000Z';

  const validMetadata: CausalityMetadata = {
    causedBy: 'event-123',
    causedByUser: 'user-456',
    causedByAction: 'workspace.archive',
    timestamp: validTimestamp,
    blueprintId: 'blueprint-789'
  };

  describe('create()', () => {
    it('should create event with valid parameters', () => {
      const event = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: {
          previousStatus: 'ready' as WorkspaceStatus,
          reason: 'User requested archive'
        },
        metadata: validMetadata
      });

      expect(event).toBeDefined();
      expect(event.getEvent().id).toBe(validEventId);
      expect(event.getEvent().aggregateId).toBe(validWorkspaceId);
      expect(event.getEvent().eventType).toBe('WorkspaceArchived');
      expect(event.getEvent().aggregateType).toBe('Workspace');
    });

    it('should create event without optional reason', () => {
      const event = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: {
          previousStatus: 'initializing' as WorkspaceStatus
        },
        metadata: validMetadata
      });

      expect(event.getEvent().data.reason).toBeUndefined();
    });

    it('should create event with each valid previous status', () => {
      const statuses: WorkspaceStatus[] = ['initializing', 'ready', 'restricted', 'archived'];

      statuses.forEach(previousStatus => {
        const event = WorkspaceArchivedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { previousStatus },
          metadata: validMetadata
        });

        expect(event.getEvent().data.previousStatus).toBe(previousStatus);
      });
    });

    it('should throw error if event id is missing', () => {
      expect(() => {
        WorkspaceArchivedEvent.create({
          id: '',
          aggregateId: validWorkspaceId,
          data: { previousStatus: 'ready' },
          metadata: validMetadata
        });
      }).toThrow('Event id is required');
    });

    it('should throw error if aggregate id is missing', () => {
      expect(() => {
        WorkspaceArchivedEvent.create({
          id: validEventId,
          aggregateId: '' as WorkspaceId,
          data: { previousStatus: 'ready' },
          metadata: validMetadata
        });
      }).toThrow('Aggregate id is required');
    });

    it('should throw error if previous status is invalid', () => {
      expect(() => {
        WorkspaceArchivedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { previousStatus: 'invalid' as WorkspaceStatus },
          metadata: validMetadata
        });
      }).toThrow('Invalid previous status: invalid');
    });

    it('should throw error if causedBy is missing', () => {
      expect(() => {
        WorkspaceArchivedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { previousStatus: 'ready' },
          metadata: { ...validMetadata, causedBy: '' }
        });
      }).toThrow('Causality metadata causedBy is required');
    });

    it('should throw error if causedByUser is missing', () => {
      expect(() => {
        WorkspaceArchivedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { previousStatus: 'ready' },
          metadata: { ...validMetadata, causedByUser: '' }
        });
      }).toThrow('Causality metadata causedByUser is required');
    });

    it('should throw error if causedByAction is missing', () => {
      expect(() => {
        WorkspaceArchivedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { previousStatus: 'ready' },
          metadata: { ...validMetadata, causedByAction: '' }
        });
      }).toThrow('Causality metadata causedByAction is required');
    });

    it('should throw error if blueprintId is missing', () => {
      expect(() => {
        WorkspaceArchivedEvent.create({
          id: validEventId,
          aggregateId: validWorkspaceId,
          data: { previousStatus: 'ready' },
          metadata: { ...validMetadata, blueprintId: '' }
        });
      }).toThrow('Causality metadata blueprintId is required');
    });
  });

  describe('toData()', () => {
    it('should serialize event to plain object', () => {
      const event = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: {
          previousStatus: 'ready',
          reason: 'User requested'
        },
        metadata: validMetadata
      });

      const data = event.toData();

      expect(data.id).toBe(validEventId);
      expect(data.aggregateId).toBe(validWorkspaceId);
      expect(data.eventType).toBe('WorkspaceArchived');
      expect(data.aggregateType).toBe('Workspace');
      expect(data.version).toBe(1);
      expect(data.data.previousStatus).toBe('ready');
      expect(data.data.reason).toBe('User requested');
      expect(data.metadata.causedBy).toBe('event-123');
      expect(data.metadata.causedByUser).toBe('user-456');
      expect(data.metadata.causedByAction).toBe('workspace.archive');
      expect(data.metadata.timestamp).toBe(validTimestamp);
      expect(data.metadata.blueprintId).toBe('blueprint-789');
    });

    it('should serialize event without optional reason', () => {
      const event = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { previousStatus: 'initializing' },
        metadata: validMetadata
      });

      const data = event.toData();
      expect(data.data.reason).toBeUndefined();
    });

    it('should include optional correlationId if present', () => {
      const metadataWithCorrelation = {
        ...validMetadata,
        correlationId: 'corr-abc'
      };

      const event = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { previousStatus: 'ready' },
        metadata: metadataWithCorrelation
      });

      const data = event.toData();
      expect(data.metadata.correlationId).toBe('corr-abc');
    });
  });

  describe('fromData()', () => {
    it('should deserialize event from plain object', () => {
      const data: WorkspaceArchivedData = {
        id: validEventId,
        aggregateId: validWorkspaceId,
        eventType: 'WorkspaceArchived',
        aggregateType: 'Workspace',
        version: 1,
        data: {
          previousStatus: 'ready',
          reason: 'Archive requested'
        },
        metadata: {
          causedBy: 'event-123',
          causedByUser: 'user-456',
          causedByAction: 'workspace.archive',
          timestamp: validTimestamp,
          blueprintId: 'blueprint-789'
        }
      };

      const event = WorkspaceArchivedEvent.fromData(data);

      expect(event.getEvent().id).toBe(validEventId);
      expect(event.getEvent().aggregateId).toBe(validWorkspaceId);
      expect(event.getEvent().data.previousStatus).toBe('ready');
      expect(event.getEvent().data.reason).toBe('Archive requested');
      expect(event.getEvent().metadata.causedBy).toBe('event-123');
    });

    it('should deserialize event without optional reason', () => {
      const data: WorkspaceArchivedData = {
        id: validEventId,
        aggregateId: validWorkspaceId,
        eventType: 'WorkspaceArchived',
        aggregateType: 'Workspace',
        version: 1,
        data: {
          previousStatus: 'initializing'
        },
        metadata: {
          causedBy: 'event-123',
          causedByUser: 'user-456',
          causedByAction: 'workspace.archive',
          timestamp: validTimestamp,
          blueprintId: 'blueprint-789'
        }
      };

      const event = WorkspaceArchivedEvent.fromData(data);
      expect(event.getEvent().data.reason).toBeUndefined();
    });

    it('should throw error if event id is missing in data', () => {
      const invalidData = {
        id: '',
        aggregateId: validWorkspaceId,
        eventType: 'WorkspaceArchived',
        aggregateType: 'Workspace',
        version: 1,
        data: { previousStatus: 'ready' as WorkspaceStatus },
        metadata: {
          causedBy: 'event-123',
          causedByUser: 'user-456',
          causedByAction: 'workspace.archive',
          timestamp: validTimestamp,
          blueprintId: 'blueprint-789'
        }
      };

      expect(() => {
        WorkspaceArchivedEvent.fromData(invalidData);
      }).toThrow('Event id is required in data');
    });

    it('should throw error if event type is incorrect', () => {
      const invalidData = {
        id: validEventId,
        aggregateId: validWorkspaceId,
        eventType: 'WrongEventType',
        aggregateType: 'Workspace',
        version: 1,
        data: { previousStatus: 'ready' as WorkspaceStatus },
        metadata: {
          causedBy: 'event-123',
          causedByUser: 'user-456',
          causedByAction: 'workspace.archive',
          timestamp: validTimestamp,
          blueprintId: 'blueprint-789'
        }
      };

      expect(() => {
        WorkspaceArchivedEvent.fromData(invalidData);
      }).toThrow('Invalid event type: WrongEventType');
    });

    it('should throw error if aggregate type is incorrect', () => {
      const invalidData = {
        id: validEventId,
        aggregateId: validWorkspaceId,
        eventType: 'WorkspaceArchived',
        aggregateType: 'WrongAggregate',
        version: 1,
        data: { previousStatus: 'ready' as WorkspaceStatus },
        metadata: {
          causedBy: 'event-123',
          causedByUser: 'user-456',
          causedByAction: 'workspace.archive',
          timestamp: validTimestamp,
          blueprintId: 'blueprint-789'
        }
      };

      expect(() => {
        WorkspaceArchivedEvent.fromData(invalidData);
      }).toThrow('Invalid aggregate type: WrongAggregate');
    });
  });

  describe('Round-trip serialization', () => {
    it('should preserve all data through create → toData → fromData', () => {
      const originalEvent = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: {
          previousStatus: 'restricted',
          reason: 'Compliance violation'
        },
        metadata: { ...validMetadata, correlationId: 'corr-def' }
      });

      const serialized = originalEvent.toData();
      const deserialized = WorkspaceArchivedEvent.fromData(serialized);

      expect(deserialized.getEvent().id).toBe(originalEvent.getEvent().id);
      expect(deserialized.getEvent().aggregateId).toBe(originalEvent.getEvent().aggregateId);
      expect(deserialized.getEvent().data.previousStatus).toBe(originalEvent.getEvent().data.previousStatus);
      expect(deserialized.getEvent().data.reason).toBe(originalEvent.getEvent().data.reason);
      expect(deserialized.getEvent().metadata.causedBy).toBe(originalEvent.getEvent().metadata.causedBy);
      expect(deserialized.getEvent().metadata.correlationId).toBe(originalEvent.getEvent().metadata.correlationId);
    });

    it('should preserve data even without optional fields', () => {
      const originalEvent = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { previousStatus: 'initializing' },
        metadata: validMetadata
      });

      const serialized = originalEvent.toData();
      const deserialized = WorkspaceArchivedEvent.fromData(serialized);

      expect(deserialized.getEvent().data.reason).toBe(originalEvent.getEvent().data.reason);
      expect(deserialized.getEvent().metadata.correlationId).toBe(originalEvent.getEvent().metadata.correlationId);
    });
  });

  describe('equals()', () => {
    it('should return true for events with same id', () => {
      const event1 = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { previousStatus: 'ready' },
        metadata: validMetadata
      });

      const event2 = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { previousStatus: 'ready' },
        metadata: validMetadata
      });

      expect(event1.equals(event2)).toBe(true);
    });

    it('should return false for events with different ids', () => {
      const event1 = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { previousStatus: 'ready' },
        metadata: validMetadata
      });

      const event2 = WorkspaceArchivedEvent.create({
        id: '550e8400-e29b-41d4-a716-446655440099',
        aggregateId: validWorkspaceId,
        data: { previousStatus: 'ready' },
        metadata: validMetadata
      });

      expect(event1.equals(event2)).toBe(false);
    });

    it('should return false for null', () => {
      const event = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { previousStatus: 'ready' },
        metadata: validMetadata
      });

      expect(event.equals(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const event = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: { previousStatus: 'ready' },
        metadata: validMetadata
      });

      expect(event.equals(undefined)).toBe(false);
    });
  });

  describe('getVersion()', () => {
    it('should return event version 1', () => {
      expect(WorkspaceArchivedEvent.getVersion()).toBe(1);
    });
  });

  describe('getEvent()', () => {
    it('should return the underlying event object', () => {
      const event = WorkspaceArchivedEvent.create({
        id: validEventId,
        aggregateId: validWorkspaceId,
        data: {
          previousStatus: 'ready',
          reason: 'User requested'
        },
        metadata: validMetadata
      });

      const underlyingEvent = event.getEvent();

      expect(underlyingEvent.id).toBe(validEventId);
      expect(underlyingEvent.aggregateId).toBe(validWorkspaceId);
      expect(underlyingEvent.eventType).toBe('WorkspaceArchived');
      expect(underlyingEvent.aggregateType).toBe('Workspace');
      expect(underlyingEvent.data.previousStatus).toBe('ready');
      expect(underlyingEvent.data.reason).toBe('User requested');
      expect(underlyingEvent.metadata.causedBy).toBe('event-123');
    });
  });
});

// END OF FILE
