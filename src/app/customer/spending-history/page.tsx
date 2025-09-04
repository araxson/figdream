import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getUserWithRole } from '@/lib/data-access/auth'
import { getCustomerPaymentHistory } from '@/lib/data-access/payments'
import { CustomerSpendingHistory } from './customer-spending-history'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: 'Spending History | FigDream',
  description: 'View your spending history across all salons',
}

async function SpendingHistoryContent() {
  const { user, role } = await getUserWithRole()
  
  if (!user || role !== 'customer') {
    redirect('/login')
  }

  const { data: payments, count } = await getCustomerPaymentHistory(user.id, {
    limit: 50,
  })

  return <CustomerSpendingHistory customerId={user.id} initialPayments={payments} totalCount={count} />
}

export default function SpendingHistoryPage() {
  return (
    <div className="container mx-auto p-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <SpendingHistoryContent />
      </Suspense>
    </div>
  )
}