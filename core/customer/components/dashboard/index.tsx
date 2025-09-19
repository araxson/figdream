'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, MapPin, User, Plus, Heart, Settings, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_amount: number;
  salon: {
    name: string;
    address: string;
  };
  staff: {
    first_name: string;
    last_name: string;
  };
  appointment_services: {
    service: {
      name: string;
    };
  }[];
}

export function CustomerDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          start_time,
          end_time,
          status,
          total_amount,
          salon:salons(name, address),
          staff:staff_profiles(first_name, last_name),
          appointment_services(service:services(name))
        `)
        .eq('customer_id', user.id)
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(5);

      if (error) throw error;
      setAppointments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground mt-2">Manage your appointments and profile</p>
        </div>
        <Button onClick={() => router.push('/customer/book')}>
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/customer/book')}>
          <CardHeader className="pb-2">
            <Calendar className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Book Appointment</p>
            <p className="text-sm text-muted-foreground">Schedule your next visit</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/customer/appointments')}>
          <CardHeader className="pb-2">
            <Clock className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">My Appointments</p>
            <p className="text-sm text-muted-foreground">View upcoming bookings</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/customer/favorites')}>
          <CardHeader className="pb-2">
            <Heart className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Favorites</p>
            <p className="text-sm text-muted-foreground">Quick book favorites</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/customer/profile')}>
          <CardHeader className="pb-2">
            <Settings className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Profile</p>
            <p className="text-sm text-muted-foreground">Manage your settings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your next scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No upcoming appointments</p>
              <Button className="mt-4" onClick={() => router.push('/customer/book')}>
                Book Your First Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {format(new Date(appointment.appointment_date), 'EEEE, MMM d')}
                      </p>
                      <Badge variant={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.start_time} - {appointment.end_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {appointment.salon?.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {appointment.staff?.first_name} {appointment.staff?.last_name}
                      </span>
                    </div>
                    <p className="text-sm">
                      {appointment.appointment_services?.map(as => as.service?.name).join(', ')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}