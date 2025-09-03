import { Metadata } from 'next'
import { SubscriptionPlansManager } from '@/components/super-admin/subscriptions'

export const metadata: Metadata = {
  title: 'Subscription Management',
  description: 'Manage subscription plans and pricing',
}

export default async function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage subscription plans, pricing, and features
        </p>
      </div>
      <SubscriptionPlansManager />
    </div>
  )
}