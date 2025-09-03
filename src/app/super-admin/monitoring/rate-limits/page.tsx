import { Metadata } from 'next'
import { getRateLimitStats } from '@/lib/data-access/security/rate-limits'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Rate Limiting',
  description: 'Monitor rate limiting and API throttling',
}

export default async function RateLimitsPage() {
  const stats = await getRateLimitStats()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rate Limiting</h1>
        <p className="text-muted-foreground">
          Monitor API rate limits and throttling
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Rate Limit Hits</CardTitle>
            <CardDescription>Number of rate limit violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.data?.totalRequests ?? 0}</div>
            <p className="text-sm text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unique IPs</CardTitle>
            <CardDescription>Unique IPs making requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.data?.uniqueIPs ?? 0}</div>
            <p className="text-sm text-muted-foreground">Active blocks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unique Users</CardTitle>
            <CardDescription>Users making requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.data?.uniqueUsers ?? 0}</div>
            <p className="text-sm text-muted-foreground">Currently throttled</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}