import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ShiftSwapRequests() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Swap Requests</CardTitle>
        <CardDescription>Review and respond to swap requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Shift swap functionality is coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  )
}