'use client'

import { Database } from '@/types/database.types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react'

type AlertHistory = Database['public']['Tables']['alert_history']['Row']

interface AlertHistoryListProps {
  history: AlertHistory[]
}

export function AlertHistoryList({ history }: AlertHistoryListProps) {
  const getSeverityIcon = (severity: string | null) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getSeverityBadge = (severity: string | null) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>
      default:
        return <Badge variant="outline" className="border-green-500 text-green-700">Info</Badge>
    }
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No alert history found
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((alert) => (
        <Card key={alert.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                {getSeverityIcon(alert.severity)}
                <div>
                  <h3 className="font-semibold">{alert.alert_name}</h3>
                  {alert.triggered_at && (
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(alert.triggered_at), 'PPpp')}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getSeverityBadge(alert.severity)}
                {alert.resolved_at && (
                  <Badge variant="outline" className="border-green-500 text-green-700">
                    Resolved
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          {(alert.message || alert.metric_value !== null) && (
            <CardContent>
              {alert.message && (
                <p className="text-sm">{alert.message}</p>
              )}
              {alert.metric_value !== null && (
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="text-muted-foreground">Metric Value:</span>
                  <span className="font-medium">{alert.metric_value}</span>
                  {alert.threshold_exceeded !== null && (
                    <>
                      <span className="text-muted-foreground">Threshold:</span>
                      <span className="font-medium">{alert.threshold_exceeded}</span>
                    </>
                  )}
                </div>
              )}
              {alert.resolved_at && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Resolved at: {format(new Date(alert.resolved_at), 'PPpp')}
                </p>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}