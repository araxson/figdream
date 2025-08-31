import { createClient } from '@/lib/database/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  DollarSign, 
  Phone, 
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';

export default async function AppointmentDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/customer');
  }

  // Get appointment details
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      appointment_services (
        *,
        services (*)
      ),
      appointment_notes (
        note,
        created_at,
        created_by
      ),
      staff_profiles (
        id,
        user_id,
        display_name,
        bio,
        profiles:user_id (
          full_name,
          avatar_url,
          phone,
          email
        )
      ),
      salons (
        name,
        address,
        city,
        state,
        zip,
        phone,
        email,
        website
      ),
      customers (
        id,
        user_id,
        profiles:user_id (
          full_name,
          email
        )
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !appointment) {
    notFound();
  }

  // Verify this appointment belongs to the current user
  if (appointment.customers?.user_id !== user.id) {
    redirect('/403');
  }

  const appointmentDate = new Date(appointment.appointment_date);
  const isPast = appointmentDate < new Date();
  const canCancel = !isPast && appointment.status !== 'cancelled' && appointment.status !== 'completed';
  const canReschedule = !isPast && appointment.status !== 'cancelled';
  const canReview = appointment.status === 'completed';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
      case 'no_show':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-50 text-green-700 border-green-200',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      completed: 'bg-gray-50 text-gray-700 border-gray-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      no_show: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Calculate total price
  const totalAmount = appointment.appointment_services?.reduce((sum: number, service: any) => 
    sum + (service.price || 0), 0
  ) || appointment.total_amount || 0;

  const totalDuration = appointment.appointment_services?.reduce((sum: number, service: any) => 
    sum + (service.duration || service.services?.duration || 0), 0
  ) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/customer/appointments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
            <p className="text-gray-600">
              Booking ID: {appointment.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canReschedule && (
            <Button variant="outline">
              Reschedule
            </Button>
          )}
          {canCancel && (
            <Button variant="destructive">
              Cancel Appointment
            </Button>
          )}
          {canReview && (
            <Button asChild>
              <Link href={`/customer/reviews/new?appointment=${appointment.id}`}>
                Leave Review
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Status Alert */}
      <Alert className={`border ${getStatusColor(appointment.status)}`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(appointment.status)}
          <AlertDescription className="font-medium">
            Status: {appointment.status.replace('_', ' ').toUpperCase()}
          </AlertDescription>
        </div>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-gray-600">
                  {appointmentDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-gray-600">
                  {appointment.start_time} - {appointment.end_time}
                  {totalDuration > 0 && ` (${totalDuration} minutes)`}
                </p>
              </div>
            </div>

            {appointment.staff_profiles && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">Service Provider</p>
                  <p className="text-sm text-gray-600">
                    {appointment.staff_profiles.display_name || 
                     appointment.staff_profiles.profiles?.full_name}
                  </p>
                  {appointment.staff_profiles.bio && (
                    <p className="text-xs text-gray-500 mt-1">
                      {appointment.staff_profiles.bio}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salon Info */}
        <Card>
          <CardHeader>
            <CardTitle>Salon Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointment.salons && (
              <>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{appointment.salons.name}</p>
                    <p className="text-sm text-gray-600">
                      {appointment.salons.address}<br />
                      {appointment.salons.city}, {appointment.salons.state} {appointment.salons.zip}
                    </p>
                  </div>
                </div>

                {appointment.salons.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${appointment.salons.phone}`} className="text-sm text-blue-600 hover:underline">
                        {appointment.salons.phone}
                      </a>
                    </div>
                  </div>
                )}

                {appointment.salons.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${appointment.salons.email}`} className="text-sm text-blue-600 hover:underline">
                        {appointment.salons.email}
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>
            Services included in this appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointment.appointment_services?.map((service: any) => (
              <div key={service.service_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{service.services?.name}</p>
                  {service.services?.description && (
                    <p className="text-sm text-gray-600">{service.services.description}</p>
                  )}
                  {service.duration && (
                    <p className="text-sm text-gray-500">{service.duration} minutes</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">${service.price || service.services?.price || '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Total Amount</span>
              </div>
              <span className="text-xl font-bold">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {appointment.appointment_notes && appointment.appointment_notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointment.appointment_notes.map((note: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{note.note}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Added on {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Instructions */}
      {appointment.special_instructions && (
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{appointment.special_instructions}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}