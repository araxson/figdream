import { createClient } from '@/lib/database/supabase/server';
import { Database } from '@/types/database.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
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
        bio,
        title,
        profiles:user_id (
          full_name,
          avatar_url,
          phone,
          email
        )
      ),
      salons (
        name,
        phone,
        email,
        website
      ),
      salon_locations!appointments_location_id_fkey (
        name,
        address_line_1,
        address_line_2,
        city,
        state_province,
        postal_code,
        phone,
        email
      ),
      profiles!appointments_customer_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !appointment) {
    notFound();
  }

  // Verify this appointment belongs to the current user
  if (appointment.customer_id !== user.id) {
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

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
      case 'no_show':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Define types for better type safety
  type AppointmentService = Database['public']['Tables']['appointment_services']['Row'];
  type AppointmentNote = Database['public']['Tables']['appointment_notes']['Row'];

  // Calculate total price
  const totalAmount = appointment.appointment_services?.reduce((sum: number, service: AppointmentService) => 
    sum + (service.price || 0), 0
  ) || appointment.total_amount || 0;

  const totalDuration = appointment.appointment_services?.reduce((sum: number, service: AppointmentService) => 
    sum + (service.duration_minutes || 0), 0
  ) || 0;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/customer">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/role-customer/appointments">Appointments</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Details</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointment Details</h1>
          <p className="text-muted-foreground">
            Booking ID: {appointment.id.slice(0, 8).toUpperCase()}
          </p>
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
      <Alert>
        <div className="flex items-center gap-2">
          {getStatusIcon(appointment.status)}
          <Badge variant={getStatusVariant(appointment.status)} className="mr-2">
            {appointment.status.replace('_', ' ')}
          </Badge>
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
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
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
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.start_time} - {appointment.end_time}
                  {totalDuration > 0 && ` (${totalDuration} minutes)`}
                </p>
              </div>
            </div>

            {appointment.staff_profiles && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Service Provider</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.staff_profiles.profiles?.full_name}
                  </p>
                  {appointment.staff_profiles.title && (
                    <p className="text-xs text-muted-foreground">
                      {appointment.staff_profiles.title}
                    </p>
                  )}
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
            {appointment.salon_locations && (
              <>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{appointment.salon_locations.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.salon_locations.address_line_1}<br />
                      {appointment.salon_locations.address_line_2 && <>{appointment.salon_locations.address_line_2}<br /></>}
                      {appointment.salon_locations.city}, {appointment.salon_locations.state_province} {appointment.salon_locations.postal_code}
                    </p>
                  </div>
                </div>

                {appointment.salon_locations.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href={`tel:${appointment.salon_locations.phone}`} className="text-sm text-blue-600 hover:underline">
                        {appointment.salon_locations.phone}
                      </a>
                    </div>
                  </div>
                )}

                {appointment.salon_locations.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${appointment.salon_locations.email}`} className="text-sm text-blue-600 hover:underline">
                        {appointment.salon_locations.email}
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
            {appointment.appointment_services?.map((service: AppointmentService) => (
              <div key={service.service_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{service.services?.name}</p>
                  {service.services?.description && (
                    <p className="text-sm text-muted-foreground">{service.services.description}</p>
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
              {appointment.appointment_notes.map((note: AppointmentNote, index: number) => (
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
      {appointment.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}