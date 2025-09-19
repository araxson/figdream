'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Smartphone,
  FileText,
  Printer,
  Share2,
  Navigation,
  Copy,
  ExternalLink,
  Star
} from 'lucide-react'
import type { BookingConfirmation, Appointment, AppointmentService } from '../types'

interface BookingConfirmationProps {
  confirmation: BookingConfirmation
  onClose?: () => void
  onReschedule?: (appointmentId: string) => void
  onCancel?: (appointmentId: string) => void
  onAddToCalendar?: (appointment: Appointment) => void
}

export function BookingConfirmationComponent({
  confirmation,
  onClose,
  onReschedule,
  onCancel,
  onAddToCalendar
}: BookingConfirmationProps) {
  // State
  const [reminderSettings, setReminderSettings] = useState({
    email: true,
    sms: true,
    hours: 24
  })
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareMethod, setShareMethod] = useState<'email' | 'sms' | 'link'>('email')
  const [shareEmail, setShareEmail] = useState('')
  const [sharePhone, setSharePhone] = useState('')
  const [copied, setCopied] = useState(false)

  // Format date and time
  const appointmentDate = new Date(confirmation.appointment.start_time!)
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
  const endTime = new Date(confirmation.appointment.end_time!)
  const formattedEndTime = endTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  // Calculate total service time
  const totalDuration = confirmation.services.reduce(
    (sum, service) => sum + service.duration_minutes,
    0
  )

  // Generate calendar file content
  const generateICS = () => {
    const start = appointmentDate.toISOString().replace(/-|:|\.\d\d\d/g, '')
    const end = endTime.toISOString().replace(/-|:|\.\d\d\d/g, '')
    const services = confirmation.services.map(s => s.service_name).join(', ')

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Salon Booking//EN
BEGIN:VEVENT
UID:${confirmation.confirmationCode}@salon.com
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, '')}
DTSTART:${start}
DTEND:${end}
SUMMARY:Salon Appointment - ${services}
DESCRIPTION:Confirmation Code: ${confirmation.confirmationCode}\\nServices: ${services}\\nStaff: ${confirmation.staff.display_name}\\nTotal: $${confirmation.totalAmount.toFixed(2)}
LOCATION:${confirmation.salon.name}, ${confirmation.salon.address}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    return icsContent
  }

  // Download calendar file
  const downloadCalendarFile = () => {
    const icsContent = generateICS()
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointment-${confirmation.confirmationCode}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Copy confirmation code
  const copyConfirmationCode = () => {
    navigator.clipboard.writeText(confirmation.confirmationCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Share booking details
  const shareBookingDetails = () => {
    const details = `
Salon Appointment Confirmation
Confirmation Code: ${confirmation.confirmationCode}
Date: ${formattedDate}
Time: ${formattedTime} - ${formattedEndTime}
Location: ${confirmation.salon.name}
Address: ${confirmation.salon.address}
Services: ${confirmation.services.map(s => s.service_name).join(', ')}
Staff: ${confirmation.staff.display_name}
Total: $${confirmation.totalAmount.toFixed(2)}
    `.trim()

    if (shareMethod === 'email' && shareEmail) {
      const subject = encodeURIComponent('Your Salon Appointment Confirmation')
      const body = encodeURIComponent(details)
      window.open(`mailto:${shareEmail}?subject=${subject}&body=${body}`)
    } else if (shareMethod === 'sms' && sharePhone) {
      const smsBody = encodeURIComponent(details)
      window.open(`sms:${sharePhone}?body=${smsBody}`)
    } else if (shareMethod === 'link') {
      navigator.clipboard.writeText(details)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    setShowShareDialog(false)
  }

  // Open map directions
  const openDirections = () => {
    const address = encodeURIComponent(confirmation.salon.address)
    window.open(`https://maps.google.com/?q=${address}`, '_blank')
  }

  // Print confirmation
  const printConfirmation = () => {
    window.print()
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <CardDescription>
            Your appointment has been successfully scheduled
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Confirmation Code */}
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmation Code</p>
                <p className="text-2xl font-bold font-mono">{confirmation.confirmationCode}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyConfirmationCode}
              >
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Appointment Details</h3>

            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formattedDate}</p>
                  <p className="text-sm text-muted-foreground">Date</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formattedTime} - {formattedEndTime}</p>
                  <p className="text-sm text-muted-foreground">Time ({totalDuration} minutes)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{confirmation.staff.display_name}</p>
                  <p className="text-sm text-muted-foreground">Your Professional</p>
                  {confirmation.staff.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{confirmation.staff.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{confirmation.salon.name}</p>
                  <p className="text-sm text-muted-foreground">{confirmation.salon.address}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={openDirections}
                  >
                    <Navigation className="mr-1 h-3 w-3" />
                    Get Directions
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div className="space-y-3">
            <h3 className="font-semibold">Services</h3>
            <div className="space-y-2">
              {confirmation.services.map((service, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{service.service_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.duration_minutes} min • {service.staff_id ? 'Assigned' : 'Any available'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${service.unit_price.toFixed(2)}</p>
                    {service.quantity > 1 && (
                      <p className="text-xs text-muted-foreground">x{service.quantity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${confirmation.appointment.subtotal?.toFixed(2)}</span>
              </div>
              {confirmation.appointment.tax_amount && confirmation.appointment.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${confirmation.appointment.tax_amount.toFixed(2)}</span>
                </div>
              )}
              {confirmation.appointment.discount_amount && confirmation.appointment.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${confirmation.appointment.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2">
                <span>Total</span>
                <span>${confirmation.totalAmount.toFixed(2)}</span>
              </div>
              {confirmation.depositAmount && confirmation.depositAmount > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Deposit Required</span>
                  <span>${confirmation.depositAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Reminder Settings */}
          <div className="space-y-3">
            <h3 className="font-semibold">Reminder Preferences</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-reminder">Email Reminder</Label>
                </div>
                <Switch
                  id="email-reminder"
                  checked={reminderSettings.email}
                  onCheckedChange={(checked) =>
                    setReminderSettings(prev => ({ ...prev, email: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sms-reminder">SMS Reminder</Label>
                </div>
                <Switch
                  id="sms-reminder"
                  checked={reminderSettings.sms}
                  onCheckedChange={(checked) =>
                    setReminderSettings(prev => ({ ...prev, sms: checked }))
                  }
                />
              </div>

              {(reminderSettings.email || reminderSettings.sms) && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-time">Remind me</Label>
                  <select
                    id="reminder-time"
                    className="text-sm border rounded px-2 py-1"
                    value={reminderSettings.hours}
                    onChange={(e) =>
                      setReminderSettings(prev => ({ ...prev, hours: Number(e.target.value) }))
                    }
                  >
                    <option value={1}>1 hour before</option>
                    <option value={2}>2 hours before</option>
                    <option value={4}>4 hours before</option>
                    <option value={24}>24 hours before</option>
                    <option value={48}>48 hours before</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold">Need to make changes?</h4>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${confirmation.salon.phone}`} className="hover:underline">
                {confirmation.salon.phone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${confirmation.salon.email}`} className="hover:underline">
                {confirmation.salon.email}
              </a>
            </div>
          </div>

          {/* Cancellation Policy */}
          {confirmation.cancellationPolicy && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Cancellation Policy:</strong> {confirmation.cancellationPolicy}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" onClick={downloadCalendarFile}>
              <Download className="mr-2 h-4 w-4" />
              Add to Calendar
            </Button>
            <Button variant="outline" onClick={() => setShowShareDialog(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="outline"
              onClick={() => onReschedule?.(confirmation.appointment.id!)}
            >
              Reschedule
            </Button>
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => onCancel?.(confirmation.appointment.id!)}
            >
              Cancel Booking
            </Button>
          </div>
          {onClose && (
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={printConfirmation}>
            <Printer className="mr-2 h-4 w-4" />
            Print Confirmation
          </Button>
        </CardFooter>
      </Card>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Booking Details</DialogTitle>
            <DialogDescription>
              Choose how you'd like to share your appointment details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={shareMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setShareMethod('email')}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button
                variant={shareMethod === 'sms' ? 'default' : 'outline'}
                onClick={() => setShareMethod('sms')}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                SMS
              </Button>
              <Button
                variant={shareMethod === 'link' ? 'default' : 'outline'}
                onClick={() => setShareMethod('link')}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>

            {shareMethod === 'email' && (
              <div>
                <Label htmlFor="share-email">Email Address</Label>
                <Input
                  id="share-email"
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
              </div>
            )}

            {shareMethod === 'sms' && (
              <div>
                <Label htmlFor="share-phone">Phone Number</Label>
                <Input
                  id="share-phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={sharePhone}
                  onChange={(e) => setSharePhone(e.target.value)}
                />
              </div>
            )}

            {shareMethod === 'link' && (
              <Alert>
                <AlertDescription>
                  Click share to copy the booking details to your clipboard
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={shareBookingDetails}>
              {shareMethod === 'link' ? 'Copy to Clipboard' : 'Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}