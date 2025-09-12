'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Plus, Edit2, Trash2, Shield, Users, Search, AlertCircle, CheckCircle, Lock, Calendar } from 'lucide-react';
import { useSalon } from '@/hooks/use-salon';

interface UserRole {
  id: string;
  user_id: string;
  salon_id: string;
  location_id?: string;
  role: string;
  permissions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assigned_by?: string;
  expires_at?: string;
  user?: {
    email: string;
    raw_app_meta_data?: {
      full_name?: string;
    };
  };
  location?: {
    name: string;
  };
}

const AVAILABLE_ROLES = [
  { value: 'owner', label: 'Owner', color: 'destructive' },
  { value: 'admin', label: 'Admin', color: 'default' },
  { value: 'manager', label: 'Manager', color: 'secondary' },
  { value: 'staff', label: 'Staff', color: 'outline' },
  { value: 'receptionist', label: 'Receptionist', color: 'outline' },
  { value: 'viewer', label: 'Viewer', color: 'outline' }
];

const PERMISSION_CATEGORIES = {
  appointments: {
    label: 'Appointments',
    permissions: [
      { key: 'view_appointments', label: 'View Appointments' },
      { key: 'create_appointments', label: 'Create Appointments' },
      { key: 'edit_appointments', label: 'Edit Appointments' },
      { key: 'delete_appointments', label: 'Delete Appointments' }
    ]
  },
  customers: {
    label: 'Customers',
    permissions: [
      { key: 'view_customers', label: 'View Customers' },
      { key: 'create_customers', label: 'Create Customers' },
      { key: 'edit_customers', label: 'Edit Customers' },
      { key: 'delete_customers', label: 'Delete Customers' }
    ]
  },
  staff: {
    label: 'Staff',
    permissions: [
      { key: 'view_staff', label: 'View Staff' },
      { key: 'manage_staff', label: 'Manage Staff' },
      { key: 'view_schedules', label: 'View Schedules' },
      { key: 'manage_schedules', label: 'Manage Schedules' }
    ]
  },
  finance: {
    label: 'Finance',
    permissions: [
      { key: 'view_reports', label: 'View Reports' },
      { key: 'view_revenue', label: 'View Revenue' },
      { key: 'manage_payments', label: 'Manage Payments' },
      { key: 'export_data', label: 'Export Data' }
    ]
  },
  settings: {
    label: 'Settings',
    permissions: [
      { key: 'view_settings', label: 'View Settings' },
      { key: 'manage_settings', label: 'Manage Settings' },
      { key: 'manage_integrations', label: 'Manage Integrations' },
      { key: 'manage_roles', label: 'Manage Roles' }
    ]
  }
};

export function UserRolesManager() {
  const { salon } = useSalon();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
  const [roleForm, setRoleForm] = useState({
    user_email: '',
    location_id: '',
    role: 'staff',
    permissions: {} as Record<string, boolean>,
    expires_at: ''
  });

  useEffect(() => {
    if (salon?.id) {
      loadUserRoles();
      loadLocations();
    }
  }, [salon?.id]);

  const loadUserRoles = async () => {
    if (!salon?.id) return;
    
    setLoading(true);
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          user:profiles!user_roles_user_id_fkey(
            email,
            raw_app_meta_data
          ),
          location:salon_locations!user_roles_location_id_fkey(
            name
          )
        `)
        .eq('salon_id', salon.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error loading user roles:', error);
      toast.error('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    if (!salon?.id) return;
    
    const supabase = createClient();
    
    try {
      const { data } = await supabase
        .from('salon_locations')
        .select('id, name')
        .eq('salon_id', salon.id);
      
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleCreateRole = async () => {
    if (!salon?.id || !roleForm.user_email) return;
    
    const supabase = createClient();
    
    try {
      // First find the user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', roleForm.user_email)
        .single();

      if (userError || !userData) {
        toast.error('User not found');
        return;
      }

      const roleData = {
        user_id: userData.id,
        salon_id: salon.id,
        location_id: roleForm.location_id || null,
        role: roleForm.role,
        permissions: roleForm.permissions,
        is_active: true,
        expires_at: roleForm.expires_at || null,
        updated_at: new Date().toISOString()
      };

      if (selectedUserRole) {
        const { error } = await supabase
          .from('user_roles')
          .update(roleData)
          .eq('id', selectedUserRole.id);
        
        if (error) throw error;
        toast.success('User role updated successfully');
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert([{
            ...roleData,
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        toast.success('User role created successfully');
      }

      setIsCreateRoleOpen(false);
      setSelectedUserRole(null);
      setRoleForm({
        user_email: '',
        location_id: '',
        role: 'staff',
        permissions: {},
        expires_at: ''
      });
      loadUserRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error('Failed to save user role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('User role deleted');
      loadUserRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete user role');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`User role ${isActive ? 'activated' : 'deactivated'}`);
      loadUserRoles();
    } catch (error) {
      console.error('Error toggling role:', error);
      toast.error('Failed to update user role');
    }
  };

  const getDefaultPermissions = (role: string) => {
    const permissions: Record<string, boolean> = {};
    
    switch (role) {
      case 'owner':
      case 'admin':
        // All permissions
        Object.values(PERMISSION_CATEGORIES).forEach(category => {
          category.permissions.forEach(perm => {
            permissions[perm.key] = true;
          });
        });
        break;
      case 'manager':
        // Most permissions except settings
        Object.entries(PERMISSION_CATEGORIES).forEach(([key, category]) => {
          if (key !== 'settings') {
            category.permissions.forEach(perm => {
              permissions[perm.key] = true;
            });
          }
        });
        permissions['view_settings'] = true;
        break;
      case 'staff':
        // Limited permissions
        permissions['view_appointments'] = true;
        permissions['create_appointments'] = true;
        permissions['edit_appointments'] = true;
        permissions['view_customers'] = true;
        permissions['view_schedules'] = true;
        break;
      case 'receptionist':
        // Reception-focused permissions
        permissions['view_appointments'] = true;
        permissions['create_appointments'] = true;
        permissions['edit_appointments'] = true;
        permissions['view_customers'] = true;
        permissions['create_customers'] = true;
        permissions['edit_customers'] = true;
        break;
      case 'viewer':
        // Read-only permissions
        permissions['view_appointments'] = true;
        permissions['view_customers'] = true;
        permissions['view_staff'] = true;
        permissions['view_schedules'] = true;
        break;
    }
    
    return permissions;
  };

  const filteredRoles = userRoles.filter(role => {
    const userName = role.user?.raw_app_meta_data?.full_name || role.user?.email || '';
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || role.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Roles</h1>
          <p className="text-muted-foreground">Manage user access and permissions</p>
        </div>
        <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedUserRole ? 'Edit User Role' : 'Assign User Role'}
              </DialogTitle>
              <DialogDescription>
                Configure user access and permissions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <Label>User Email</Label>
                <Input
                  type="email"
                  value={roleForm.user_email}
                  onChange={(e) => setRoleForm({ ...roleForm, user_email: e.target.value })}
                  placeholder="user@example.com"
                  disabled={!!selectedUserRole}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Role</Label>
                  <Select
                    value={roleForm.role}
                    onValueChange={(value) => {
                      setRoleForm({ 
                        ...roleForm, 
                        role: value,
                        permissions: getDefaultPermissions(value)
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Location (Optional)</Label>
                  <Select
                    value={roleForm.location_id}
                    onValueChange={(value) => setRoleForm({ ...roleForm, location_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Expires At (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={roleForm.expires_at}
                  onChange={(e) => setRoleForm({ ...roleForm, expires_at: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Permissions</h3>
                {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => (
                  <div key={key}>
                    <h4 className="text-sm font-medium mb-2">{category.label}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {category.permissions.map((perm) => (
                        <div key={perm.key} className="flex items-center space-x-2">
                          <Switch
                            checked={roleForm.permissions[perm.key] || false}
                            onCheckedChange={(checked) => {
                              setRoleForm({
                                ...roleForm,
                                permissions: {
                                  ...roleForm.permissions,
                                  [perm.key]: checked
                                }
                              });
                            }}
                          />
                          <Label className="text-sm">{perm.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>
                {selectedUserRole ? 'Update' : 'Assign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRoles.length}</div>
            <p className="text-xs text-muted-foreground">
              {userRoles.filter(r => r.is_active).length} active
            </p>
          </CardContent>
        </Card>
        
        {AVAILABLE_ROLES.slice(0, 3).map((role) => {
          const count = userRoles.filter(r => r.role === role.value).length;
          return (
            <Card key={role.value}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{role.label}s</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">Users</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Roles</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((userRole) => {
                const role = AVAILABLE_ROLES.find(r => r.value === userRole.role);
                const permissionCount = Object.values(userRole.permissions || {}).filter(Boolean).length;
                
                return (
                  <TableRow key={userRole.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {userRole.user?.raw_app_meta_data?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userRole.user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role?.color as any}>
                        <Shield className="h-3 w-3 mr-1" />
                        {role?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userRole.location?.name || 'All locations'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{permissionCount} permissions</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={userRole.is_active}
                        onCheckedChange={(checked) => handleToggleActive(userRole.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      {userRole.expires_at ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(userRole.expires_at), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUserRole(userRole);
                            setRoleForm({
                              user_email: userRole.user?.email || '',
                              location_id: userRole.location_id || '',
                              role: userRole.role,
                              permissions: userRole.permissions || {},
                              expires_at: userRole.expires_at || ''
                            });
                            setIsCreateRoleOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRole(userRole.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}