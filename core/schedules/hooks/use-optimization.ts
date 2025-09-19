"use client";

import { useState, useCallback, useMemo } from "react";
import { optimizeScheduleAction, suggestOptimalSlotsAction } from "../actions/scheduling-actions";
import type {
  OptimizationResult,
  SchedulingCriteria,
  DateRange,
  OptimizationObjective,
  SchedulingConstraint,
  SchedulingPreference,
  AvailableSlot,
  ObjectiveType
} from "../dal/schedules-types";

interface UseOptimizationOptions {
  defaultObjectives?: OptimizationObjective[];
  defaultConstraints?: SchedulingConstraint[];
  defaultPreferences?: SchedulingPreference[];
  onOptimizationComplete?: (result: OptimizationResult) => void;
  onError?: (error: string) => void;
}

interface OptimizationReturn {
  isOptimizing: boolean;
  lastResult: OptimizationResult | null;
  optimizationHistory: OptimizationResult[];
  currentCriteria: SchedulingCriteria | null;

  // Core optimization functions
  optimizeSchedule: (
    salonId: string,
    dateRange: DateRange,
    criteria?: Partial<SchedulingCriteria>
  ) => Promise<OptimizationResult | null>;

  suggestOptimalSlots: (criteria: SchedulingCriteria) => Promise<AvailableSlot[]>;

  // Criteria management
  updateCriteria: (criteria: Partial<SchedulingCriteria>) => void;
  addObjective: (objective: OptimizationObjective) => void;
  removeObjective: (type: ObjectiveType) => void;
  updateObjective: (type: ObjectiveType, updates: Partial<OptimizationObjective>) => void;
  addConstraint: (constraint: SchedulingConstraint) => void;
  removeConstraint: (index: number) => void;
  addPreference: (preference: SchedulingPreference) => void;
  removePreference: (index: number) => void;

  // Analysis helpers
  getOptimizationScore: () => number;
  getImprovementSummary: () => string[];
  canAutoApplyChanges: () => boolean;

  // Presets
  applyPreset: (presetName: 'balanced' | 'revenue' | 'utilization' | 'satisfaction') => void;

  // Reset and clear
  resetCriteria: () => void;
  clearHistory: () => void;
}

/**
 * Hook for schedule optimization and performance analytics
 */
export function useOptimization(
  options: UseOptimizationOptions = {}
): OptimizationReturn {
  const {
    defaultObjectives = [
      { type: "maximize_utilization", weight: 0.25, target: 0.85 },
      { type: "minimize_wait_time", weight: 0.25, target: 15 },
      { type: "maximize_revenue", weight: 0.25 },
      { type: "balance_workload", weight: 0.25, target: 0.8 }
    ],
    defaultConstraints = [
      { type: "working_hours", mandatory: true, parameters: {} },
      { type: "minimum_break_time", mandatory: true, parameters: { minutes: 30 } }
    ],
    defaultPreferences = [],
    onOptimizationComplete,
    onError
  } = options;

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastResult, setLastResult] = useState<OptimizationResult | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationResult[]>([]);
  const [currentCriteria, setCurrentCriteria] = useState<SchedulingCriteria | null>(null);

  // Main optimization function
  const optimizeSchedule = useCallback(async (
    salonId: string,
    dateRange: DateRange,
    criteriaOverrides?: Partial<SchedulingCriteria>
  ): Promise<OptimizationResult | null> => {
    setIsOptimizing(true);

    try {
      // Merge criteria
      const criteria: SchedulingCriteria = {
        salonId,
        dateRange,
        objectives: defaultObjectives,
        constraints: defaultConstraints,
        preferences: defaultPreferences,
        ...currentCriteria,
        ...criteriaOverrides
      };

      const result = await optimizeScheduleAction(salonId, dateRange, criteria);

      if (result.success && result.data) {
        const optimizationResult = result.data;

        setLastResult(optimizationResult);
        setOptimizationHistory(prev => [optimizationResult, ...prev].slice(0, 10)); // Keep last 10
        setCurrentCriteria(criteria);

        onOptimizationComplete?.(optimizationResult);
        return optimizationResult;
      } else {
        throw new Error(result.error || 'Optimization failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Optimization failed';
      onError?.(errorMessage);
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [currentCriteria, defaultObjectives, defaultConstraints, defaultPreferences, onOptimizationComplete, onError]);

  // Suggest optimal slots
  const suggestOptimalSlots = useCallback(async (
    criteria: SchedulingCriteria
  ): Promise<AvailableSlot[]> => {
    try {
      const result = await suggestOptimalSlotsAction(criteria);

      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.error || 'Slot suggestion failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Slot suggestion failed';
      onError?.(errorMessage);
      return [];
    }
  }, [onError]);

  // Update criteria
  const updateCriteria = useCallback((updates: Partial<SchedulingCriteria>) => {
    setCurrentCriteria(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Objective management
  const addObjective = useCallback((objective: OptimizationObjective) => {
    setCurrentCriteria(prev => {
      if (!prev) return null;
      const existingIndex = prev.objectives.findIndex(obj => obj.type === objective.type);
      if (existingIndex >= 0) {
        const newObjectives = [...prev.objectives];
        newObjectives[existingIndex] = objective;
        return { ...prev, objectives: newObjectives };
      } else {
        return { ...prev, objectives: [...prev.objectives, objective] };
      }
    });
  }, []);

  const removeObjective = useCallback((type: ObjectiveType) => {
    setCurrentCriteria(prev => {
      if (!prev) return null;
      return {
        ...prev,
        objectives: prev.objectives.filter(obj => obj.type !== type)
      };
    });
  }, []);

  const updateObjective = useCallback((type: ObjectiveType, updates: Partial<OptimizationObjective>) => {
    setCurrentCriteria(prev => {
      if (!prev) return null;
      return {
        ...prev,
        objectives: prev.objectives.map(obj =>
          obj.type === type ? { ...obj, ...updates } : obj
        )
      };
    });
  }, []);

  // Constraint management
  const addConstraint = useCallback((constraint: SchedulingConstraint) => {
    setCurrentCriteria(prev => {
      if (!prev) return null;
      return { ...prev, constraints: [...prev.constraints, constraint] };
    });
  }, []);

  const removeConstraint = useCallback((index: number) => {
    setCurrentCriteria(prev => {
      if (!prev) return null;
      const newConstraints = [...prev.constraints];
      newConstraints.splice(index, 1);
      return { ...prev, constraints: newConstraints };
    });
  }, []);

  // Preference management
  const addPreference = useCallback((preference: SchedulingPreference) => {
    setCurrentCriteria(prev => {
      if (!prev) return null;
      return { ...prev, preferences: [...prev.preferences, preference] };
    });
  }, []);

  const removePreference = useCallback((index: number) => {
    setCurrentCriteria(prev => {
      if (!prev) return null;
      const newPreferences = [...prev.preferences];
      newPreferences.splice(index, 1);
      return { ...prev, preferences: newPreferences };
    });
  }, []);

  // Analysis helpers
  const getOptimizationScore = useCallback((): number => {
    return lastResult?.score || 0;
  }, [lastResult]);

  const getImprovementSummary = useCallback((): string[] => {
    if (!lastResult?.improvements) return [];

    return lastResult.improvements.map(improvement => {
      const percentage = (improvement.improvement * 100).toFixed(1);
      return `${improvement.type.replace(/_/g, ' ')}: +${percentage}%`;
    });
  }, [lastResult]);

  const canAutoApplyChanges = useCallback((): boolean => {
    if (!lastResult?.suggestedChanges) return false;

    return lastResult.suggestedChanges.every(change =>
      change.impact.satisfactionScore >= 70 && change.impact.revenueImpact >= 0
    );
  }, [lastResult]);

  // Preset configurations
  const applyPreset = useCallback((presetName: 'balanced' | 'revenue' | 'utilization' | 'satisfaction') => {
    const presets = {
      balanced: {
        objectives: [
          { type: "maximize_utilization" as ObjectiveType, weight: 0.25, target: 0.8 },
          { type: "minimize_wait_time" as ObjectiveType, weight: 0.25, target: 15 },
          { type: "maximize_revenue" as ObjectiveType, weight: 0.25 },
          { type: "maximize_satisfaction" as ObjectiveType, weight: 0.25, target: 80 }
        ]
      },
      revenue: {
        objectives: [
          { type: "maximize_revenue" as ObjectiveType, weight: 0.5 },
          { type: "maximize_utilization" as ObjectiveType, weight: 0.3, target: 0.9 },
          { type: "minimize_wait_time" as ObjectiveType, weight: 0.2, target: 20 }
        ]
      },
      utilization: {
        objectives: [
          { type: "maximize_utilization" as ObjectiveType, weight: 0.6, target: 0.95 },
          { type: "balance_workload" as ObjectiveType, weight: 0.3, target: 0.9 },
          { type: "minimize_wait_time" as ObjectiveType, weight: 0.1, target: 30 }
        ]
      },
      satisfaction: {
        objectives: [
          { type: "maximize_satisfaction" as ObjectiveType, weight: 0.4, target: 90 },
          { type: "minimize_wait_time" as ObjectiveType, weight: 0.3, target: 10 },
          { type: "maximize_utilization" as ObjectiveType, weight: 0.2, target: 0.75 },
          { type: "balance_workload" as ObjectiveType, weight: 0.1, target: 0.8 }
        ]
      }
    };

    const preset = presets[presetName];
    setCurrentCriteria(prev => prev ? { ...prev, objectives: preset.objectives } : null);
  }, []);

  // Reset and clear functions
  const resetCriteria = useCallback(() => {
    setCurrentCriteria(null);
  }, []);

  const clearHistory = useCallback(() => {
    setOptimizationHistory([]);
    setLastResult(null);
  }, []);

  // Memoized computed values
  const computedValues = useMemo(() => ({
    hasResults: lastResult !== null,
    hasHistory: optimizationHistory.length > 0,
    averageScore: optimizationHistory.length > 0
      ? optimizationHistory.reduce((sum, result) => sum + result.score, 0) / optimizationHistory.length
      : 0,
    bestScore: Math.max(...optimizationHistory.map(r => r.score), 0),
    trendsUpward: optimizationHistory.length >= 2
      ? optimizationHistory[0].score > optimizationHistory[1].score
      : false
  }), [lastResult, optimizationHistory]);

  return {
    isOptimizing,
    lastResult,
    optimizationHistory,
    currentCriteria,
    optimizeSchedule,
    suggestOptimalSlots,
    updateCriteria,
    addObjective,
    removeObjective,
    updateObjective,
    addConstraint,
    removeConstraint,
    addPreference,
    removePreference,
    getOptimizationScore,
    getImprovementSummary,
    canAutoApplyChanges,
    applyPreset,
    resetCriteria,
    clearHistory,
    ...computedValues
  };
}