import { createClient } from '@/lib/database/supabase/server';
import { getStaffByUserId } from '@/lib/data-access/staff';
import { getStaffWeeklySchedule, getStaffAvailableSlots } from '@/lib/data-access/staff/schedules';
import { getAppointments } from '@/lib/data-access/bookings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar, Clock, User, Coffee, Sun, Moon, AlertCircle, CheckCircle
} from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function StaffSchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/staff');
  }

  const staff = await getStaffByUserId(user.id);
  
  if (!staff) {
    redirect('/register/staff');
  }

  // Get weekly schedule
  const weeklySchedule = await getStaffWeeklySchedule(staff.id);
  
  // Get today's date info
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDayOfWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Get this week's appointments
  const appointments = await getAppointments({
    staffId: staff.id,
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0]
  });

  // Get today's available slots
  const todaySlots = await getStaffAvailableSlots(
    staff.id,
    today.toISOString().split('T')[0],
    30
  );

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daySchedule = [
    { day: 'sunday', schedule: weeklySchedule.sunday },
    { day: 'monday', schedule: weeklySchedule.monday },
    { day: 'tuesday', schedule: weeklySchedule.tuesday },
    { day: 'wednesday', schedule: weeklySchedule.wednesday },
    { day: 'thursday', schedule: weeklySchedule.thursday },
    { day: 'friday', schedule: weeklySchedule.friday },
    { day: 'saturday', schedule: weeklySchedule.saturday }
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return <Sun className="h-4 w-4 text-yellow-500" />;
    if (hour < 17) return <Sun className="h-4 w-4 text-orange-500" />;
    return <Moon className="h-4 w-4 text-blue-500" />;
  };

  const todaySchedule = daySchedule[currentDayOfWeek].schedule;
  const todayAppointments = appointments?.filter(apt => 
    new Date(apt.booking_date).getDay() === currentDayOfWeek
  ) || [];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Schedule</h1>
        <p className="text-muted-foreground mt-2">
          Manage your working hours and appointments
        </p>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaySchedule?.is_working ? 'Working' : 'Off'}
            </div>
            {todaySchedule?.is_working && (
              <p className="text-xs text-muted-foreground">
                {formatTime(todaySchedule.start_time)} - {formatTime(todaySchedule.end_time)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaySlots.filter(s => !s.available).length} time slots booked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todaySlots.filter(s => s.available).length}
            </div>
            <p className="text-xs text-muted-foreground">
              30-minute slots remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Break</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              No breaks scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="today">Today's Details</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>
                Your regular working hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {daySchedule.map(({ day, schedule }, index) => {
                  const isToday = index === currentDayOfWeek;
                  const dayAppointments = appointments?.filter(apt => 
                    new Date(apt.booking_date).getDay() === index
                  ) || [];
                  
                  return (
                    <div
                      key={day}
                      className={`border rounded-lg p-4 ${
                        isToday ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          {dayNames[index]}
                          {isToday && (
                            <Badge variant="default" className="text-xs">Today</Badge>
                          )}
                        </h4>
                        {schedule?.is_working ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      
                      {schedule?.is_working ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            {getTimeIcon(schedule.start_time)}
                            <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                          </div>
                          {dayAppointments.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''} scheduled
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Day off</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Time Slots</CardTitle>
              <CardDescription>
                Your availability for {dayNames[currentDayOfWeek]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaySchedule?.is_working ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {todaySlots.slice(0, 32).map((slot, index) => (
                      <div
                        key={index}
                        className={`p-2 text-center rounded-md text-xs ${
                          slot.available
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {formatTime(slot.start)}
                      </div>
                    ))}
                  </div>
                  
                  {todayAppointments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Today's Appointments</h4>
                      <div className="space-y-2">
                        {todayAppointments.map((apt) => (
                          <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{apt.start_time} - {apt.end_time}</p>
                              <p className="text-sm text-muted-foreground">
                                Booking #{apt.id.slice(0, 8)}
                              </p>
                            </div>
                            <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                              {apt.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are not scheduled to work today.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                Your appointments for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appointments && appointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Booking ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments
                      .filter(apt => new Date(apt.booking_date) >= today)
                      .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
                      .slice(0, 10)
                      .map((apt) => (
                        <TableRow key={apt.id}>
                          <TableCell>
                            {new Date(apt.booking_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>{apt.start_time} - {apt.end_time}</TableCell>
                          <TableCell>
                            {apt.end_time && apt.start_time ? (
                              (() => {
                                const start = apt.start_time.split(':').map(Number);
                                const end = apt.end_time.split(':').map(Number);
                                const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
                                return `${duration} min`;
                              })()
                            ) : '-- min'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
                              {apt.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {apt.id.slice(0, 8)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No upcoming appointments scheduled
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Schedule Settings Notice */}
      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          To update your working hours or request time off, please contact your salon manager.
        </AlertDescription>
      </Alert>
    </div>
  );
}