import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OptOutList } from './components/opt-out-list'
import { OptOutStats } from './components/opt-out-stats'
import { AddOptOutDialog } from './components/add-opt-out-dialog'
import { BulkOptOutDialog } from './components/bulk-opt-out-dialog'
import { getSmsOptOuts, getOptOutStats } from '@/lib/data-access/sms-opt-outs'
import { getUserSalonId } from '@/lib/data-access/auth/utils'
import { redirect } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquareOff, TrendingUp, Users, AlertCircle } from 'lucide-react'

export default async function SmsOptOutsPage() {
  const salonId = await getUserSalonId()
  
  if (!salonId) {
    redirect('/salon-admin')
  }

  const [optOuts, stats] = await Promise.all([
    getSmsOptOuts(salonId),
    getOptOutStats(salonId)
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Opt-Outs</h1>
          <p className="text-muted-foreground">
            Manage SMS unsubscribe requests for GDPR compliance
          </p>
        </div>
        <div className="flex gap-2">
          <BulkOptOutDialog salonId={salonId} />
          <AddOptOutDialog salonId={salonId} />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opt-Outs</CardTitle>
            <MessageSquareOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All-time unsubscribes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastMonth}</div>
            <p className="text-xs text-muted-foreground">
              Previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GDPR</div>
            <p className="text-xs text-muted-foreground">
              Compliant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Opt-Out List</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Opt-Out List</CardTitle>
              <CardDescription>
                All phone numbers that have opted out of SMS marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <OptOutList optOuts={optOuts || []} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opt-Out Statistics</CardTitle>
              <CardDescription>
                Analyze opt-out trends and reasons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <OptOutStats stats={stats} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>GDPR Compliance</CardTitle>
              <CardDescription>
                Ensure your SMS marketing meets legal requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">✅ Compliance Checklist</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Automatic opt-out processing for STOP, UNSUBSCRIBE keywords</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Permanent record of all opt-out requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Immediate removal from all SMS campaigns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Option for users to re-subscribe if desired</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Audit trail for all opt-out actions</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">📋 Legal Requirements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Process opt-out requests within 10 business days (TCPA)</li>
                  <li>• Include opt-out instructions in every marketing SMS</li>
                  <li>• Honor opt-outs across all campaigns and lists</li>
                  <li>• Maintain opt-out records for at least 5 years</li>
                  <li>• Never charge for opt-out requests</li>
                </ul>
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="font-semibold mb-2 text-yellow-900">⚠️ Important Notes</h3>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li>• Always include "Reply STOP to unsubscribe" in marketing messages</li>
                  <li>• Process opt-outs immediately upon receipt</li>
                  <li>• Do not send any messages after opt-out except confirmation</li>
                  <li>• Violations can result in fines up to $1,500 per message</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}