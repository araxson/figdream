import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { Coffee, Clock, Calendar, TrendingUp, AlertCircle, UserCheck } from 'lucide-react'
import { BreakScheduler } from './break-scheduler'
import { BreakPatterns } from './break-patterns'
import type { Database } from '@/types/database.types'

type StaffBreak = Database['public']['Tables']['staff_breaks']['Row']
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']

interface StaffWithBreaks extends StaffProfile {
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  staff_breaks: StaffBreak[]
  staff_schedules: {
    id: string
    day_of_week: number
    start_time: string
    end_time: string
  }[]
}

export default async function StaffBreaksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login/salon-owner')
  }

  // Get salon ID for the user
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .eq('role', 'salon_owner')
    .single()

  if (!userRole?.salon_id) {
    redirect('/role-salon-owner')
  }

  const salonId = userRole.salon_id

  // Fetch staff with their breaks and schedules
  const { data: staffMembers } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles!inner(
        id,
        full_name,
        avatar_url
      ),
      staff_breaks(
        *
      ),
      staff_schedules(
        id,
        day_of_week,
        start_time,
        end_time
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('profiles(full_name)')

  // Calculate statistics
  const today = new Date()
  const dayOfWeek = today.getDay()
  
  const activeBreaks = staffMembers?.reduce((count, staff) => {
    return count + staff.staff_breaks.filter(b => 
      b.day_of_week === dayOfWeek && b.is_active
    ).length
  }, 0) || 0

  const averageBreakDuration = staffMembers?.reduce((sum, staff) => {
    const totalDuration = staff.staff_breaks.reduce((dur, brk) => 
      dur + (brk.duration_minutes || 0), 0
    )
    return sum + totalDuration
  }, 0) || 0

  const totalBreaks = staffMembers?.reduce((count, staff) => 
    count + staff.staff_breaks.length, 0
  ) || 0

  const avgDuration = totalBreaks > 0 ? Math.round(averageBreakDuration / totalBreaks) : 0

  const staffWithoutBreaks = staffMembers?.filter(
    staff => staff.staff_breaks.length === 0
  ).length || 0

  // Identify break patterns
  const breakPatterns: Record<string, number> = {}
  staffMembers?.forEach(staff => {
    staff.staff_breaks.forEach(brk => {
      const pattern = `${brk.start_time}-${brk.end_time}`
      breakPatterns[pattern] = (breakPatterns[pattern] || 0) + 1
    })
  })

  const mostCommonPattern = Object.entries(breakPatterns)
    .sort(([, a], [, b]) => b - a)[0]

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Break Management</h1>
          <p className="text-muted-foreground">
            Configure break schedules and patterns for your staff
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBreaks}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled breaks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration} min</div>
            <p className="text-xs text-muted-foreground">
              Per break
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Common Pattern</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {mostCommonPattern ? mostCommonPattern[0] : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostCommonPattern ? `${mostCommonPattern[1]} staff` : 'No patterns'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Breaks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffWithoutBreaks}</div>
            <p className="text-xs text-muted-foreground">
              Staff members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Break Management Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Break Schedule</TabsTrigger>
          <TabsTrigger value="patterns">Break Patterns</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Staff Break Schedules</CardTitle>
              <CardDescription>
                Configure individual break times for each staff member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {staffMembers?.map((staff) => (
                  <BreakScheduler
                    key={staff.id}
                    staff={staff}
                    existingBreaks={staff.staff_breaks}
                    schedules={staff.staff_schedules}
                  />
                ))}
                
                {(!staffMembers || staffMembers.length === 0) && (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No staff members found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Break Patterns</CardTitle>
              <CardDescription>
                Apply common break patterns across multiple staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BreakPatterns 
                staffMembers={staffMembers || []} 
                salonId={salonId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Break Compliance</CardTitle>
              <CardDescription>
                Monitor break compliance and legal requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Legal Requirements</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Minimum break for 6+ hour shift
                      </span>
                      <Badge variant="secondary">30 minutes</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Rest break for 4+ hour shift
                      </span>
                      <Badge variant="secondary">15 minutes</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Staff Compliance Status</h3>
                  {staffMembers?.map((staff) => {
                    const hasBreaks = staff.staff_breaks.length > 0
                    const totalBreakTime = staff.staff_breaks.reduce(
                      (sum, brk) => sum + (brk.duration_minutes || 0), 0
                    )
                    
                    return (
                      <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {staff.profiles.full_name || 'Staff Member'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {totalBreakTime} minutes total break time
                          </p>
                        </div>
                        <Badge variant={hasBreaks ? 'default' : 'destructive'}>
                          {hasBreaks ? 'Configured' : 'No Breaks'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}