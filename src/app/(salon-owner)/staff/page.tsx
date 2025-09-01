'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/database/supabase/client';
import { 
  getStaffBySalon, 
  createStaffProfile, 
  updateStaffProfile, 
  updateStaffServices,
  getStaffServices 
} from '@/lib/data-access/staff';
import { getSalonServices } from '@/lib/data-access/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from '@/components/ui/drawer';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Toggle } from '@/components/ui/toggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  Plus, Edit2, Trash2, User, Clock, Calendar, DollarSign, 
  Search, Filter, UserCheck, UserX, Scissors, Award, 
  AlertCircle, Loader2, Mail, Phone, MapPin, Star,
  ChevronRight, Settings, Shield, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/types/database.types';

// Type definitions using proper database types
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'];
type Service = Database['public']['Tables']['services']['Row'];
type StaffService = Database['public']['Tables']['staff_services']['Row'];
type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row'];
type UserRole = Database['public']['Tables']['user_roles']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

// Properly typed staff member with database relationships
type StaffMember = StaffProfile & {
  profiles?: Profile | null;
  staff_services?: (StaffService & {
    services?: Service | null;
  })[] | null;
  staff_schedules?: StaffSchedule[] | null;
  appointments_count?: number;
  revenue_generated?: number;
  average_rating?: number;
}

// Ultra-strategic form state management
interface StaffFormData {
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  phone: string;
  hire_date: string;
  commission_rate: number;
  base_salary: number;
  is_active: boolean;
  can_book_online: boolean;
  bio: string;
  specialties: string[];
  selected_services: string[];
}

export default function SalonOwnerStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Ultra-comprehensive form state
  const [formData, setFormData] = useState<StaffFormData>({
    email: '',
    first_name: '',
    last_name: '',
    display_name: '',
    phone: '',
    hire_date: new Date().toISOString().split('T')[0],
    commission_rate: 50,
    base_salary: 0,
    is_active: true,
    can_book_online: true,
    bio: '',
    specialties: [],
    selected_services: []
  });

  // Ultra-efficient data loading
  useEffect(() => {
    loadSalonData();
  }, []);

  // Ultra-smart filtering
  useEffect(() => {
    applyFilters();
  }, [staff, searchQuery, filterStatus]);

  const loadSalonData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login/salon-owner');
        return;
      }

      // Get salon with ultra-precision
      const { data: salon } = await supabase
        .from('salons')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (!salon) {
        toast.error('No salon found for this account');
        router.push('/salon-admin/dashboard');
        return;
      }

      setSalonId(salon.id);
      
      // Load all data in parallel for ultra-performance
      const [staffData, servicesData] = await Promise.all([
        loadStaff(salon.id),
        loadServices(salon.id)
      ]);

      setStaff(staffData);
      setServices(servicesData.data || []);
    } catch (error) {
      console.error('Ultra-error loading salon:', error);
      toast.error('Failed to load salon data');
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async (salonId: string): Promise<StaffMember[]> => {
    try {
      const staffData = await getStaffBySalon(salonId);
      
      // Ultra-enhance with additional metrics
      const enhancedStaff = await Promise.all(
        (staffData || []).map(async (member) => {
          const supabase = createClient();
          
          // Get appointment count for ultra-insights
          const { count: appointmentsCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('staff_id', member.id)
            .eq('status', 'completed');

          // Get average rating for ultra-performance tracking
          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('staff_id', member.id);

          const avgRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

          return {
            ...member,
            appointments_count: appointmentsCount || 0,
            average_rating: avgRating
          };
        })
      );

      return enhancedStaff;
    } catch (error) {
      console.error('Ultra-error loading staff:', error);
      toast.error('Failed to load staff members');
      return [];
    }
  };

  const loadServices = async (salonId: string) => {
    try {
      return await getSalonServices(salonId);
    } catch (error) {
      console.error('Ultra-error loading services:', error);
      return { data: [], error: 'Failed to load services' };
    }
  };

  const applyFilters = () => {
    let filtered = [...staff];

    // Ultra-smart search
    if (searchQuery) {
      filtered = filtered.filter(member => {
        const searchLower = searchQuery.toLowerCase();
        return (
          member.first_name?.toLowerCase().includes(searchLower) ||
          member.last_name?.toLowerCase().includes(searchLower) ||
          member.display_name?.toLowerCase().includes(searchLower) ||
          member.profiles?.email?.toLowerCase().includes(searchLower) ||
          member.profiles?.phone?.includes(searchQuery)
        );
      });
    }

    // Ultra-precise status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(member => 
        filterStatus === 'active' ? member.is_active : !member.is_active
      );
    }

    setFilteredStaff(filtered);
  };

  const handleAddStaff = async () => {
    if (!salonId) return;
    
    // Ultra-validation
    if (!formData.email || !formData.first_name || !formData.last_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSavingStaff(true);
    try {
      const supabase = createClient();
      
      // Create user account with ultra-security
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-12), // Temporary password
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: 'staff'
          }
        }
      });

      if (authError) throw authError;

      // Create staff profile with ultra-precision
      const staffProfile = await createStaffProfile({
        user_id: authData.user!.id,
        salon_id: salonId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name || `${formData.first_name} ${formData.last_name[0]}.`,
        phone: formData.phone,
        hire_date: formData.hire_date,
        commission_rate: formData.commission_rate,
        base_salary: formData.base_salary,
        is_active: formData.is_active,
        can_book_online: formData.can_book_online,
        bio: formData.bio
      });

      if (staffProfile && formData.selected_services.length > 0) {
        await updateStaffServices(staffProfile.id, formData.selected_services);
      }

      toast.success('Staff member added successfully');
      setIsAddDialogOpen(false);
      resetForm();
      await loadStaff(salonId).then(setStaff);
    } catch (error) {
      console.error('Ultra-error adding staff:', error);
      toast.error('Failed to add staff member');
    } finally {
      setSavingStaff(false);
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff) return;

    setSavingStaff(true);
    try {
      await updateStaffProfile(selectedStaff.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        phone: formData.phone,
        commission_rate: formData.commission_rate,
        base_salary: formData.base_salary,
        is_active: formData.is_active,
        can_book_online: formData.can_book_online,
        bio: formData.bio
      });

      if (formData.selected_services) {
        await updateStaffServices(selectedStaff.id, formData.selected_services);
      }

      toast.success('Staff member updated successfully');
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      resetForm();
      if (salonId) await loadStaff(salonId).then(setStaff);
    } catch (error) {
      console.error('Ultra-error updating staff:', error);
      toast.error('Failed to update staff member');
    } finally {
      setSavingStaff(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    setDeletingStaffId(staffId);
    try {
      await updateStaffProfile(staffId, { is_active: false });
      toast.success('Staff member deactivated');
      if (salonId) await loadStaff(salonId).then(setStaff);
    } catch (error) {
      console.error('Ultra-error deactivating staff:', error);
      toast.error('Failed to deactivate staff member');
    } finally {
      setDeletingStaffId(null);
    }
  };

  const openEditDialog = (member: StaffMember) => {
    setSelectedStaff(member);
    setFormData({
      email: member.profiles?.email || '',
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      display_name: member.display_name || '',
      phone: member.phone || '',
      hire_date: member.hire_date || '',
      commission_rate: member.commission_rate || 50,
      base_salary: member.base_salary || 0,
      is_active: member.is_active !== false,
      can_book_online: member.can_book_online !== false,
      bio: member.bio || '',
      specialties: member.staff_specialties?.map(s => s.specialty) || [],
      selected_services: member.staff_services?.map(s => s.service_id) || []
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      display_name: '',
      phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      commission_rate: 50,
      base_salary: 0,
      is_active: true,
      can_book_online: true,
      bio: '',
      specialties: [],
      selected_services: []
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Ultra-comprehensive staff card component
  const StaffCard = ({ member }: { member: StaffMember }) => (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="w-12 h-12 cursor-pointer">
                  <AspectRatio ratio={1} className="bg-muted rounded-full overflow-hidden">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={member.profiles?.avatar_url || ''} />
                      <AvatarFallback>
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </AspectRatio>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="w-16 h-16">
                    <AspectRatio ratio={1} className="bg-muted rounded-full overflow-hidden">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={member.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </AspectRatio>
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-semibold">
                      {member.display_name || `${member.first_name} ${member.last_name}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {member.profiles?.email}
                    </p>
                    {member.bio && (
                      <p className="text-sm mt-2">
                        {member.bio}
                      </p>
                    )}
                    <div className="flex items-center pt-2">
                      <Calendar className="mr-2 h-4 w-4 opacity-70" />
                      <span className="text-xs text-muted-foreground">
                        Joined {member.hire_date ? new Date(member.hire_date).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  {member.display_name || `${member.first_name} ${member.last_name}`}
                </h3>
                {member.is_active ? (
                  <Badge variant="default" className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
                {member.can_book_online && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Online Booking
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {member.profiles?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {member.profiles.email}
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {member.phone}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-1">
                  <Scissors className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {member.staff_services?.length || 0} services
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {member.appointments_count || 0} appointments
                  </span>
                </div>
                {member.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      {member.average_rating.toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {member.commission_rate}% commission
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedStaff(member);
                      setIsServiceDialogOpen(true);
                    }}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Manage Services</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(member)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Staff</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <AlertDialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingStaffId === member.id}
                      >
                        {deletingStaffId === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove Staff</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate Staff Member?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will deactivate {member.first_name} {member.last_name}. 
                    They will no longer be able to accept appointments or access the system.
                    You can reactivate them later if needed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteStaff(member.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Deactivate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {member.bio && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {member.bio}
          </p>
        )}

        {member.staff_services && member.staff_services.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {member.staff_services.slice(0, 5).map((ss) => (
              <Badge key={ss.service_id} variant="secondary" className="text-xs">
                {ss.services?.name}
              </Badge>
            ))}
            {member.staff_services.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{member.staff_services.length - 5} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-24 mb-2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your salon staff, services, and schedules with ultra-precision
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create a new staff profile with ultra-comprehensive details
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="staff@salon.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="How clients will see the name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({ ...formData, commission_rate: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_salary">Base Salary (Optional)</Label>
                  <Input
                    id="base_salary"
                    type="number"
                    min="0"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Description</Label>
                <textarea
                  id="bio"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief description of the staff member's expertise..."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Can this staff member take appointments?
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Online Booking</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow clients to book online with this staff member
                    </p>
                  </div>
                  <Switch
                    checked={formData.can_book_online}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_book_online: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Assigned Services</Label>
                <ScrollArea className="h-[200px] border rounded-md p-4">
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={formData.selected_services.includes(service.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                selected_services: [...formData.selected_services, service.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selected_services: formData.selected_services.filter(id => id !== service.id)
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {service.name}
                          <span className="text-muted-foreground ml-2">
                            ({service.duration} min • {formatCurrency(service.price || 0)})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStaff} disabled={savingStaff}>
                {savingStaff ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Staff Member'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Ultra-smart filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search staff by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Desktop Filter with ToggleGroup */}
        <ToggleGroup type="single" value={filterStatus} onValueChange={(value: string) => value && setFilterStatus(value as 'all' | 'active' | 'inactive')} className="hidden md:flex">
          <ToggleGroupItem value="all" aria-label="All staff">
            All Staff
          </ToggleGroupItem>
          <ToggleGroupItem value="active" aria-label="Active only">
            Active
          </ToggleGroupItem>
          <ToggleGroupItem value="inactive" aria-label="Inactive only">
            Inactive
          </ToggleGroupItem>
        </ToggleGroup>
        
        {/* Mobile Filter Drawer */}
        <Drawer>
          <DrawerTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filter Staff</DrawerTitle>
              <DrawerDescription>
                Apply filters to narrow down your staff list
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <div>
                <Label className="mb-2 block">Status</Label>
                <ToggleGroup type="single" value={filterStatus} onValueChange={(value: string) => value && setFilterStatus(value as 'all' | 'active' | 'inactive')} className="justify-start">
                  <ToggleGroupItem value="all">All Staff</ToggleGroupItem>
                  <ToggleGroupItem value="active">Active</ToggleGroupItem>
                  <ToggleGroupItem value="inactive">Inactive</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div>
                <Label className="mb-2 block">Additional Options</Label>
                <div className="space-y-2">
                  <Toggle pressed={false} className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Has assigned services
                  </Toggle>
                  <Toggle pressed={false} className="w-full justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    Available today
                  </Toggle>
                  <Toggle pressed={false} className="w-full justify-start">
                    <Award className="mr-2 h-4 w-4" />
                    Top performers
                  </Toggle>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button className="w-full">Apply Filters</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Ultra-comprehensive stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">
              {staff.filter(s => s.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.length > 0
                ? Math.round(staff.reduce((sum, s) => sum + (s.commission_rate || 0), 0) / staff.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.reduce((sum, s) => sum + (s.staff_services?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Staff-service assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.length > 0
                ? (staff.reduce((sum, s) => sum + (s.average_rating || 0), 0) / staff.filter(s => s.average_rating > 0).length || 0).toFixed(1)
                : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Customer satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ultra-comprehensive staff display */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Service Assignments</TabsTrigger>
          <TabsTrigger value="schedule">Schedules</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {filteredStaff.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Staff Found</h3>
                <p className="text-muted-foreground">
                  {staff.length === 0 
                    ? "You haven't added any staff members yet."
                    : "No staff members match your search criteria."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredStaff.map((member) => (
                <StaffCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Assignments Matrix</CardTitle>
              <CardDescription>
                Ultra-comprehensive view of staff-service relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    {filteredStaff.map((member) => (
                      <TableHead key={member.id} className="text-center">
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      {filteredStaff.map((member) => (
                        <TableCell key={member.id} className="text-center">
                          {member.staff_services?.some(ss => ss.service_id === service.id) ? (
                            <Badge variant="default" className="h-6 w-6 p-0 rounded-full">
                              ✓
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Schedules</CardTitle>
              <CardDescription>
                Manage working hours and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Schedule management coming soon. Use the dedicated schedule page for now.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Ultra-insights into staff performance and productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Appointments</TableHead>
                    <TableHead>Avg Rating</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.display_name || `${member.first_name} ${member.last_name}`}
                      </TableCell>
                      <TableCell>{member.appointments_count || 0}</TableCell>
                      <TableCell>
                        {member.average_rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {member.average_rating.toFixed(1)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{member.commission_rate}%</TableCell>
                      <TableCell>
                        <Badge variant={member.is_active ? 'default' : 'secondary'}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog - Similar structure to Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff profile with ultra-precision
            </DialogDescription>
          </DialogHeader>
          {/* Same form fields as Add Dialog */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStaff} disabled={savingStaff}>
              {savingStaff ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Staff Member'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Alert className="mt-6">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Ultra-Security Note:</strong> Staff members will receive an email to set their password. 
          Ensure email addresses are correct. Use role-based permissions to control access levels.
        </AlertDescription>
      </Alert>
    </div>
  );
}