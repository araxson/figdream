'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, CreditCard } from 'lucide-react'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils/format'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BookingConfirmationProps {
  bookingData: {
    salonId: string
    serviceIds: string[]
    staffId: string
    date: string
    time: string
  }
  onConfirm: () => void
  onBack: () => void
}

export function BookingConfirmation({ bookingData, onConfirm, onBack }: BookingConfirmationProps) {
  const [salon, setSalon] = useState<{id: string; name: string; address: string | null} | null>(null)
  const [staff, setStaff] = useState<{id: string; user_id: string; profiles?: {first_name: string | null; last_name: string | null} | null} | null>(null)
  const [services, setServices] = useState<{id: string; name: string; duration_minutes: number; price?: number}[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const fetchBookingDetails = useCallback(async () => {
    try {
      const [salonRes, staffRes, servicesRes] = await Promise.all([
        supabase.from('salons').select('*').eq('id', bookingData.salonId).single(),
        supabase.from('staff_profiles').select('*, profiles(*)').eq('id', bookingData.staffId).single(),
        supabase.from('services').select('*').in('id', bookingData.serviceIds)
      ])

      if (salonRes.data) {
        setSalon({
          id: salonRes.data.id,
          name: salonRes.data.name,
          address: salonRes.data.address
        })
      }
      if (staffRes.data) {
        setStaff({
          id: staffRes.data.id,
          user_id: staffRes.data.user_id,
          profiles: staffRes.data.profiles
        })
      }
      setServices(servicesRes.data?.map(s => ({
        id: s.id,
        name: s.name,
        duration_minutes: s.duration_minutes,
        price: s.price
      })) || [])
    } catch (error) {
      console.error('Error fetching booking details:', error)
    } finally {
      setLoading(false)
    }
  }, [bookingData.salonId, bookingData.staffId, bookingData.serviceIds, supabase])

  useEffect(() => {
    fetchBookingDetails()
  }, [fetchBookingDetails])

  const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0)
  const totalDuration = services.reduce((sum, service) => sum + (service.duration_minutes || 0), 0)

  const handleConfirmBooking = async () => {
    if (booking) return
    
    try {
      setBooking(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get customer
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!customer) {
        console.error('Customer not found')
        return
      }

      // Calculate end time
      const [hours, minutes] = bookingData.time.split(':').map(Number)
      const endTime = new Date()
      endTime.setHours(hours)
      endTime.setMinutes(minutes + totalDuration)
      const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`

      // Create appointment
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          salon_id: bookingData.salonId,
          customer_id: customer.id,
          staff_id: bookingData.staffId,
          appointment_date: bookingData.date,
          start_time: bookingData.time,
          end_time: endTimeStr,
          status: 'pending' as const,
          computed_total_price: totalPrice,
          location_id: salon?.id || bookingData.salonId
        })
        .select()
        .single()

      if (error) throw error

      // Add appointment services
      const appointmentServices = bookingData.serviceIds.map((serviceId, index) => ({
        appointment_id: appointment.id,
        service_id: serviceId,
        duration_minutes: services[index]?.duration_minutes || 30,
        price: services[index]?.price || 0
      }))

      await supabase
        .from('appointment_services')
        .insert(appointmentServices)

      onConfirm()
      router.push('/customer/appointments')
    } catch (error) {
      console.error('Error creating booking:', error)
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Loading booking details...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Confirm Your Booking</CardTitle>
          <p className="text-sm text-muted-foreground">
            Please review your appointment details before confirming
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Appointment Details</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{salon?.name}</p>
                  <p className="text-muted-foreground">{salon?.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(bookingData.date)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(bookingData.time)}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>With {staff?.profiles?.first_name} {staff?.profiles?.last_name}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Services</h3>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between text-sm">
                  <span>{service.name}</span>
                  <span className="font-medium">
                    {formatCurrency(service.price || 0)}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Payment</h3>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>Payment will be collected at the salon</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h4 className="font-medium text-amber-900 text-sm mb-1">Cancellation Policy</h4>
            <p className="text-xs text-amber-800">
              Please arrive 5-10 minutes before your appointment. 
              Cancellations must be made at least 24 hours in advance to avoid fees.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleConfirmBooking}
              disabled={booking}
            >
              {booking ? 'Creating Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}