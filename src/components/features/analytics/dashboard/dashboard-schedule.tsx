import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Coffee } from 'lucide-react'
import Link from 'next/link'
import { ScheduleItem } from '@/types/features/dashboard-types'

interface DashboardScheduleProps {
  schedule: ScheduleItem[]
  breaks: Array<{ time: string; type: string }>
}

export function DashboardSchedule({ schedule, breaks }: DashboardScheduleProps) {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'upcoming': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed': return <Badge variant="outline" className="text-green-600">Completed</Badge>
      case 'in-progress': return <Badge className="bg-blue-500">In Progress</Badge>
      case 'upcoming': return <Badge variant="outline">Upcoming</Badge>
      default: return null
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today&apos;s Schedule</CardTitle>
                <CardDescription>Your appointments for today</CardDescription>
              </div>
              <Link href="/staff/schedule">
                <Button variant="outline" size="sm">View Full Schedule</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-9 top-3 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {schedule.map((item, index) => (
                  <div key={index} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)} ring-4 ring-white`} />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-muted-foreground">{item.time}</p>
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="font-medium">{item.customer}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.service} • {item.duration}
                          </p>
                        </div>
                        {item.status === 'upcoming' && (
                          <Button size="sm" variant="outline">Start</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coffee className="h-4 w-4" />
              Scheduled Breaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {breaks.map((breakItem, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{breakItem.time}</p>
                    <p className="text-xs text-muted-foreground">{breakItem.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}