import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Users, Calendar, DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { createClient } from "@/lib/database/supabase/server"
import { redirect } from "next/navigation"
import { getLocationManagerData, getLocationMetrics } from "@/lib/data-access/location-manager"

export default async function LocationManagerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login/location-manager")
  }
  
  // Get location manager's assigned location
  let locationData
  let metrics
  
  try {
    locationData = await getLocationManagerData(user.id)
    metrics = await getLocationMetrics(locationData.locationId)
  } catch (error) {
    // User is not a location manager or has no assigned location
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Access Denied: You are not assigned as a location manager or have no location assigned.
          </p>
        </div>
      </div>
    )
  }
  
  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }
  
  const getChangeText = (change: number, prefix: string = "") => {
    if (change > 0) return `+${prefix}${Math.abs(change)} from yesterday`
    if (change < 0) return `-${prefix}${Math.abs(change)} from yesterday`
    return "Same as yesterday"
  }
  
  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Location Dashboard</h1>
        <p className="text-muted-foreground">
          Managing: {locationData.location.name} - {locationData.location.address_line_1}, {locationData.location.city}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.todaysAppointments}</div>
            <div className="flex items-center gap-1">
              {getChangeIcon(metrics.appointmentChange)}
              <p className={`text-xs ${getChangeColor(metrics.appointmentChange)}`}>
                {getChangeText(metrics.appointmentChange)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeStaff}</div>
            <p className="text-xs text-muted-foreground">
              Currently on duty
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.todaysRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.utilizationRate}%</div>
            <p className="text-xs text-muted-foreground">
              Staff with appointments today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
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
                  ? `${Math.round((metrics.todaysAppointments / (metrics.todaysAppointments + metrics.appointmentChange)) * 100)}%`
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
              <p className="text-sm font-medium">{locationData.location.name}</p>
              <p className="text-sm text-muted-foreground">
                {locationData.location.address_line_1}
                {locationData.location.address_line_2 && `, ${locationData.location.address_line_2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {locationData.location.city}, {locationData.location.state_province} {locationData.location.postal_code}
              </p>
            </div>
            {locationData.location.phone && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{locationData.location.phone}</p>
              </div>
            )}
            {locationData.location.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{locationData.location.email}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}