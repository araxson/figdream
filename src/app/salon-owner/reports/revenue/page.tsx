import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import { getRevenueAnalytics } from '@/lib/data-access/payments/payment-records'
import { RevenueReportContent } from './revenue-report-content'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface PageProps {
  searchParams: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }
}

async function RevenueReportData({ searchParams }: PageProps) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get salon info
  const { data: salonData } = await supabase
    .from('salons')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!salonData) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold">No Salon Found</h1>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don&apos;t have access to any salon. Please contact support if this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Set default date range (last 30 days)
  const endDate = searchParams.endDate || new Date().toISOString().split('T')[0]
  const startDate = searchParams.startDate || (() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })()

  const groupBy = searchParams.groupBy || 'day'

  // Get revenue analytics
  const analytics = await getRevenueAnalytics(salonData.id, {
    startDate,
    endDate,
    groupBy,
  })

  // Get staff earnings for the period
  const { data: staffEarnings } = await supabase
    .from('payment_records')
    .select(`
      staff_id,
      service_amount,
      tip_amount,
      staff:profiles!payment_records_staff_id_fkey(
        id,
        full_name
      )
    `)
    .eq('salon_id', salonData.id)
    .gte('payment_date', startDate)
    .lte('payment_date', endDate)

  // Process staff earnings
  interface StaffEarning {
    staff_name: string
    total_services: number
    total_tips: number
    transaction_count: number
  }
  const staffEarningsMap: Record<string, StaffEarning> = {}
  staffEarnings?.forEach(record => {
    const staffId = record.staff_id
    if (!staffEarningsMap[staffId]) {
      staffEarningsMap[staffId] = {
        staff_name: record.staff?.full_name || 'Unknown',
        total_services: 0,
        total_tips: 0,
        transaction_count: 0,
      }
    }
    staffEarningsMap[staffId].total_services += record.service_amount || 0
    staffEarningsMap[staffId].total_tips += record.tip_amount || 0
    staffEarningsMap[staffId].transaction_count += 1
  })

  const topPerformers = Object.entries(staffEarningsMap)
    .map(([id, data]) => ({
      id,
      ...data,
      total: data.total_services + data.total_tips,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return (
    <RevenueReportContent
      salonName={salonData.name}
      analytics={analytics}
      topPerformers={topPerformers}
      startDate={startDate}
      endDate={endDate}
      groupBy={groupBy}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function RevenueReportPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <RevenueReportData searchParams={searchParams} />
    </Suspense>
  )
}