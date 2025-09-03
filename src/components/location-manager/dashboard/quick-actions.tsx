import { Database } from "@/types/database.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
type Location = Database['public']['Tables']['locations']['Row']
interface QuickActionsProps {
  metrics: {
    todaysAppointments: number
    todaysRevenue: number
    activeStaff: number
    utilizationRate: number
  }
  location: Location
}
export function QuickActions({ metrics, location }: QuickActionsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Appointment Completion Rate</span>
            <span className="text-sm font-medium">
              {metrics.todaysAppointments > 0 
                ? `${Math.round((metrics.todaysAppointments / (metrics.todaysAppointments + 1)) * 100)}%`
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Average Revenue per Appointment</span>
            <span className="text-sm font-medium">
              ${metrics.todaysAppointments > 0 
                ? (metrics.todaysRevenue / metrics.todaysAppointments).toFixed(2)
                : "0.00"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Staff Availability</span>
            <span className="text-sm font-medium">
              {metrics.activeStaff > 0 
                ? `${metrics.activeStaff - Math.round(metrics.activeStaff * metrics.utilizationRate / 100)} available`
                : "No staff"}
            </span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Location Information</CardTitle>
          <CardDescription>Your assigned location details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">{location.name}</p>
            <p className="text-sm text-muted-foreground">
              {location.address_line_1}
              {location.address_line_2 && `, ${location.address_line_2}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {location.city}, {location.state_province} {location.postal_code}
            </p>
          </div>
          {location.phone && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{location.phone}</p>
            </div>
          )}
          {location.email && (
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{location.email}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}