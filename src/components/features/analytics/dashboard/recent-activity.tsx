import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { getRecentActivity } from './queries'
import { formatDate } from '@/lib/utils/format'

export async function RecentActivity() {
  const activities = await getRecentActivity()
  
  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Badge variant="default">Appointment</Badge>
      case 'review':
        return <Badge variant="secondary">Review</Badge>
      case 'registration':
        return <Badge variant="outline">Registration</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest system events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No recent activity
              </p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="mt-0.5">
                    {getActivityBadge(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {formatDate(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}