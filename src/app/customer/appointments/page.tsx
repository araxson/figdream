import { createClient } from '@/lib/database/supabase/server';
import { getCustomerByUserId, getCustomerAppointments } from '@/lib/data-access/customers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, User, DollarSign, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CustomerAppointmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/customer');
  }

  const customer = await getCustomerByUserId(user.id);
  
  if (!customer) {
    redirect('/register/customer');
  }

  const appointments = await getCustomerAppointments(customer.id);

  // Categorize appointments
  const now = new Date();
  const upcomingAppointments = appointments?.filter(apt => 
    new Date(apt.appointment_date) >= now && 
    apt.status !== 'cancelled'
  ).sort((a, b) => 
    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
  ) || [];
  
  const pastAppointments = appointments?.filter(apt => 
    new Date(apt.appointment_date) < now || 
    apt.status === 'completed'
  ).sort((a, b) => 
    new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
  ) || [];
  
  const cancelledAppointments = appointments?.filter(apt => 
    apt.status === 'cancelled'
  ).sort((a, b) => 
    new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
  ) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      confirmed: 'default',
      pending: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
      no_show: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-lg font-semibold">
              {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{appointment.start_time} - {appointment.end_time}</span>
            </div>
          </div>
          {getStatusBadge(appointment.status)}
        </div>

        <div className="space-y-3">
          {appointment.salons && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">{appointment.salons.name}</p>
                <p className="text-gray-600">
                  {appointment.salons.address}, {appointment.salons.city}, {appointment.salons.state}
                </p>
              </div>
            </div>
          )}

          {appointment.staff_profiles && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm">
                <span className="font-medium">Staff: </span>
                {appointment.staff_profiles.display_name || 
                 appointment.staff_profiles.profiles?.full_name || 
                 'Not assigned'}
              </span>
            </div>
          )}

          {appointment.appointment_services && appointment.appointment_services.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Services:</p>
              <div className="flex flex-wrap gap-2">
                {appointment.appointment_services.map((service: any) => (
                  <Badge key={service.service_id} variant="secondary">
                    {service.services?.name}
                    {service.price && ` - $${service.price}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="font-semibold">
                Total: ${appointment.total_amount || '0.00'}
              </span>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/customer/appointments/${appointment.id}`}>
                View Details
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="mt-2 text-gray-600">
            View and manage your salon appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/book">
            Book New Appointment
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No upcoming appointments</p>
                <Button asChild>
                  <Link href="/book">Book Your First Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length > 0 ? (
            pastAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No past appointments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledAppointments.length > 0 ? (
            cancelledAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No cancelled appointments</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}