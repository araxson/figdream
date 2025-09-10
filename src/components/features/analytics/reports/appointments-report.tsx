'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AppointmentReportProps {
  dateRange: string
}

export function AppointmentReport({ dateRange }: AppointmentReportProps) {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    noShow: 0,
    averageDuration: 0,
    peakHours: [] as { hour: number; count: number }[],
    byStatus: [] as { status: string; count: number }[]
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchAppointmentStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const now = new Date()
      const startDate = dateRange === 'month' 
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())

      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('salon_id', salon.id)
        .gte('appointment_date', startDate.toISOString().split('T')[0])

      if (!appointments) return

      // Calculate statistics
      const completed = appointments.filter(a => a.status === 'completed').length
      const cancelled = appointments.filter(a => a.status === 'cancelled').length
      const noShow = appointments.filter(a => a.status === 'no_show').length

      // Calculate peak hours
      const hourCounts = appointments.reduce((acc, apt) => {
        const hour = parseInt(apt.start_time.split(':')[0])
        acc[hour] = (acc[hour] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      const peakHours = Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setStats({
        total: appointments.length,
        completed,
        cancelled,
        noShow,
        averageDuration: 60,
        peakHours,
        byStatus: [
          { status: 'Completed', count: completed },
          { status: 'Cancelled', count: cancelled },
          { status: 'No Show', count: noShow },
          { status: 'Pending', count: appointments.filter(a => a.status === 'pending').length }
        ]
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching appointment stats:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase, dateRange])

  useEffect(() => {
    fetchAppointmentStats()
  }, [fetchAppointmentStats])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading appointment data...
          </div>
        </CardContent>
      </Card>
    )
  }

  const completionRate = stats.total > 0 ? (stats.completed / stats.total * 100) : 0
  const cancellationRate = stats.total > 0 ? (stats.cancelled / stats.total * 100) : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === 'month' ? 'This month' : 'Last 3 months'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellation Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancellationRate.toFixed(1)}%</div>
            <Progress value={cancellationRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDuration} min</div>
            <p className="text-xs text-muted-foreground">Per appointment</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.status}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <Progress 
                      value={stats.total > 0 ? (item.count / stats.total * 100) : 0} 
                      className="w-24"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.peakHours.map((hour) => {
                const hourStr = `${hour.hour}:00`
                const percentage = stats.total > 0 ? (hour.count / stats.total * 100) : 0
                
                return (
                  <div key={hour.hour} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{hourStr}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{hour.count}</span>
                      <Progress value={percentage * 5} className="w-24" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}