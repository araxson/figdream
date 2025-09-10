import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function TimeOffRequests() {
  const requests = [
    { id: 1, dates: 'Jan 20-22', reason: 'Personal', status: 'approved', days: 3 },
    { id: 2, dates: 'Feb 14-15', reason: 'Medical', status: 'pending', days: 2 },
    { id: 3, dates: 'Mar 1-8', reason: 'Vacation', status: 'pending', days: 8 },
  ]

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default'
      case 'pending': return 'secondary'
      case 'declined': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Off Requests</CardTitle>
        <CardDescription>Your vacation and time off history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Available Days:</span>
            <span className="font-medium">12 days</span>
          </div>
          
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">{request.dates}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.reason} • {request.days} days
                  </p>
                </div>
                <Badge variant={getStatusVariant(request.status)}>
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}