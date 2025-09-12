'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Mail, Phone, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamMember {
  id: string;
  user_id: string;
  salon_id: string;
  role: 'owner' | 'manager' | 'staff' | 'receptionist';
  permissions: string[];
  is_active: boolean;
  hire_date?: string;
  department?: string;
  position?: string;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    phone?: string;
  };
}

const ROLE_COLORS = {
  owner: 'destructive',
  manager: 'default',
  staff: 'secondary',
  receptionist: 'outline'
} as const;

const PERMISSIONS = [
  { value: 'appointments.manage', label: 'Manage Appointments' },
  { value: 'customers.manage', label: 'Manage Customers' },
  { value: 'services.manage', label: 'Manage Services' },
  { value: 'staff.manage', label: 'Manage Staff' },
  { value: 'billing.manage', label: 'Manage Billing' },
  { value: 'reports.view', label: 'View Reports' },
  { value: 'settings.manage', label: 'Manage Settings' },
  { value: 'campaigns.manage', label: 'Manage Campaigns' }
];

export function TeamMembersManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('staff');
  const [formData, setFormData] = useState({
    role: 'staff' as TeamMember['role'],
    permissions: [] as string[],
    department: '',
    position: '',
    is_active: true
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchMembers();
    }
  }, [salonId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          users (
            id,
            email,
            full_name,
            avatar_url,
            phone
          )
        `)
        .eq('salon_id', salonId)
        .order('role')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (existingUser) {
        // Check if already a team member
        const { data: existingMember } = await supabase
          .from('team_members')
          .select('id')
          .eq('salon_id', salonId)
          .eq('user_id', existingUser.id)
          .single();

        if (existingMember) {
          toast.error('This user is already a team member');
          return;
        }

        // Add as team member
        const { error } = await supabase
          .from('team_members')
          .insert({
            user_id: existingUser.id,
            salon_id: salonId,
            role: inviteRole,
            permissions: getDefaultPermissions(inviteRole),
            is_active: true,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Team member added successfully');
      } else {
        // Send invitation email (would integrate with email service)
        toast.info('Invitation sent to ' + inviteEmail);
      }

      setIsInviteOpen(false);
      setInviteEmail('');
      setInviteRole('staff');
      fetchMembers();
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to invite team member');
    }
  };

  const handleUpdate = async () => {
    if (!editingMember) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('team_members')
        .update({
          role: formData.role,
          permissions: formData.permissions,
          department: formData.department || null,
          position: formData.position || null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      toast.success('Team member updated successfully');
      setIsDialogOpen(false);
      fetchMembers();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Team member removed successfully');
      fetchMembers();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  const toggleActive = async (member: TeamMember) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: !member.is_active })
        .eq('id', member.id);

      if (error) throw error;

      toast.success(`Team member ${member.is_active ? 'deactivated' : 'activated'}`);
      fetchMembers();
    } catch (error) {
      console.error('Error updating member status:', error);
      toast.error('Failed to update member status');
    }
  };

  const getDefaultPermissions = (role: TeamMember['role']): string[] => {
    switch (role) {
      case 'owner':
        return PERMISSIONS.map(p => p.value);
      case 'manager':
        return PERMISSIONS.filter(p => !p.value.includes('settings')).map(p => p.value);
      case 'staff':
        return ['appointments.manage', 'customers.manage', 'reports.view'];
      case 'receptionist':
        return ['appointments.manage', 'customers.manage'];
      default:
        return [];
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      role: member.role,
      permissions: member.permissions || [],
      department: member.department || '',
      position: member.position || '',
      is_active: member.is_active
    });
    setIsDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
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
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage team members and their permissions
              </CardDescription>
            </div>
            <Button onClick={() => setIsInviteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No team members yet</p>
              <p className="text-sm mt-2">Invite your first team member to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.users?.avatar_url} />
                          <AvatarFallback>
                            {member.users?.full_name ? getInitials(member.users.full_name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.users?.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {member.users?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_COLORS[member.role]}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.department || '-'}
                      {member.position && (
                        <div className="text-sm text-muted-foreground">
                          {member.position}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {member.permissions?.length || 0} permissions
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.is_active ? 'default' : 'secondary'}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(member)}
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {member.role !== 'owner' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your salon team
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="member@example.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as TeamMember['role'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update role and permissions for {editingMember?.users?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => {
                    setFormData({ 
                      ...formData, 
                      role: value as TeamMember['role'],
                      permissions: getDefaultPermissions(value as TeamMember['role'])
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Hair Styling"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Senior Stylist"
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {PERMISSIONS.map((permission) => (
                  <div key={permission.value} className="flex items-center space-x-2">
                    <Switch
                      id={permission.value}
                      checked={formData.permissions.includes(permission.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            permissions: [...formData.permissions, permission.value]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            permissions: formData.permissions.filter(p => p !== permission.value)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={permission.value} className="text-sm">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}