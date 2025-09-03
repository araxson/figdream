import { Metadata } from 'next'
import { PlatformAnalyticsDashboard } from '@/components/super-admin/analytics'

export const metadata: Metadata = {
  title: 'Platform Analytics',
  description: 'Platform-wide analytics and insights',
}

export default async function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">
          System-wide performance metrics and insights
        </p>
      </div>
      <PlatformAnalyticsDashboard />
    </div>
  )
}