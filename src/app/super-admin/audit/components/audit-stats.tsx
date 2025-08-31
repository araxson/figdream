'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { format } from 'date-fns'

interface AuditStatsProps {
  stats: {
    totalEvents: number
    byAction: Record<string, number>
    byEntity: Record<string, number>
    byDay: Record<string, number>
    recentActivity: any[]
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function AuditStats({ stats }: AuditStatsProps) {
  // Prepare data for charts
  const actionData = Object.entries(stats.byAction)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const entityData = Object.entries(stats.byEntity)
    .map(([entity, count]) => ({ entity, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const dayData = Object.entries(stats.byDay)
    .map(([day, count]) => ({
      day: format(new Date(day), 'MMM d'),
      date: day,
      count
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const maxActionCount = Math.max(...actionData.map(d => d.count), 1)

  return (
    <div className="space-y-6">
      {/* Activity Over Time */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ fill: '#8884d8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Actions Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Top Actions</h3>
          <div className="space-y-3">
            {actionData.map((item, index) => (
              <div key={item.action} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">
                    {item.action.replace('_', ' ')}
                  </span>
                  <span className="text-muted-foreground">
                    {item.count} ({((item.count / stats.totalEvents) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Progress 
                  value={(item.count / maxActionCount) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Entity Types */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Entity Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={entityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ entity, percent }) => `${entity} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {entityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity Patterns */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Activity Patterns</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Most Active Day</p>
            <p className="text-2xl font-bold">
              {dayData.length > 0 
                ? dayData.reduce((max, day) => day.count > max.count ? day : max).day
                : 'N/A'
              }
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
            <p className="text-2xl font-bold">
              {dayData.length > 0 
                ? Math.round(stats.totalEvents / dayData.length)
                : 0
              }
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Peak Activity</p>
            <p className="text-2xl font-bold">
              {dayData.length > 0 
                ? Math.max(...dayData.map(d => d.count))
                : 0
              } events
            </p>
          </div>
        </div>
      </Card>

      {/* Security Insights */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Security Insights</h3>
        <div className="space-y-3">
          {stats.byAction['login'] && (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Login Attempts</p>
                <p className="text-sm text-muted-foreground">Total authentication events</p>
              </div>
              <Badge variant="default">{stats.byAction['login']}</Badge>
            </div>
          )}
          
          {stats.byAction['access_denied'] && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50">
              <div>
                <p className="font-medium text-red-900">Access Denied</p>
                <p className="text-sm text-red-700">Unauthorized access attempts</p>
              </div>
              <Badge variant="destructive">{stats.byAction['access_denied']}</Badge>
            </div>
          )}
          
          {stats.byAction['permission_change'] && (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium">Permission Changes</p>
                <p className="text-sm text-muted-foreground">Role and permission updates</p>
              </div>
              <Badge variant="outline">{stats.byAction['permission_change']}</Badge>
            </div>
          )}

          {!stats.byAction['access_denied'] && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-green-50">
              <div>
                <p className="font-medium text-green-900">No Security Issues</p>
                <p className="text-sm text-green-700">No unauthorized access attempts detected</p>
              </div>
              <Badge variant="outline" className="bg-green-100">Secure</Badge>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}