import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Skeleton } from '@/components/ui'
import { AuditLogTable } from '@/components/super-admin/audit/audit-log-table'
import { AuditStats } from '@/components/super-admin/audit/audit-stats'
import { AuditFilters } from '@/components/super-admin/audit/audit-filters'
import { getAuditLogs, getAuditStats } from '@/lib/data-access/audit-logs'
import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import { Shield, Activity, FileText, AlertTriangle } from 'lucide-react'

export default async function AuditLogPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // Await searchParams
  const searchParamsResolved = await searchParams
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // TODO: Check if user is super admin
  // const isSuperAdmin = await checkSuperAdminRole(user.id)
  // if (!isSuperAdmin) {
  //   redirect('/403')
  // }

  // Parse filters from search params
  const filters = {
    action: searchParamsResolved.action as string | undefined,
    entity: searchParamsResolved.entity as string | undefined,
    startDate: searchParamsResolved.startDate as string | undefined,
    endDate: searchParamsResolved.endDate as string | undefined,
  }

  const [logs, stats] = await Promise.all([
    getAuditLogs(filters),
    getAuditStats(undefined, 30)
  ])

  const securityEvents = logs?.filter(log => 
    ['login', 'logout', 'password_reset', 'permission_change', 'role_change', 'access_denied'].includes(log.action)
  ).length || 0

  const dataChanges = logs?.filter(log =>
    ['create', 'update', 'delete'].includes(log.action)
  ).length || 0

  return (
    <div className="container max-w-7xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Monitor system activity and security events
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents}</div>
            <p className="text-xs text-muted-foreground">
              Authentication & permissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Changes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataChanges}</div>
            <p className="text-xs text-muted-foreground">
              Create, update, delete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs?.filter(log => log.action === 'suspicious_activity').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Suspicious activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
              <CardDescription>
                All system events and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AuditFilters initialFilters={filters} />
                <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                  <AuditLogTable logs={logs || []} />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Statistics</CardTitle>
              <CardDescription>
                Analyze system usage patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AuditStats stats={stats} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Authentication, authorization, and security-related events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <AuditLogTable 
                  logs={logs?.filter(log => 
                    ['login', 'logout', 'password_reset', 'permission_change', 
                     'role_change', 'access_denied', 'suspicious_activity'].includes(log.action)
                  ) || []} 
                />
              </Suspense>
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>
                Recent security concerns requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logs?.filter(log => log.action === 'access_denied').slice(0, 5).map(log => (
                  <div key={log.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">
                          Access Denied
                        </p>
                        <p className="text-sm text-red-700">
                          User {log.profiles?.email || log.user_id} attempted to access {log.entity_type}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!logs || logs.filter(log => log.action === 'access_denied').length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No security alerts to display
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}