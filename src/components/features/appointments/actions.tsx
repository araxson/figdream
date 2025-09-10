'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

interface AppointmentActionsProps {
  appointmentId: string
  status: Database['public']['Enums']['appointment_status']
  onUpdate?: () => void
}

export function AppointmentActions({ appointmentId, status, onUpdate }: AppointmentActionsProps) {
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<string | null>(null)
  const supabase = createClient()

  async function handleCancel() {
    setLoading(true)
    setAction('cancel')
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Customer requested'
        })
        .eq('id', appointmentId)

      if (error) throw error

      // Log cancellation notification (optional - could be handled by backend)
      // await supabase
      //   .from('notifications')
      //   .insert({
      //     title: 'Appointment Cancelled',
      //     message: 'Your appointment has been cancelled',
      //     type: 'appointment_cancelled',
      //     user_id: userId // would need to get current user ID
      //   })

      if (onUpdate) onUpdate()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error cancelling appointment:', error)
      }
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  async function handleReschedule() {
    setLoading(true)
    setAction('reschedule')
    try {
      // In a real app, this would open a reschedule modal
      // For now, we'll just mark it as pending reschedule
      const { error } = await supabase
        .from('appointments')
        .update({ 
          notes: 'Customer requested reschedule',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      if (error) throw error
      if (onUpdate) onUpdate()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error requesting reschedule:', error)
      }
    } finally {
      setLoading(false)
      setAction(null)
    }
  }

  if (status !== 'confirmed' && status !== 'pending') {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleReschedule}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${action === 'reschedule' ? 'animate-spin' : ''}`} />
            Reschedule Appointment
          </Button>

          <Button
            variant="destructive"
            className="w-full justify-start"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className={`h-4 w-4 mr-2 ${action === 'cancel' ? 'animate-pulse' : ''}`} />
            Cancel Appointment
          </Button>

          <div className="pt-2 border-t">
            <h4 className="text-sm font-medium mb-2">Cancellation Policy</h4>
            <p className="text-xs text-muted-foreground">
              Appointments must be cancelled at least 24 hours in advance to avoid cancellation fees.
              Late cancellations may be subject to a fee of up to 50% of the service cost.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}