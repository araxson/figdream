"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useScheduleSync } from "../hooks/use-schedule-sync";
import { useConflictDetection } from "../hooks/use-conflict-detection";
import type {
  StaffScheduleWithAvailability,
  ScheduleConflict,
  AvailableSlot,
  DateRange
} from "../dal/schedules-types";

interface ScheduleCalendarProps {
  salonId: string;
  staffSchedules: StaffScheduleWithAvailability[];
  dateRange: DateRange;
  onSlotClick?: (slot: AvailableSlot) => void;
  onAppointmentClick?: (appointmentId: string) => void;
  onSlotDrag?: (slot: AvailableSlot, newTime: Date) => void;
  enableDragDrop?: boolean;
  showConflicts?: boolean;
  viewMode?: 'day' | 'week' | 'month';
  timeSlotDuration?: number; // minutes
  className?: string;
}

interface DragState {
  isDragging: boolean;
  draggedSlot: AvailableSlot | null;
  dragStartPosition: { x: number; y: number } | null;
  dragPreviewPosition: { x: number; y: number } | null;
}

interface TimeGrid {
  hours: string[];
  timeSlots: Array<{
    time: string;
    timestamp: Date;
    hour: number;
    minute: number;
  }>;
}

/**
 * Advanced schedule calendar with drag-drop functionality and conflict detection
 */
export function ScheduleCalendar({
  salonId,
  staffSchedules,
  dateRange,
  onSlotClick,
  onAppointmentClick,
  onSlotDrag,
  enableDragDrop = true,
  showConflicts = true,
  viewMode = 'day',
  timeSlotDuration = 30,
  className
}: ScheduleCalendarProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedSlot: null,
    dragStartPosition: null,
    dragPreviewPosition: null
  });

  const [selectedDate, setSelectedDate] = useState<Date>(dateRange.start);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Real-time sync
  const { status, broadcastUpdate } = useScheduleSync({
    salonId,
    enableRealTime: true,
    onUpdate: (update) => {
      // Handle real-time updates
    }
  });

  // Conflict detection
  const { conflicts, detectConflicts } = useConflictDetection({
    autoDetect: showConflicts,
    onConflictDetected: (conflicts) => {
      // Handle conflicts
    }
  });

  // Generate time grid
  const timeGrid: TimeGrid = React.useMemo(() => {
    const hours: string[] = [];
    const timeSlots: TimeGrid['timeSlots'] = [];

    // Generate 24-hour grid
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += timeSlotDuration) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        if (minute === 0) {
          hours.push(timeString);
        }

        // Create timestamp for selected date
        const timestamp = new Date(selectedDate);
        timestamp.setHours(hour, minute, 0, 0);

        timeSlots.push({
          time: timeString,
          timestamp,
          hour,
          minute
        });
      }
    }

    return { hours, timeSlots };
  }, [selectedDate, timeSlotDuration]);

  // Handle drag start
  const handleDragStart = useCallback((slot: AvailableSlot, event: React.MouseEvent) => {
    if (!enableDragDrop) return;

    event.preventDefault();
    setDragState({
      isDragging: true,
      draggedSlot: slot,
      dragStartPosition: { x: event.clientX, y: event.clientY },
      dragPreviewPosition: { x: event.clientX, y: event.clientY }
    });
  }, [enableDragDrop]);

  // Handle drag move
  const handleDragMove = useCallback((event: MouseEvent) => {
    if (!dragState.isDragging) return;

    setDragState(prev => ({
      ...prev,
      dragPreviewPosition: { x: event.clientX, y: event.clientY }
    }));
  }, [dragState.isDragging]);

  // Handle drag end
  const handleDragEnd = useCallback((event: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedSlot) return;

    // Calculate drop position and new time
    const calendarElement = calendarRef.current;
    if (calendarElement) {
      const rect = calendarElement.getBoundingClientRect();
      const relativeY = event.clientY - rect.top;

      // Calculate which time slot this corresponds to
      const slotHeight = 60; // Assume 60px per hour
      const hourIndex = Math.floor(relativeY / slotHeight);
      const minuteIndex = Math.floor((relativeY % slotHeight) / (slotHeight / (60 / timeSlotDuration)));

      const newHour = Math.max(0, Math.min(23, hourIndex));
      const newMinute = Math.max(0, Math.min(60 - timeSlotDuration, minuteIndex * timeSlotDuration));

      const newTime = new Date(selectedDate);
      newTime.setHours(newHour, newMinute, 0, 0);

      // Check if the new time is different from original
      if (newTime.getTime() !== dragState.draggedSlot.start.getTime()) {
        onSlotDrag?.(dragState.draggedSlot, newTime);

        // Broadcast the change
        broadcastUpdate('update', 'appointment', {
          newStartTime: newTime.toISOString(),
          originalStartTime: dragState.draggedSlot.start.toISOString()
        });
      }
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedSlot: null,
      dragStartPosition: null,
      dragPreviewPosition: null
    });
  }, [dragState, selectedDate, timeSlotDuration, onSlotDrag, broadcastUpdate]);

  // Setup drag event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.body.classList.add('cursor-grabbing');

      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.body.classList.remove('cursor-grabbing');
      };
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  // Get conflicts for a specific time slot
  const getSlotConflicts = useCallback((timestamp: Date, staffId: string): ScheduleConflict[] => {
    return conflicts.filter(conflict =>
      conflict.staffId === staffId &&
      timestamp >= conflict.timeRange.start &&
      timestamp <= conflict.timeRange.end
    );
  }, [conflicts]);

  // Get available slots for a time
  const getAvailableSlots = useCallback((timestamp: Date, staffId: string): AvailableSlot[] => {
    const staff = staffSchedules.find(s => s.staff_id === staffId);
    if (!staff) return [];

    return staff.availability.availableSlots.filter(slot =>
      timestamp >= slot.start && timestamp <= slot.end
    );
  }, [staffSchedules]);

  // Get appointments for a time slot
  const getAppointments = useCallback((timestamp: Date, staffId: string) => {
    const staff = staffSchedules.find(s => s.staff_id === staffId);
    if (!staff) return [];

    return staff.appointments.filter(apt => {
      if (!apt.start_time || !apt.end_time) return false;
      const aptStart = new Date(apt.start_time);
      const aptEnd = new Date(apt.end_time);
      return timestamp >= aptStart && timestamp <= aptEnd;
    });
  }, [staffSchedules]);

  // Render time slot content
  const renderTimeSlotContent = useCallback((
    timeSlot: TimeGrid['timeSlots'][0],
    staffId: string
  ) => {
    const slotConflicts = getSlotConflicts(timeSlot.timestamp, staffId);
    const availableSlots = getAvailableSlots(timeSlot.timestamp, staffId);
    const appointments = getAppointments(timeSlot.timestamp, staffId);

    return (
      <div
        className={cn(
          "relative h-8 border-b border-gray-100 transition-colors",
          availableSlots.length > 0 && "bg-green-50 hover:bg-green-100",
          slotConflicts.length > 0 && "bg-red-50",
          appointments.length > 0 && "bg-blue-50"
        )}
      >
        {/* Available slots */}
        {availableSlots.map((slot, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "absolute inset-0 cursor-pointer transition-all",
                    enableDragDrop && "hover:shadow-sm"
                  )}
                  onClick={() => onSlotClick?.(slot)}
                  onMouseDown={(e) => handleDragStart(slot, e)}
                >
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-100 border-green-300"
                  >
                    Available
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Available: {slot.start.toLocaleTimeString()} - {slot.end.toLocaleTimeString()}</p>
                <p>Duration: {slot.duration} minutes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Appointments */}
        {appointments.map((appointment, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => appointment.id && onAppointmentClick?.(appointment.id)}
                >
                  <Badge
                    variant="default"
                    className="text-xs bg-blue-100 border-blue-300 text-blue-800"
                  >
                    {appointment.status}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Appointment: {appointment.id}</p>
                <p>Status: {appointment.status}</p>
                <p>Time: {appointment.start_time ? new Date(appointment.start_time).toLocaleTimeString() : 'N/A'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Conflicts */}
        {slotConflicts.map((conflict, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute inset-0">
                  <Badge
                    variant="destructive"
                    className="text-xs"
                  >
                    {conflict.type}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Conflict: {conflict.description}</p>
                <p>Severity: {conflict.severity}</p>
                <p>Type: {conflict.type}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }, [
    getSlotConflicts,
    getAvailableSlots,
    getAppointments,
    onSlotClick,
    onAppointmentClick,
    handleDragStart,
    enableDragDrop
  ]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Schedule Calendar - {selectedDate.toLocaleDateString()}
        </CardTitle>

        <div className="flex items-center space-x-2">
          {/* Sync status indicator */}
          <Badge
            variant={status.isOnline ? "default" : "secondary"}
            className="text-xs"
          >
            {status.isOnline ? "Online" : "Offline"}
          </Badge>

          {/* Conflict count */}
          {conflicts.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {conflicts.length} Conflicts
            </Badge>
          )}

          {/* View mode toggle */}
          <div className="flex rounded-md border">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                className="px-3 py-1"
                onClick={() => {
                  // Handle view mode change
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div
          ref={calendarRef}
          className="relative overflow-auto max-h-[600px] border rounded-lg"
        >
          {/* Time grid */}
          <div className="grid grid-cols-[80px_1fr] min-h-full">
            {/* Time labels */}
            <div className="border-r bg-gray-50">
              {timeGrid.hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 flex items-center justify-center text-sm font-medium text-gray-600 border-b"
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Staff columns */}
            <div className={cn(
              "grid",
              staffSchedules.length === 1 && "grid-cols-1",
              staffSchedules.length === 2 && "grid-cols-2",
              staffSchedules.length >= 3 && "grid-cols-3"
            )}>
              {staffSchedules.map((staff) => (
                <div key={staff.id} className="border-r last:border-r-0">
                  {/* Staff header */}
                  <div className="h-12 bg-gray-50 border-b flex items-center justify-center text-sm font-medium">
                    Staff {staff.staff_id}
                  </div>

                  {/* Time slots */}
                  <div>
                    {timeGrid.timeSlots.map((timeSlot) => (
                      <div key={`${staff.id}-${timeSlot.time}`}>
                        {staff.staff_id && renderTimeSlotContent(timeSlot, staff.staff_id)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drag preview */}
          {dragState.isDragging && dragState.dragPreviewPosition && (
            <TooltipProvider>
              <Tooltip open>
                <TooltipContent className="fixed z-50 pointer-events-none">
                  <Badge variant="outline" className="bg-white shadow-lg">
                    Dragging...
                  </Badge>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}