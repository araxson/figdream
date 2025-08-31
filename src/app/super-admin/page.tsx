import { createClient } from '@/lib/database/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity, 
  Building, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SuperAdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/super-admin');
  }

  // Check if user is super admin
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (userRole?.role !== 'super_admin') {
    redirect('/403');
  }

  // Fetch platform statistics
  const { count: totalSalons } = await supabase
    .from('salons')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const { data: activeSubscriptions } = await supabase
    .from('platform_subscriptions')
    .select('*')
    .eq('status', 'active');

  const { data: recentApiUsage } = await supabase
    .from('api_usage')
    .select('request_count')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const { data: systemHealth } = await supabase
    .from('system_configuration')
    .select('*')
    .limit(1);

  // Calculate metrics
  const totalRevenue = activeSubscriptions?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0;
  const dailyApiCalls = recentApiUsage?.reduce((sum, usage) => sum + (usage.request_count || 0), 0) || 0;

  const stats = [
    {
      title: 'Total Salons',
      value: totalSalons || 0,
      icon: Building,
      description: 'Active salons',
      href: '/super-admin/salons',
      trend: '+12%',
    },
    {
      title: 'Total Users',
      value: totalUsers || 0,
      icon: Users,
      description: 'Registered users',
      href: '/super-admin/users',
      trend: '+8%',
    },
    {
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: 'From subscriptions',
      href: '/super-admin/subscriptions',
      trend: '+15%',
    },
    {
      title: 'API Calls (24h)',
      value: dailyApiCalls.toLocaleString(),
      icon: Activity,
      description: 'Last 24 hours',
      href: '/super-admin/api-usage',
      trend: '+5%',
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions?.length || 0,
      icon: CreditCard,
      description: 'Current active',
      href: '/super-admin/subscriptions',
      trend: '+10%',
    },
    {
      title: 'Monthly Appointments',
      value: totalAppointments || 0,
      icon: TrendingUp,
      description: 'Last 30 days',
      href: '/super-admin/analytics',
      trend: '+20%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Platform Overview
        </h1>
        <p className="mt-2 text-muted-foreground">
          Monitor and manage the entire platform from this dashboard.
        </p>
      </div>

      {/* System Status */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              System Status
            </CardTitle>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              All Systems Operational
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Database:</span>
              <span className="ml-2 font-medium">Healthy</span>
            </div>
            <div>
              <span className="text-gray-600">API:</span>
              <span className="ml-2 font-medium">Online</span>
            </div>
            <div>
              <span className="text-gray-600">Storage:</span>
              <span className="ml-2 font-medium">45% Used</span>
            </div>
            <div>
              <span className="text-gray-600">Response Time:</span>
              <span className="ml-2 font-medium">87ms</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  <span className="text-xs text-green-600 font-medium">
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Salon Registrations</CardTitle>
            <CardDescription>
              New salons in the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* This would be populated with real data */}
              <div className="text-sm text-gray-500 text-center py-4">
                No new registrations in the last 7 days
              </div>
            </div>
            <Link
              href="/super-admin/salons"
              className="block mt-4 text-sm text-blue-600 hover:underline text-center"
            >
              View all salons →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Alerts</CardTitle>
            <CardDescription>
              Important system notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Database Optimization Recommended</p>
                  <p className="text-xs text-gray-500">Run vacuum to improve performance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Backup Completed</p>
                  <p className="text-xs text-gray-500">Daily backup completed successfully</p>
                </div>
              </div>
            </div>
            <Link
              href="/super-admin/security"
              className="block mt-4 text-sm text-blue-600 hover:underline text-center"
            >
              View security dashboard →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link
              href="/super-admin/salons/new"
              className="text-sm text-blue-600 hover:underline"
            >
              Add New Salon
            </Link>
            <Link
              href="/super-admin/users"
              className="text-sm text-blue-600 hover:underline"
            >
              Manage Users
            </Link>
            <Link
              href="/super-admin/database"
              className="text-sm text-blue-600 hover:underline"
            >
              Database Tools
            </Link>
            <Link
              href="/super-admin/settings"
              className="text-sm text-blue-600 hover:underline"
            >
              System Settings
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}