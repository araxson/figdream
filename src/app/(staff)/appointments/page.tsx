import { createClient } from '@/lib/database/supabase/server';
import { getStaffByUserId, getStaffAppointments } from '@/lib/data-access/staff';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, User, DollarSign, ChevronRight, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default async function StaffAppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/staff');
  }

  const staff = await getStaffByUserId(user.id);
  
  if (!staff) {
    redirect('/register/staff');
  }

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Get appointments for today and upcoming
  const appointments = await getStaffAppointments(staff.id);
  
  // Categorize appointments
  const now = new Date();
  const todayAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate.toDateString() === now.toDateString() && 
           apt.status !== 'cancelled';
  }).sort((a, b) => 
    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
  ) || [];
  
  const upcomingAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return aptDate > now && 
           apt.status !== 'cancelled';
  }).sort((a, b) => 
    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
  ) || [];
  
  const pastAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    return (aptDate < now && aptDate.toDateString() !== now.toDateString()) || 
           apt.status === 'completed';
  }).sort((a, b) => 
    new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
  ).slice(0, 20) || []; // Limit past appointments to 20

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      in_progress: 'default',
      completed: 'outline',
      cancelled: 'destructive',
      no_show: 'destructive',
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatTime(appointment.appointment_date)}
            </CardTitle>
            <CardDescription className="mt-1">
              {appointment.services?.name || 'Service'}
              {appointment.services?.duration && (
                <span className="ml-2">• {appointment.services.duration} min</span>
              )}
            </CardDescription>
          </div>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <User className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">
              {appointment.customers?.first_name} {appointment.customers?.last_name}
            </p>
            {appointment.customers?.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Phone className="h-3 w-3" />
                <span>{appointment.customers.phone}</span>
              </div>
            )}
            {appointment.customers?.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Mail className="h-3 w-3" />
                <span>{appointment.customers.email}</span>
              </div>
            )}
          </div>
        </div>

        {appointment.notes && (
          <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
            {appointment.notes}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">${appointment.total_price || appointment.services?.price || 0}</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/staff/appointments/${appointment.id}`}>
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground mt-2">
          Manage your appointments and client schedule
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <p className="text-xs text-muted-foreground">
              appointments scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {upcomingAppointments.filter(apt => {
                const aptDate = new Date(apt.appointment_date);
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return aptDate <= weekFromNow;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              upcoming appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments?.filter(apt => apt.status === 'completed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              this month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">
            Today ({todayAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Appointments Today</h3>
                <p className="text-muted-foreground text-center">
                  You don't have any appointments scheduled for today.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {todayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Upcoming Appointments</h3>
                <p className="text-muted-foreground text-center">
                  You don't have any upcoming appointments scheduled.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Past Appointments</h3>
                <p className="text-muted-foreground text-center">
                  You haven't completed any appointments yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Alert className="mt-6">
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          To view your full schedule and availability, visit the{' '}
          <Link href="/staff/schedule" className="font-medium underline">
            Schedule page
          </Link>.
        </AlertDescription>
      </Alert>
    </div>
  );
}