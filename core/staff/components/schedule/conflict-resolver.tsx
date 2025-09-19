"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useConflictDetection } from "../hooks/use-conflict-detection";
import type {
  ScheduleConflict,
  ConflictResolution,
  ConflictType,
  ConflictSeverity,
  ResolutionType
} from "../dal/schedules-types";

interface ConflictResolverProps {
  salonId: string;
  conflicts?: ScheduleConflict[];
  onConflictResolved?: (conflictId: string) => void;
  onResolutionApplied?: (resolution: ConflictResolution) => void;
  className?: string;
}

interface ResolutionDialogState {
  isOpen: boolean;
  conflict: ScheduleConflict | null;
  selectedResolution: ConflictResolution | null;
}

const conflictTypeLabels: Record<ConflictType, string> = {
  double_booking: "Double Booking",
  staff_unavailable: "Staff Unavailable",
  service_duration_overlap: "Service Duration Overlap",
  resource_conflict: "Resource Conflict",
  travel_time_violation: "Travel Time Violation",
  break_time_conflict: "Break Time Conflict",
  working_hours_violation: "Working Hours Violation",
  time_off_conflict: "Time Off Conflict"
};

const severityColors: Record<ConflictSeverity, string> = {
  low: "bg-yellow-100 text-yellow-800 border-yellow-200",
  medium: "bg-orange-100 text-orange-800 border-orange-200",
  high: "bg-red-100 text-red-800 border-red-200",
  critical: "bg-red-200 text-red-900 border-red-300"
};

const resolutionTypeLabels: Record<ResolutionType, string> = {
  reschedule_appointment: "Reschedule Appointment",
  reassign_staff: "Reassign Staff Member",
  split_appointment: "Split Appointment",
  extend_working_hours: "Extend Working Hours",
  add_staff_break: "Add Staff Break",
  cancel_appointment: "Cancel Appointment",
  book_different_resource: "Book Different Resource"
};

/**
 * Interactive conflict resolution interface
 */
export function ConflictResolver({
  salonId,
  conflicts: externalConflicts,
  onConflictResolved,
  onResolutionApplied,
  className
}: ConflictResolverProps) {
  const [resolutionDialog, setResolutionDialog] = useState<ResolutionDialogState>({
    isOpen: false,
    conflict: null,
    selectedResolution: null
  });

  const [activeTab, setActiveTab] = useState<ConflictSeverity>("critical");

  // Use conflict detection hook if no external conflicts provided
  const {
    conflicts: detectedConflicts,
    isResolving,
    resolveConflict,
    dismissConflict,
    getConflictsBySeverity,
    getAutoResolvableConflicts,
    statistics
  } = useConflictDetection({
    autoDetect: !externalConflicts,
    onConflictResolved
  });

  const conflicts = externalConflicts || detectedConflicts;

  // Open resolution dialog
  const openResolutionDialog = useCallback((conflict: ScheduleConflict) => {
    setResolutionDialog({
      isOpen: true,
      conflict,
      selectedResolution: conflict.suggestedResolutions[0] || null
    });
  }, []);

  // Close resolution dialog
  const closeResolutionDialog = useCallback(() => {
    setResolutionDialog({
      isOpen: false,
      conflict: null,
      selectedResolution: null
    });
  }, []);

  // Apply resolution
  const applyResolution = useCallback(async () => {
    if (!resolutionDialog.conflict || !resolutionDialog.selectedResolution) return;

    const success = await resolveConflict(
      resolutionDialog.conflict.id,
      resolutionDialog.selectedResolution
    );

    if (success) {
      onResolutionApplied?.(resolutionDialog.selectedResolution);
      closeResolutionDialog();
    }
  }, [resolutionDialog, resolveConflict, onResolutionApplied, closeResolutionDialog]);

  // Auto-resolve conflicts
  const autoResolveConflicts = useCallback(async () => {
    const autoResolvableConflicts = getAutoResolvableConflicts();

    for (const conflict of autoResolvableConflicts) {
      const bestResolution = conflict.suggestedResolutions
        .filter(r => r.autoApplicable)
        .sort((a, b) => b.impact.satisfactionScore - a.impact.satisfactionScore)[0];

      if (bestResolution) {
        await resolveConflict(conflict.id, bestResolution);
      }
    }
  }, [getAutoResolvableConflicts, resolveConflict]);

  // Render conflict item
  const renderConflictItem = useCallback((conflict: ScheduleConflict) => (
    <Card key={conflict.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={cn("text-xs", severityColors[conflict.severity])}>
              {conflict.severity.toUpperCase()}
            </Badge>
            <span className="font-medium text-sm">
              {conflictTypeLabels[conflict.type]}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {conflict.autoResolvable && (
              <Badge variant="outline" className="text-xs">
                Auto-Resolvable
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissConflict(conflict.id)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{conflict.description}</p>

          <div className="text-xs text-gray-500">
            <p>Staff: {conflict.staffId}</p>
            <p>
              Time: {conflict.timeRange.start.toLocaleString()} - {conflict.timeRange.end.toLocaleString()}
            </p>
            <p>Appointments affected: {conflict.appointmentIds.length}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Suggested Resolutions:</h4>
            <div className="grid gap-2">
              {conflict.suggestedResolutions.map((resolution, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {resolutionTypeLabels[resolution.type]}
                      </span>
                      {resolution.autoApplicable && (
                        <Badge variant="secondary" className="text-xs">
                          Auto
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {resolution.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>Satisfaction: {resolution.impact.satisfactionScore}%</span>
                      <span>Revenue: ${resolution.impact.revenueImpact}</span>
                      <span>Time: {resolution.impact.timeImpact}min</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setResolutionDialog({
                        isOpen: true,
                        conflict,
                        selectedResolution: resolution
                      });
                    }}
                    disabled={isResolving}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ), [dismissConflict, isResolving]);

  // Render statistics
  const renderStatistics = useCallback(() => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">{statistics.total}</div>
          <p className="text-xs text-muted-foreground">Total Conflicts</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {statistics.bySeverity.critical || 0}
          </div>
          <p className="text-xs text-muted-foreground">Critical</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {statistics.autoResolvable}
          </div>
          <p className="text-xs text-muted-foreground">Auto-Resolvable</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold">
            {Math.round((statistics.autoResolvable / Math.max(statistics.total, 1)) * 100)}%
          </div>
          <p className="text-xs text-muted-foreground">Resolution Rate</p>
        </CardContent>
      </Card>
    </div>
  ), [statistics]);

  if (conflicts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-green-600 mb-2">✓</div>
          <h3 className="font-medium text-lg">No Conflicts Detected</h3>
          <p className="text-sm text-gray-600 text-center">
            Your schedule is optimized and conflict-free.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Statistics */}
      {renderStatistics()}

      {/* Auto-resolve section */}
      {statistics.autoResolvable > 0 && (
        <Alert className="mb-6">
          <AlertTitle>Auto-Resolution Available</AlertTitle>
          <AlertDescription className="mt-2">
            {statistics.autoResolvable} conflicts can be automatically resolved.
            <Button
              variant="outline"
              size="sm"
              className="ml-3"
              onClick={autoResolveConflicts}
              disabled={isResolving}
            >
              Auto-Resolve All
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Conflicts by severity */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Conflicts</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ConflictSeverity)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="critical" className="relative">
                Critical
                {statistics.bySeverity.critical > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs h-4 w-4 p-0">
                    {statistics.bySeverity.critical}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="high" className="relative">
                High
                {statistics.bySeverity.high > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs h-4 w-4 p-0">
                    {statistics.bySeverity.high}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="medium" className="relative">
                Medium
                {statistics.bySeverity.medium > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs h-4 w-4 p-0">
                    {statistics.bySeverity.medium}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="low" className="relative">
                Low
                {statistics.bySeverity.low > 0 && (
                  <Badge variant="outline" className="ml-1 text-xs h-4 w-4 p-0">
                    {statistics.bySeverity.low}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {(['critical', 'high', 'medium', 'low'] as ConflictSeverity[]).map((severity) => (
              <TabsContent key={severity} value={severity} className="mt-6">
                <div className="space-y-4">
                  {getConflictsBySeverity(severity).map(renderConflictItem)}
                  {getConflictsBySeverity(severity).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No {severity} severity conflicts found.
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Resolution confirmation dialog */}
      <Dialog open={resolutionDialog.isOpen} onOpenChange={closeResolutionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Resolution</DialogTitle>
            <DialogDescription>
              Review the resolution details before applying changes.
            </DialogDescription>
          </DialogHeader>

          {resolutionDialog.conflict && resolutionDialog.selectedResolution && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Conflict Details</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p><strong>Type:</strong> {conflictTypeLabels[resolutionDialog.conflict.type]}</p>
                  <p><strong>Severity:</strong> {resolutionDialog.conflict.severity}</p>
                  <p><strong>Description:</strong> {resolutionDialog.conflict.description}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Resolution Plan</h4>
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p><strong>Action:</strong> {resolutionTypeLabels[resolutionDialog.selectedResolution.type]}</p>
                  <p><strong>Description:</strong> {resolutionDialog.selectedResolution.description}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Impact Assessment</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Customer Satisfaction</label>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={resolutionDialog.selectedResolution.impact.satisfactionScore}
                        className="flex-1"
                      />
                      <span>{resolutionDialog.selectedResolution.impact.satisfactionScore}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-600">Revenue Impact</label>
                    <p className={cn(
                      "font-medium",
                      resolutionDialog.selectedResolution.impact.revenueImpact >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    )}>
                      ${resolutionDialog.selectedResolution.impact.revenueImpact}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600">Time Impact</label>
                    <p>{resolutionDialog.selectedResolution.impact.timeImpact} minutes</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Staff Affected</label>
                    <p>{resolutionDialog.selectedResolution.impact.staffAffected.length} members</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeResolutionDialog}>
              Cancel
            </Button>
            <Button onClick={applyResolution} disabled={isResolving}>
              {isResolving ? "Applying..." : "Apply Resolution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}