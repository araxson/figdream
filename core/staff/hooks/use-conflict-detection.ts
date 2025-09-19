"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { detectConflictsAction, resolveConflictAction } from "../actions/scheduling-actions";
import type {
  ScheduleConflict,
  ConflictResolution,
  ConflictType,
  ConflictSeverity
} from "../dal/schedules-types";

interface UseConflictDetectionOptions {
  autoDetect?: boolean;
  debounceMs?: number;
  severityThreshold?: ConflictSeverity;
  onConflictDetected?: (conflicts: ScheduleConflict[]) => void;
  onConflictResolved?: (conflictId: string) => void;
}

interface ConflictDetectionReturn {
  conflicts: ScheduleConflict[];
  isDetecting: boolean;
  isResolving: boolean;
  detectConflicts: (appointmentData: {
    staffId: string;
    startTime: Date;
    endTime: Date;
    serviceId: string;
    salonId: string;
  }) => Promise<ScheduleConflict[]>;
  resolveConflict: (conflictId: string, resolution: ConflictResolution) => Promise<boolean>;
  dismissConflict: (conflictId: string) => void;
  clearConflicts: () => void;
  getConflictsByType: (type: ConflictType) => ScheduleConflict[];
  getConflictsBySeverity: (severity: ConflictSeverity) => ScheduleConflict[];
  getUnresolvedConflicts: () => ScheduleConflict[];
  getAutoResolvableConflicts: () => ScheduleConflict[];
  statistics: {
    total: number;
    bySeverity: Record<ConflictSeverity, number>;
    byType: Record<ConflictType, number>;
    autoResolvable: number;
  };
}

/**
 * Hook for schedule conflict detection and resolution
 */
export function useConflictDetection(
  options: UseConflictDetectionOptions = {}
): ConflictDetectionReturn {
  const {
    autoDetect = true,
    debounceMs = 500,
    severityThreshold = "low",
    onConflictDetected,
    onConflictResolved
  } = options;

  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [dismissedConflicts, setDismissedConflicts] = useState<Set<string>>(new Set());

  // Detect conflicts for appointment data
  const detectConflicts = useCallback(async (appointmentData: {
    staffId: string;
    startTime: Date;
    endTime: Date;
    serviceId: string;
    salonId: string;
  }): Promise<ScheduleConflict[]> => {
    setIsDetecting(true);

    try {
      const result = await detectConflictsAction(appointmentData);

      if (result.success) {
        const detectedConflicts = result.data || [];

        // Filter by severity threshold
        const severityOrder: ConflictSeverity[] = ["low", "medium", "high", "critical"];
        const thresholdIndex = severityOrder.indexOf(severityThreshold);
        const filteredConflicts = detectedConflicts.filter(conflict => {
          const conflictIndex = severityOrder.indexOf(conflict.severity);
          return conflictIndex >= thresholdIndex;
        });

        // Update conflicts state
        setConflicts(prev => {
          // Remove existing conflicts for the same staff/time
          const filtered = prev.filter(existing =>
            existing.staffId !== appointmentData.staffId ||
            existing.timeRange.start.getTime() !== appointmentData.startTime.getTime()
          );
          return [...filtered, ...filteredConflicts];
        });

        // Notify of new conflicts
        if (filteredConflicts.length > 0) {
          onConflictDetected?.(filteredConflicts);
        }

        return filteredConflicts;
      } else {
        throw new Error(result.error || 'Conflict detection failed');
      }
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      return [];
    } finally {
      setIsDetecting(false);
    }
  }, [severityThreshold, onConflictDetected]);

  // Resolve a specific conflict
  const resolveConflict = useCallback(async (
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<boolean> => {
    setIsResolving(true);

    try {
      const result = await resolveConflictAction(conflictId, resolution);

      if (result.success) {
        // Remove resolved conflict
        setConflicts(prev => prev.filter(conflict => conflict.id !== conflictId));

        // Add any new conflicts that might have been created
        if (result.data?.newConflicts?.length) {
          setConflicts(prev => [...prev, ...result.data.newConflicts]);
        }

        onConflictResolved?.(conflictId);
        return true;
      } else {
        throw new Error(result.error || 'Conflict resolution failed');
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      return false;
    } finally {
      setIsResolving(false);
    }
  }, [onConflictResolved]);

  // Dismiss a conflict (hide it without resolving)
  const dismissConflict = useCallback((conflictId: string) => {
    setDismissedConflicts(prev => new Set([...prev, conflictId]));
  }, []);

  // Clear all conflicts
  const clearConflicts = useCallback(() => {
    setConflicts([]);
    setDismissedConflicts(new Set());
  }, []);

  // Get visible conflicts (not dismissed)
  const visibleConflicts = useMemo(() =>
    conflicts.filter(conflict => !dismissedConflicts.has(conflict.id)),
    [conflicts, dismissedConflicts]
  );

  // Get conflicts by type
  const getConflictsByType = useCallback((type: ConflictType) =>
    visibleConflicts.filter(conflict => conflict.type === type),
    [visibleConflicts]
  );

  // Get conflicts by severity
  const getConflictsBySeverity = useCallback((severity: ConflictSeverity) =>
    visibleConflicts.filter(conflict => conflict.severity === severity),
    [visibleConflicts]
  );

  // Get unresolved conflicts
  const getUnresolvedConflicts = useCallback(() =>
    visibleConflicts, // All visible conflicts are unresolved by definition
    [visibleConflicts]
  );

  // Get auto-resolvable conflicts
  const getAutoResolvableConflicts = useCallback(() =>
    visibleConflicts.filter(conflict => conflict.autoResolvable),
    [visibleConflicts]
  );

  // Calculate statistics
  const statistics = useMemo(() => {
    const bySeverity = visibleConflicts.reduce((acc, conflict) => {
      acc[conflict.severity] = (acc[conflict.severity] || 0) + 1;
      return acc;
    }, {} as Record<ConflictSeverity, number>);

    const byType = visibleConflicts.reduce((acc, conflict) => {
      acc[conflict.type] = (acc[conflict.type] || 0) + 1;
      return acc;
    }, {} as Record<ConflictType, number>);

    const autoResolvable = visibleConflicts.filter(c => c.autoResolvable).length;

    return {
      total: visibleConflicts.length,
      bySeverity,
      byType,
      autoResolvable
    };
  }, [visibleConflicts]);

  return {
    conflicts: visibleConflicts,
    isDetecting,
    isResolving,
    detectConflicts,
    resolveConflict,
    dismissConflict,
    clearConflicts,
    getConflictsByType,
    getConflictsBySeverity,
    getUnresolvedConflicts,
    getAutoResolvableConflicts,
    statistics
  };
}