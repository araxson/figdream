'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Star, Clock, Calendar } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { Database } from '@/types/database.types'
import { formatCurrency } from '@/lib/utils/format'
import { cn } from '@/lib/utils'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

type StaffPerformance = {
  staff: StaffProfile
  totalRevenue: number
  appointmentCount: number
  averageRating: number
  utilizationRate: number
  clientRetention: number
}

export function StaffPerformance() {
  const [performances, setPerformances] = useState<StaffPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange] = useState('month')

  const fetchPerformanceData = useCallback(async () => {
    try {
      const response = await fetch(`/api/staff/performance?dateRange=${dateRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch performance data')
      }
      
      const data = await response.json()
      setPerformances(data.performances || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching performance data:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchPerformanceData()
  }, [fetchPerformanceData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("flex items-center justify-center py-8")}>
            Loading performance data...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-6")}>
            {performances.map((perf, index) => {
              const initials = `${perf.staff.profiles?.first_name?.[0] || ''}${perf.staff.profiles?.last_name?.[0] || ''}`.toUpperCase()
              
              return (
                <div key={perf.staff.id} className={cn("space-y-4 pb-6 border-b last:border-0")}>
                  <div className={cn("flex items-start justify-between")}>
                    <div className={cn("flex items-center gap-3")}>
                      <div className={cn("relative")}>
                        <Avatar>
                          <AvatarImage src={perf.staff.profiles?.avatar_url || undefined} />
                          <AvatarFallback>{initials || 'ST'}</AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <div className={cn("absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold")}>
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className={cn("font-semibold")}>
                          {perf.staff.profiles?.first_name} {perf.staff.profiles?.last_name}
                        </h3>
                        <p className={cn("text-sm text-muted-foreground")}>{perf.staff.title || 'Staff'}</p>
                      </div>
                    </div>
                    <div className={cn("text-right")}>
                      <div className={cn("text-2xl font-bold")}>{formatCurrency(perf.totalRevenue)}</div>
                      <div className={cn("text-sm text-muted-foreground")}>Total Revenue</div>
                    </div>
                  </div>

                  <div className={cn("grid grid-cols-4 gap-4")}>
                    <div className={cn("space-y-2")}>
                      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground")}>
                        <Calendar className={cn("h-3 w-3")} />
                        Appointments
                      </div>
                      <div className={cn("text-xl font-semibold")}>{perf.appointmentCount}</div>
                    </div>
                    
                    <div className={cn("space-y-2")}>
                      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground")}>
                        <Star className={cn("h-3 w-3")} />
                        Rating
                      </div>
                      <div className={cn("text-xl font-semibold")}>
                        {perf.averageRating.toFixed(1)}
                      </div>
                    </div>
                    
                    <div className={cn("space-y-2")}>
                      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground")}>
                        <Clock className={cn("h-3 w-3")} />
                        Utilization
                      </div>
                      <div className={cn("flex items-center gap-2")}>
                        <div className={cn("text-xl font-semibold")}>
                          {perf.utilizationRate.toFixed(0)}%
                        </div>
                        <Progress value={perf.utilizationRate} className={cn("w-16")} />
                      </div>
                    </div>
                    
                    <div className={cn("space-y-2")}>
                      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground")}>
                        <TrendingUp className={cn("h-3 w-3")} />
                        Retention
                      </div>
                      <div className={cn("flex items-center gap-2")}>
                        <div className={cn("text-xl font-semibold")}>
                          {perf.clientRetention.toFixed(0)}%
                        </div>
                        <Progress value={perf.clientRetention} className={cn("w-16")} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}