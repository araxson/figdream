import { createClient } from "@/lib/database/supabase/server"
import { redirect } from "next/navigation"
import { 
  getLocationManagerData, 
  getLocationSchedule,
  getLocationStaff 
} from "@/lib/data-access/location-manager"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui"
import { 
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Info,
  Ban
} from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"

export default async function LocationSchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login/location-manager")
  }
  
  // Get location manager's data
  let locationData
  let scheduleData
  let staff
  
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  
  try {
    locationData = await getLocationManagerData(user.id)
    scheduleData = await getLocationSchedule(locationData.locationId, weekStart, weekEnd)
    staff = await getLocationStaff(locationData.locationId)
  } catch (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Error: Unable to load schedule. {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
  
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
  
  // Group schedule items by day
  const scheduleByDay = weekDays.map(day => {
    const dayString = format(day, 'yyyy-MM-dd')
    
    return {
      date: day,
      blockedTimes: scheduleData.blockedTimes.filter(bt => {
        const blockDate = format(new Date(bt.start_datetime), 'yyyy-MM-dd')
        return blockDate === dayString
      }),
      timeOff: scheduleData.timeOff.filter(to => {
        const startDate = new Date(to.start_date)
        const endDate = new Date(to.end_date)
        return day >= startDate && day <= endDate
      }),
      appointments: scheduleData.appointments.filter(apt => {
        const aptDate = format(new Date(apt.start_time), 'yyyy-MM-dd')
        return aptDate === dayString
      })
    }
  })
  
  // Calculate stats
  const totalBlockedHours = scheduleData.blockedTimes.reduce((total, bt) => {
    const start = new Date(bt.start_datetime)
    const end = new Date(bt.end_datetime)
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  }, 0)
  
  const staffOnLeave = new Set(scheduleData.timeOff.map(to => to.staff_id)).size
  const totalAppointments = scheduleData.appointments.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
        <p className="text-muted-foreground">
          View weekly schedule and availability at {locationData.location.name}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Total appointments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Hours</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBlockedHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Hours blocked this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff on Leave</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffOnLeave}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Staff</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length - staffOnLeave}</div>
            <p className="text-xs text-muted-foreground">Working this week</p>
          </CardContent>
        </Card>
      </div>
      
      {scheduleData.timeOff.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {staffOnLeave} staff member{staffOnLeave > 1 ? 's are' : ' is'} on approved time off this week.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
          <TabsTrigger value="blocked">Blocked Times</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
        </TabsList>
        
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Week of {format(weekStart, 'MMM d, yyyy')}</CardTitle>
              <CardDescription>Staff schedule and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduleByDay.map((day) => {
                  const isToday = format(day.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                  
                  return (
                    <div 
                      key={day.date.toISOString()} 
                      className={`border rounded-lg p-4 ${isToday ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {format(day.date, 'EEEE, MMM d')}
                            {isToday && <Badge className="ml-2" variant="default">Today</Badge>}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span>{day.appointments.length} appointments</span>
                          {day.blockedTimes.length > 0 && (
                            <Badge variant="outline" className="gap-1">
                              <Ban className="h-3 w-3" />
                              {day.blockedTimes.length} blocked
                            </Badge>
                          )}
                          {day.timeOff.length > 0 && (
                            <Badge variant="secondary">
                              {day.timeOff.length} on leave
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {day.blockedTimes.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium mb-1">Blocked Times:</p>
                          <div className="flex flex-wrap gap-2">
                            {day.blockedTimes.map((bt) => (
                              <Badge key={bt.id} variant="outline" className="text-xs">
                                {format(new Date(bt.start_datetime), 'h:mm a')} - {format(new Date(bt.end_datetime), 'h:mm a')}
                                {bt.reason && `: ${bt.reason}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {day.timeOff.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Staff on Leave:</p>
                          <div className="flex flex-wrap gap-2">
                            {day.timeOff.map((to) => (
                              <Badge key={to.id} variant="secondary" className="text-xs">
                                {to.staff_profiles?.profiles?.full_name || 'Unknown'} - {to.type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Time Slots</CardTitle>
              <CardDescription>Times when appointments cannot be scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleData.blockedTimes.length > 0 ? (
                <div className="space-y-2">
                  {scheduleData.blockedTimes.map((bt) => (
                    <div key={bt.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {format(new Date(bt.start_datetime), 'EEE, MMM d')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(bt.start_datetime), 'h:mm a')} - {format(new Date(bt.end_datetime), 'h:mm a')}
                        </div>
                        {bt.reason && (
                          <div className="text-sm mt-1">{bt.reason}</div>
                        )}
                      </div>
                      <div>
                        {bt.staff_id ? (
                          <Badge variant="outline">
                            {bt.staff_profiles?.profiles?.full_name || 'Staff'}
                          </Badge>
                        ) : (
                          <Badge>All Staff</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No blocked times this week</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeoff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Requests</CardTitle>
              <CardDescription>Approved time off for this week</CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleData.timeOff.length > 0 ? (
                <div className="space-y-2">
                  {scheduleData.timeOff.map((to) => (
                    <div key={to.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {to.staff_profiles?.profiles?.full_name || 'Unknown Staff'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(to.start_date), 'MMM d')} - {format(new Date(to.end_date), 'MMM d, yyyy')}
                        </div>
                        {to.notes && (
                          <div className="text-sm mt-1">{to.notes}</div>
                        )}
                      </div>
                      <Badge variant="default">{to.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No time off requests this week</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}