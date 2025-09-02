import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  ScrollArea,
  Button,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { 
  getErrorStats, 
  getCriticalErrors,
  getUserErrors,
  resolveError,
  type ErrorSeverity,
  type ErrorCategory
} from '@/lib/data-access/monitoring/error-logs'
import { formatDistanceToNow } from 'date-fns'

export default async function ErrorLogsPage() {
  // Get stats for last 7 days
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 7)
  const endDate = new Date()
  
  const stats = await getErrorStats(startDate, endDate)
  const criticalErrors = await getCriticalErrors(20)
  
  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }
  
  const getCategoryIcon = (category: ErrorCategory) => {
    switch (category) {
      case 'database': return '🗄️'
      case 'api': return '🔌'
      case 'auth': return '🔐'
      case 'payment': return '💳'
      case 'ui': return '🖥️'
      case 'system': return '⚙️'
      case 'business_logic': return '📊'
      case 'third_party': return '🌐'
      default: return '❓'
    }
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Error Logs</h1>
        <p className="text-muted-foreground">Monitor and manage application errors</p>
      </div>

      {/* Critical Errors Alert */}
      {criticalErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {criticalErrors.length} unresolved critical errors require immediate attention
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalErrors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.errorsBySeverity.critical}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.errorsBySeverity.high} high severity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errorRate.toFixed(1)}/hr</div>
            <p className="text-xs text-muted-foreground">Average per hour</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.errorsByCategory)
                .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.entries(stats.errorsByCategory)
                .sort(([, a], [, b]) => b - a)[0]?.[1] || 0} errors
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="severity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="severity">By Severity</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="recent">Recent Errors</TabsTrigger>
          <TabsTrigger value="top">Top Errors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="severity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Error Severity Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.errorsBySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(severity as ErrorSeverity)}>
                        {severity}
                      </Badge>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Critical Errors</CardTitle>
                <CardDescription>Unresolved critical issues</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {criticalErrors.slice(0, 5).map((error) => (
                      <div key={error.id} className="p-2 border rounded">
                        <p className="text-sm font-medium truncate">{error.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(error.created_at!), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="category" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Errors by Category</CardTitle>
              <CardDescription>Distribution across different system areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(stats.errorsByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(category as ErrorCategory)}</span>
                      <div>
                        <p className="text-sm font-medium capitalize">{category.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{count} errors</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest errors across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {stats.recentErrors.map((error) => (
                    <div key={error.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(error.severity as ErrorSeverity)}>
                            {error.severity}
                          </Badge>
                          <Badge variant="outline">
                            {error.category}
                          </Badge>
                          {error.resolved && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm font-medium">{error.message}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(error.created_at!), { addSuffix: true })}
                          </span>
                          {error.user_id && (
                            <span className="text-xs text-muted-foreground">
                              User: {error.user_id.slice(0, 8)}...
                            </span>
                          )}
                          {error.url && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {error.url}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Frequent Errors</CardTitle>
              <CardDescription>Top recurring error messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topErrors.map((error, index) => (
                  <div key={error.message} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">{error.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Last: {formatDistanceToNow(error.lastOccurred, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {error.count} occurrences
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}