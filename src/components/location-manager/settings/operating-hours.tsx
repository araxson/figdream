import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from "lucide-react"
interface BusinessHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}
interface OperatingHoursProps {
  businessHours: BusinessHours
}
export function OperatingHours({ businessHours }: OperatingHoursProps) {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
        <CardDescription>Operating hours for this location</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {daysOfWeek.map((day) => {
            const hours = businessHours[day] || { open: '09:00', close: '18:00', closed: false }
            return (
              <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium capitalize w-24">{day}</span>
                </div>
                <div>
                  {hours.closed ? (
                    <Badge variant="secondary">Closed</Badge>
                  ) : (
                    <span className="text-sm">
                      {hours.open} - {hours.close}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}