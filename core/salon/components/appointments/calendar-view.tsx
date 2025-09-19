"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
} from "date-fns";
import type { AppointmentWithRelations } from "../types";

interface CalendarViewProps {
  appointments: AppointmentWithRelations[];
  _onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void;
}

export function CalendarView({
  appointments,
  _onDateSelect,
  onAppointmentClick,
}: CalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => {
      if (!apt.start_time) return false;
      const aptDate = new Date(apt.start_time);
      return isSameDay(aptDate, date);
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek(
      direction === "prev"
        ? subWeeks(currentWeek, 1)
        : addWeeks(currentWeek, 1),
    );
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Week View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] rounded-lg border p-2 ${
                  isToday ? "bg-accent" : "bg-background"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {format(day, "EEE")}
                  </div>
                  <div className={`text-sm ${isToday ? "font-bold" : ""}`}>
                    {format(day, "d")}
                  </div>
                </div>

                <div className="space-y-1">
                  {dayAppointments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No appointments
                    </p>
                  ) : (
                    dayAppointments.slice(0, 3).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => onAppointmentClick?.(apt)}
                        className="w-full rounded bg-primary/10 p-1 text-left hover:bg-primary/20"
                      >
                        <p className="text-xs font-medium truncate">
                          {apt.start_time &&
                            format(new Date(apt.start_time), "h:mm a")}
                        </p>
                        <p className="text-xs truncate text-muted-foreground">
                          {apt.customer?.display_name || "Guest"}
                        </p>
                      </button>
                    ))
                  )}
                  {dayAppointments.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{dayAppointments.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
