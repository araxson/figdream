"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";

interface TimeSlot {
  time: string;
  available: boolean;
  staffName?: string;
}

interface TimeSlotPickerProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  onTimeChange: (time: string) => void;
  availableSlots?: Record<string, TimeSlot[]>; // date string -> slots
  minDate?: Date;
  maxDate?: Date;
  showStaffName?: boolean;
}

export function TimeSlotPicker({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  availableSlots = {},
  minDate = new Date(),
  maxDate = addDays(new Date(), 30),
  showStaffName = false,
}: TimeSlotPickerProps) {
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const dateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const daySlots = availableSlots[dateKey] || [];

  const groupSlotsByPeriod = (slots: TimeSlot[]) => {
    const morning: TimeSlot[] = [];
    const afternoon: TimeSlot[] = [];
    const evening: TimeSlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.time.split(":")[0]);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  };

  const { morning, afternoon, evening } = groupSlotsByPeriod(daySlots);

  const renderTimeSlots = (slots: TimeSlot[], period: string) => {
    if (slots.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground capitalize">
          {period}
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <Button
              key={slot.time}
              variant={selectedTime === slot.time ? "default" : "outline"}
              size="sm"
              disabled={!slot.available}
              onClick={() => slot.available && onTimeChange(slot.time)}
              onMouseEnter={() => setHoveredSlot(slot.time)}
              onMouseLeave={() => setHoveredSlot(null)}
              className="relative"
            >
              <Clock className="h-3 w-3 mr-1" />
              {slot.time}
              {showStaffName && slot.staffName && hoveredSlot === slot.time && (
                <Badge
                  variant="secondary"
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap"
                >
                  {slot.staffName}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const hasAvailableSlots = daySlots.some((slot) => slot.available);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={(date) => date < minDate || date > maxDate}
            initialFocus
          />
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedDate ? (
              <>Available Times for {format(selectedDate, "MMM d, yyyy")}</>
            ) : (
              "Select a date first"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please select a date to see available time slots
              </AlertDescription>
            </Alert>
          ) : !hasAvailableSlots ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No available time slots for this date. Please select another
                date.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {renderTimeSlots(morning, "morning")}
                {renderTimeSlots(afternoon, "afternoon")}
                {renderTimeSlots(evening, "evening")}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
