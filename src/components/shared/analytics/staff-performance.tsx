'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Avatar, AvatarFallback, AvatarImage, Badge, Progress } from '@/components/ui'
import { Clock, DollarSign } from 'lucide-react'
interface StaffPerformanceProps {
  data?: {
    topPerformers: Array<{
      name: string
      appointments: number
      completed: number
      revenue: number
      utilization: number
      avatar?: string
    }>
    staffMetrics: Record<string, {
      appointments: number
      completed: number
      revenue: number
      utilization: number
    }>
  }
}
export function StaffPerformance({ data }: StaffPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Performance</CardTitle>
        <CardDescription>
          Top performing staff members and their metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data?.topPerformers.map((staff, index) => (
            <div key={staff.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={staff.avatar} />
                    <AvatarFallback>
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                      1
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="font-medium">{staff.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{staff.appointments} appointments</span>
                    <span>•</span>
                    <span>${staff.revenue.toLocaleString()} revenue</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{staff.utilization}%</p>
                  <p className="text-xs text-muted-foreground">Utilization</p>
                </div>
                <Progress value={staff.utilization} className="w-[60px]" />
              </div>
            </div>
          ))}
          {/* Overall Metrics */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Avg Utilization</span>
                </div>
                <p className="text-lg font-semibold">
                  {data?.topPerformers && data.topPerformers.length > 0 
                    ? `${(data.topPerformers.reduce((acc, s) => acc + s.utilization, 0) / data.topPerformers.length).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Revenue</span>
                </div>
                <p className="text-lg font-semibold">
                  ${data?.topPerformers.reduce((acc, s) => acc + s.revenue, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}