import { Metadata } from 'next'
import { PageHeader } from '@/components/shared/ui-components'
import { StatsCard, StatsGrid, EmptyState } from '@/components/shared/ui-components'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  ShieldCheck,
  Activity,
  Store,
  AlertTriangle,
  TrendingUp,
  Settings,
  ChevronRight,
  Server,
  Database
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Super Admin Dashboard',
  description: 'System administration and monitoring',
}

export default async function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="System Dashboard"
        description="Platform administration and monitoring"
        badge="Super Admin"
        actions={
          <div className="flex gap-2">
            <Link href="/super-admin/system/configuration">
              <Button>
                <Settings className="size-4 mr-2" />
                System Config
              </Button>
            </Link>
            <Link href="/super-admin/monitoring">
              <Button variant="outline">
                <Activity className="size-4 mr-2" />
                Monitoring
              </Button>
            </Link>
          </div>
        }
      />

      {/* System Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-6">System Overview</h2>
        <StatsGrid>
          <Suspense fallback={
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          }>
            <StatsCard
              href="/super-admin/users"
              title="Total Users"
              value={0}
              description="Active users"
              icon={Users}
              trend={{ value: 0, label: 'new this month' }}
              variant="gradient"
            />
            <StatsCard
              href="/super-admin/salons"
              title="Total Salons"
              value={0}
              description="Registered salons"
              icon={Store}
              trend={{ value: 0, label: 'new this month' }}
              variant="gradient"
            />
            <StatsCard
              href="/super-admin/billing"
              title="Revenue"
              value="$0"
              description="Monthly revenue"
              icon={DollarSign}
              trend={{ value: 0, label: 'vs last month' }}
              variant="gradient"
            />
            <StatsCard
              href="/super-admin/system-health"
              title="System Health"
              value="100%"
              description="All systems operational"
              icon={ShieldCheck}
              variant="gradient"
            />
          </Suspense>
        </StatsGrid>
      </div>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-3">System Status</h3>
          <div className="space-y-3">
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/20">
                    <Server className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium">API Server</p>
                    <p className="text-sm text-muted-foreground">Running normally</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20">
                  Operational
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/20">
                    <Database className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium">Database</p>
                    <p className="text-sm text-muted-foreground">99.9% uptime</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20">
                  Healthy
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg dark:bg-yellow-900/20">
                    <AlertTriangle className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium">Error Rate</p>
                    <p className="text-sm text-muted-foreground">0.01% last 24h</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20">
                  Low
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/super-admin/users">
              <Button variant="outline" className="w-full justify-between">
                Manage Users
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/super-admin/salons">
              <Button variant="outline" className="w-full justify-between">
                Manage Salons
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/super-admin/audit">
              <Button variant="outline" className="w-full justify-between">
                View Audit Logs
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/super-admin/email-templates">
              <Button variant="outline" className="w-full justify-between">
                Email Templates
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/super-admin/monitoring">
              <Button variant="outline" className="w-full justify-between">
                System Monitoring
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Platform Metrics</h2>
          <Link href="/super-admin/analytics">
            <Button variant="ghost" size="sm">
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">API Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
              <div className="mt-3 flex items-center text-sm">
                <TrendingUp className="size-4 mr-1 text-green-600" />
                <span className="text-green-600">0% increase</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Current users online</p>
              <div className="mt-3 flex items-center text-sm">
                <Activity className="size-4 mr-1 text-blue-600" />
                <span className="text-blue-600">Real-time</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 GB</div>
              <p className="text-xs text-muted-foreground">Of 100 GB limit</p>
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '0%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent System Activity</h2>
        <EmptyState
          icon={Activity}
          title="No recent activity"
          description="System events and admin actions will appear here"
          action={{
            label: "View Audit Logs",
            href: "/super-admin/audit"
          }}
        />
      </div>
    </div>
  )
}