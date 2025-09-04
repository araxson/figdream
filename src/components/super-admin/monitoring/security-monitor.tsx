'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Shield, Lock, UserX, Key, AlertTriangle } from 'lucide-react'
interface SecurityMonitorProps {
  securityEventsData: Array<Record<string, unknown>>
  auditLogsData: Array<Record<string, unknown>>
}
export function SecurityMonitor({ securityEventsData, auditLogsData }: SecurityMonitorProps) {
  // Process security events by type
  const processSecurityEvents = () => {
    const eventTypes: Record<string, { count: number; severity: string }> = {}
    securityEventsData.forEach((event: Record<string, unknown>) => {
      const type = event.event_type as string || 'unknown'
      const severity = event.severity as string || 'low'
      if (!eventTypes[type]) {
        eventTypes[type] = { count: 0, severity }
      }
      eventTypes[type].count++
    })
    return Object.entries(eventTypes).map(([type, data]) => ({
      type,
      count: data.count,
      severity: data.severity
    }))
  }
  // Process failed login attempts
  const processFailedLogins = () => {
    const failedLogins = auditLogsData.filter((log: Record<string, unknown>) => 
      log.action === 'login_failed' || log.action === 'authentication_failed'
    )
    const byUser: Record<string, number> = {}
    failedLogins.forEach((log: Record<string, unknown>) => {
      const userId = log.user_id as string || 'unknown'
      byUser[userId] = (byUser[userId] || 0) + 1
    })
    return Object.entries(byUser)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }
  // Process suspicious activities
  const processSuspiciousActivities = () => {
    return auditLogsData.filter((log: Record<string, unknown>) => {
      const action = log.action as string || ''
      return action.includes('denied') || 
             action.includes('blocked') || 
             action.includes('unauthorized') ||
             action.includes('violation')
    }).slice(0, 10)
  }
  const securityEvents = processSecurityEvents()
  const failedLogins = processFailedLogins()
  const suspiciousActivities = processSuspiciousActivities()
  const getSeverityColor = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'outline'
    }
  }
  const getSeverityIcon = (severity: string) => {
    switch(severity.toLowerCase()) {
      case 'critical': return AlertCircle
      case 'high': return AlertTriangle
      case 'medium': return Shield
      default: return Lock
    }
  }
  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEventsData.length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedLogins.reduce((sum, fl) => sum + fl.count, 0)}</div>
            <p className="text-xs text-muted-foreground">Unique users: {failedLogins.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspiciousActivities.length}</div>
            <Badge variant={suspiciousActivities.length > 5 ? "destructive" : "secondary"} className="mt-1">
              {suspiciousActivities.length > 5 ? 'High' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {100 - Math.min(100, (failedLogins.length * 5 + suspiciousActivities.length * 10))}%
            </div>
            <p className="text-xs text-muted-foreground">System security health</p>
          </CardContent>
        </Card>
      </div>
      {/* Security Events by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events by Type</CardTitle>
          <CardDescription>Recent security events categorized by type and severity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.length > 0 ? (
              securityEvents.map((event, index) => {
                const Icon = getSeverityIcon(event.severity)
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium capitalize">{event.type.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">{event.count} occurrences</p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(event.severity)}>
                      {event.severity}
                    </Badge>
                  </div>
                )
              })
            ) : (
              <p className="text-center text-muted-foreground py-4">No security events detected</p>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Failed Login Attempts */}
      {failedLogins.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Failed Login Attempts Detected</strong>
            <div className="mt-2 space-y-1">
              {failedLogins.map((fl, index) => (
                <div key={index} className="text-sm">
                  User {fl.userId.substring(0, 8)}... - {fl.count} attempts
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      {/* Suspicious Activities Log */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Suspicious Activities</CardTitle>
          <CardDescription>Activities that may indicate security issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {suspiciousActivities.length > 0 ? (
              suspiciousActivities.map((activity: Record<string, unknown>, index) => (
                <div key={index} className="flex items-start gap-3 p-2 rounded">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action as string}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user_id ? `User: ${(activity.user_id as string).substring(0, 8)}...` : 'System'} • 
                      {new Date(activity.created_at as string).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No suspicious activities detected</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}