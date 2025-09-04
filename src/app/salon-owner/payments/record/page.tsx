import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import { getCustomersBySalon } from '@/lib/data-access/customers'
import { getStaffBySalon } from '@/lib/data-access/staff'
import { PaymentRecordPage } from './payment-record-page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

async function PaymentRecordContent() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get salon info for the current user
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

  // Fetch customers and staff for the salon
  const [customers, staff] = await Promise.all([
    getCustomersBySalon(salonData.id),
    getStaffBySalon(salonData.id)
  ])

  return (
    <PaymentRecordPage
      salonId={salonData.id}
      salonName={salonData.name}
      customers={customers}
      staff={staff}
      userId={user.id}
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
        <Skeleton className="h-10 w-32" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function RecordPaymentPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PaymentRecordContent />
    </Suspense>
  )
}