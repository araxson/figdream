'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Copy, RefreshCw, XCircle, CheckCircle, Clock } from 'lucide-react'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils/format'

type StaffInvitation = Database['public']['Tables']['staff_invitations']['Row']

interface InvitationListProps {
  invitations: StaffInvitation[]
  onResend: (invitation: StaffInvitation) => void
  onCancel: (invitation: StaffInvitation) => void
  onCopyLink: (token: string) => void
}

export function getInvitationStatus(invitation: StaffInvitation): 'pending' | 'accepted' | 'expired' {
  if (invitation.accepted_at) return 'accepted'
  if (new Date(invitation.expires_at) < new Date()) return 'expired'
  return 'pending'
}

export function getMetadataField(metadata: unknown, field: string): string {
  if (typeof metadata === 'object' && metadata !== null && field in metadata) {
    const value = (metadata as Record<string, unknown>)[field]
    return typeof value === 'string' ? value : ''
  }
  return ''
}

export function getResentCount(metadata: unknown): number {
  if (typeof metadata === 'object' && metadata !== null && 'resent_count' in metadata) {
    const count = (metadata as Record<string, unknown>).resent_count
    return typeof count === 'number' ? count : 0
  }
  return 0
}

function StatusBadge({ status }: { status: 'pending' | 'accepted' | 'expired' }) {
  const variants = {
    pending: { variant: 'outline' as const, icon: Clock, label: 'Pending' },
    accepted: { variant: 'default' as const, icon: CheckCircle, label: 'Accepted' },
    expired: { variant: 'secondary' as const, icon: XCircle, label: 'Expired' }
  }
  
  const { variant, icon: Icon, label } = variants[status]
  
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

export function InvitationList({ invitations, onResend, onCancel, onCopyLink }: InvitationListProps) {
  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No invitations sent yet. Send your first invitation to add staff members.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Staff Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invitations.map((invitation) => {
          const status = getInvitationStatus(invitation)
          const firstName = getMetadataField(invitation.metadata, 'first_name')
          const lastName = getMetadataField(invitation.metadata, 'last_name')
          const resentCount = getResentCount(invitation.metadata)
          
          return (
            <TableRow key={invitation.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {firstName} {lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">{invitation.email}</div>
                  {resentCount > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Resent {resentCount} time{resentCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{invitation.role}</Badge>
              </TableCell>
              <TableCell>
                <StatusBadge status={status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(invitation.created_at)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(invitation.expires_at)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  {status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopyLink(invitation.invitation_token)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResend(invitation)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {status !== 'accepted' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel(invitation)}
                      className="text-destructive"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}