import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AppointmentHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
        <CardDescription>View your past appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Your appointment history will be displayed here</p>
      </CardContent>
    </Card>
  )
}