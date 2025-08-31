'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TimePicker } from '@/components/ui/time-picker'
import { DatetimePicker } from '@/components/ui/datetime-picker'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CalendarIcon, Clock, User, Scissors, DollarSign, FileText } from 'lucide-react'
import { format } from 'date-fns'

interface AppointmentFormProps {
  salonId: string
  staff?: Array<{ id: string; name: string }>
  services?: Array<{ id: string; name: string; duration: number; price: number }>
  customers?: Array<{ id: string; name: string; email: string }>
}

export function AppointmentForm({ 
  salonId, 
  staff = [], 
  services = [], 
  customers = [] 
}: AppointmentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const calculateEndTime = (start: string, serviceIds: string[]) => {
    if (!start || serviceIds.length === 0) return ''
    
    const totalDuration = serviceIds.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service?.duration || 0)
    }, 0)
    
    const [hour, minute] = start.split(':').map(Number)
    const totalMinutes = hour * 60 + minute + totalDuration
    const endHour = Math.floor(totalMinutes / 60)
    const endMinute = totalMinutes % 60
    
    return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`
  }

  const handleServiceChange = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId]
    
    setSelectedServices(newServices)
    
    // Auto-calculate end time
    if (startTime) {
      setEndTime(calculateEndTime(startTime, newServices))
    }
  }

  const handleStartTimeChange = (time: string) => {
    setStartTime(time)
    if (selectedServices.length > 0) {
      setEndTime(calculateEndTime(time, selectedServices))
    }
  }

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service?.price || 0)
    }, 0)
  }

  const handleSubmit = async () => {
    // Validation
    if (!selectedDate || !startTime || !selectedCustomer || !selectedStaff || selectedServices.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      // In a real app, this would save to the database
      const appointmentData = {
        salon_id: salonId,
        customer_id: selectedCustomer,
        staff_id: selectedStaff,
        services: selectedServices,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        total_price: calculateTotalPrice(),
        notes,
        status: 'confirmed'
      }
      
      console.log('Creating appointment:', appointmentData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Appointment created successfully!')
      router.push('/salon-admin/appointments')
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Failed to create appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Select date, time, and customer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={handleStartTimeChange}
              minTime="09:00"
              maxTime="18:00"
              interval={15}
            />
            
            <TimePicker
              label="End Time"
              value={endTime}
              onChange={setEndTime}
              minTime="09:00"
              maxTime="19:00"
              interval={15}
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label>Customer</Label>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {customers.find(c => c.id === selectedCustomer)?.name || "Select a customer"}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {customers.map(customer => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div>
                      <div>{customer.name}</div>
                      <div className="text-xs text-muted-foreground">{customer.email}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Staff Member</Label>
            <Select value={selectedStaff} onValueChange={setSelectedStaff}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Services & Notes</CardTitle>
          <CardDescription>Select services and add notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Services</Label>
            <div className="space-y-2 rounded-md border p-4">
              {services.map(service => (
                <div key={service.id} className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceChange(service.id)}
                      className="rounded border-gray-300"
                    />
                    <span>{service.name}</span>
                  </label>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {service.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Price:</span>
              <span>${calculateTotalPrice().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Appointment'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/salon-admin/appointments')}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}