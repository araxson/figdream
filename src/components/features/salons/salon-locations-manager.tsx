'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Clock, Phone, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface SalonLocation {
  id: string;
  salon_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  email?: string;
  website?: string;
  is_primary: boolean;
  is_active: boolean;
  business_hours?: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  coordinates?: { lat: number; lng: number };
  amenities?: string[];
  parking_info?: string;
  public_transport?: string;
  created_at: string;
  updated_at: string;
}

export function SalonLocationsManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [locations, setLocations] = useState<SalonLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SalonLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
    phone: '',
    email: '',
    website: '',
    is_primary: false,
    is_active: true,
    parking_info: '',
    public_transport: ''
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchLocations();
    }
  }, [salonId]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('salon_locations')
        .select('*')
        .eq('salon_id', salonId)
        .order('is_primary', { ascending: false })
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load salon locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const locationData = {
        salon_id: salonId,
        ...formData,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      };

      if (editingLocation) {
        const { error } = await supabase
          .from('salon_locations')
          .update(locationData)
          .eq('id', editingLocation.id);

        if (error) throw error;
        toast.success('Location updated successfully');
      } else {
        // If setting as primary, unset other primary locations
        if (formData.is_primary) {
          await supabase
            .from('salon_locations')
            .update({ is_primary: false })
            .eq('salon_id', salonId);
        }

        const { error } = await supabase
          .from('salon_locations')
          .insert({
            ...locationData,
            created_at: new Date().toISOString(),
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Location added successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('Failed to save location');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('salon_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const togglePrimary = async (location: SalonLocation) => {
    try {
      // Unset all other primary locations
      await supabase
        .from('salon_locations')
        .update({ is_primary: false })
        .eq('salon_id', salonId);

      // Set this location as primary
      const { error } = await supabase
        .from('salon_locations')
        .update({ is_primary: true })
        .eq('id', location.id);

      if (error) throw error;

      toast.success('Primary location updated');
      fetchLocations();
    } catch (error) {
      console.error('Error updating primary location:', error);
      toast.error('Failed to update primary location');
    }
  };

  const toggleActive = async (location: SalonLocation) => {
    try {
      const { error } = await supabase
        .from('salon_locations')
        .update({ is_active: !location.is_active })
        .eq('id', location.id);

      if (error) throw error;

      toast.success(`Location ${location.is_active ? 'deactivated' : 'activated'}`);
      fetchLocations();
    } catch (error) {
      console.error('Error updating location status:', error);
      toast.error('Failed to update location status');
    }
  };

  const openDialog = (location?: SalonLocation) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        address: location.address,
        city: location.city,
        state: location.state,
        zip_code: location.zip_code,
        country: location.country,
        phone: location.phone,
        email: location.email || '',
        website: location.website || '',
        is_primary: location.is_primary,
        is_active: location.is_active,
        parking_info: location.parking_info || '',
        public_transport: location.public_transport || ''
      });
    } else {
      setEditingLocation(null);
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'US',
      phone: '',
      email: '',
      website: '',
      is_primary: false,
      is_active: true,
      parking_info: '',
      public_transport: ''
    });
    setEditingLocation(null);
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
              <CardTitle>Salon Locations</CardTitle>
              <CardDescription>
                Manage your salon's physical locations and branches
              </CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No locations added yet</p>
              <p className="text-sm mt-2">Add your first salon location to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="font-medium">
                        {location.name}
                        {location.is_primary && (
                          <Badge className="ml-2" variant="default">Primary</Badge>
                        )}
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
                      <div className="space-y-1">
                        {location.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {location.phone}
                          </div>
                        )}
                        {location.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {location.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={location.is_active ? 'default' : 'secondary'}>
                        {location.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!location.is_primary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePrimary(location)}
                            title="Set as primary"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(location)}
                        >
                          <Switch checked={location.is_active} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(location)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(location.id)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation ? 'Update location details' : 'Add a new salon location'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Main Branch"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="NY"
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  placeholder="10001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="location@salon.com"
                />
              </div>
              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://salon.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="parking">Parking Information (Optional)</Label>
              <Textarea
                id="parking"
                value={formData.parking_info}
                onChange={(e) => setFormData({ ...formData, parking_info: e.target.value })}
                placeholder="Free street parking available"
              />
            </div>
            <div>
              <Label htmlFor="transport">Public Transport (Optional)</Label>
              <Textarea
                id="transport"
                value={formData.public_transport}
                onChange={(e) => setFormData({ ...formData, public_transport: e.target.value })}
                placeholder="5 min walk from Central Station"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
                />
                <Label htmlFor="primary">Set as Primary Location</Label>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingLocation ? 'Update' : 'Add'} Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}