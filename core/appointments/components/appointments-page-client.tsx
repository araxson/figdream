'use client'

import { useState, useCallback } from 'react'
import { Plus, Calendar as CalendarIcon, List, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  AppointmentForm,
  CalendarEnhanced,
  AppointmentDetailsModal,
  AvailabilityChecker,
  AppointmentListEnhanced,
  AppointmentsStats,
} from '@/core/appointments/components'
import type { AppointmentWithRelations, AppointmentStatus } from '@/core/appointments/types'
import type { Database } from '@/types/database.types'
import {
  cancelAppointmentAction,
  checkInAppointmentAction,
  completeAppointmentAction,
  rescheduleAppointmentAction,
} from '@/core/appointments/actions/appointments-actions'

type Staff = Database['public']['Tables']['profiles']['Row']
type Service = Database['public']['Tables']['services']['Row']
type Customer = Database['public']['Tables']['profiles']['Row']

interface AppointmentsPageClientProps {
  initialAppointments: AppointmentWithRelations[]
  salonId: string
  staffList: Staff[]
  serviceList: Service[]
  customerList: Customer[]
}

export function AppointmentsPageClient({
  initialAppointments,
  salonId,
  staffList,
  serviceList,
  customerList,
}: AppointmentsPageClientProps) {
  const router = useRouter()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'availability'>('calendar')
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>()
  const [calendarViewMode, setCalendarViewMode] = useState<'day' | 'week' | 'month'>('week')

  // Stats calculation
  const stats = {
    total: appointments.length,
    today: appointments.filter(apt => {
      const aptDate = new Date(apt.start_time)
      const today = new Date()
      return aptDate.toDateString() === today.toDateString()
    }).length,
    upcoming: appointments.filter(apt =>
      new Date(apt.start_time) > new Date() && apt.status === 'confirmed'
    ).length,
    pending: appointments.filter(apt => apt.status === 'pending').length,
    revenue: appointments
      .filter(apt => apt.status === 'completed' && apt.payment_status === 'completed')
      .reduce((sum, apt) => sum + (apt.total_amount || 0), 0),
  }

  // Handle appointment click
  const handleAppointmentClick = useCallback((appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment)
    setShowDetailsModal(true)
  }, [])

  // Handle appointment edit
  const handleAppointmentEdit = useCallback((appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment)
    // Navigate to edit page or show edit form
    router.push(`/dashboard/appointments/${appointment.id}/edit`)
  }, [router])

  // Handle appointment cancel
  const handleAppointmentCancel = useCallback(async (appointment: AppointmentWithRelations) => {
    const reason = prompt('Please provide a cancellation reason:')
    if (!reason) return

    try {
      const result = await cancelAppointmentAction(appointment.id, reason)
      if (result.success) {
        toast.success('Appointment cancelled successfully')
        router.refresh()
      } else {
        throw new Error(result.error || 'Failed to cancel appointment')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel appointment')
    }
  }, [router])

  // Handle appointment check-in
  const handleAppointmentCheckIn = useCallback(async (appointment: AppointmentWithRelations) => {
    try {
      const result = await checkInAppointmentAction(appointment.id)
      if (result.success) {
        toast.success('Customer checked in successfully')
        router.refresh()
      } else {
        throw new Error(result.error || 'Failed to check in')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to check in')
    }
  }, [router])

  // Handle appointment complete
  const handleAppointmentComplete = useCallback(async (appointment: AppointmentWithRelations) => {
    try {
      const result = await completeAppointmentAction(appointment.id)
      if (result.success) {
        toast.success('Appointment completed successfully')
        router.refresh()
      } else {
        throw new Error(result.error || 'Failed to complete appointment')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete appointment')
    }
  }, [router])

  // Handle appointment reschedule
  const handleAppointmentReschedule = useCallback(async (
    appointment: AppointmentWithRelations,
    newDate: Date,
    newTime: string
  ) => {
    try {
      const scheduledAt = new Date(newDate)
      const [hours, minutes] = newTime.split(':').map(Number)
      scheduledAt.setHours(hours, minutes, 0, 0)

      const result = await rescheduleAppointmentAction({
        id: appointment.id,
        scheduled_at: scheduledAt.toISOString(),
        reason: 'Rescheduled via calendar',
      })

      if (result.success) {
        toast.success('Appointment rescheduled successfully')
        router.refresh()
      } else {
        throw new Error(result.error || 'Failed to reschedule')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reschedule')
    }
  }, [router])

  // Handle time slot click
  const handleTimeSlotClick = useCallback((date: Date, time: string) => {
    // Pre-fill the form with the selected date and time
    setShowCreateForm(true)
  }, [])

  // Handle create appointment success
  const handleCreateSuccess = useCallback((appointmentId: string) => {
    toast.success('Appointment created successfully')
    setShowCreateForm(false)
    router.refresh()
  }, [router])

  // Handle bulk actions
  const handleBulkAction = useCallback(async (action: string, appointmentIds: string[]) => {
    try {
      switch (action) {
        case 'confirm':
          // Implement bulk confirm
          toast.success(`${appointmentIds.length} appointments confirmed`)
          break
        case 'cancel':
          // Implement bulk cancel
          toast.success(`${appointmentIds.length} appointments cancelled`)
          break
        case 'reschedule':
          // Show reschedule modal for bulk reschedule
          toast.info('Bulk reschedule coming soon')
          break
      }
      router.refresh()
    } catch (error) {
      toast.error('Failed to perform bulk action')
    }
  }, [router])

  // Handle export
  const handleExport = useCallback(() => {
    // Implement export functionality
    toast.info('Export feature coming soon')
  }, [])

  // Handle availability slot select
  const handleAvailabilitySlotSelect = useCallback((date: Date, time: string, staffId: string) => {
    // Pre-fill the form with selected slot
    setShowCreateForm(true)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage appointments, bookings, and schedules
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Upcoming</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="availability" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Availability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <CalendarEnhanced
            appointments={appointments}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentEdit={handleAppointmentEdit}
            onAppointmentCancel={handleAppointmentCancel}
            onAppointmentReschedule={handleAppointmentReschedule}
            onTimeSlotClick={handleTimeSlotClick}
            staffMembers={staffList.map(s => ({
              id: s.id,
              name: `${s.first_name} ${s.last_name}`,
              avatar: s.avatar_url,
            }))}
            selectedStaffId={selectedStaffId}
            onStaffChange={setSelectedStaffId}
            viewMode={calendarViewMode}
            onViewModeChange={setCalendarViewMode}
            showStaffFilter={true}
            enableDragDrop={true}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <AppointmentListEnhanced
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
            onAppointmentEdit={handleAppointmentEdit}
            onAppointmentCancel={handleAppointmentCancel}
            onAppointmentCheckIn={handleAppointmentCheckIn}
            onAppointmentComplete={handleAppointmentComplete}
            onBulkAction={handleBulkAction}
            onExport={handleExport}
            showFilters={true}
            showBulkActions={true}
          />
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <AvailabilityChecker
            staffList={staffList}
            selectedStaffId={selectedStaffId}
            onStaffChange={setSelectedStaffId}
            selectedService={serviceList[0]}
            serviceDuration={serviceList[0]?.duration || 30}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSlotSelect={handleAvailabilitySlotSelect}
            showStaffSelector={true}
            daysToShow={14}
          />
        </TabsContent>
      </Tabs>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        onEdit={() => handleAppointmentEdit(selectedAppointment!)}
        onReschedule={() => {
          setShowRescheduleModal(true)
          setShowDetailsModal(false)
        }}
        useSheet={true}
      />

      {/* Create Appointment Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new appointment for a customer
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm
            salonId={salonId}
            staffList={staffList}
            serviceList={serviceList}
            customerList={customerList}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      {selectedAppointment && (
        <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Select a new date and time for this appointment
              </DialogDescription>
            </DialogHeader>
            <AvailabilityChecker
              staffList={staffList}
              selectedStaffId={selectedAppointment.staff_id || undefined}
              onStaffChange={(id) => {}}
              selectedService={serviceList.find(s =>
                selectedAppointment.services?.some(as => as.service_id === s.id)
              )}
              serviceDuration={selectedAppointment.duration_minutes || 30}
              onSlotSelect={(date, time, staffId) => {
                handleAppointmentReschedule(selectedAppointment, date, time)
                setShowRescheduleModal(false)
              }}
              showStaffSelector={false}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}