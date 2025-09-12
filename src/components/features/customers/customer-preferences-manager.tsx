'use client';

import { useState, useEffect } from 'react';
import { Heart, Info, Search, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerPreference {
  id: string;
  customer_id: string;
  salon_id: string;
  preferred_staff?: string[];
  allergies?: string;
  notes?: string;
  notification_preferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  style_preferences?: string;
  product_preferences?: string;
  avoid_ingredients?: string[];
  special_requirements?: string;
  created_at: string;
  updated_at: string;
  customers?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface CustomerFavorite {
  id: string;
  customer_id: string;
  service_id?: string;
  staff_id?: string;
  product_id?: string;
  created_at: string;
}

export function CustomerPreferencesManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [preferences, setPreferences] = useState<CustomerPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerPreference | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('preferences');
  const [formData, setFormData] = useState({
    allergies: '',
    notes: '',
    style_preferences: '',
    product_preferences: '',
    special_requirements: '',
    email_notifications: true,
    sms_notifications: true,
    marketing: false
  });

  const supabase = createClient();

  useEffect(() => {
    if (salonId) {
      fetchPreferences();
    }
  }, [salonId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('customer_preferences')
        .select(`
          *,
          customers (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('salon_id', salonId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPreferences(data || []);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load customer preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCustomer) return;

    try {
      const { error } = await supabase
        .from('customer_preferences')
        .update({
          allergies: formData.allergies || null,
          notes: formData.notes || null,
          style_preferences: formData.style_preferences || null,
          product_preferences: formData.product_preferences || null,
          special_requirements: formData.special_requirements || null,
          notification_preferences: {
            email: formData.email_notifications,
            sms: formData.sms_notifications,
            push: false,
            marketing: formData.marketing
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;

      toast.success('Preferences updated successfully');
      setIsEditOpen(false);
      fetchPreferences();
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const openEditDialog = (preference: CustomerPreference) => {
    setSelectedCustomer(preference);
    setFormData({
      allergies: preference.allergies || '',
      notes: preference.notes || '',
      style_preferences: preference.style_preferences || '',
      product_preferences: preference.product_preferences || '',
      special_requirements: preference.special_requirements || '',
      email_notifications: preference.notification_preferences?.email ?? true,
      sms_notifications: preference.notification_preferences?.sms ?? true,
      marketing: preference.notification_preferences?.marketing ?? false
    });
    setIsEditOpen(true);
  };

  const filteredPreferences = preferences.filter(pref => {
    const customer = pref.customers;
    if (!customer) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      (customer.phone && customer.phone.includes(searchTerm))
    );
  });

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
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
              <CardTitle>Customer Preferences</CardTitle>
              <CardDescription>
                Manage customer preferences, allergies, and special requirements
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="preferences" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Allergies</TableHead>
                    <TableHead>Style Preferences</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPreferences.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No customer preferences found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPreferences.map((pref) => (
                      <TableRow key={pref.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {pref.customers?.full_name || 'Unknown'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {pref.customers?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pref.allergies ? (
                            <Badge variant="destructive">{pref.allergies}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {pref.style_preferences || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {pref.notification_preferences?.email && (
                              <Badge variant="outline">Email</Badge>
                            )}
                            {pref.notification_preferences?.sms && (
                              <Badge variant="outline">SMS</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(pref.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(pref)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="favorites" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                Customer favorites feature coming soon
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer Preferences</DialogTitle>
            <DialogDescription>
              Update preferences for {selectedCustomer?.customers?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="allergies">Allergies & Sensitivities</Label>
              <Textarea
                id="allergies"
                placeholder="e.g., Latex allergy, sensitive skin"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="style">Style Preferences</Label>
              <Textarea
                id="style"
                placeholder="e.g., Prefers short cuts, likes natural looks"
                value={formData.style_preferences}
                onChange={(e) => setFormData({ ...formData, style_preferences: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="products">Product Preferences</Label>
              <Textarea
                id="products"
                placeholder="e.g., Organic products only, no strong scents"
                value={formData.product_preferences}
                onChange={(e) => setFormData({ ...formData, product_preferences: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="special">Special Requirements</Label>
              <Textarea
                id="special"
                placeholder="e.g., Wheelchair accessible station needed"
                value={formData.special_requirements}
                onChange={(e) => setFormData({ ...formData, special_requirements: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="notes">General Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any other important information"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="space-y-4">
              <Label>Notification Preferences</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="email"
                  checked={formData.email_notifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, email_notifications: checked })}
                />
                <Label htmlFor="email">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sms"
                  checked={formData.sms_notifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, sms_notifications: checked })}
                />
                <Label htmlFor="sms">SMS Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="marketing"
                  checked={formData.marketing}
                  onCheckedChange={(checked) => setFormData({ ...formData, marketing: checked })}
                />
                <Label htmlFor="marketing">Marketing Communications</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}