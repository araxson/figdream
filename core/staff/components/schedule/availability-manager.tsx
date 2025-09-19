"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getStaffAvailabilityAction } from "../actions/scheduling-actions";
import type {
  StaffAvailability,
  AvailableSlot,
  DateRange,
  WorkingHours,
  DayOfWeek
} from "../dal/schedules-types";

interface AvailabilityManagerProps {
  salonId: string;
  staffId: string;
  onAvailabilityChange?: (availability: StaffAvailability) => void;
  className?: string;
}

interface AvailabilityFilters {
  dateRange: DateRange;
  minDuration: number;
  includeBreaks: boolean;
  includeBufferTime: boolean;
  serviceTypes: string[];
}

type WorkingHoursForm = {
  [key in DayOfWeek]: {
    isWorking: boolean;
    start: string;
    end: string;
    breakStart: string;
    breakEnd: string;
  };
}

/**
 * Staff availability management interface
 */
export function AvailabilityManager({
  salonId,
  staffId,
  onAvailabilityChange,
  className
}: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<StaffAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [filters, setFilters] = useState<AvailabilityFilters>({
    dateRange: {
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
    },
    minDuration: 30,
    includeBreaks: false,
    includeBufferTime: true,
    serviceTypes: []
  });

  const [workingHoursForm, setWorkingHoursForm] = useState<WorkingHoursForm>({
    monday: { isWorking: true, start: "09:00", end: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    tuesday: { isWorking: true, start: "09:00", end: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    wednesday: { isWorking: true, start: "09:00", end: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    thursday: { isWorking: true, start: "09:00", end: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    friday: { isWorking: true, start: "09:00", end: "17:00", breakStart: "12:00", breakEnd: "13:00" },
    saturday: { isWorking: true, start: "10:00", end: "16:00", breakStart: "", breakEnd: "" },
    sunday: { isWorking: false, start: "", end: "", breakStart: "", breakEnd: "" }
  });

  // Load availability data
  const loadAvailability = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getStaffAvailabilityAction(staffId, filters.dateRange);
      if (result.success && result.data) {
        setAvailability(result.data);
        onAvailabilityChange?.(result.data);
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
    } finally {
      setIsLoading(false);
    }
  }, [staffId, filters.dateRange, onAvailabilityChange]);

  // Load availability on mount and when filters change
  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Filter available slots based on criteria
  const filteredSlots = React.useMemo(() => {
    if (!availability) return [];

    return availability.availableSlots.filter(slot => {
      // Filter by minimum duration
      if (slot.duration < filters.minDuration) return false;

      // Filter by date
      const slotDate = slot.start.toDateString();
      const selectedDateStr = selectedDate.toDateString();
      if (slotDate !== selectedDateStr) return false;

      // Include buffer time check
      if (!filters.includeBufferTime && (slot.bufferBefore || slot.bufferAfter)) {
        return false;
      }

      return true;
    });
  }, [availability, filters, selectedDate]);

  // Calculate utilization metrics
  const utilizationMetrics = React.useMemo(() => {
    if (!availability) return null;

    const utilizationRate = availability.totalHours > 0
      ? (availability.bookedHours / availability.totalHours) * 100
      : 0;

    const availableRate = availability.totalHours > 0
      ? ((availability.totalHours - availability.bookedHours - availability.breakHours) / availability.totalHours) * 100
      : 0;

    return {
      utilization: Math.round(utilizationRate),
      available: Math.round(availableRate),
      break: Math.round((availability.breakHours / availability.totalHours) * 100),
      totalSlots: availability.availableSlots.length,
      averageSlotDuration: availability.availableSlots.length > 0
        ? Math.round(availability.availableSlots.reduce((sum, slot) => sum + slot.duration, 0) / availability.availableSlots.length)
        : 0
    };
  }, [availability]);

  // Group slots by time of day
  const slotsByTimeOfDay = React.useMemo(() => {
    const groups = {
      morning: [] as AvailableSlot[],
      afternoon: [] as AvailableSlot[],
      evening: [] as AvailableSlot[]
    };

    filteredSlots.forEach(slot => {
      const hour = slot.start.getHours();
      if (hour < 12) {
        groups.morning.push(slot);
      } else if (hour < 17) {
        groups.afternoon.push(slot);
      } else {
        groups.evening.push(slot);
      }
    });

    return groups;
  }, [filteredSlots]);

  // Update working hours
  const updateWorkingHours = useCallback((day: DayOfWeek, updates: Partial<WorkingHoursForm[DayOfWeek]>) => {
    setWorkingHoursForm(prev => ({
      ...prev,
      [day]: { ...prev[day], ...updates }
    }));
  }, []);

  // Save working hours
  const saveWorkingHours = useCallback(async () => {
    // TODO: Implementation would save working hours to database
    // Reload availability after saving
    await loadAvailability();
  }, [workingHoursForm, loadAvailability]);

  // Render time slots
  const renderTimeSlots = useCallback((slots: AvailableSlot[]) => (
    <div className="grid gap-2">
      {slots.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No available slots
        </div>
      ) : (
        slots.map((slot, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {slot.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                  {slot.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Badge variant="outline" className="text-xs">
                  {slot.duration}min
                </Badge>
              </div>
              {(slot.bufferBefore || slot.bufferAfter) && (
                <div className="text-xs text-gray-500 mt-1">
                  Buffer: {slot.bufferBefore || 0}min before, {slot.bufferAfter || 0}min after
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {slot.serviceIds && slot.serviceIds.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {slot.serviceIds.length} services
                </Badge>
              )}
              <Button variant="outline" size="sm">
                Book
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  ), []);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Staff Availability</span>
            {isLoading && (
              <Badge variant="secondary" className="text-xs">
                Loading...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="working-hours">Working Hours</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Utilization metrics */}
              {utilizationMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {utilizationMetrics.utilization}%
                      </div>
                      <p className="text-xs text-muted-foreground">Utilization</p>
                      <Progress value={utilizationMetrics.utilization} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {utilizationMetrics.available}%
                      </div>
                      <p className="text-xs text-muted-foreground">Available</p>
                      <Progress value={utilizationMetrics.available} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {utilizationMetrics.totalSlots}
                      </div>
                      <p className="text-xs text-muted-foreground">Available Slots</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">
                        {utilizationMetrics.averageSlotDuration}min
                      </div>
                      <p className="text-xs text-muted-foreground">Avg Slot Duration</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Conflicts alert */}
              {availability && availability.conflicts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">
                    {availability.conflicts.length} Schedule Conflicts Detected
                  </h4>
                  <div className="space-y-1">
                    {availability.conflicts.slice(0, 3).map((conflict, index) => (
                      <p key={index} className="text-sm text-red-700">
                        • {conflict.description}
                      </p>
                    ))}
                    {availability.conflicts.length > 3 && (
                      <p className="text-sm text-red-600">
                        ...and {availability.conflicts.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="min-duration" className="text-sm">Min Duration:</Label>
                  <Select
                    value={filters.minDuration.toString()}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, minDuration: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15min</SelectItem>
                      <SelectItem value="30">30min</SelectItem>
                      <SelectItem value="60">1hr</SelectItem>
                      <SelectItem value="120">2hr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-breaks"
                    checked={filters.includeBreaks}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeBreaks: checked }))}
                  />
                  <Label htmlFor="include-breaks" className="text-sm">Include Breaks</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-buffer"
                    checked={filters.includeBufferTime}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, includeBufferTime: checked }))}
                  />
                  <Label htmlFor="include-buffer" className="text-sm">Include Buffer</Label>
                </div>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Calendar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>

                {/* Time slots for selected date */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Available Slots - {selectedDate.toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        Morning
                        <Badge variant="outline" className="ml-2 text-xs">
                          {slotsByTimeOfDay.morning.length} slots
                        </Badge>
                      </h4>
                      {renderTimeSlots(slotsByTimeOfDay.morning)}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        Afternoon
                        <Badge variant="outline" className="ml-2 text-xs">
                          {slotsByTimeOfDay.afternoon.length} slots
                        </Badge>
                      </h4>
                      {renderTimeSlots(slotsByTimeOfDay.afternoon)}
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        Evening
                        <Badge variant="outline" className="ml-2 text-xs">
                          {slotsByTimeOfDay.evening.length} slots
                        </Badge>
                      </h4>
                      {renderTimeSlots(slotsByTimeOfDay.evening)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Working Hours Tab */}
            <TabsContent value="working-hours" className="space-y-6">
              <div className="space-y-4">
                {Object.entries(workingHoursForm).map(([day, hours]) => (
                  <Card key={day}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium capitalize">{day}</h4>
                        <Switch
                          checked={hours.isWorking}
                          onCheckedChange={(checked) => updateWorkingHours(day as DayOfWeek, { isWorking: checked })}
                        />
                      </div>

                      {hours.isWorking && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor={`${day}-start`} className="text-sm">Start Time</Label>
                            <Input
                              id={`${day}-start`}
                              type="time"
                              value={hours.start}
                              onChange={(e) => updateWorkingHours(day as DayOfWeek, { start: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`${day}-end`} className="text-sm">End Time</Label>
                            <Input
                              id={`${day}-end`}
                              type="time"
                              value={hours.end}
                              onChange={(e) => updateWorkingHours(day as DayOfWeek, { end: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`${day}-break-start`} className="text-sm">Break Start</Label>
                            <Input
                              id={`${day}-break-start`}
                              type="time"
                              value={hours.breakStart}
                              onChange={(e) => updateWorkingHours(day as DayOfWeek, { breakStart: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`${day}-break-end`} className="text-sm">Break End</Label>
                            <Input
                              id={`${day}-break-end`}
                              type="time"
                              value={hours.breakEnd}
                              onChange={(e) => updateWorkingHours(day as DayOfWeek, { breakEnd: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={saveWorkingHours}>
                  Save Working Hours
                </Button>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buffer-before">Default Buffer Before (minutes)</Label>
                      <Input
                        id="buffer-before"
                        type="number"
                        defaultValue="15"
                        min="0"
                        max="60"
                      />
                    </div>

                    <div>
                      <Label htmlFor="buffer-after">Default Buffer After (minutes)</Label>
                      <Input
                        id="buffer-after"
                        type="number"
                        defaultValue="15"
                        min="0"
                        max="60"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-block">Auto-block unavailable times</Label>
                      <Switch id="auto-block" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-overlap">Allow service overlap</Label>
                      <Switch id="allow-overlap" />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sync-calendar">Sync with external calendar</Label>
                      <Switch id="sync-calendar" defaultChecked />
                    </div>
                  </div>

                  <Button className="w-full">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}