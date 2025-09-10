'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}
type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row']

export function StaffSchedule() {
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [schedules, setSchedules] = useState<StaffSchedule[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      // Fetch staff
      const { data: staffData } = await supabase
        .from('staff_profiles')
        .select(`
          *,
          profiles(*)
        `)
        .eq('salon_id', salon.id)
        .eq('is_active', true)

      // Fetch schedules
      const { data: scheduleData } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('salon_id', salon.id)

      setStaff(staffData || [])
      setSchedules(scheduleData || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching schedules:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getScheduleForDay = (staffId: string, dayOfWeek: number) => {
    return schedules.find(
      s => s.staff_id === staffId && s.day_of_week === dayOfWeek
    )
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading schedules...
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredStaff = selectedStaff === 'all' 
    ? staff 
    : staff.filter(s => s.id === selectedStaff)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Staff Schedule</CardTitle>
          <Button>
            <Clock className="h-4 w-4 mr-2" />
            Edit Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedStaff} onValueChange={setSelectedStaff}>
          <TabsList>
            <TabsTrigger value="all">All Staff</TabsTrigger>
            {staff.map((member) => (
              <TabsTrigger key={member.id} value={member.id}>
                {member.profiles?.first_name} {member.profiles?.last_name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedStaff} className="mt-6">
            <div className="space-y-6">
              {filteredStaff.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">
                      {member.profiles?.first_name} {member.profiles?.last_name}
                    </h3>
                  </div>
                  
                  <div className="grid gap-2">
                    {weekDays.map((day, index) => {
                      const schedule = getScheduleForDay(member.id, index)
                      
                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted/50"
                        >
                          <span className="font-medium w-32">{day}</span>
                          {schedule ? (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                              </span>
                              {/* Break times not available in current schema */}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Day off</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}