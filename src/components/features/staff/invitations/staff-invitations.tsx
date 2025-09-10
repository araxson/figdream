'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, Clock, CheckCircle, XCircle, Mail } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type StaffInvite = Database['public']['Tables']['staff_invitations']['Row']

interface InviteMetadata {
  first_name?: string
  last_name?: string
}

export function StaffInvitations() {
  const [invitations, setInvitations] = useState<StaffInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'stylist',
    firstName: '',
    lastName: ''
  })
  const supabase = createClient()

  const fetchInvitations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { data, error } = await supabase
        .from('staff_invitations')
        .select('*')
        .eq('salon_id', salon.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvitations(data || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching invitations:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchInvitations()
  }, [fetchInvitations])

  async function sendInvitation() {
    if (!newInvite.email || !newInvite.firstName || !newInvite.lastName) return

    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id, name')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { error } = await supabase
        .from('staff_invitations')
        .insert({
          salon_id: salon.id,
          email: newInvite.email,
          role: newInvite.role,
          invited_by: user.id,
          metadata: {
            first_name: newInvite.firstName,
            last_name: newInvite.lastName
          }
        })

      if (error) throw error

      setNewInvite({
        email: '',
        role: 'stylist',
        firstName: '',
        lastName: ''
      })
      await fetchInvitations()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error sending invitation:', error)
      }
    } finally {
      setSending(false)
    }
  }

  async function resendInvitation(id: string) {
    try {
      const { error } = await supabase
        .from('staff_invitations')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      await fetchInvitations()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error resending invitation:', error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'accepted':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading invitations...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send New Invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newInvite.firstName}
                  onChange={(e) => setNewInvite({ ...newInvite, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newInvite.lastName}
                  onChange={(e) => setNewInvite({ ...newInvite, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newInvite.role}
                  onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="stylist">Stylist</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={sendInvitation} disabled={sending}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sent Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invitations sent yet. Send your first invitation above.
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {(invite.metadata as InviteMetadata)?.first_name || ''} {(invite.metadata as InviteMetadata)?.last_name || ''}
                      </div>
                      <div className="text-sm text-muted-foreground">{invite.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{invite.role}</Badge>
                    {getStatusBadge(invite.accepted_at ? 'accepted' : 'pending')}
                    {!invite.accepted_at && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resendInvitation(invite.id)}
                      >
                        Resend
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}