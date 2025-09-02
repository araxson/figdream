import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Badge,
  Alert,
  AlertDescription,
  ScrollArea,
  Skeleton,
} from '@/components/ui'
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Coffee,
  CalendarOff
} from 'lucide-react'
import { format, startOfWeek, addDays, parseISO } from 'date-fns'
import type { Database } from '@/types/database.types'

type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row']
type StaffBreak = Database['public']['Tables']['staff_breaks']['Row']
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']

async function getStaffSchedules(salonId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_schedules')
    .select(`
      *,
      staff_profiles (
        id,
        display_name,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('salon_id', salonId)
    .order('day_of_week', { ascending: true })

  if (error) {
    console.error('Error fetching staff schedules:', error)
    return []
  }

  return data || []
}

async function getStaffBreaks(salonId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_breaks')
    .select(`
      *,
      staff_profiles (
        id,
        display_name
      )
    `)
    .eq('salon_id', salonId)
    .order('break_start', { ascending: true })

  if (error) {
    console.error('Error fetching staff breaks:', error)
    return []
  }

  return data || []
}

async function getTimeOffRequests(salonId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('time_off_requests')
    .select(`
      *,
      staff_profiles (
        id,
        display_name,
        profiles (
          full_name
        )
      )
    `)
    .eq('salon_id', salonId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching time off requests:', error)
    return []
  }

  return data || []
}

async function getStaffList(salonId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_name', { ascending: true })

  if (error) {
    console.error('Error fetching staff list:', error)
    return []
  }

  return data || []
}

function ScheduleLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export default async function StaffSchedulePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login/salon-owner')
  }

  // Get salon ID for the current user
  const { data: salonData } = await supabase
    .from('salons')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!salonData) {
    redirect('/salon-admin/dashboard')
  }

  const [schedules, breaks, timeOffRequests, staffList] = await Promise.all([
    getStaffSchedules(salonData.id),
    getStaffBreaks(salonData.id),
    getTimeOffRequests(salonData.id),
    getStaffList(salonData.id)
  ])

  // Group schedules by staff
  const schedulesByStaff = schedules.reduce((acc, schedule) => {
    const staffId = schedule.staff_id
    if (!acc[staffId]) {
      acc[staffId] = []
    }
    acc[staffId].push(schedule)
    return acc
  }, {} as Record<string, typeof schedules>)

  // Group breaks by day
  const breaksByDay = breaks.reduce((acc, breakItem) => {
    const day = format(parseISO(breakItem.break_start), 'EEEE')
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(breakItem)
    return acc
  }, {} as Record<string, typeof breaks>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Schedule Management</h1>
          <p className="text-muted-foreground">
            Manage staff schedules, breaks, and time-off requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
          <Button variant="outline">
            <CalendarOff className="mr-2 h-4 w-4" />
            Block Time
          </Button>
        </div>
      </div>

      {/* Time Off Requests Alert */}
      {timeOffRequests.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {timeOffRequests.length} pending time-off requests to review
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="staff">By Staff</TabsTrigger>
          <TabsTrigger value="breaks">Breaks</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule Overview</CardTitle>
              <CardDescription>
                View and manage staff schedules for the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {DAYS_OF_WEEK.map((day, dayIndex) => {
                    const daySchedules = schedules.filter(s => s.day_of_week === dayIndex)
                    const dayBreaks = breaksByDay[day] || []
                    
                    return (
                      <Card key={day}>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">{day}</CardTitle>
                            <Badge variant="secondary">
                              {daySchedules.length} staff scheduled
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                        
                        {daySchedules.length > 0 ? (
                          <div className="space-y-2">
                            {daySchedules.map((schedule) => (
                              <div 
                                key={schedule.id} 
                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {schedule.staff_profiles?.profiles?.full_name || 'Staff Member'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      <Clock className="inline h-3 w-3 mr-1" />
                                      {schedule.start_time} - {schedule.end_time}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            
                            {dayBreaks.length > 0 && (
                              <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                  <Coffee className="inline h-3 w-3 mr-1" />
                                  Breaks scheduled: {dayBreaks.length}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No staff scheduled</p>
                        )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Schedule Details</CardTitle>
              <CardDescription>
                Individual staff member schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staffList.map((staff) => {
                  const staffSchedules = schedulesByStaff[staff.id] || []
                  
                  return (
                    <Card key={staff.id}>
                      <CardContent>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                {staff.profiles?.full_name || 'Staff Member'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {staff.profiles?.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {staff.specialties?.join(', ') || 'No specialties'}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit Schedule
                          </Button>
                        </div>
                        
                        {staffSchedules.length > 0 ? (
                          <div className="mt-4 space-y-1">
                            {staffSchedules.map((schedule) => (
                              <div key={schedule.id} className="text-sm">
                                <span className="font-medium">
                                  {DAYS_OF_WEEK[schedule.day_of_week]}:
                                </span>{' '}
                                {schedule.start_time} - {schedule.end_time}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-4 text-sm text-muted-foreground">
                            No schedule configured
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breaks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Break Schedule</CardTitle>
              <CardDescription>
                Manage staff break times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {breaks.map((breakItem) => (
                  <div key={breakItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Coffee className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium">
                          {breakItem.staff_profiles?.profiles?.full_name || 'Staff Member'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(breakItem.break_start), 'PPp')} -{' '}
                          {format(parseISO(breakItem.break_end), 'p')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {breaks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No breaks scheduled
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeoff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Requests</CardTitle>
              <CardDescription>
                Review and approve time off requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeOffRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {request.staff_profiles?.profiles?.full_name || 'Staff Member'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(parseISO(request.start_date), 'PP')} -{' '}
                          {format(parseISO(request.end_date), 'PP')}
                        </p>
                        <p className="text-sm mt-2">{request.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600">
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {timeOffRequests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No pending time off requests
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}