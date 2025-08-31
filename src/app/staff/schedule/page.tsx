'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/database/supabase/client';
import { getStaffByUserId, getStaffSchedule, getStaffAppointments, getStaffBreaks } from '@/lib/data-access/staff';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, 
  Coffee, User, AlertCircle, Sun, Moon, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/types/database.types';

type Staff = Database['public']['Tables']['staff_profiles']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  customers?: { first_name: string; last_name: string } | null;
  services?: { name: string; duration: number } | null;
};
type Schedule = Database['public']['Tables']['staff_schedules']['Row'];
type Break = Database['public']['Tables']['staff_breaks']['Row'];

export default function StaffSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [breaks, setBreaks] = useState<Break[]>([]);

  useEffect(() => {
    loadStaffData();
  }, []);

  useEffect(() => {
    if (staff) {
      loadScheduleData();
    }
  }, [staff, selectedDate, viewMode]);

  const loadStaffData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login/staff');
        return;
      }

      const staffData = await getStaffByUserId(user.id);
      
      if (!staffData) {
        router.push('/register/staff');
        return;
      }

      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleData = async () => {
    if (!staff) return;

    try {
      // Calculate date range based on view mode
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);

      if (viewMode === 'day') {
        // Just the selected day
      } else if (viewMode === 'week') {
        // Get start and end of week
        const day = startDate.getDay();
        startDate.setDate(startDate.getDate() - day);
        endDate.setDate(startDate.getDate() + 6);
      } else if (viewMode === 'month') {
        // Get start and end of month
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
      }

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      // Load schedules, appointments, and breaks in parallel
      const [schedulesData, appointmentsData] = await Promise.all([
        getStaffSchedule(staff.id, startStr, endStr),
        getStaffAppointments(staff.id, startStr)
      ]);

      setSchedules(schedulesData || []);
      setAppointments(appointmentsData || []);

      // Load breaks for each day if viewing day or week
      if (viewMode === 'day') {
        const breaksData = await getStaffBreaks(staff.id, startStr);
        setBreaks(breaksData || []);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error('Failed to load schedule data');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getScheduleForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.find(s => s.date === dateStr);
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.appointment_date.startsWith(dateStr) && 
      apt.status !== 'cancelled'
    );
  };

  const renderDayView = () => {
    const schedule = getScheduleForDate(selectedDate);
    const dayAppointments = getAppointmentsForDate(selectedDate);
    const dateStr = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (!schedule || !schedule.is_working) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Day Off</h3>
            <p className="text-muted-foreground">
              You're not scheduled to work on {dateStr}
            </p>
          </CardContent>
        </Card>
      );
    }

    // Create time slots for the day
    const startHour = parseInt(schedule.start_time.split(':')[0]);
    const endHour = parseInt(schedule.end_time.split(':')[0]);
    const timeSlots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      timeSlots.push({
        time: `${hour}:00`,
        displayTime: formatTime(`${hour}:00:00`),
        appointments: dayAppointments.filter(apt => {
          const aptHour = new Date(apt.appointment_date).getHours();
          return aptHour === hour;
        })
      });
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{dateStr}</CardTitle>
          <CardDescription>
            Working hours: {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <div key={slot.time} className="flex gap-4 p-3 border rounded-lg hover:bg-muted/50">
                <div className="w-24 text-sm font-medium">
                  {slot.displayTime}
                </div>
                <div className="flex-1">
                  {slot.appointments.length > 0 ? (
                    <div className="space-y-2">
                      {slot.appointments.map((apt) => (
                        <div key={apt.id} className="bg-primary/10 p-2 rounded">
                          <p className="font-medium text-sm">
                            {apt.customers?.first_name} {apt.customers?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {apt.services?.name} • {apt.services?.duration || 60} min
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">Available</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {breaks.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Breaks
              </h4>
              <div className="space-y-2">
                {breaks.map((breakItem) => (
                  <div key={breakItem.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">
                      {formatTime(breakItem.start_time)} - {formatTime(breakItem.end_time)}
                    </Badge>
                    <span className="text-muted-foreground">
                      {breakItem.break_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="grid gap-4">
        {weekDays.map((date) => {
          const schedule = getScheduleForDate(date);
          const dayAppointments = getAppointmentsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <Card key={date.toISOString()} className={isToday ? 'border-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">
                      {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </CardTitle>
                    {schedule && schedule.is_working && (
                      <CardDescription className="text-xs mt-1">
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </CardDescription>
                    )}
                  </div>
                  {isToday && <Badge>Today</Badge>}
                  {!schedule || !schedule.is_working ? (
                    <Badge variant="secondary">Day Off</Badge>
                  ) : (
                    <Badge variant="outline">{dayAppointments.length} appointments</Badge>
                  )}
                </div>
              </CardHeader>
              {schedule && schedule.is_working && dayAppointments.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="text-sm">
                        <span className="font-medium">
                          {new Date(apt.appointment_date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {apt.services?.name}
                        </span>
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{dayAppointments.length - 3} more
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium py-2">
              {day}
            </div>
          ))}
        </div>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date) => {
              const schedule = getScheduleForDate(date);
              const dayAppointments = getAppointmentsForDate(date);
              const isCurrentMonth = date.getMonth() === month;
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <Card
                  key={date.toISOString()}
                  className={`p-2 text-center cursor-pointer hover:bg-muted/50 ${
                    !isCurrentMonth ? 'opacity-50' : ''
                  } ${isToday ? 'border-primary' : ''}`}
                  onClick={() => {
                    setSelectedDate(date);
                    setViewMode('day');
                  }}
                >
                  <div className="text-sm font-medium">{date.getDate()}</div>
                  {schedule && schedule.is_working ? (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs px-1">
                        {dayAppointments.length}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground mt-1">Off</div>
                  )}
                </Card>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Schedule</h1>
        <p className="text-muted-foreground mt-2">
          View your work schedule and appointments
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'day' | 'week' | 'month')}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(selectedDate);
              if (viewMode === 'day') {
                newDate.setDate(newDate.getDate() - 1);
              } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() - 7);
              } else {
                newDate.setMonth(newDate.getMonth() - 1);
              }
              setSelectedDate(newDate);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(selectedDate);
              if (viewMode === 'day') {
                newDate.setDate(newDate.getDate() + 1);
              } else if (viewMode === 'week') {
                newDate.setDate(newDate.getDate() + 7);
              } else {
                newDate.setMonth(newDate.getMonth() + 1);
              }
              setSelectedDate(newDate);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          To request time off or update your availability, please contact your salon manager.
        </AlertDescription>
      </Alert>
    </div>
  );
}