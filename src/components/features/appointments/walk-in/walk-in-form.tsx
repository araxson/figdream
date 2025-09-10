'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { WalkInFormData, WalkInFormProps } from './walk-in-types'
import { WalkInFormFields } from './walk-in-form-fields'
import { createWalkInAppointment, calculateTotal, calculateDuration } from './walk-in-service'

export function WalkInForm({ salonId, staffMembers = [], services = [] }: WalkInFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  
  const [formData, setFormData] = useState<WalkInFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    staff_id: '',
    payment_method: 'cash',
    collect_payment_now: true
  })

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const total = calculateTotal(selectedServices, services)
  const duration = calculateDuration(selectedServices, services)

  const handleSubmit = async () => {
    if (!formData.customer_name || selectedServices.length === 0) {
      toast.error('Please provide customer name and select at least one service')
      return
    }

    setLoading(true)

    try {
      await createWalkInAppointment(salonId, formData, selectedServices, services)
      
      toast.success('Walk-in appointment created successfully')
      setOpen(false)
      router.refresh()
      
      // Reset form
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        staff_id: '',
        payment_method: 'cash',
        collect_payment_now: true
      })
      setSelectedServices([])
    } catch (error) {
      console.error('Error creating walk-in appointment:', error)
      toast.error('Failed to create walk-in appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Walk-In Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Walk-In Customer</DialogTitle>
          <DialogDescription>
            Quick entry for walk-in customers without prior appointments
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <WalkInFormFields
            formData={formData}
            setFormData={setFormData}
            selectedServices={selectedServices}
            handleServiceToggle={handleServiceToggle}
            staffMembers={staffMembers}
            services={services}
            total={total}
          />
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedServices.length > 0 && (
                <span>Duration: {duration} minutes</span>
              )}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create Walk-In'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}