import { Metadata } from 'next'
import { BillingDashboard } from '@/components/super-admin/billing'

export const metadata: Metadata = {
  title: 'Billing Management',
  description: 'Manage platform billing and invoices',
}

export default async function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing Management</h1>
        <p className="text-muted-foreground">
          Manage subscriptions, invoices, and payments
        </p>
      </div>
      <BillingDashboard />
    </div>
  )
}