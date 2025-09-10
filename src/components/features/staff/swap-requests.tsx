import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function ShiftSwapRequests() {
  const requests = [
    { id: 1, from: 'Sarah Johnson', date: 'Jan 15', shift: '9:00 AM - 5:00 PM', status: 'pending' },
    { id: 2, from: 'Mike Wilson', date: 'Jan 18', shift: '2:00 PM - 8:00 PM', status: 'pending' },
    { id: 3, from: 'Emma Davis', date: 'Jan 12', shift: '10:00 AM - 6:00 PM', status: 'approved' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Swap Requests</CardTitle>
        <CardDescription>Review and respond to swap requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{request.from}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.date} • {request.shift}
                  </p>
                </div>
                <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>
                  {request.status}
                </Badge>
              </div>
              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">Accept</Button>
                  <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}