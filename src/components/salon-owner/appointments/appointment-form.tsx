'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Button, 
  Label, 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Checkbox,
  DateTimePicker
} from '@/components/ui'
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
  const [startDateTime, setStartDateTime] = useState<Date | undefined>(new Date())
  const [endDateTime, setEndDateTime] = useState<Date | undefined>()
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  const calculateTotalDuration = (serviceIds: string[]) => {
    return serviceIds.reduce((total, id) => {
      const service = services.find(s => s.id === id)
      return total + (service?.duration || 0)
    }, 0)
  }

  const calculateEndDateTime = (startDate: Date, serviceIds: string[]) => {
    if (!startDate || serviceIds.length === 0) return undefined
    
    const totalDuration = calculateTotalDuration(serviceIds)
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + totalDuration)
    
    return endDate
  }

  const handleServiceChange = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId]
    
    setSelectedServices(newServices)
    
    // Auto-calculate end time
    if (startDateTime) {
      const endDate = calculateEndDateTime(startDateTime, newServices)
      setEndDateTime(endDate)
    }
  }

  const handleStartDateTimeChange = (date: Date | undefined) => {
    setStartDateTime(date)
    if (date && selectedServices.length > 0) {
      const endDate = calculateEndDateTime(date, selectedServices)
      setEndDateTime(endDate)
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
    if (!startDateTime || !selectedCustomer || !selectedStaff || selectedServices.length === 0) {
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
        date: format(startDateTime, 'yyyy-MM-dd'),
        start_time: format(startDateTime, 'HH:mm:ss'),
        end_time: endDateTime ? format(endDateTime, 'HH:mm:ss') : '',
        appointment_date: startDateTime.toISOString(),
        end_date: endDateTime?.toISOString(),
        total_price: calculateTotalPrice(),
        total_duration: calculateTotalDuration(selectedServices),
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
          <div className="grid gap-4 lg:grid-cols-2">
            <DateTimePicker
              label="Start Date & Time"
              placeholder="Select appointment start"
              value={startDateTime}
              onChange={handleStartDateTimeChange}
              minDate={new Date()}
              minTime="09:00"
              maxTime="18:00"
              interval={15}
            />
            
            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <div className="p-3 rounded-md border bg-muted/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    {endDateTime ? (
                      <div>
                        <p className="font-medium">
                          {format(endDateTime, "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Duration: {calculateTotalDuration(selectedServices)} minutes
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Select services to calculate end time
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceChange(service.id)}
                    />
                    <Label htmlFor={service.id} className="cursor-pointer">
                      {service.name}
                    </Label>
                  </div>
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