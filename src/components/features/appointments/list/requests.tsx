'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { toast } from 'sonner'

type Appointment = Database['public']['Tables']['appointments']['Row']

export function AppointmentRequests() {
  const [requests, setRequests] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchRequests = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('staff_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (data) setRequests(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleRequest = async (id: string, action: 'confirm' | 'decline') => {
    const status = action === 'confirm' ? 'confirmed' : 'cancelled'
    
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)

    if (!error) {
      toast.success(`Appointment ${action === 'confirm' ? 'confirmed' : 'declined'}`)
      fetchRequests()
    } else {
      toast.error('Failed to update appointment')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Appointment Requests</CardTitle>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {requests.length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No pending appointment requests
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {request.appointment_date} at {request.start_time}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Customer: {request.customer_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Service: Service
                    </p>
                    {request.notes && (
                      <p className="text-sm text-muted-foreground">
                        Notes: {request.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequest(request.id, 'confirm')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequest(request.id, 'decline')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}