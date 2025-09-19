'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  Phone,
  Mail,
  DollarSign,
  MapPin,
  FileText,
  FileEdit,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  CreditCard,
  Scissors,
  RefreshCw,
  Printer,
  Share2,
  ChevronRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { AppointmentWithRelations, AppointmentStatus, PaymentStatus } from '../types'
import {
  confirmAppointmentAction,
  cancelAppointmentAction,
  checkInAppointmentAction,
  completeAppointmentAction,
  noShowAppointmentAction,
  addAppointmentNoteAction,
} from '../actions/appointments-actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
  const [newNote, setNewNote] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')
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

  const handleCancel = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    setIsLoading(true)
    try {
      const result = await cancelAppointmentAction(appointment.id, cancellationReason)
      if (result.success) {
        toast.success('Appointment cancelled successfully')
        setShowCancelDialog(false)
        setCancellationReason('')
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

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setIsLoading(true)
    try {
      const result = await addAppointmentNoteAction(appointment.id, newNote, false)
      if (result.success) {
        toast.success('Note added successfully')
        setNewNote('')
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

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-3 h-3 rounded-full', status.color)} />
          <Badge variant="outline" className="gap-1">
            {status.icon}
            {status.label}
          </Badge>
          {appointment.confirmation_code && (
            <Badge variant="secondary">#{appointment.confirmation_code}</Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Actions
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {appointment.status === 'pending' && (
              <DropdownMenuItem onClick={() => handleStatusChange('confirm')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Appointment
              </DropdownMenuItem>
            )}
            {appointment.status === 'confirmed' && (
              <DropdownMenuItem onClick={() => handleStatusChange('checkin')}>
                <User className="mr-2 h-4 w-4" />
                Check In
              </DropdownMenuItem>
            )}
            {(appointment.status === 'confirmed' || appointment.status === 'checked_in') && (
              <DropdownMenuItem onClick={() => handleStatusChange('complete')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleStatusChange('noshow')}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Mark No-Show
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onReschedule}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reschedule
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onPrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setShowCancelDialog(true)}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel Appointment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schedule Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Date</span>
                </div>
                <span className="font-medium">{format(startTime, 'PPP')}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Time</span>
                </div>
                <span className="font-medium">
                  {format(startTime, 'p')} - {format(endTime, 'p')} ({duration} min)
                </span>
              </div>
              {appointment.salon && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Location</span>
                  </div>
                  <span className="font-medium">{appointment.salon.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {appointment.customer && (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={appointment.customer.avatar_url || undefined} />
                      <AvatarFallback>
                        {appointment.customer.first_name?.[0]}
                        {appointment.customer.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {appointment.customer.first_name} {appointment.customer.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">Customer</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {appointment.customer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.customer.email}</span>
                      </div>
                    )}
                    {appointment.customer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{appointment.customer.phone}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Staff Member</CardTitle>
            </CardHeader>
            <CardContent>
              {appointment.staff && (
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={appointment.staff.avatar_url || undefined} />
                    <AvatarFallback>
                      {appointment.staff.first_name?.[0]}
                      {appointment.staff.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {appointment.staff.first_name} {appointment.staff.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">Service Provider</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {(appointment.notes || appointment.internal_notes) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointment.notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Customer Notes</Label>
                    <p className="text-sm mt-1">{appointment.notes}</p>
                  </div>
                )}
                {appointment.internal_notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Internal Notes</Label>
                    <p className="text-sm mt-1">{appointment.internal_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Services</CardTitle>
            </CardHeader>
            <CardContent>
              {appointment.services && appointment.services.length > 0 ? (
                <div className="space-y-3">
                  {appointment.services.map((service) => (
                    <div key={service.id} className="flex items-start justify-between p-3 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <Scissors className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">{service.service_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.duration_minutes} minutes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${service.unit_price.toFixed(2)}</p>
                        {service.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">x{service.quantity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Duration</span>
                    <span>{duration} minutes</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No services added</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={paymentStatus.color as any}>
                  {paymentStatus.label}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                {appointment.subtotal != null && (
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${appointment.subtotal.toFixed(2)}</span>
                  </div>
                )}
                {appointment.tax_amount != null && appointment.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${appointment.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                {appointment.discount_amount != null && appointment.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${appointment.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {appointment.tip_amount != null && appointment.tip_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tip</span>
                    <span>${appointment.tip_amount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${appointment.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              {appointment.deposit_required && (
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertTitle>Deposit Required</AlertTitle>
                  <AlertDescription>
                    A deposit of ${appointment.deposit_amount?.toFixed(2)} is required.
                    {appointment.deposit_paid && ' (Paid)'}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Note</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note about this appointment..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="resize-none"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isLoading}
                  size="sm"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointment.created_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Appointment Created</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appointment.created_at), 'PPpp')}
                      </p>
                    </div>
                  </div>
                )}
                {appointment.confirmed_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Confirmed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appointment.confirmed_at), 'PPpp')}
                      </p>
                    </div>
                  </div>
                )}
                {appointment.checked_in_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Checked In</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appointment.checked_in_at), 'PPpp')}
                      </p>
                    </div>
                  </div>
                )}
                {appointment.completed_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appointment.completed_at), 'PPpp')}
                      </p>
                    </div>
                  </div>
                )}
                {appointment.cancelled_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Cancelled</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(appointment.cancelled_at), 'PPpp')}
                      </p>
                      {appointment.cancellation_reason && (
                        <p className="text-sm mt-1">Reason: {appointment.cancellation_reason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Cancellation reason..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={!cancellationReason.trim() || isLoading}
            >
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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