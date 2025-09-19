"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CustomerNote {
  id: string
  note: string
  created_at: string
}

interface CustomerNotesProps {
  customerId: string
  notes?: CustomerNote[]
  onAddNote: (customerId: string, note: string) => Promise<void>
  isAddingNote: boolean
}

export function CustomerNotes({
  customerId,
  notes = [],
  onAddNote,
  isAddingNote
}: CustomerNotesProps) {
  const [newNote, setNewNote] = useState("")

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    await onAddNote(customerId, newNote)
    setNewNote("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Notes</CardTitle>
        <CardDescription>
          Add important notes about this customer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Add a note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            disabled={isAddingNote}
          />
          <Button
            onClick={handleAddNote}
            disabled={isAddingNote || !newNote.trim()}
            className="w-full"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        {notes.length > 0 && <Separator />}

        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardContent className="pt-4">
                  <p className="text-sm">{note.note}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notes added yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}