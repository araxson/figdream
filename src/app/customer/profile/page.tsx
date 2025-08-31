'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/database/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Mail, Phone, Calendar, MapPin, Bell, Shield, 
  AlertCircle, Loader2, Camera, Save, X 
} from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/types/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerPreferences = Database['public']['Tables']['customer_preferences']['Row'];
type NotificationSettings = Database['public']['Tables']['notification_settings']['Row'];

export default function CustomerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [preferences, setPreferences] = useState<CustomerPreferences | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Preferences
  const [allergies, setAllergies] = useState('');
  const [skinType, setSkinType] = useState('');
  const [hairType, setHairType] = useState('');
  const [preferredProducts, setPreferredProducts] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [marketingSms, setMarketingSms] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, []);

  const loadCustomerData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login/customer');
        return;
      }

      // Load customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (customerError || !customerData) {
        console.error('Error loading customer:', customerError);
        router.push('/register/customer');
        return;
      }

      setCustomer(customerData);
      setFirstName(customerData.first_name || '');
      setLastName(customerData.last_name || '');
      setEmail(customerData.email || '');
      setPhone(customerData.phone || '');
      setDateOfBirth(customerData.date_of_birth || '');
      setAddress(customerData.address || '');
      setCity(customerData.city || '');
      setState(customerData.state || '');
      setZipCode(customerData.zip_code || '');

      // Load preferences
      const { data: prefsData } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', customerData.id)
        .single();

      if (prefsData) {
        setPreferences(prefsData);
        // Parse preferences JSON if needed
        const prefs = prefsData.preferences as any || {};
        setAllergies(prefs.allergies || '');
        setSkinType(prefs.skin_type || '');
        setHairType(prefs.hair_type || '');
        setPreferredProducts(prefs.preferred_products || '');
        setSpecialRequests(prefs.special_requests || '');
      }

      // Load notification settings
      const { data: notifData } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (notifData) {
        setNotificationSettings(notifData);
        setEmailNotifications(notifData.email_enabled || false);
        setSmsNotifications(notifData.sms_enabled || false);
        setAppointmentReminders(notifData.appointment_reminders || false);
        setPromotionalEmails(notifData.promotional_emails || false);
        setMarketingSms(notifData.marketing_sms || false);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!customer) return;
    
    setSaving(true);
    try {
      const supabase = createClient();
      
      // Update customer data
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          date_of_birth: dateOfBirth || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zip_code: zipCode || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id);

      if (customerError) throw customerError;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!customer) return;
    
    setSaving(true);
    try {
      const supabase = createClient();
      
      const preferencesData = {
        allergies,
        skin_type: skinType,
        hair_type: hairType,
        preferred_products: preferredProducts,
        special_requests: specialRequests
      };

      if (preferences) {
        // Update existing preferences
        const { error } = await supabase
          .from('customer_preferences')
          .update({
            preferences: preferencesData,
            preference_type: 'preferences' as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', preferences.id);

        if (error) throw error;
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('customer_preferences')
          .insert({
            customer_id: customer.id,
            preference_type: 'preferences' as any,
            preferences: preferencesData
          });

        if (error) throw error;
      }

      toast.success('Preferences saved successfully');
      loadCustomerData(); // Reload to get latest data
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const notificationData = {
        user_id: user.id,
        email_enabled: emailNotifications,
        sms_enabled: smsNotifications,
        appointment_reminders: appointmentReminders,
        promotional_emails: promotionalEmails,
        marketing_sms: marketingSms,
        updated_at: new Date().toISOString()
      };

      if (notificationSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('notification_settings')
          .update(notificationData)
          .eq('id', notificationSettings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('notification_settings')
          .insert(notificationData);

        if (error) throw error;
      }

      toast.success('Notification settings updated');
      loadCustomerData(); // Reload to get latest data
    } catch (error) {
      console.error('Error saving notifications:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={customer?.avatar_url || ''} />
                  <AvatarFallback>
                    {firstName?.[0]}{lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="ZIP"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Beauty Preferences</CardTitle>
              <CardDescription>
                Help us customize your experience with your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies or Sensitivities</Label>
                <Textarea
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="List any allergies or skin sensitivities..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="skinType">Skin Type</Label>
                  <Select value={skinType} onValueChange={setSkinType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skin type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="dry">Dry</SelectItem>
                      <SelectItem value="oily">Oily</SelectItem>
                      <SelectItem value="combination">Combination</SelectItem>
                      <SelectItem value="sensitive">Sensitive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hairType">Hair Type</Label>
                  <Select value={hairType} onValueChange={setHairType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hair type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="straight">Straight</SelectItem>
                      <SelectItem value="wavy">Wavy</SelectItem>
                      <SelectItem value="curly">Curly</SelectItem>
                      <SelectItem value="coily">Coily</SelectItem>
                      <SelectItem value="fine">Fine</SelectItem>
                      <SelectItem value="thick">Thick</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredProducts">Preferred Products</Label>
                <Textarea
                  id="preferredProducts"
                  value={preferredProducts}
                  onChange={(e) => setPreferredProducts(e.target.value)}
                  placeholder="Any specific products or brands you prefer..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any special accommodations or requests..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Control how and when we contact you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text message updates
                    </p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming appointments
                    </p>
                  </div>
                  <Switch
                    id="appointmentReminders"
                    checked={appointmentReminders}
                    onCheckedChange={setAppointmentReminders}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="promotionalEmails">Promotional Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive special offers and promotions via email
                    </p>
                  </div>
                  <Switch
                    id="promotionalEmails"
                    checked={promotionalEmails}
                    onCheckedChange={setPromotionalEmails}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketingSms">Marketing SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive special offers via text message
                    </p>
                  </div>
                  <Switch
                    id="marketingSms"
                    checked={marketingSms}
                    onCheckedChange={setMarketingSms}
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You can unsubscribe from marketing communications at any time. 
                  Appointment reminders are recommended to avoid missing your bookings.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}