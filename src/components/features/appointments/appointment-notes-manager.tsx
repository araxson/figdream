'use client';

import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Search, User, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface AppointmentNote {
  id: string;
  appointment_id: string;
  salon_id: string;
  note_type: 'service' | 'customer' | 'internal' | 'follow_up';
  content: string;
  visibility: 'public' | 'staff_only' | 'private';
  tags?: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  appointments?: {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    customers?: {
      full_name: string;
      email: string;
    };
    services?: {
      name: string;
    };
    staff?: {
      full_name: string;
    };
  };
  users?: {
    full_name: string;
  };
}

const NOTE_TYPES = [
  { value: 'service', label: 'Service Notes', color: 'blue' },
  { value: 'customer', label: 'Customer Preferences', color: 'green' },
  { value: 'internal', label: 'Internal Notes', color: 'yellow' },
  { value: 'follow_up', label: 'Follow-up Required', color: 'red' }
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Visible to Customer', icon: '👁️' },
  { value: 'staff_only', label: 'Staff Only', icon: '👥' },
  { value: 'private', label: 'Private', icon: '🔒' }
];

export function AppointmentNotesManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [notes, setNotes] = useState<AppointmentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<AppointmentNote | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    appointment_id: '',
    note_type: 'service' as AppointmentNote['note_type'],
    content: '',
    visibility: 'staff_only' as AppointmentNote['visibility'],
    tags: [] as string[],
    tag_input: '',
    is_pinned: false
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchNotes();
    }
  }, [salonId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('appointment_notes')
        .select(`
          *,
          appointments (
            id,
            appointment_date,
            appointment_time,
            status,
            customers (
              full_name,
              email
            ),
            services (
              name
            ),
            staff (
              full_name
            )
          ),
          users (
            full_name
          )
        `)
        .eq('salon_id', salonId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load appointment notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const noteData = {
        salon_id: salonId,
        appointment_id: formData.appointment_id || selectedAppointmentId,
        note_type: formData.note_type,
        content: formData.content,
        visibility: formData.visibility,
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_pinned: formData.is_pinned,
        updated_at: new Date().toISOString(),
        created_by: user.id
      };

      if (editingNote) {
        const { error } = await supabase
          .from('appointment_notes')
          .update(noteData)
          .eq('id', editingNote.id);

        if (error) throw error;
        toast.success('Note updated successfully');
      } else {
        const { error } = await supabase
          .from('appointment_notes')
          .insert({
            ...noteData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Note added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointment_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Note deleted successfully');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const togglePin = async (note: AppointmentNote) => {
    try {
      const { error } = await supabase
        .from('appointment_notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', note.id);

      if (error) throw error;

      toast.success(`Note ${note.is_pinned ? 'unpinned' : 'pinned'}`);
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    }
  };

  const addTag = () => {
    if (formData.tag_input && !formData.tags.includes(formData.tag_input)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.tag_input],
        tag_input: ''
      });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const openDialog = (note?: AppointmentNote, appointmentId?: string) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        appointment_id: note.appointment_id,
        note_type: note.note_type,
        content: note.content,
        visibility: note.visibility,
        tags: note.tags || [],
        tag_input: '',
        is_pinned: note.is_pinned
      });
    } else {
      setEditingNote(null);
      setSelectedAppointmentId(appointmentId || null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      appointment_id: '',
      note_type: 'service',
      content: '',
      visibility: 'staff_only',
      tags: [],
      tag_input: '',
      is_pinned: false
    });
    setEditingNote(null);
    setSelectedAppointmentId(null);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.appointments?.customers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || note.note_type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getNoteTypeColor = (type: string) => {
    const noteType = NOTE_TYPES.find(t => t.value === type);
    return noteType?.color || 'gray';
  };

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!currentSalon) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          {isAdmin ? 'Please select a salon from the dropdown above' : 'No salon found'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Appointment Notes</CardTitle>
              <CardDescription>
                Manage notes and important information for appointments
              </CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {NOTE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No appointment notes found</p>
              <p className="text-sm mt-2">Add notes to keep track of important appointment details</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <Card key={note.id} className={note.is_pinned ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {note.is_pinned && (
                            <Badge variant="default">Pinned</Badge>
                          )}
                          <Badge variant="outline">
                            {NOTE_TYPES.find(t => t.value === note.note_type)?.label}
                          </Badge>
                          <Badge variant="secondary">
                            {VISIBILITY_OPTIONS.find(v => v.value === note.visibility)?.icon} {note.visibility}
                          </Badge>
                        </div>
                        
                        {note.appointments && (
                          <div className="text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(parseISO(note.appointments.appointment_date), 'MMM dd, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {note.appointments.customers?.full_name}
                              </span>
                              {note.appointments.services && (
                                <span>{note.appointments.services.name}</span>
                              )}
                            </div>
                          </div>
                        )}

                        <p className="text-sm mb-2">{note.content}</p>

                        {note.tags && note.tags.length > 0 && (
                          <div className="flex gap-1 mb-2">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Created by {note.users?.full_name || 'Unknown'} on{' '}
                          {format(parseISO(note.created_at), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePin(note)}
                          title={note.is_pinned ? 'Unpin' : 'Pin'}
                        >
                          📌
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(note)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Edit Note' : 'Add Appointment Note'}
            </DialogTitle>
            <DialogDescription>
              {editingNote ? 'Update appointment note details' : 'Add a new note for an appointment'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!editingNote && !selectedAppointmentId && (
              <div>
                <Label htmlFor="appointment">Appointment ID (Optional)</Label>
                <Input
                  id="appointment"
                  value={formData.appointment_id}
                  onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                  placeholder="Leave empty for general note"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Note Type</Label>
                <Select
                  value={formData.note_type}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    note_type: value as AppointmentNote['note_type']
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    visibility: value as AppointmentNote['visibility']
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="content">Note Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter note details..."
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  id="tags"
                  value={formData.tag_input}
                  onChange={(e) => setFormData({ ...formData, tag_input: e.target.value })}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag}>Add</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        className="ml-1 hover:text-destructive"
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="pinned"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
              />
              <Label htmlFor="pinned">Pin this note</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingNote ? 'Update' : 'Add'} Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}