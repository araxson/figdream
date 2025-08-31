import { createClient } from '@/lib/database/supabase/server';
import { getCustomerByUserId, getCustomerAppointments, getCustomerLoyaltyPoints } from '@/lib/data-access/customers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, DollarSign, Gift, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function CustomerDashboard() {
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
  const loyaltyPoints = await getCustomerLoyaltyPoints(customer.id);

  // Calculate stats
  const upcomingAppointments = appointments?.filter(apt => 
    new Date(apt.appointment_date) >= new Date() && 
    apt.status !== 'cancelled'
  ) || [];
  
  const completedAppointments = appointments?.filter(apt => 
    apt.status === 'completed'
  ) || [];
  
  const totalSpent = completedAppointments.reduce((sum, apt) => 
    sum + (apt.total_amount || 0), 0
  );

  const stats = [
    {
      title: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      icon: CalendarDays,
      description: 'Scheduled visits',
      href: '/customer/appointments',
    },
    {
      title: 'Loyalty Points',
      value: loyaltyPoints,
      icon: Gift,
      description: 'Available points',
      href: '/customer/loyalty',
    },
    {
      title: 'Total Spent',
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      description: 'Lifetime spending',
      href: '/customer/payments',
    },
    {
      title: 'Services Completed',
      value: completedAppointments.length,
      icon: TrendingUp,
      description: 'Total visits',
      href: '/customer/appointments?filter=completed',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {customer.profiles?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your account and upcoming appointments.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button asChild>
            <Link href="/book">
              <CalendarDays className="mr-2 h-4 w-4" />
              Book Appointment
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/customer/reviews/new">
              <Star className="mr-2 h-4 w-4" />
              Leave Review
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/customer/profile">
              <Clock className="mr-2 h-4 w-4" />
              Update Preferences
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your next scheduled visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {appointment.start_time} - {appointment.end_time}
                    </p>
                    <p className="text-sm text-gray-600">
                      at {appointment.salons?.name}
                    </p>
                    {appointment.appointment_services && (
                      <div className="mt-2">
                        {appointment.appointment_services.map((as: any) => (
                          <span
                            key={as.service_id}
                            className="inline-block px-2 py-1 mr-2 text-xs bg-gray-100 rounded"
                          >
                            {as.services?.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${appointment.total_amount || 0}</p>
                    <Link
                      href={`/customer/appointments/${appointment.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {upcomingAppointments.length > 3 && (
              <div className="mt-4 text-center">
                <Link
                  href="/customer/appointments"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View all {upcomingAppointments.length} appointments
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest account activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedAppointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium">
                    Appointment completed
                  </p>
                  <p className="text-gray-600">
                    {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.salons?.name}
                  </p>
                </div>
                <Link
                  href={`/customer/reviews/new?appointment=${appointment.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Leave review
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}