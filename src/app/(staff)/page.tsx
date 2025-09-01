import { createClient } from '@/lib/database/supabase/server';
import { 
  getStaffByUserId, 
  getStaffAppointments, 
  getStaffEarnings,
  getStaffUtilization,
  getStaffSchedule 
} from '@/lib/data-access/staff';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PerformanceChart } from './performance-chart';
import { Calendar, Clock, DollarSign, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function StaffDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/staff');
  }

  const staff = await getStaffByUserId(user.id);
  
  if (!staff) {
    redirect('/register/staff');
  }

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = await getStaffAppointments(staff.id, today);
  const allAppointments = await getStaffAppointments(staff.id);
  const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const earnings = await getStaffEarnings(staff.id, thisMonthStart);
  const utilization = await getStaffUtilization(staff.id);
  const schedule = await getStaffSchedule(staff.id, today, today);

  // Calculate stats
  const todayCount = todayAppointments?.length || 0;
  const upcomingCount = allAppointments?.filter(apt => 
    new Date(apt.appointment_date) >= new Date() && 
    apt.status !== 'cancelled'
  ).length || 0;
  
  const thisMonthEarnings = earnings?.reduce((sum, e) => 
    sum + (e.base_amount || 0) + (e.commission_amount || 0) + (e.tip_amount || 0), 0
  ) || 0;

  const avgUtilization = utilization?.length > 0
    ? (utilization.reduce((sum, u) => sum + (u.utilization_percentage || 0), 0) / utilization.length).toFixed(1)
    : 0;

  const todaySchedule = schedule?.[0];
  const isWorkingToday = todaySchedule && !todaySchedule.is_day_off;

  const stats = [
    {
      title: "Today's Appointments",
      value: todayCount,
      icon: Calendar,
      description: isWorkingToday ? 'Scheduled for today' : 'Day off',
      href: '/staff/appointments',
    },
    {
      title: 'Upcoming Total',
      value: upcomingCount,
      icon: Users,
      description: 'Future appointments',
      href: '/staff/appointments',
    },
    {
      title: 'This Month Earnings',
      value: `$${thisMonthEarnings.toFixed(2)}`,
      icon: DollarSign,
      description: 'Total earned',
      href: '/staff/earnings',
    },
    {
      title: 'Utilization Rate',
      value: `${avgUtilization}%`,
      icon: TrendingUp,
      description: '30-day average',
      href: '/staff/performance',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {staff.display_name || staff.profiles?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isWorkingToday 
            ? `You have ${todayCount} appointment${todayCount !== 1 ? 's' : ''} today.`
            : 'You have the day off today. Enjoy your time off!'
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card>
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

      {/* Performance Charts */}
      <PerformanceChart staffId={staff.id} />

      {/* Today's Schedule */}
      {isWorkingToday && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {todaySchedule?.start_time} - {todaySchedule?.end_time}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppointments && todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {appointment.start_time} - {appointment.end_time}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {appointment.customers?.profiles?.full_name || 'Customer'}
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
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status}
                      </span>
                      <Link
                        href={`/staff/appointments/${appointment.id}`}
                        className="block mt-2 text-sm text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No appointments scheduled for today
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
            <Link href="/staff/schedule">
              <Calendar className="mr-2 h-4 w-4" />
              View Schedule
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/staff/time-off/request">
              <Clock className="mr-2 h-4 w-4" />
              Request Time Off
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/staff/profile">
              <Users className="mr-2 h-4 w-4" />
              Update Profile
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Performance */}
      {utilization && utilization.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
            <CardDescription>
              Your utilization over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {utilization.slice(0, 7).map((util) => (
                <div key={util.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(util.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress value={util.utilization_percentage || 0} className="w-32" />
                    <span className="text-sm font-medium w-12 text-right">
                      {util.utilization_percentage || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}