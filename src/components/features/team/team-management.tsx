'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Plus, Users, Edit, Trash2 } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Database } from '@/types/database.types'
import { TeamMemberDialog } from './team-member-dialog'
import { TeamMemberDeleteDialog } from './team-member-delete-dialog'

type TeamMember = Database['public']['Tables']['team_members']['Row']

interface TeamManagementProps {
  initialMembers: TeamMember[]
}

export function TeamManagement({ initialMembers }: TeamManagementProps) {
  const [members, setMembers] = useState(initialMembers)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSuccess = (updatedMembers: TeamMember[]) => {
    setMembers(updatedMembers)
    setDialogOpen(false)
    setEditingMember(null)
  }

  const handleDeleteSuccess = (deletedId: string) => {
    setMembers(members.filter(m => m.id !== deletedId))
    setDeletingMember(null)
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderActions = (member: TeamMember) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            setEditingMember(member)
            setDialogOpen(true)
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setDeletingMember(member)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              <CardDescription>
                Manage your team members and their roles
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                setEditingMember(null)
                setDialogOpen(true)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No team members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.sort_order}</TableCell>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          <Badge variant={member.is_active ? 'default' : 'secondary'}>
                            {member.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {renderActions(member)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <TeamMemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        member={editingMember}
        members={members}
        onSuccess={handleSuccess}
      />

      {deletingMember && (
        <TeamMemberDeleteDialog
          member={deletingMember}
          onClose={() => setDeletingMember(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}