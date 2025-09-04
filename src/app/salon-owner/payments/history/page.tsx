import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import { getPaymentRecordsBySalon } from '@/lib/data-access/payments/payment-records'
import { PaymentHistoryContent } from './payment-history-content'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  searchParams: {
    page?: string
    search?: string
    startDate?: string
    endDate?: string
    staffId?: string
    customerId?: string
    paymentMethod?: string
  }
}

async function PaymentHistoryData({ searchParams }: PageProps) {
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
            <CardTitle>No Salon Found</CardTitle>
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

  // Parse search params
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  // Get payment records with filters
  const { data: payments, count } = await getPaymentRecordsBySalon(salonData.id, {
    startDate: searchParams.startDate,
    endDate: searchParams.endDate,
    staffId: searchParams.staffId,
    customerId: searchParams.customerId,
    paymentMethod: searchParams.paymentMethod,
    limit,
    offset,
  })

  // Get staff and customers for filters
  const [staffResult, customersResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'staff')
      .eq('salon_id', salonData.id),
    supabase
      .from('bookings')
      .select('customer_id, profiles!inner(id, full_name, email)')
      .eq('salon_id', salonData.id)
      .limit(100)
  ])

  // Extract unique customers
  const uniqueCustomers = customersResult.data
    ? Array.from(
        new Map(
          customersResult.data.map((b) => [
            b.profiles.id,
            { id: b.profiles.id, full_name: b.profiles.full_name, email: b.profiles.email }
          ])
        ).values()
      )
    : []

  return (
    <PaymentHistoryContent
      payments={payments}
      totalCount={count || 0}
      currentPage={page}
      pageSize={limit}
      salonName={salonData.name}
      staff={staffResult.data || []}
      customers={uniqueCustomers}
      searchParams={searchParams}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentHistoryPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PaymentHistoryData searchParams={searchParams} />
    </Suspense>
  )
}