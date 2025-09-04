'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import { format } from 'date-fns'
import { 
  UserPlus, 
  Mail, 
  Copy, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Info,
  AlertCircle
} from 'lucide-react'

interface Invitation {
  id: string
  email: string
  role: string
  invitation_token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
  metadata: {
    role?: string
    salon_name?: string
    [key: string]: unknown
  }
}

export function StaffInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [salonId, setSalonId] = useState<string | null>(null)
  const [isInviting, setIsInviting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Form fields
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')

  // Load salon ID and invitations
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Get current user's salon
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('salon_id')
        .eq('user_id', user.id)
        .eq('role', 'salon_owner')
        .eq('is_active', true)
        .single()

      if (!userRole?.salon_id) {
        toast.error('Salon not found')
        return
      }

      setSalonId(userRole.salon_id)

      // Load invitations
      const { data: invitationsData, error } = await supabase
        .from('staff_invitations')
        .select('*')
        .eq('salon_id', userRole.salon_id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('Failed to load invitations')
      } else {
        setInvitations(invitationsData || [])
      }
    } catch (_err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const sendInvitation = async () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    if (!salonId) {
      toast.error('Salon not configured')
      return
    }

    setIsInviting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Not authenticated')
        return
      }

      // Create invitation
      const { data, error } = await supabase
        .from('staff_invitations')
        .insert({
          salon_id: salonId,
          email: email.toLowerCase(),
          role,
          invited_by: user.id,
          metadata: {
            sent_at: new Date().toISOString()
          }
        })
        .select()
        .single()

      if (error) {
        if (error.message?.includes('unique_pending_invitation')) {
          toast.error('An invitation has already been sent to this email')
        } else {
          toast.error('Failed to create invitation')
        }
        return
      }

      // Here you would normally send an email with the invitation link
      // For now, we'll just show the link to copy
      const inviteUrl = `${window.location.origin}/accept-invitation?token=${data.invitation_token}`
      
      toast.success('Invitation created successfully!')
      
      // Copy link to clipboard
      navigator.clipboard.writeText(inviteUrl)
      toast.info('Invitation link copied to clipboard')

      // Reset form and reload
      setEmail('')
      setRole('staff')
      setDialogOpen(false)
      loadData()
    } catch (_err) {
      toast.error('Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const resendInvitation = async (invitation: Invitation) => {
    try {
      const supabase = createClient()
      
      // Update expiration date
      const { error } = await supabase
        .from('staff_invitations')
        .update({
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      if (error) {
        toast.error('Failed to resend invitation')
        return
      }

      // Copy link to clipboard
      const inviteUrl = `${window.location.origin}/accept-invitation?token=${invitation.invitation_token}`
      navigator.clipboard.writeText(inviteUrl)
      
      toast.success('Invitation resent and link copied to clipboard')
      loadData()
    } catch (_err) {
      toast.error('Failed to resend invitation')
    }
  }

  const deleteInvitation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('staff_invitations')
        .delete()
        .eq('id', id)

      if (error) {
        toast.error('Failed to delete invitation')
      } else {
        toast.success('Invitation deleted')
        loadData()
      }
    } catch (_err) {
      toast.error('Failed to delete invitation')
    }
  }

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/accept-invitation?token=${token}`
    navigator.clipboard.writeText(inviteUrl)
    toast.success('Invitation link copied to clipboard')
  }

  const getStatusBadge = (invitation: Invitation) => {
    if (invitation.accepted_at) {
      return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Accepted</Badge>
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date()
    if (isExpired) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Expired</Badge>
    }
    
    return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Only salon owners and super administrators can invite new staff members. 
          Staff accounts created through invitations will automatically be assigned to your salon.
        </AlertDescription>
      </Alert>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Send New Invitation</CardTitle>
          <CardDescription>
            Invite staff members to join your salon team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Staff Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your salon. The invitation will expire in 7 days.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="staff@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="staff">Staff Member</SelectItem>
                      <SelectItem value="location_manager">Location Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    The invitation link will be copied to your clipboard. 
                    You&apos;ll need to send it to the staff member via email or messaging.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={sendInvitation} disabled={isInviting}>
                  {isInviting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Invitations</CardTitle>
          <CardDescription>
            Manage and track staff invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No invitations sent yet</p>
              <p className="text-sm mt-2">Click &quot;Invite Staff Member&quot; to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell className="capitalize">
                      {invitation.role.replace('_', ' ')}
                    </TableCell>
                    <TableCell>{getStatusBadge(invitation)}</TableCell>
                    <TableCell>
                      {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!invitation.accepted_at && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyInviteLink(invitation.invitation_token)}
                              title="Copy invitation link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => resendInvitation(invitation)}
                              title="Resend invitation"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteInvitation(invitation.id)}
                          title="Delete invitation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}