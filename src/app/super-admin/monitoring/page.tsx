import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, BarChart3, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'System Monitoring',
  description: 'Monitor system performance and health',
}

export default async function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
        <p className="text-muted-foreground">
          Real-time system monitoring and alerts
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/super-admin/monitoring/api-usage">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                API Usage
              </CardTitle>
              <CardDescription>
                Monitor API endpoints and usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Requests today</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/super-admin/monitoring/error-logs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Logs
              </CardTitle>
              <CardDescription>
                Track and analyze system errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Errors today</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/super-admin/monitoring/rate-limits">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rate Limits
              </CardTitle>
              <CardDescription>
                Monitor rate limiting and throttling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Limits hit today</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}