'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database.types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { FileText, Plus, Edit2, Save, X, Loader2, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'

type Appointment = Database['public']['Tables']['appointments']['Row']
type AppointmentNote = Database['public']['Tables']['appointment_notes']['Row']

interface AppointmentNotesManagerProps {
  appointment: Appointment & {
    staff_profiles?: {
      display_name: string | null
      profiles?: {
        full_name: string | null
        avatar_url: string | null
      }
    }
  }
  onNoteAdded?: (note: AppointmentNote) => void
  trigger?: React.ReactNode
  canEdit?: boolean
}

export default function AppointmentNotesManager({
  appointment,
  onNoteAdded,
  trigger,
  canEdit = true
}: AppointmentNotesManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState<AppointmentNote[]>([])
  const [newNote, setNewNote] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadNotes()
    }
  }, [isOpen])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/notes`)
      
      if (!response.ok) {
        throw new Error('Failed to load notes')
      }
      
      const data = await response.json()
      setNotes(data.notes || [])
    } catch (error) {
      console.error('Error loading notes:', error)
      // Fallback to appointment notes if they exist
      if (appointment.notes) {
        setNotes([
          {
            id: 'main',
            appointment_id: appointment.id,
            note: appointment.notes,
            created_at: appointment.created_at || new Date().toISOString(),
            created_by: appointment.staff_id || '',
            updated_at: appointment.updated_at || new Date().toISOString()
          }
        ])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: newNote.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add note')
      }

      const data = await response.json()
      const addedNote = data.note
      
      setNotes([addedNote, ...notes])
      setNewNote('')
      
      if (onNoteAdded) {
        onNoteAdded(addedNote)
      }
      
      toast.success('Note added successfully')
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteContent.trim()) {
      toast.error('Note cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: editingNoteContent.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update note')
      }

      const data = await response.json()
      const updatedNote = data.note
      
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n))
      setEditingNoteId(null)
      setEditingNoteContent('')
      
      toast.success('Note updated successfully')
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Failed to update note. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      const response = await fetch(`/api/appointments/${appointment.id}/notes/${noteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete note')
      }

      setNotes(notes.filter(n => n.id !== noteId))
      toast.success('Note deleted successfully')
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note. Please try again.')
    }
  }

  const startEditing = (note: AppointmentNote) => {
    setEditingNoteId(note.id)
    setEditingNoteContent(note.note)
  }

  const cancelEditing = () => {
    setEditingNoteId(null)
    setEditingNoteContent('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-1" />
            Notes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Appointment Notes</DialogTitle>
          <DialogDescription>
            View and manage notes for this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Appointment Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {new Date(appointment.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.start_time} - {appointment.end_time}
                  </p>
                  {appointment.staff_profiles && (
                    <p className="text-sm text-muted-foreground">
                      With {appointment.staff_profiles.display_name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-lg font-semibold">${appointment.total_amount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Note */}
          {canEdit && (
            <div className="space-y-2">
              <Label htmlFor="new-note">Add a Note</Label>
              <Textarea
                id="new-note"
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
                disabled={isSaving}
              />
              <Button
                onClick={handleAddNote}
                disabled={isSaving || !newNote.trim()}
                size="sm"
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Notes List */}
          <div className="space-y-2">
            <Label>Notes History</Label>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : notes.length > 0 ? (
              <ScrollArea className="h-64 rounded-md border">
                <div className="p-4 space-y-3">
                  {notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-3">
                        {editingNoteId === note.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingNoteContent}
                              onChange={(e) => setEditingNoteContent(e.target.value)}
                              rows={3}
                              disabled={isSaving}
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateNote(note.id)}
                                disabled={isSaving}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                disabled={isSaving}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback>
                                    <User className="h-3 w-3" />
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-xs font-medium">System</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(note.created_at), 'MMM dd, yyyy h:mm a')}
                                  </p>
                                </div>
                              </div>
                              {canEdit && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditing(note)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                            {note.updated_at !== note.created_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Edited {format(new Date(note.updated_at), 'MMM dd, yyyy h:mm a')}
                              </p>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2" />
                <p className="text-sm">No notes yet</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}