/**
 * WorkspaceProjectionBuilder Tests
 * 
 * Tests projection building from Workspace domain events.
 * Validates:
 * - Event handling and dispatching
 * - Projection creation and updates
 * - Idempotency of projection updates
 * - Firestore integration
 */

import { WorkspaceProjectionBuilder, WorkspaceProjectionSchema } from './WorkspaceProjectionBuilder';
import type { DomainEvent } from '@ng-events/core-engine/projection';

describe('WorkspaceProjectionBuilder', () => {
  let builder: WorkspaceProjectionBuilder;
  let mockFirestore: any;
  let mockDoc: jest.Mock;
  let mockSetDoc: jest.Mock;

  beforeEach(() => {
    // Mock Firestore
    mockSetDoc = jest.fn().mockResolvedValue(undefined);
    mockDoc = jest.fn().mockReturnValue({ id: 'mock-doc-ref' });

    mockFirestore = {
      collection: jest.fn(),
      doc: mockDoc,
    };

    // Mock firebase/firestore module
    jest.mock('firebase/firestore', () => ({
      doc: mockDoc,
      setDoc: mockSetDoc,
    }));

    builder = new WorkspaceProjectionBuilder(mockFirestore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('Constructor_ValidFirestore_CreatesInstance', () => {
      expect(builder).toBeInstanceOf(WorkspaceProjectionBuilder);
    });

    it('Constructor_NullFirestore_ThrowsError', () => {
      expect(() => new WorkspaceProjectionBuilder(null as any)).toThrow(
        'Firestore instance is required'
      );
    });

    it('Constructor_UndefinedFirestore_ThrowsError', () => {
      expect(() => new WorkspaceProjectionBuilder(undefined as any)).toThrow(
        'Firestore instance is required'
      );
    });
  });

  describe('handleEvent - Event Dispatching', () => {
    it('HandleEvent_WorkspaceCreatedEvent_CallsHandleWorkspaceCreated', async () => {
      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-456',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
          causedBy: 'system',
          causedByUser: 'user-1',
          causedByAction: 'workspace.create',
          blueprintId: 'acc-456',
        },
      };

      await builder.handleEvent(event);

      // Verify setDoc was called (projection created)
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('HandleEvent_WorkspaceArchivedEvent_CallsHandleWorkspaceArchived', async () => {
      const event: DomainEvent = {
        id: 'evt-124',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceArchived',
        data: {
          previousStatus: 'ready',
          reason: 'User request',
        },
        metadata: {
          timestamp: '2024-01-02T00:00:00.000Z',
          causedBy: 'evt-123',
          causedByUser: 'user-1',
          causedByAction: 'workspace.archive',
          blueprintId: 'acc-456',
        },
      };

      await builder.handleEvent(event);

      // Verify setDoc was called (projection updated)
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('HandleEvent_UnknownEventType_IgnoresEvent', async () => {
      const event: DomainEvent = {
        id: 'evt-999',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'UnknownEvent',
        data: {},
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      // Verify setDoc was NOT called
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('HandleEvent_NullEvent_LogsWarning', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await builder.handleEvent(null as any);

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('HandleEvent_EventWithoutEventType_LogsWarning', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const event = {
        id: 'evt-123',
        aggregateId: 'ws-123',
      } as any;

      await builder.handleEvent(event);

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('handleWorkspaceCreated - Projection Creation', () => {
    it('HandleWorkspaceCreated_ValidEvent_CreatesProjection', async () => {
      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-456',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
          causedBy: 'system',
          causedByUser: 'user-1',
          causedByAction: 'workspace.create',
          blueprintId: 'acc-456',
        },
      };

      await builder.handleEvent(event);

      // Verify projection schema
      const expectedProjection: WorkspaceProjectionSchema = {
        id: 'ws-123',
        ownerId: 'acc-456',
        status: 'ready',
        createdAt: '2024-01-01T00:00:00.000Z',
        version: 1,
        lastEventAt: '2024-01-01T00:00:00.000Z',
      };

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expectedProjection,
        { merge: true }
      );
    });

    it('HandleWorkspaceCreated_InitializingStatus_CreatesProjection', async () => {
      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-456',
          status: 'initializing',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'initializing',
        }),
        { merge: true }
      );
    });

    it('HandleWorkspaceCreated_MissingAggregateId_LogsError', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: '',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-456',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('HandleWorkspaceCreated_MissingAccountId_LogsError', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('HandleWorkspaceCreated_MissingStatus_LogsError', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-456',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleWorkspaceArchived - Projection Update', () => {
    it('HandleWorkspaceArchived_ValidEvent_UpdatesProjection', async () => {
      const event: DomainEvent = {
        id: 'evt-124',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceArchived',
        data: {
          previousStatus: 'ready',
          reason: 'User request',
        },
        metadata: {
          timestamp: '2024-01-02T00:00:00.000Z',
          causedBy: 'evt-123',
          causedByUser: 'user-1',
          causedByAction: 'workspace.archive',
          blueprintId: 'acc-456',
        },
      };

      await builder.handleEvent(event);

      // Verify update payload
      const expectedUpdate: Partial<WorkspaceProjectionSchema> = {
        status: 'archived',
        archivedAt: '2024-01-02T00:00:00.000Z',
        lastEventAt: '2024-01-02T00:00:00.000Z',
      };

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expectedUpdate,
        { merge: true }
      );
    });

    it('HandleWorkspaceArchived_MissingAggregateId_LogsError', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const event: DomainEvent = {
        id: 'evt-124',
        aggregateId: '',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceArchived',
        data: {
          previousStatus: 'ready',
        },
        metadata: {
          timestamp: '2024-01-02T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Idempotency', () => {
    it('Idempotency_SameEventTwice_ProducesSameProjection', async () => {
      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-456',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      // Execute twice
      await builder.handleEvent(event);
      await builder.handleEvent(event);

      // Both calls should produce identical projection
      expect(mockSetDoc).toHaveBeenCalledTimes(2);

      const firstCall = mockSetDoc.mock.calls[0];
      const secondCall = mockSetDoc.mock.calls[1];

      // Compare projection payloads (second argument)
      expect(firstCall[1]).toEqual(secondCall[1]);
    });

    it('Idempotency_UsesMergeTrue_ForSafeReplay', async () => {
      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-456',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      // Verify merge:true is used
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        { merge: true }
      );
    });
  });

  describe('rebuild - Event Replay', () => {
    it('Rebuild_EmptyEventStream_CompletesSuccessfully', async () => {
      await expect(builder.rebuild('ws-123', [])).resolves.toBeUndefined();
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    it('Rebuild_SingleEvent_ReplaysEvent', async () => {
      const events: DomainEvent[] = [
        {
          id: 'evt-123',
          aggregateId: 'ws-123',
          aggregateType: 'Workspace',
          eventType: 'WorkspaceCreated',
          data: {
            accountId: 'acc-456',
            status: 'ready',
          },
          metadata: {
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
      ];

      await builder.rebuild('ws-123', events);

      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('Rebuild_MultipleEvents_ReplaysInOrder', async () => {
      const events: DomainEvent[] = [
        {
          id: 'evt-123',
          aggregateId: 'ws-123',
          aggregateType: 'Workspace',
          eventType: 'WorkspaceCreated',
          data: {
            accountId: 'acc-456',
            status: 'ready',
          },
          metadata: {
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
        {
          id: 'evt-124',
          aggregateId: 'ws-123',
          aggregateType: 'Workspace',
          eventType: 'WorkspaceArchived',
          data: {
            previousStatus: 'ready',
          },
          metadata: {
            timestamp: '2024-01-02T00:00:00.000Z',
          },
        },
      ];

      await builder.rebuild('ws-123', events);

      expect(mockSetDoc).toHaveBeenCalledTimes(2);
    });

    it('Rebuild_UnorderedEvents_SortsBeforeReplay', async () => {
      const events: DomainEvent[] = [
        {
          id: 'evt-124',
          aggregateId: 'ws-123',
          aggregateType: 'Workspace',
          eventType: 'WorkspaceArchived',
          data: {
            previousStatus: 'ready',
          },
          metadata: {
            timestamp: '2024-01-02T00:00:00.000Z',
          },
        },
        {
          id: 'evt-123',
          aggregateId: 'ws-123',
          aggregateType: 'Workspace',
          eventType: 'WorkspaceCreated',
          data: {
            accountId: 'acc-456',
            status: 'ready',
          },
          metadata: {
            timestamp: '2024-01-01T00:00:00.000Z',
          },
        },
      ];

      await builder.rebuild('ws-123', events);

      // First call should be WorkspaceCreated (earlier timestamp)
      const firstCallProjection = mockSetDoc.mock.calls[0][1];
      expect(firstCallProjection.status).toBe('ready');
      expect(firstCallProjection.version).toBe(1);

      // Second call should be WorkspaceArchived (later timestamp)
      const secondCallProjection = mockSetDoc.mock.calls[1][1];
      expect(secondCallProjection.status).toBe('archived');
    });

    it('Rebuild_MissingAggregateId_ThrowsError', async () => {
      await expect(builder.rebuild('', [])).rejects.toThrow(
        'Aggregate ID is required for rebuild'
      );
    });

    it('Rebuild_NullEvents_ThrowsError', async () => {
      await expect(builder.rebuild('ws-123', null as any)).rejects.toThrow(
        'Events must be an array'
      );
    });
  });

  describe('Firestore Integration', () => {
    it('FirestoreIntegration_UsesCorrectCollectionPath', async () => {
      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-456',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      // Verify doc() was called with correct path
      expect(mockDoc).toHaveBeenCalledWith(
        mockFirestore,
        'projections/workspace',
        'ws-123'
      );
    });

    it('FirestoreIntegration_Error_RethrowsError', async () => {
      const firestoreError = new Error('Firestore write failed');
      mockSetDoc.mockRejectedValue(firestoreError);

      const event: DomainEvent = {
        id: 'evt-123',
        aggregateId: 'ws-123',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-456',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      };

      await expect(builder.handleEvent(event)).rejects.toThrow('Firestore write failed');
    });
  });

  describe('Edge Cases and Additional Coverage', () => {
    it('EdgeCase_WorkspaceCreatedWithRestrictedStatus_CreatesProjection', async () => {
      const event: DomainEvent = {
        id: 'evt-125',
        aggregateId: 'ws-125',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-789',
          status: 'restricted',
        },
        metadata: {
          timestamp: '2024-01-03T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'restricted',
        }),
        { merge: true }
      );
    });

    it('EdgeCase_RebuildWithSingleArchivedEvent_UpdatesCorrectly', async () => {
      const events: DomainEvent[] = [
        {
          id: 'evt-126',
          aggregateId: 'ws-126',
          aggregateType: 'Workspace',
          eventType: 'WorkspaceArchived',
          data: {
            previousStatus: 'ready',
          },
          metadata: {
            timestamp: '2024-01-04T00:00:00.000Z',
          },
        },
      ];

      await builder.rebuild('ws-126', events);

      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'archived',
        }),
        { merge: true }
      );
    });

    it('EdgeCase_MultipleWorkspacesInSequence_IndependentProjections', async () => {
      const event1: DomainEvent = {
        id: 'evt-127',
        aggregateId: 'ws-127',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-111',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-05T00:00:00.000Z',
        },
      };

      const event2: DomainEvent = {
        id: 'evt-128',
        aggregateId: 'ws-128',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-222',
          status: 'initializing',
        },
        metadata: {
          timestamp: '2024-01-05T01:00:00.000Z',
        },
      };

      await builder.handleEvent(event1);
      await builder.handleEvent(event2);

      expect(mockSetDoc).toHaveBeenCalledTimes(2);

      // Verify first workspace
      const firstCall = mockSetDoc.mock.calls[0];
      expect(firstCall[1]).toMatchObject({
        id: 'ws-127',
        ownerId: 'acc-111',
      });

      // Verify second workspace
      const secondCall = mockSetDoc.mock.calls[1];
      expect(secondCall[1]).toMatchObject({
        id: 'ws-128',
        ownerId: 'acc-222',
      });
    });

    it('EdgeCase_EventWithExtraMetadataFields_HandlesGracefully', async () => {
      const event: DomainEvent = {
        id: 'evt-129',
        aggregateId: 'ws-129',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: 'acc-999',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-06T00:00:00.000Z',
          causedBy: 'system',
          causedByUser: 'admin-1',
          causedByAction: 'workspace.create',
          blueprintId: 'acc-999',
          correlationId: 'corr-123',
          extraField: 'ignored',
        },
      };

      await builder.handleEvent(event);

      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('EdgeCase_RebuildEmptyAggregateId_ThrowsError', async () => {
      await expect(builder.rebuild('  ', [])).rejects.toThrow(
        'Aggregate ID is required for rebuild'
      );
    });

    it('EdgeCase_EventDataWithWhitespaceValues_ValidatesCorrectly', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const event: DomainEvent = {
        id: 'evt-130',
        aggregateId: '  ',
        aggregateType: 'Workspace',
        eventType: 'WorkspaceCreated',
        data: {
          accountId: '  ',
          status: 'ready',
        },
        metadata: {
          timestamp: '2024-01-07T00:00:00.000Z',
        },
      };

      await builder.handleEvent(event);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});

// END OF FILE
