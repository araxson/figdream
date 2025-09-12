'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { TimeOffRequest, TimeOffFormData } from '@/types/features/time-off-types'
import { TimeOffForm } from './time-off-form'
import { TimeOffList } from './time-off/time-off-list'
import { TimeOffStatsCard } from './time-off-stats'
import { 
  fetchTimeOffRequests, 
  submitTimeOffRequest, 
  cancelTimeOffRequest,
  calculateDays 
} from '@/lib/api/services/time-off-api'

export function TimeOffRequests() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [cancelingRequest, setCancelingRequest] = useState<TimeOffRequest | null>(null)
  const [formData, setFormData] = useState<TimeOffFormData>({
    startDate: '',
    endDate: '',
    reason: ''
  })
  const { toast } = useToast()

  const loadRequests = useCallback(async () => {
    const data = await fetchTimeOffRequests()
    setRequests(data)
    setLoading(false)
  }, [])
  
  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  async function handleSubmitRequest() {
    try {
      await submitTimeOffRequest(formData)
      toast.success('Time off request submitted successfully')
      setShowRequestDialog(false)
      setFormData({ startDate: '', endDate: '', reason: '' })
      loadRequests()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting request:', error)
      }
      toast.error('Failed to submit request')
    }
  }

  async function handleCancelRequest() {
    if (!cancelingRequest) return

    try {
      await cancelTimeOffRequest(cancelingRequest.id)
      toast.success('Request cancelled successfully')
      loadRequests()
      setCancelingRequest(null)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error cancelling request:', error)
      }
      toast.error('Failed to cancel request')
      setCancelingRequest(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Off Requests</CardTitle>
          <CardDescription>Manage your time off and vacation requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading requests...
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentYear = new Date().getFullYear()
  const approvedDays = requests
    .filter(r => r.status === 'approved' && new Date(r.start_date).getFullYear() === currentYear)
    .reduce((total, r) => total + calculateDays(r.start_date, r.end_date), 0)
  
  const pendingDays = requests
    .filter(r => r.status === 'pending')
    .reduce((total, r) => total + calculateDays(r.start_date, r.end_date), 0)

  const totalAllowedDays = 21
  const remainingDays = Math.max(0, totalAllowedDays - approvedDays)

  const stats = {
    approvedDays,
    pendingDays,
    remainingDays
  }

  return (
    <>
      <TimeOffStatsCard stats={stats} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time Off Requests</CardTitle>
              <CardDescription>Manage your time off and vacation requests</CardDescription>
            </div>
            <Button onClick={() => setShowRequestDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TimeOffList
            requests={requests}
            cancelingRequest={cancelingRequest}
            onCancelRequest={setCancelingRequest}
            onConfirmCancel={handleCancelRequest}
            onCancelDialog={() => setCancelingRequest(null)}
          />
        </CardContent>
      </Card>

      <TimeOffForm
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmitRequest}
      />
    </>
  )
}