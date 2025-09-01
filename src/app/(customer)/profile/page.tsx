import { createClient } from '@/lib/database/supabase/server';
import { getCustomerByUserId } from '@/lib/data-access/customers';
import { getCustomerPreferences } from '@/lib/data-access/customers/preferences';
import { getNotificationSettingsByUserId } from '@/lib/data-access/notification-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Phone, Calendar, MapPin, Bell, Shield, 
  AlertCircle, Heart, Star, Clock, Settings
} from 'lucide-react';
import { redirect } from 'next/navigation';
import ProfileForm from './profile-form';
import PreferencesForm from './preferences-form';
import NotificationSettingsForm from './notification-settings-form';

export default async function CustomerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login/customer');
  }

  // Get customer data
  const customer = await getCustomerByUserId(user.id);
  
  if (!customer) {
    redirect('/register/customer');
  }

  // Get preferences and notification settings
  const [preferences, notificationSettings] = await Promise.all([
    getCustomerPreferences(customer.id),
    getNotificationSettingsByUserId(user.id)
  ]);

  // Get user profile for email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Profile Summary Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">
                  {customer.first_name} {customer.last_name}
                </h2>
                <p className="text-muted-foreground">{profile?.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  {customer.phone && (
                    <span className="text-sm flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </span>
                  )}
                  {customer.date_of_birth && (
                    <span className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Born {new Date(customer.date_of_birth).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Customer ID: {customer.id.slice(0, 8)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Heart className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm customer={customer} />
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Street Address</p>
                  <p className="font-medium">{customer.address || 'Not provided'}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="font-medium">{customer.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">State</p>
                    <p className="font-medium">{customer.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ZIP Code</p>
                    <p className="font-medium">{customer.zip_code || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Preferences</CardTitle>
              <CardDescription>
                Help us personalize your experience with your preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesForm 
                customerId={customer.id} 
                currentPreferences={preferences}
              />
            </CardContent>
          </Card>

          {preferences && (
            <>
              {/* Preferred Staff */}
              {preferences.preferred_staff_ids && preferences.preferred_staff_ids.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Preferred Staff Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {preferences.preferred_staff_ids.map((staffId) => (
                        <Badge key={staffId} variant="secondary">
                          Staff #{staffId.slice(0, 8)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preferred Services */}
              {preferences.preferred_service_ids && preferences.preferred_service_ids.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Favorite Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {preferences.preferred_service_ids.map((serviceId) => (
                        <Badge key={serviceId} variant="secondary">
                          Service #{serviceId.slice(0, 8)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preferred Times */}
              {preferences.preferred_time_slots && preferences.preferred_time_slots.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Preferred Appointment Times
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {preferences.preferred_time_slots.map((time) => (
                        <Badge key={time} variant="outline">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Choose how you want to receive updates and reminders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettingsForm 
                userId={user.id}
                currentSettings={notificationSettings}
                customerPreferences={preferences}
              />
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Marketing Communications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional offers and news
                    </p>
                  </div>
                  <Badge variant={preferences?.marketing_emails ? "default" : "secondary"}>
                    {preferences?.marketing_emails ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Marketing</p>
                    <p className="text-sm text-muted-foreground">
                      Receive text message promotions
                    </p>
                  </div>
                  <Badge variant={preferences?.marketing_sms ? "default" : "secondary"}>
                    {preferences?.marketing_sms ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Account Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Account Created</p>
              <p className="font-medium">
                {new Date(customer.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {customer.updated_at ? new Date(customer.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Email Verified</p>
              <p className="font-medium">
                {user.email_confirmed_at ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone Verified</p>
              <p className="font-medium">
                {user.phone_confirmed_at ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}