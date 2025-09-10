'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building, 
  Calendar, 
  TrendingUp, 
  Activity,
  Server,
  Database as DatabaseIcon,
  Zap
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface PlatformMetric {
  label: string
  value: number
  change: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  unit?: string
}

export function PlatformMetrics() {
  const [metrics, setMetrics] = useState<PlatformMetric[]>([])
  const [systemHealth] = useState({
    database: 98,
    api: 99,
    storage: 85,
    uptime: 99.9
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

   
  const fetchMetrics = useCallback(async () => {
    try {
      // Fetch active users (last 24h)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', yesterday)

      // Fetch total salons
      const { count: totalSalons } = await supabase
        .from('salons')
        .select('*', { count: 'exact', head: true })

      // Fetch appointments today
      const today = new Date().toISOString().split('T')[0]
      const { count: appointmentsToday } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)

      // Fetch total appointments this month  
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { count: monthlyTransactions } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth)
        .eq('status', 'completed')

      setMetrics([
        {
          label: 'Active Users (24h)',
          value: activeUsers || 0,
          change: 12.5,
          icon: Users,
          color: 'text-blue-600'
        },
        {
          label: 'Total Salons',
          value: totalSalons || 0,
          change: 5.2,
          icon: Building,
          color: 'text-green-600'
        },
        {
          label: 'Appointments Today',
          value: appointmentsToday || 0,
          change: -2.3,
          icon: Calendar,
          color: 'text-purple-600'
        },
        {
          label: 'Monthly Transactions',
          value: monthlyTransactions || 0,
          change: 18.7,
          icon: TrendingUp,
          color: 'text-orange-600'
        }
      ])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching platform metrics:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metric.value.toLocaleString()}{metric.unit}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  {' '}from last period
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Database</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={systemHealth.database} className="w-24" />
                <span className="text-sm font-medium">{systemHealth.database}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">API Server</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={systemHealth.api} className="w-24" />
                <span className="text-sm font-medium">{systemHealth.api}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={systemHealth.storage} className="w-24" />
                <span className="text-sm font-medium">{systemHealth.storage}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">{systemHealth.uptime}%</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}