"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { syncScheduleChangesAction, broadcastScheduleUpdateAction } from "../actions/scheduling-actions";
import type { ScheduleUpdate, SyncStatus } from "../dal/schedules-types";

interface UseScheduleSyncOptions {
  salonId: string;
  pollInterval?: number; // milliseconds
  enableRealTime?: boolean;
  onUpdate?: (update: ScheduleUpdate) => void;
  onError?: (error: string) => void;
}

interface ScheduleSyncReturn {
  status: SyncStatus;
  isOnline: boolean;
  pendingUpdates: ScheduleUpdate[];
  sync: () => Promise<void>;
  broadcastUpdate: (
    updateType: string,
    entityId: string,
    changes: Record<string, any>
  ) => Promise<void>;
  clearPendingUpdates: () => void;
}

/**
 * Hook for real-time schedule synchronization
 */
export function useScheduleSync(options: UseScheduleSyncOptions): ScheduleSyncReturn {
  const {
    salonId,
    pollInterval = 30000, // 30 seconds default
    enableRealTime = true,
    onUpdate,
    onError
  } = options;

  const [status, setStatus] = useState<SyncStatus>({
    lastSync: new Date(),
    pendingUpdates: 0,
    conflictsPending: 0,
    isOnline: navigator.onLine,
    syncErrors: []
  });

  const [pendingUpdates, setPendingUpdates] = useState<ScheduleUpdate[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<Date>(new Date());

  // Sync with server
  const sync = useCallback(async () => {
    try {
      const result = await syncScheduleChangesAction(salonId, lastSyncRef.current);

      if (result.success && result.data) {
        const { changes, timestamp } = result.data;

        // Apply changes and notify
        changes.forEach((change: ScheduleUpdate) => {
          onUpdate?.(change);
        });

        // Update sync status
        lastSyncRef.current = timestamp;
        setStatus(prev => ({
          ...prev,
          lastSync: timestamp,
          syncErrors: []
        }));

        // Clear any pending updates that were synced
        setPendingUpdates(prev =>
          prev.filter(update => update.timestamp > timestamp)
        );
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      onError?.(errorMessage);

      setStatus(prev => ({
        ...prev,
        syncErrors: [
          ...prev.syncErrors,
          {
            id: crypto.randomUUID(),
            message: errorMessage,
            timestamp: new Date(),
            resolved: false
          }
        ]
      }));
    }
  }, [salonId, onUpdate, onError]);

  // Broadcast update to other clients
  const broadcastUpdate = useCallback(async (
    updateType: string,
    entityId: string,
    changes: Record<string, any>
  ) => {
    try {
      const update: ScheduleUpdate = {
        type: updateType as any,
        entityId,
        entityType: 'appointment', // Default, should be determined from context
        changes,
        timestamp: new Date(),
        userId: '', // Should be set from auth context
        salonId
      };

      // Add to pending updates
      setPendingUpdates(prev => [...prev, update]);

      // Broadcast to server
      await broadcastScheduleUpdateAction(salonId, updateType, entityId, changes);

      // Update pending count
      setStatus(prev => ({
        ...prev,
        pendingUpdates: prev.pendingUpdates + 1
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Broadcast failed';
      onError?.(errorMessage);
    }
  }, [salonId, onError]);

  // Clear pending updates
  const clearPendingUpdates = useCallback(() => {
    setPendingUpdates([]);
    setStatus(prev => ({
      ...prev,
      pendingUpdates: 0
    }));
  }, []);

  // Setup polling
  useEffect(() => {
    if (enableRealTime) {
      // Initial sync
      sync();

      // Setup interval
      intervalRef.current = setInterval(sync, pollInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enableRealTime, pollInterval, sync]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      // Sync when coming back online
      if (enableRealTime) {
        sync();
      }
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableRealTime, sync]);

  return {
    status: {
      ...status,
      isOnline: navigator.onLine
    },
    isOnline: navigator.onLine,
    pendingUpdates,
    sync,
    broadcastUpdate,
    clearPendingUpdates
  };
}