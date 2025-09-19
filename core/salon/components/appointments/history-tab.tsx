'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { AppointmentWithRelations } from '../types'

interface AppointmentHistoryTabProps {
  appointment: AppointmentWithRelations
  onAddNote: (note: string) => Promise<void>
  isLoading: boolean
}

export function AppointmentHistoryTab({
  appointment,
  onAddNote,
  isLoading
}: AppointmentHistoryTabProps) {
  const [newNote, setNewNote] = useState('')

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    await onAddNote(newNote)
    setNewNote('')
  }

  return (
    <div className="space-y-4 mt-4">
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
    </div>
  )
}