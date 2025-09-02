import { createClient } from '@/lib/database/supabase/server';
import { getStaffByUserId } from '@/lib/data-access/staff';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
  Alert,
  AlertDescription
} from '@/components/ui';
import { 
  Calendar, Clock, User, Phone, Mail, MapPin, DollarSign, 
  MessageSquare, ChevronLeft, Edit, CheckCircle, XCircle,
  AlertCircle, FileText
} from 'lucide-react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffAppointmentDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/staff');
  }

  const staff = await getStaffByUserId(user.id);
  
  if (!staff) {
    redirect('/register/staff');
  }

  // Get appointment details
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      customers (
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        date_of_birth,
        notes
      ),
      services (
        id,
        name,
        description,
        duration,
        price,
        category
      ),
      appointment_services (
        id,
        service_id,
        price,
        duration,
        services (
          name,
          description
        )
      ),
      appointment_notes (
        id,
        note,
        created_at,
        created_by,
        note_type
      ),
      salons (
        id,
        name,
        address,
        phone
      ),
      salon_locations (
        id,
        name,
        address,
        phone
      )
    `)
    .eq('id', id)
    .eq('staff_id', staff.id)
    .single();

  if (error || !appointment) {
    notFound();
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      in_progress: 'default',
      completed: 'outline',
      cancelled: 'destructive',
      no_show: 'destructive',
    };
    
    const icons: Record<string, React.ReactNode> = {
      pending: <AlertCircle className="h-3 w-3 mr-1" />,
      confirmed: <CheckCircle className="h-3 w-3 mr-1" />,
      completed: <CheckCircle className="h-3 w-3 mr-1" />,
      cancelled: <XCircle className="h-3 w-3 mr-1" />,
      no_show: <XCircle className="h-3 w-3 mr-1" />,
    };
    
    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center">
        {icons[status]}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const { date, time } = formatDateTime(appointment.appointment_date);

  // Calculate total price from appointment services or fallback to appointment total
  const totalPrice = appointment.appointment_services?.reduce(
    (sum: number, service: any) => sum + (service.price || 0), 
    0
  ) || appointment.total_price || appointment.services?.price || 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/role-staff-member/appointments">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Link>
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Appointment Details</h1>
            <p className="text-muted-foreground mt-2">
              Booking ID: {appointment.id.slice(0, 8)}
            </p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(appointment.status)}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Date & Time Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date & Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{time}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium text-lg">
                {appointment.customers?.first_name} {appointment.customers?.last_name}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {appointment.customers?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{appointment.customers.phone}</p>
                  </div>
                </div>
              )}
              
              {appointment.customers?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{appointment.customers.email}</p>
                  </div>
                </div>
              )}
            </div>

            {appointment.customers?.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {appointment.customers.address}
                    {appointment.customers.city && `, ${appointment.customers.city}`}
                    {appointment.customers.state && `, ${appointment.customers.state}`}
                    {appointment.customers.zip_code && ` ${appointment.customers.zip_code}`}
                  </p>
                </div>
              </div>
            )}

            {appointment.customers?.notes && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Customer Notes</p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">{appointment.customers.notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            {appointment.appointment_services && appointment.appointment_services.length > 0 ? (
              <div className="space-y-3">
                {appointment.appointment_services.map((service: any) => (
                  <div key={service.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{service.services?.name}</p>
                      {service.services?.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.services.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.duration || 60} min
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${service.price || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : appointment.services ? (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{appointment.services.name}</p>
                  {appointment.services.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {appointment.services.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appointment.services.duration || 60} min
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${appointment.services.price || 0}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No service details available</p>
            )}
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center">
              <p className="font-semibold">Total Amount</p>
              <p className="text-xl font-bold">${totalPrice}</p>
            </div>

            {appointment.payment_status && (
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant={appointment.payment_status === 'paid' ? 'default' : 'secondary'}>
                  {appointment.payment_status}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Notes */}
        {appointment.appointment_notes && appointment.appointment_notes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Appointment Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointment.appointment_notes.map((note: any) => (
                  <div key={note.id} className="border-l-2 border-primary pl-4">
                    <p className="text-sm">{note.note}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(note.created_at).toLocaleString()} • {note.note_type || 'General'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Notes */}
        {appointment.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                General Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{appointment.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">
                {appointment.salon_locations?.name || appointment.salons?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {appointment.salon_locations?.address || appointment.salons?.address}
              </p>
              {(appointment.salon_locations?.phone || appointment.salons?.phone) && (
                <p className="text-sm">
                  <Phone className="h-3 w-3 inline mr-1" />
                  {appointment.salon_locations?.phone || appointment.salons?.phone}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To update the appointment status or add notes, please use the salon management system.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}