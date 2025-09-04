import { Metadata } from 'next'
import { PaymentMethodList } from '@/components/shared/payment/payment-method-list'

export const metadata: Metadata = {
  title: 'Payment Methods',
  description: 'Manage your payment methods',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Methods</h1>
        <p className="text-muted-foreground">Manage your saved payment methods</p>
      </div>
      
      <PaymentMethodList />
    </div>
  )
}