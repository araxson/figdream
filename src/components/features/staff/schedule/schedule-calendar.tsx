'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Clock, Coffee } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/ui/use-toast'
import { format } from 'date-fns'
import { ScheduleData, ScheduleFormData, BreakFormData } from './schedule-types'
import { ScheduleForm } from './schedule-form'
import { BreakForm } from './break-form'
import { ScheduleDisplay } from './schedule-display'
import { fetchScheduleData, saveSchedule, saveBreak } from './schedule-api'

export function StaffScheduleCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    schedules: [],
    breaks: [],
    timeOffRequests: []
  })
  const [loading, setLoading] = useState(true)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showBreakDialog, setShowBreakDialog] = useState(false)
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormData>({
    dayOfWeek: new Date().getDay(),
    startTime: '09:00',
    endTime: '17:00'
  })
  const [breakForm, setBreakForm] = useState<BreakFormData>({
    breakDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '12:00',
    endTime: '13:00'
  })
  const toast = useToast()

  const loadScheduleData = useCallback(async () => {
    const data = await fetchScheduleData(selectedDate)
    if (data) {
      setScheduleData(data)
    }
    setLoading(false)
  }, [selectedDate])
   
  useEffect(() => {
    loadScheduleData()
  }, [loadScheduleData])

  async function handleSaveSchedule() {
    try {
      await saveSchedule(scheduleForm, scheduleData)
      toast.success('Schedule updated successfully')
      setShowScheduleDialog(false)
      loadScheduleData()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving schedule:', error)
      }
      toast.error('Failed to save schedule')
    }
  }

  async function handleSaveBreak() {
    try {
      await saveBreak(breakForm)
      toast.success('Break added successfully')
      setShowBreakDialog(false)
      loadScheduleData()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving break:', error)
      }
      toast.error('Failed to save break')
    }
  }

  const getDaySchedule = (date: Date) => {
    const dayOfWeek = date.getDay()
    return scheduleData.schedules.find((s) => s.day_of_week === dayOfWeek)
  }

  const getDayBreaks = (date: Date) => {
    const dayOfWeek = date.getDay()
    return scheduleData.breaks.filter((b) => b.day_of_week === dayOfWeek)
  }

  const isOnTimeOff = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return scheduleData.timeOffRequests.some(req => {
      return dateStr >= req.start_date && dateStr <= req.end_date
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Schedule</CardTitle>
          <CardDescription>Manage your working hours and breaks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading schedule...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Schedule Calendar</CardTitle>
                <CardDescription>View and manage your schedule</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowScheduleDialog(true)}>
                  <Clock className="h-4 w-4 mr-1" />
                  Set Hours
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowBreakDialog(true)}>
                  <Coffee className="h-4 w-4 mr-1" />
                  Add Break
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                scheduled: (date) => !!getDaySchedule(date),
                timeOff: (date) => isOnTimeOff(date),
                hasBreak: (date) => getDayBreaks(date).length > 0
              }}
              modifiersStyles={{
                scheduled: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
                timeOff: { backgroundColor: 'rgba(239, 68, 68, 0.1)', textDecoration: 'line-through' },
                hasBreak: { borderBottom: '2px solid orange' }
              }}
            />
          </CardContent>
        </Card>

        <ScheduleDisplay selectedDate={selectedDate} scheduleData={scheduleData} />
      </div>

      <ScheduleForm 
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        formData={scheduleForm}
        onFormChange={setScheduleForm}
        onSave={handleSaveSchedule}
      />

      <BreakForm
        open={showBreakDialog}
        onOpenChange={setShowBreakDialog}
        formData={breakForm}
        onFormChange={setBreakForm}
        onSave={handleSaveBreak}
      />
    </>
  )
}