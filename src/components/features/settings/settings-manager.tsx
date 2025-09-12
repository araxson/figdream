'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { createBrowserClient } from '@supabase/ssr';
import { useSalon } from '@/lib/contexts/salon-context';
import { Database } from '@/types/database.types';
import { toast } from 'sonner';
import { 
  Settings,
  Store,
  Globe,
  Clock,
  Calendar,
  DollarSign,
  Bell,
  Mail,
  MessageSquare,
  Shield,
  Users,
  Palette,
  Languages,
  MapPin,
  Phone,
  CreditCard,
  Receipt,
  FileText,
  Image,
  Video,
  Music,
  Wifi,
  Smartphone,
  Monitor,
  Printer,
  Database as DatabaseIcon,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Upload,
  Download,
  Copy,
  Check,
  X,
  AlertTriangle,
  Info,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

interface SalonSettings {
  // Business Information
  business_name: string;
  business_type: string;
  business_registration: string;
  tax_id: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  timezone: string;
  coordinates: { lat: number; lng: number };
  
  // Operating Hours
  operating_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };
  holiday_schedule: Array<{
    date: string;
    name: string;
    is_closed: boolean;
  }>;
  
  // Booking Settings
  booking_enabled: boolean;
  booking_advance_days: number;
  booking_minimum_notice: number;
  booking_cancellation_hours: number;
  booking_buffer_time: number;
  booking_slot_duration: number;
  max_bookings_per_day: number;
  allow_walk_ins: boolean;
  require_deposit: boolean;
  deposit_percentage: number;
  
  // Payment Settings
  currency: string;
  payment_methods: {
    cash: boolean;
    card: boolean;
    online: boolean;
    mobile: boolean;
  };
  tax_rate: number;
  tip_suggestions: number[];
  invoice_prefix: string;
  invoice_starting_number: number;
  
  // Notifications
  notifications_enabled: boolean;
  email_notifications: {
    new_booking: boolean;
    booking_reminder: boolean;
    booking_cancellation: boolean;
    payment_received: boolean;
    review_received: boolean;
    staff_schedule: boolean;
  };
  sms_notifications: {
    booking_confirmation: boolean;
    booking_reminder: boolean;
    promotional: boolean;
  };
  reminder_timing: {
    first_reminder: number;
    second_reminder: number;
  };
  
  // Display Settings
  theme: 'light' | 'dark' | 'auto';
  primary_color: string;
  logo_url: string;
  cover_image_url: string;
  gallery_images: string[];
  language: string;
  date_format: string;
  time_format: '12h' | '24h';
  week_starts_on: 'sunday' | 'monday';
  
  // Features
  features: {
    online_booking: boolean;
    reviews: boolean;
    loyalty_program: boolean;
    gift_cards: boolean;
    packages: boolean;
    memberships: boolean;
    inventory_tracking: boolean;
    staff_commissions: boolean;
    marketing_campaigns: boolean;
    analytics: boolean;
    api_access: boolean;
  };
  
  // Security
  two_factor_auth: boolean;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special: boolean;
    expiry_days: number;
  };
  session_timeout: number;
  ip_whitelist: string[];
  audit_logging: boolean;
  
  // Integration
  integrations: {
    google_calendar: boolean;
    google_maps: boolean;
    facebook: boolean;
    instagram: boolean;
    mailchimp: boolean;
    twilio: boolean;
    stripe: boolean;
    square: boolean;
  };
  api_keys: {
    google_maps?: string;
    twilio?: string;
    mailchimp?: string;
    stripe?: string;
    square?: string;
  };
  
  // Metadata
  created_at: string;
  updated_at: string;
  last_modified_by: string;
}

const defaultSettings: Partial<SalonSettings> = {
  business_type: 'salon',
  timezone: 'America/New_York',
  currency: 'USD',
  booking_advance_days: 30,
  booking_minimum_notice: 24,
  booking_cancellation_hours: 24,
  booking_buffer_time: 15,
  booking_slot_duration: 30,
  max_bookings_per_day: 50,
  deposit_percentage: 20,
  tax_rate: 0,
  tip_suggestions: [15, 18, 20, 25],
  invoice_prefix: 'INV',
  invoice_starting_number: 1000,
  theme: 'light',
  primary_color: '#3b82f6',
  language: 'en',
  date_format: 'MM/dd/yyyy',
  time_format: '12h',
  week_starts_on: 'sunday',
  session_timeout: 30,
  password_policy: {
    min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special: false,
    expiry_days: 90
  },
  reminder_timing: {
    first_reminder: 24,
    second_reminder: 2
  }
};

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

const currencies = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' }
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' }
];

export function SettingsManager() {
  const { currentSalon } = useSalon();
  const [settings, setSettings] = useState<Partial<SalonSettings>>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('business');
  const [showApiKeys, setShowApiKeys] = useState(false);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (currentSalon?.id) {
      fetchSettings();
    }
  }, [currentSalon?.id]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('salon_settings')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data.settings || defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('salon_settings')
        .upsert({
          salon_id: currentSalon?.id,
          settings: settings as any,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `salon-settings-${format(new Date(), 'yyyy-MM-dd')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Settings exported successfully');
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setSettings({ ...settings, ...imported });
          setHasChanges(true);
          toast.success('Settings imported successfully');
        } catch (error) {
          toast.error('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
    setHasChanges(true);
  };

  if (!currentSalon) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please select a salon to manage settings.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your salon configuration and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportSettings}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Label htmlFor="import-settings" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </Label>
          <Input
            id="import-settings"
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportSettings}
          />
          <Button
            variant="outline"
            onClick={handleResetSettings}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Basic information about your salon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    value={settings.business_name || ''}
                    onChange={(e) => updateSetting('business_name', e.target.value)}
                    placeholder="Your Salon Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select
                    value={settings.business_type}
                    onValueChange={(value) => updateSetting('business_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salon">Hair Salon</SelectItem>
                      <SelectItem value="spa">Spa</SelectItem>
                      <SelectItem value="barbershop">Barbershop</SelectItem>
                      <SelectItem value="nail_salon">Nail Salon</SelectItem>
                      <SelectItem value="beauty_salon">Beauty Salon</SelectItem>
                      <SelectItem value="wellness">Wellness Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input
                    value={settings.business_registration || ''}
                    onChange={(e) => updateSetting('business_registration', e.target.value)}
                    placeholder="Business registration"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID</Label>
                  <Input
                    value={settings.tax_id || ''}
                    onChange={(e) => updateSetting('tax_id', e.target.value)}
                    placeholder="Tax identification"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={settings.phone || ''}
                    onChange={(e) => updateSetting('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => updateSetting('email', e.target.value)}
                    placeholder="salon@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  value={settings.website || ''}
                  onChange={(e) => updateSetting('website', e.target.value)}
                  placeholder="https://yoursalon.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={settings.description || ''}
                  onChange={(e) => updateSetting('description', e.target.value)}
                  placeholder="Describe your salon..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Your salon's physical location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={settings.address || ''}
                  onChange={(e) => updateSetting('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={settings.city || ''}
                    onChange={(e) => updateSetting('city', e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input
                    value={settings.state || ''}
                    onChange={(e) => updateSetting('state', e.target.value)}
                    placeholder="NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    value={settings.postal_code || ''}
                    onChange={(e) => updateSetting('postal_code', e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={settings.country || ''}
                    onChange={(e) => updateSetting('country', e.target.value)}
                    placeholder="United States"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Configuration</CardTitle>
              <CardDescription>Configure how customers can book appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Online Booking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to book appointments online
                  </p>
                </div>
                <Switch
                  checked={settings.booking_enabled}
                  onCheckedChange={(checked) => updateSetting('booking_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Advance Booking (days)</Label>
                  <Input
                    type="number"
                    value={settings.booking_advance_days}
                    onChange={(e) => updateSetting('booking_advance_days', parseInt(e.target.value))}
                    min="1"
                    max="365"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Notice (hours)</Label>
                  <Input
                    type="number"
                    value={settings.booking_minimum_notice}
                    onChange={(e) => updateSetting('booking_minimum_notice', parseInt(e.target.value))}
                    min="0"
                    max="168"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cancellation Window (hours)</Label>
                  <Input
                    type="number"
                    value={settings.booking_cancellation_hours}
                    onChange={(e) => updateSetting('booking_cancellation_hours', parseInt(e.target.value))}
                    min="0"
                    max="168"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Buffer Time (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.booking_buffer_time}
                    onChange={(e) => updateSetting('booking_buffer_time', parseInt(e.target.value))}
                    min="0"
                    max="60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Slot Duration (minutes)</Label>
                  <Select
                    value={settings.booking_slot_duration?.toString()}
                    onValueChange={(value) => updateSetting('booking_slot_duration', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Bookings Per Day</Label>
                  <Input
                    type="number"
                    value={settings.max_bookings_per_day}
                    onChange={(e) => updateSetting('max_bookings_per_day', parseInt(e.target.value))}
                    min="1"
                    max="500"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Walk-ins</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept customers without appointments
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_walk_ins}
                    onCheckedChange={(checked) => updateSetting('allow_walk_ins', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Deposit</Label>
                    <p className="text-sm text-muted-foreground">
                      Require deposit for bookings
                    </p>
                  </div>
                  <Switch
                    checked={settings.require_deposit}
                    onCheckedChange={(checked) => updateSetting('require_deposit', checked)}
                  />
                </div>

                {settings.require_deposit && (
                  <div className="space-y-2">
                    <Label>Deposit Percentage</Label>
                    <Input
                      type="number"
                      value={settings.deposit_percentage}
                      onChange={(e) => updateSetting('deposit_percentage', parseInt(e.target.value))}
                      min="5"
                      max="100"
                      suffix="%"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment methods and invoicing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => updateSetting('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.symbol} {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={settings.tax_rate}
                    onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value))}
                    min="0"
                    max="30"
                    step="0.01"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Payment Methods</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Cash</span>
                    </div>
                    <Switch
                      checked={settings.payment_methods?.cash}
                      onCheckedChange={(checked) => updateSetting('payment_methods.cash', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Card</span>
                    </div>
                    <Switch
                      checked={settings.payment_methods?.card}
                      onCheckedChange={(checked) => updateSetting('payment_methods.card', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Online</span>
                    </div>
                    <Switch
                      checked={settings.payment_methods?.online}
                      onCheckedChange={(checked) => updateSetting('payment_methods.online', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Mobile</span>
                    </div>
                    <Switch
                      checked={settings.payment_methods?.mobile}
                      onCheckedChange={(checked) => updateSetting('payment_methods.mobile', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Tip Suggestions (%)</Label>
                <div className="flex gap-2">
                  {settings.tip_suggestions?.map((tip, index) => (
                    <Input
                      key={index}
                      type="number"
                      value={tip}
                      onChange={(e) => {
                        const newTips = [...(settings.tip_suggestions || [])];
                        newTips[index] = parseInt(e.target.value);
                        updateSetting('tip_suggestions', newTips);
                      }}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input
                    value={settings.invoice_prefix}
                    onChange={(e) => updateSetting('invoice_prefix', e.target.value)}
                    placeholder="INV"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Starting Number</Label>
                  <Input
                    type="number"
                    value={settings.invoice_starting_number}
                    onChange={(e) => updateSetting('invoice_starting_number', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email and SMS notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send automated notifications to customers and staff
                  </p>
                </div>
                <Switch
                  checked={settings.notifications_enabled}
                  onCheckedChange={(checked) => updateSetting('notifications_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>Email Notifications</Label>
                  <div className="space-y-3 mt-3">
                    {[
                      { key: 'new_booking', label: 'New Booking' },
                      { key: 'booking_reminder', label: 'Booking Reminder' },
                      { key: 'booking_cancellation', label: 'Booking Cancellation' },
                      { key: 'payment_received', label: 'Payment Received' },
                      { key: 'review_received', label: 'Review Received' },
                      { key: 'staff_schedule', label: 'Staff Schedule Updates' }
                    ].map(notification => (
                      <div key={notification.key} className="flex items-center justify-between">
                        <span className="text-sm">{notification.label}</span>
                        <Switch
                          checked={settings.email_notifications?.[notification.key as keyof typeof settings.email_notifications]}
                          onCheckedChange={(checked) => updateSetting(`email_notifications.${notification.key}`, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>SMS Notifications</Label>
                  <div className="space-y-3 mt-3">
                    {[
                      { key: 'booking_confirmation', label: 'Booking Confirmation' },
                      { key: 'booking_reminder', label: 'Booking Reminder' },
                      { key: 'promotional', label: 'Promotional Messages' }
                    ].map(notification => (
                      <div key={notification.key} className="flex items-center justify-between">
                        <span className="text-sm">{notification.label}</span>
                        <Switch
                          checked={settings.sms_notifications?.[notification.key as keyof typeof settings.sms_notifications]}
                          onCheckedChange={(checked) => updateSetting(`sms_notifications.${notification.key}`, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Reminder Timing</Label>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <Label className="text-sm">First Reminder (hours before)</Label>
                      <Input
                        type="number"
                        value={settings.reminder_timing?.first_reminder}
                        onChange={(e) => updateSetting('reminder_timing.first_reminder', parseInt(e.target.value))}
                        min="1"
                        max="168"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Second Reminder (hours before)</Label>
                      <Input
                        type="number"
                        value={settings.reminder_timing?.second_reminder}
                        onChange={(e) => updateSetting('reminder_timing.second_reminder', parseInt(e.target.value))}
                        min="1"
                        max="24"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Customize the appearance and localization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: any) => updateSetting('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={settings.date_format}
                    onValueChange={(value) => updateSetting('date_format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Format</Label>
                  <Select
                    value={settings.time_format}
                    onValueChange={(value: any) => updateSetting('time_format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Week Starts On</Label>
                  <Select
                    value={settings.week_starts_on}
                    onValueChange={(value: any) => updateSetting('week_starts_on', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'online_booking', label: 'Online Booking', icon: Calendar },
                  { key: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
                  { key: 'loyalty_program', label: 'Loyalty Program', icon: Users },
                  { key: 'gift_cards', label: 'Gift Cards', icon: CreditCard },
                  { key: 'packages', label: 'Service Packages', icon: FileText },
                  { key: 'memberships', label: 'Memberships', icon: Users },
                  { key: 'inventory_tracking', label: 'Inventory Tracking', icon: DatabaseIcon },
                  { key: 'staff_commissions', label: 'Staff Commissions', icon: DollarSign },
                  { key: 'marketing_campaigns', label: 'Marketing Campaigns', icon: Mail },
                  { key: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
                  { key: 'api_access', label: 'API Access', icon: Globe }
                ].map(feature => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{feature.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {settings.features?.[feature.key as keyof typeof settings.features] ? 'Enabled' : 'Disabled'}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={settings.features?.[feature.key as keyof typeof settings.features]}
                        onCheckedChange={(checked) => updateSetting(`features.${feature.key}`, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all admin accounts
                  </p>
                </div>
                <Switch
                  checked={settings.two_factor_auth}
                  onCheckedChange={(checked) => updateSetting('two_factor_auth', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Track all system changes and access
                  </p>
                </div>
                <Switch
                  checked={settings.audit_logging}
                  onCheckedChange={(checked) => updateSetting('audit_logging', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => updateSetting('session_timeout', parseInt(e.target.value))}
                  min="5"
                  max="1440"
                />
              </div>

              <Separator />

              <div>
                <Label>Password Policy</Label>
                <div className="space-y-3 mt-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Minimum Length</Label>
                      <Input
                        type="number"
                        value={settings.password_policy?.min_length}
                        onChange={(e) => updateSetting('password_policy.min_length', parseInt(e.target.value))}
                        min="6"
                        max="32"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Expiry (days)</Label>
                      <Input
                        type="number"
                        value={settings.password_policy?.expiry_days}
                        onChange={(e) => updateSetting('password_policy.expiry_days', parseInt(e.target.value))}
                        min="0"
                        max="365"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require Uppercase</span>
                      <Switch
                        checked={settings.password_policy?.require_uppercase}
                        onCheckedChange={(checked) => updateSetting('password_policy.require_uppercase', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require Lowercase</span>
                      <Switch
                        checked={settings.password_policy?.require_lowercase}
                        onCheckedChange={(checked) => updateSetting('password_policy.require_lowercase', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require Numbers</span>
                      <Switch
                        checked={settings.password_policy?.require_numbers}
                        onCheckedChange={(checked) => updateSetting('password_policy.require_numbers', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Require Special Characters</span>
                      <Switch
                        checked={settings.password_policy?.require_special}
                        onCheckedChange={(checked) => updateSetting('password_policy.require_special', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}