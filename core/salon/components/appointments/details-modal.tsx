'use client'

import { useState } from 'react'
import {
  FileEdit,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  X,
  UserCheck,
} from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AppointmentWithRelations, AppointmentStatus, PaymentStatus } from '../types'
import {
  confirmAppointmentAction,
  cancelAppointmentAction,
  checkInAppointmentAction,
  completeAppointmentAction,
  noShowAppointmentAction,
  addAppointmentNoteAction,
} from '../../actions/appointments'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppointmentModalHeader } from './appointment-modal-header'
import { AppointmentDetailsTab } from './appointment-details-tab'
import { AppointmentServicesTab } from './appointment-services-tab'
import { AppointmentPaymentTab } from './appointment-payment-tab'
import { AppointmentHistoryTab } from './appointment-history-tab'
import { AppointmentCancelDialog } from './appointment-cancel-dialog'

interface AppointmentDetailsModalProps {
  appointment: AppointmentWithRelations | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
  onReschedule?: () => void
  onPrint?: () => void
  onShare?: () => void
  useSheet?: boolean
}

const statusConfig: Record<AppointmentStatus, { label: string; icon: React.ReactNode; color: string }> = {
  draft: { label: 'Draft', icon: <FileEdit className="h-4 w-4" />, color: 'bg-gray-400' },
  pending: { label: 'Pending', icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-blue-500' },
  checked_in: { label: 'Checked In', icon: <UserCheck className="h-4 w-4" />, color: 'bg-indigo-500' },
  in_progress: { label: 'In Progress', icon: <RefreshCw className="h-4 w-4" />, color: 'bg-purple-500' },
  completed: { label: 'Completed', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500' },
  cancelled: { label: 'Cancelled', icon: <X className="h-4 w-4" />, color: 'bg-gray-500' },
  no_show: { label: 'No Show', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-500' },
  rescheduled: { label: 'Rescheduled', icon: <RefreshCw className="h-4 w-4" />, color: 'bg-orange-500' },
}

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: 'Payment Pending', color: 'destructive' },
  processing: { label: 'Processing', color: 'secondary' },
  completed: { label: 'Paid', color: 'success' },
  failed: { label: 'Payment Failed', color: 'destructive' },
  refunded: { label: 'Refunded', color: 'secondary' },
  partially_refunded: { label: 'Partially Refunded', color: 'secondary' },
  cancelled: { label: 'Payment Cancelled', color: 'secondary' },
}

export function AppointmentDetailsModal({
  appointment,
  open,
  onOpenChange,
  onEdit,
  onReschedule,
  onPrint,
  onShare,
  useSheet = false,
}: AppointmentDetailsModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  if (!appointment) return null

  const status = statusConfig[appointment.status as AppointmentStatus]
  const paymentStatus = paymentStatusConfig[appointment.payment_status as PaymentStatus]
  const startTime = new Date(appointment.start_time)
  const endTime = new Date(appointment.end_time)
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

  const handleStatusChange = async (action: 'confirm' | 'checkin' | 'complete' | 'noshow') => {
    setIsLoading(true)
    try {
      let result
      switch (action) {
        case 'confirm':
          result = await confirmAppointmentAction(appointment.id)
          break
        case 'checkin':
          result = await checkInAppointmentAction(appointment.id)
          break
        case 'complete':
          result = await completeAppointmentAction(appointment.id)
          break
        case 'noshow':
          result = await noShowAppointmentAction(appointment.id)
          break
      }

      if (result?.success) {
        toast.success(`Appointment ${action === 'confirm' ? 'confirmed' : action === 'checkin' ? 'checked in' : action === 'complete' ? 'completed' : 'marked as no-show'}`)
        router.refresh()
      } else {
        throw new Error(result?.error || 'Failed to update appointment')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update appointment')
    } finally {
      setIsLoading(false)
    }
  }


  const handleAddNote = async (note: string) => {
    setIsLoading(true)
    try {
      const result = await addAppointmentNoteAction(appointment.id, note, false)
      if (result.success) {
        toast.success('Note added successfully')
        router.refresh()
      } else {
        throw new Error(result.error || 'Failed to add note')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add note')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAppointment = async (reason: string) => {
    if (!reason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    setIsLoading(true)
    try {
      const result = await cancelAppointmentAction(appointment.id, reason)
      if (result.success) {
        toast.success('Appointment cancelled successfully')
        setShowCancelDialog(false)
        router.refresh()
        onOpenChange(false)
      } else {
        throw new Error(result.error || 'Failed to cancel appointment')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel appointment')
    } finally {
      setIsLoading(false)
    }
  }

  const content = (
    <>
      <AppointmentModalHeader
        appointment={appointment}
        statusConfig={statusConfig}
        onStatusChange={handleStatusChange}
        onEdit={onEdit}
        onReschedule={onReschedule}
        onPrint={onPrint}
        onShare={onShare}
        onCancel={() => setShowCancelDialog(true)}
        isLoading={isLoading}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <AppointmentDetailsTab appointment={appointment} />
        </TabsContent>

        <TabsContent value="services">
          <AppointmentServicesTab appointment={appointment} />
        </TabsContent>

        <TabsContent value="payment">
          <AppointmentPaymentTab
            appointment={appointment}
            paymentStatusConfig={paymentStatusConfig}
          />
        </TabsContent>

        <TabsContent value="history">
          <AppointmentHistoryTab
            appointment={appointment}
            onAddNote={handleAddNote}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      <AppointmentCancelDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onCancel={handleCancelAppointment}
        isLoading={isLoading}
      />
    </>
  )

  if (useSheet) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Appointment Details</SheetTitle>
            <SheetDescription>
              View and manage appointment information
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
          <DialogDescription>
            View and manage appointment information
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}