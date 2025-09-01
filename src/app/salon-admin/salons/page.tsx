'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/database/supabase/client';
import type { Database } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Building, 
  MapPin, 
  Plus, 
  Pencil, 
  Trash2, 
  Phone,
  Mail,
  Globe,
  Clock,
  Calendar,
  Users,
  Settings,
  DollarSign,
  Star,
  TrendingUp,
  Package,
  Shield,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Navigation,
  Image
} from 'lucide-react';
import { format } from 'date-fns';

// ULTRA-TYPES: Comprehensive type definitions
type Salon = Database['public']['Tables']['salons']['Row'];
type SalonLocation = Database['public']['Tables']['salon_locations']['Row'];

interface SalonExtended extends Salon {
  locations?: SalonLocationExtended[];
  owner?: {
    id: string;
    email: string;
    full_name?: string;
  };
  subscription?: {
    id: string;
    status: string;
    plan_id: string;
    plan?: {
      name: string;
      tier: string;
    };
  };
  stats?: {
    total_appointments: number;
    total_customers: number;
    total_staff: number;
    average_rating: number;
    monthly_revenue: number;
  };
}

interface SalonLocationExtended extends SalonLocation {
  services_count?: number;
  staff_count?: number;
  appointments_today?: number;
  operating_hours?: any;
}

// ULTRA-CONSTANTS: Business hours template
const BUSINESS_HOURS_TEMPLATE = {
  monday: { open: '09:00', close: '18:00', closed: false },
  tuesday: { open: '09:00', close: '18:00', closed: false },
  wednesday: { open: '09:00', close: '18:00', closed: false },
  thursday: { open: '09:00', close: '18:00', closed: false },
  friday: { open: '09:00', close: '18:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true }
};

export default function SalonManagementPage() {
  // ULTRA-STATE: Comprehensive state management
  const [salons, setSalons] = useState<SalonExtended[]>([]);
  const [locations, setLocations] = useState<SalonLocationExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalon, setSelectedSalon] = useState<SalonExtended | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<SalonLocationExtended | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showSalonDialog, setShowSalonDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SalonLocationExtended | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // ULTRA-FORM: Salon form state
  const [salonForm, setSalonForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    logo_url: '',
    timezone: 'America/New_York',
    currency: 'USD',
    tax_rate: 0,
    booking_lead_time: 24,
    cancellation_hours: 24,
    max_advance_booking: 90,
    is_active: true
  });

  // ULTRA-FORM: Location form state
  const [locationForm, setLocationForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    phone: '',
    email: '',
    latitude: null as number | null,
    longitude: null as number | null,
    operating_hours: BUSINESS_HOURS_TEMPLATE,
    is_primary: false,
    is_active: true
  });

  // ULTRA-FETCH: Load salon and location data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      // Get user role and salon association
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role, salon_id')
        .eq('user_id', user.id)
        .single();

      if (!userRole || userRole.role !== 'salon_owner') {
        toast.error('Insufficient permissions');
        return;
      }

      // Fetch salon data with extended information
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select(`
          *,
          profiles!owner_id (
            id,
            email,
            full_name
          ),
          platform_subscriptions (
            id,
            status,
            plan_id,
            platform_subscription_plans (
              name,
              tier
            )
          )
        `)
        .eq('id', userRole.salon_id)
        .single();

      if (salonError) throw salonError;

      // Fetch locations for this salon
      const { data: locationsData, error: locationsError } = await supabase
        .from('salon_locations')
        .select(`
          *,
          staff_profiles (id),
          services (id),
          appointments (id, scheduled_at)
        `)
        .eq('salon_id', userRole.salon_id)
        .order('is_primary', { ascending: false });

      if (locationsError) throw locationsError;

      // Process locations with counts
      const processedLocations = (locationsData || []).map(location => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentsToday = location.appointments?.filter((apt: any) => {
          const aptDate = new Date(apt.scheduled_at);
          return aptDate >= today && aptDate < tomorrow;
        }).length || 0;

        return {
          ...location,
          services_count: location.services?.length || 0,
          staff_count: location.staff_profiles?.length || 0,
          appointments_today: appointmentsToday
        };
      });

      // Calculate salon statistics
      const { data: stats } = await supabase
        .from('appointments')
        .select('id, total_amount, status')
        .eq('salon_id', userRole.salon_id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const monthlyRevenue = stats?.reduce((sum, apt) => {
        if (apt.status === 'completed') {
          return sum + (apt.total_amount || 0);
        }
        return sum;
      }, 0) || 0;

      const salonWithStats: SalonExtended = {
        ...salonData,
        locations: processedLocations,
        owner: salonData.profiles,
        subscription: salonData.platform_subscriptions?.[0],
        stats: {
          total_appointments: stats?.length || 0,
          total_customers: 0, // Would fetch from customers table
          total_staff: processedLocations.reduce((sum, loc) => sum + (loc.staff_count || 0), 0),
          average_rating: 4.5, // Would calculate from reviews
          monthly_revenue: monthlyRevenue
        }
      };

      setSalons([salonWithStats]);
      setSelectedSalon(salonWithStats);
      setLocations(processedLocations);

    } catch (error) {
      console.error('Error loading salon data:', error);
      toast.error('Failed to load salon data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ULTRA-HANDLER: Update salon settings
  const handleUpdateSalon = async () => {
    if (!selectedSalon) return;

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('salons')
        .update({
          name: salonForm.name,
          description: salonForm.description,
          email: salonForm.email,
          phone: salonForm.phone,
          website: salonForm.website,
          logo_url: salonForm.logo_url,
          settings: {
            timezone: salonForm.timezone,
            currency: salonForm.currency,
            tax_rate: salonForm.tax_rate,
            booking_lead_time: salonForm.booking_lead_time,
            cancellation_hours: salonForm.cancellation_hours,
            max_advance_booking: salonForm.max_advance_booking
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSalon.id);

      if (error) throw error;

      toast.success('Salon settings updated successfully');
      setShowSalonDialog(false);
      loadData();
    } catch (error) {
      console.error('Error updating salon:', error);
      toast.error('Failed to update salon settings');
    }
  };

  // ULTRA-HANDLER: Create or update location
  const handleSaveLocation = async () => {
    if (!selectedSalon) return;

    try {
      const supabase = createClient();

      const locationData = {
        salon_id: selectedSalon.id,
        name: locationForm.name,
        address: locationForm.address,
        city: locationForm.city,
        state: locationForm.state,
        zip_code: locationForm.zip_code,
        country: locationForm.country,
        phone: locationForm.phone,
        email: locationForm.email,
        latitude: locationForm.latitude,
        longitude: locationForm.longitude,
        operating_hours: locationForm.operating_hours,
        is_primary: locationForm.is_primary,
        is_active: locationForm.is_active
      };

      if (editingLocation) {
        const { error } = await supabase
          .from('salon_locations')
          .update({
            ...locationData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLocation.id);

        if (error) throw error;
        toast.success('Location updated successfully');
      } else {
        const { error } = await supabase
          .from('salon_locations')
          .insert({
            ...locationData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Location added successfully');
      }

      setShowLocationDialog(false);
      setEditingLocation(null);
      loadData();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    }
  };

  // ULTRA-HANDLER: Delete location
  const handleDeleteLocation = async (locationId: string) => {
    setPendingDeleteId(locationId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteLocation = async () => {
    if (!pendingDeleteId) return;

    try {
      const supabase = createClient();

      // Check if location has appointments
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', pendingDeleteId);

      if (count && count > 0) {
        toast.error('Cannot delete location with existing appointments');
        setDeleteConfirmOpen(false);
        setPendingDeleteId(null);
        return;
      }

      const { error } = await supabase
        .from('salon_locations')
        .delete()
        .eq('id', pendingDeleteId);

      if (error) throw error;

      toast.success('Location deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    } finally {
      setDeleteConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  // ULTRA-HANDLER: Toggle location status
  const handleToggleLocationStatus = async (locationId: string, isActive: boolean) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('salon_locations')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', locationId);

      if (error) throw error;

      toast.success(`Location ${isActive ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      console.error('Error updating location status:', error);
      toast.error('Failed to update location status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading salon data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ULTRA-HEADER: Salon overview */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-6 w-6" />
            {selectedSalon?.name || 'Salon Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your salon settings, locations, and business configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showSalonDialog} onOpenChange={setShowSalonDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => {
                if (selectedSalon) {
                  setSalonForm({
                    name: selectedSalon.name,
                    description: selectedSalon.description || '',
                    email: selectedSalon.email || '',
                    phone: selectedSalon.phone || '',
                    website: selectedSalon.website || '',
                    logo_url: selectedSalon.logo_url || '',
                    timezone: selectedSalon.settings?.timezone || 'America/New_York',
                    currency: selectedSalon.settings?.currency || 'USD',
                    tax_rate: selectedSalon.settings?.tax_rate || 0,
                    booking_lead_time: selectedSalon.settings?.booking_lead_time || 24,
                    cancellation_hours: selectedSalon.settings?.cancellation_hours || 24,
                    max_advance_booking: selectedSalon.settings?.max_advance_booking || 90,
                    is_active: selectedSalon.is_active
                  });
                }
              }}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Salon Settings</DialogTitle>
                <DialogDescription>
                  Configure your salon's business information and policies
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Salon Name</Label>
                    <Input
                      value={salonForm.name}
                      onChange={(e) => setSalonForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={salonForm.email}
                      onChange={(e) => setSalonForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={salonForm.phone}
                      onChange={(e) => setSalonForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={salonForm.website}
                      onChange={(e) => setSalonForm(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={salonForm.description}
                    onChange={(e) => setSalonForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Timezone</Label>
                    <Select value={salonForm.timezone} onValueChange={(value) => setSalonForm(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value={salonForm.currency} onValueChange={(value) => setSalonForm(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={salonForm.tax_rate}
                      onChange={(e) => setSalonForm(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Booking Lead Time (hours)</Label>
                    <Input
                      type="number"
                      value={salonForm.booking_lead_time}
                      onChange={(e) => setSalonForm(prev => ({ ...prev, booking_lead_time: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Cancellation Window (hours)</Label>
                    <Input
                      type="number"
                      value={salonForm.cancellation_hours}
                      onChange={(e) => setSalonForm(prev => ({ ...prev, cancellation_hours: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Max Advance Booking (days)</Label>
                    <Input
                      type="number"
                      value={salonForm.max_advance_booking}
                      onChange={(e) => setSalonForm(prev => ({ ...prev, max_advance_booking: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={salonForm.is_active}
                    onCheckedChange={(checked) => setSalonForm(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSalonDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateSalon}>
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingLocation(null);
                setLocationForm({
                  name: '',
                  address: '',
                  city: '',
                  state: '',
                  zip_code: '',
                  country: 'USA',
                  phone: '',
                  email: '',
                  latitude: null,
                  longitude: null,
                  operating_hours: BUSINESS_HOURS_TEMPLATE,
                  is_primary: locations.length === 0,
                  is_active: true
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLocation ? 'Edit' : 'Add'} Location</DialogTitle>
                <DialogDescription>
                  Configure location details and operating hours
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Location Name</Label>
                  <Input
                    value={locationForm.name}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Main Branch"
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={locationForm.address}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={locationForm.city}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input
                      value={locationForm.state}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>ZIP Code</Label>
                    <Input
                      value={locationForm.zip_code}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, zip_code: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={locationForm.phone}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={locationForm.email}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={locationForm.is_primary}
                      onCheckedChange={(checked) => setLocationForm(prev => ({ ...prev, is_primary: checked }))}
                      disabled={locations.length === 0}
                    />
                    <Label>Primary Location</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={locationForm.is_active}
                      onCheckedChange={(checked) => setLocationForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowLocationDialog(false);
                  setEditingLocation(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveLocation}>
                  {editingLocation ? 'Update' : 'Add'} Location
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ULTRA-STATS: Salon metrics */}
      {selectedSalon && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {selectedSalon.subscription?.status === 'active' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="font-medium">
                  {selectedSalon.subscription?.plan?.name || 'No Plan'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedSalon.subscription?.plan?.tier || 'Free'} Tier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{locations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {locations.filter(l => l.is_active).length} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedSalon.stats?.total_staff || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${selectedSalon.stats?.monthly_revenue?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold">
                  {selectedSalon.stats?.average_rating?.toFixed(1) || '0.0'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From customer reviews
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ULTRA-TABS: Locations management */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="locations">Locations ({locations.length})</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Your salon's public information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Business Name</Label>
                  <p className="font-medium">{selectedSalon?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Owner</Label>
                  <p className="font-medium">{selectedSalon?.owner?.full_name || selectedSalon?.owner?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedSalon?.email || 'Not set'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedSalon?.phone || 'Not set'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Website</Label>
                  <p className="font-medium flex items-center gap-1">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {selectedSalon?.website || 'Not set'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant={selectedSalon?.is_active ? 'default' : 'secondary'}>
                    {selectedSalon?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              {selectedSalon?.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="mt-1">{selectedSalon.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Today</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          {location.is_primary && (
                            <Badge variant="outline" className="text-xs">Primary</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{location.address}</div>
                        <div className="text-muted-foreground">
                          {location.city}, {location.state} {location.zip_code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{location.phone}</div>
                        <div className="text-muted-foreground">{location.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{location.staff_count || 0}</TableCell>
                    <TableCell>{location.services_count || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {location.appointments_today || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={location.is_active}
                        onCheckedChange={(checked) => handleToggleLocationStatus(location.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingLocation(location);
                            setLocationForm({
                              name: location.name,
                              address: location.address || '',
                              city: location.city || '',
                              state: location.state || '',
                              zip_code: location.zip_code || '',
                              country: location.country || 'USA',
                              phone: location.phone || '',
                              email: location.email || '',
                              latitude: location.latitude,
                              longitude: location.longitude,
                              operating_hours: location.operating_hours || BUSINESS_HOURS_TEMPLATE,
                              is_primary: location.is_primary,
                              is_active: location.is_active
                            });
                            setShowLocationDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLocation(location.id)}
                          disabled={location.is_primary}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Configuration</CardTitle>
              <CardDescription>
                Manage services offered at each location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Service configuration per location coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Policies</CardTitle>
              <CardDescription>
                Configure booking rules and cancellation policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Booking Lead Time</Label>
                  <p className="font-medium">{selectedSalon?.settings?.booking_lead_time || 24} hours</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cancellation Window</Label>
                  <p className="font-medium">{selectedSalon?.settings?.cancellation_hours || 24} hours</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Max Advance Booking</Label>
                  <p className="font-medium">{selectedSalon?.settings?.max_advance_booking || 90} days</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tax Rate</Label>
                  <p className="font-medium">{selectedSalon?.settings?.tax_rate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Location Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this location? This action cannot be undone and will 
              permanently remove the location from your system. Any associated data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteConfirmOpen(false);
              setPendingDeleteId(null);
            }}>
              Keep Location
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteLocation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}