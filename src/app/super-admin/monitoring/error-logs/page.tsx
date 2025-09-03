import { Metadata } from 'next'
import { getErrorLogs } from '@/lib/data-access/monitoring/error-logs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Error Logs',
  description: 'View and analyze system error logs',
}

export default async function ErrorLogsPage() {
  const logs = await getErrorLogs({ limit: 100 })
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Error Logs</h1>
        <p className="text-muted-foreground">
          View and analyze system errors and exceptions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
          <CardDescription>
            Last 100 system errors and exceptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border-l-4 border-destructive pl-4">
                  <div className="font-mono text-sm">{log.error_message}</div>
                  {log.error_type && (
                    <div className="text-sm text-destructive">{log.error_type}</div>
                  )}
                  {log.endpoint && (
                    <div className="text-xs text-muted-foreground">
                      {log.method} {log.endpoint}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No errors logged</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}