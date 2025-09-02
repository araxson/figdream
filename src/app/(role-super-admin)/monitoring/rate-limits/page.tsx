import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  ScrollArea,
  Button,
  Alert,
  AlertDescription,
  Progress,
} from '@/components/ui'
import { AlertTriangle, Shield, Activity } from 'lucide-react'
import { 
  getRateLimitStats,
  cleanupOldRateLimits,
  resetUserRateLimits
} from '@/lib/data-access/security/rate-limits'
import { formatDistanceToNow } from 'date-fns'

export default async function RateLimitsPage() {
  // Get rate limit statistics for last 24 hours
  const stats = await getRateLimitStats({ hours: 24 })
  
  // Cleanup old rate limits (older than 24 hours)
  await cleanupOldRateLimits()
  
  const rateLimitThreshold = 100 // requests per 15 minutes
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rate Limits</h1>
        <p className="text-muted-foreground">Monitor API rate limiting and traffic patterns</p>
      </div>

      {/* High Traffic Alert */}
      {stats.data && stats.data.recentViolations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {stats.data.recentViolations.length} rate limit violations detected in the last 24 hours
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.data?.totalRequests.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.data?.uniqueUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.data?.uniqueIPs || 0}
            </div>
            <p className="text-xs text-muted-foreground">Different sources</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Violations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.data?.recentViolations.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Exceeded limits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>High Traffic Endpoints</CardTitle>
            <CardDescription>Endpoints with most requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.data?.topEndpoints.map((endpoint, index) => {
                const usagePercent = (endpoint.count / rateLimitThreshold) * 100
                const isWarning = usagePercent > 80
                const isCritical = usagePercent > 100
                
                return (
                  <div key={endpoint.endpoint} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-medium truncate max-w-[250px]">
                          {endpoint.endpoint}
                        </span>
                      </div>
                      <Badge 
                        variant={isCritical ? 'destructive' : isWarning ? 'secondary' : 'outline'}
                      >
                        {endpoint.count} / {rateLimitThreshold}
                      </Badge>
                    </div>
                    <Progress 
                      value={Math.min(usagePercent, 100)} 
                      className={`h-2 ${isCritical ? 'bg-destructive/20' : isWarning ? 'bg-yellow-100' : ''}`}
                    />
                  </div>
                )
              }) || []}
            </div>
          </CardContent>
        </Card>

        {/* Recent Violations */}
        <Card>
          <CardHeader>
            <CardTitle>Rate Limit Violations</CardTitle>
            <CardDescription>Recent requests exceeding limits</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {stats.data?.recentViolations.map((violation) => (
                  <div key={violation.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="destructive">
                        {violation.request_count} requests
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(violation.created_at!), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm font-medium truncate">
                      {violation.endpoint}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {violation.user_id && (
                        <span>User: {violation.user_id.slice(0, 8)}...</span>
                      )}
                      {violation.ip_address && (
                        <span>IP: {violation.ip_address}</span>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No rate limit violations detected
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limit Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Configuration</CardTitle>
          <CardDescription>Current rate limiting rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Standard Limit</span>
              </div>
              <p className="text-2xl font-bold">100 requests</p>
              <p className="text-xs text-muted-foreground">Per 15 minute window</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="font-medium">Authenticated Users</span>
              </div>
              <p className="text-2xl font-bold">500 requests</p>
              <p className="text-xs text-muted-foreground">Per 15 minute window</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Premium Users</span>
              </div>
              <p className="text-2xl font-bold">1000 requests</p>
              <p className="text-xs text-muted-foreground">Per 15 minute window</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}