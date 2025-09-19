'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, User, CreditCard, MessageSquare, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { BookingDetails, PaymentMethod } from '../../types'

interface BookingConfirmationProps {
  bookingDetails: BookingDetails
  paymentMethods: PaymentMethod[]
  onConfirm: (notes: string, paymentMethodId?: string) => Promise<void>
  onBack: () => void
  isLoading?: boolean
}

export function BookingConfirmation({
  bookingDetails,
  paymentMethods,
  onConfirm,
  onBack,
  isLoading = false
}: BookingConfirmationProps) {
  const [notes, setNotes] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [agreeToPolicy, setAgreeToPolicy] = useState(false)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const canConfirm = agreeToTerms && agreeToPolicy

  const handleConfirm = async () => {
    if (!canConfirm) return
    await onConfirm(notes, selectedPaymentMethod || undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Confirm Your Booking</h2>
        <p className="text-muted-foreground">
          Review your appointment details and confirm your booking
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Details */}
        <div className="space-y-6">
          {/* Salon Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Salon Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{bookingDetails.salonName}</h3>
                <p className="text-sm text-muted-foreground">
                  Premium salon experience with professional staff
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookingDetails.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDuration(service.duration)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${service.price}</div>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between font-semibold">
                  <div>Total ({formatDuration(bookingDetails.duration)})</div>
                  <div>${bookingDetails.totalPrice}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Member */}
          {bookingDetails.staffName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Stylist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(bookingDetails.staffName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{bookingDetails.staffName}</div>
                    <div className="text-sm text-muted-foreground">
                      Professional Stylist
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {bookingDetails.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {bookingDetails.time}
                  </span>
                  <Badge variant="secondary">
                    {formatDuration(bookingDetails.duration)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="space-y-6">
          {/* Special Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Special Notes
              </CardTitle>
              <CardDescription>
                Any special requests or requirements for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests, allergies, or preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          {paymentMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={setSelectedPaymentMethod}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Pay at salon</SelectItem>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="capitalize">{method.brand || method.type}</span>
                            {method.lastFour && (
                              <span className="text-muted-foreground">
                                •••• {method.lastFour}
                              </span>
                            )}
                            {method.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  • Appointments can be cancelled or rescheduled up to 24 hours in advance
                </p>
                <p>
                  • Cancellations made less than 24 hours before the appointment may incur a fee
                </p>
                <p>
                  • No-shows will be charged the full service amount
                </p>
                <p>
                  • Rescheduling is subject to availability
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={setAgreeToTerms}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/cancellation-policy" className="text-primary underline">
                    Cancellation Policy
                  </a>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={agreeToPolicy}
                  onCheckedChange={setAgreeToPolicy}
                />
                <Label htmlFor="privacy" className="text-sm">
                  I agree to the{' '}
                  <a href="/privacy" className="text-primary underline">
                    Privacy Policy
                  </a>{' '}
                  and consent to the processing of my personal data
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Booking Summary */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${bookingDetails.totalPrice}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax:</span>
                  <span>Calculated at salon</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Duration:</span>
                  <span>{formatDuration(bookingDetails.duration)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>

          {!canConfirm && (
            <Alert>
              <AlertDescription>
                Please agree to the terms and conditions to proceed with your booking.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}