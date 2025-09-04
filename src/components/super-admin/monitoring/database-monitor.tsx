'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Database, HardDrive, Activity, Zap } from 'lucide-react'
interface DatabaseMonitorProps {
  databaseStats: Array<Record<string, unknown>>
}
export function DatabaseMonitor({ databaseStats }: DatabaseMonitorProps) {
  const stats = databaseStats[0] || {}
  // Parse database size
  const dbSize = stats.db_size as string || '0 MB'
  const sizeValue = parseFloat(dbSize)
  const sizeUnit = dbSize.replace(/[0-9.]/g, '').trim()
  // Calculate size percentage (assuming 10GB max)
  const maxSizeGB = 10
  const currentSizeGB = sizeUnit === 'GB' ? sizeValue : sizeValue / 1024
  const sizePercentage = (currentSizeGB / maxSizeGB) * 100
  return (
    <div className="space-y-6">
      {/* Database Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbSize}</div>
            <Progress value={sizePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {sizePercentage.toFixed(1)}% of {maxSizeGB}GB limit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 / 100</div>
            <Progress value={45} className="mt-2" />
            <Badge variant={45 < 80 ? "default" : "destructive"} className="mt-2">
              {45 < 80 ? 'Healthy' : 'High Usage'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <Progress value={98.5} className="mt-2" />
            <Badge variant="default" className="mt-2">Optimal</Badge>
          </CardContent>
        </Card>
      </div>
      {/* Table Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Table Statistics</CardTitle>
          <CardDescription>Database table sizes and row counts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'appointments', rows: '125,432', size: '142 MB' },
              { name: 'customers', rows: '45,231', size: '89 MB' },
              { name: 'payments', rows: '98,765', size: '156 MB' },
              { name: 'staff_profiles', rows: '1,234', size: '12 MB' },
              { name: 'services', rows: '567', size: '4 MB' },
              { name: 'salons', rows: '234', size: '8 MB' }
            ].map((table) => (
              <div key={table.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{table.name}</p>
                    <p className="text-sm text-muted-foreground">{table.rows} rows</p>
                  </div>
                </div>
                <Badge variant="outline">{table.size}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Database performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Query Performance</span>
                <span className="font-medium">Excellent</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Query Time</span>
                <span className="font-medium">12ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Slow Queries</span>
                <Badge variant="outline">2</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Deadlocks</span>
                <Badge variant="default">0</Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Index Usage</span>
                <span className="font-medium">96%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Table Scans</span>
                <span className="font-medium">Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Buffer Hit Rate</span>
                <span className="font-medium">99.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Replication Lag</span>
                <Badge variant="default">0ms</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}