import { createClient } from '@/lib/database/supabase/server';
import { getCustomerByUserId } from '@/lib/data-access/customers';
import { getCustomerPreferences } from '@/lib/data-access/customers/preferences';
import { getNotificationSettings } from '@/lib/data-access/notification-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Badge, Separator, HoverCard, HoverCardContent, HoverCardTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, ScrollArea, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, Avatar, AvatarFallback, AvatarImage, Progress, Collapsible, CollapsibleContent, CollapsibleTrigger, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui';
import { 
  User, Mail, Phone, Calendar, MapPin, Bell, Shield, 
  AlertCircle, Heart, Star, Clock, Settings, MoreHorizontal,
  Copy, Edit, Share2, Download, ChevronDown, Info
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
    getNotificationSettings(user.id)
  ]);

  // Get user profile for email
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <TooltipProvider>
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
              <HoverCard>
                <HoverCardTrigger>
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={`${customer.first_name || ''} ${customer.last_name || ''}`} />
                    <AvatarFallback>
                      {(customer.first_name?.[0] || 'U')}{(customer.last_name?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback>{(customer.first_name?.[0] || 'U')}{(customer.last_name?.[0] || '')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{customer.first_name} {customer.last_name}</h4>
                      <p className="text-sm text-muted-foreground">{profile?.email}</p>
                      <div className="flex items-center pt-2">
                        <Calendar className="mr-2 h-4 w-4 opacity-70" />
                        <span className="text-xs text-muted-foreground">
                          Member since {new Date(customer.customer_since || customer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <div>
                <h2 className="text-2xl font-semibold">
                  {customer.first_name} {customer.last_name}
                </h2>
                <p className="text-muted-foreground">{profile?.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  {customer.phone && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm flex items-center gap-1 cursor-default">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Primary phone number</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {customer.customer_since && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm flex items-center gap-1 cursor-default">
                          <Calendar className="h-3 w-3" />
                          Member since {new Date(customer.customer_since).toLocaleDateString()}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your membership start date</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs cursor-default">
                    ID: {customer.id.slice(0, 8)}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your unique customer identifier</p>
                </TooltipContent>
              </Tooltip>
              <ContextMenu>
                <ContextMenuTrigger>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="rounded-md p-2 hover:bg-muted cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Profile actions</p>
                    </TooltipContent>
                  </Tooltip>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Customer ID
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Profile
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completion Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Profile Completion</span>
              <span className="text-muted-foreground">85%</span>
            </div>
            <Progress value={85} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Complete your preferences and notification settings to get personalized recommendations
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <ScrollArea className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="personal">
                  <User className="h-4 w-4 mr-2" />
                  Personal Info
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage your personal details</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="preferences">
                  <Heart className="h-4 w-4 mr-2" />
                  Preferences
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Set your service preferences</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure notification settings</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>
        </ScrollArea>

        <TabsContent value="personal" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Changes are saved automatically</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <ProfileForm customer={customer} />
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5" />
                        Service Preferences
                      </CardTitle>
                      <CardDescription>
                        Help us personalize your experience with your preferences
                      </CardDescription>
                    </div>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <p className="text-sm">Preferences help us recommend services and staff that match your style and needs.</p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </CardHeader>
                <CardContent>
                  <PreferencesForm 
                    customerId={customer.id} 
                    currentPreferences={preferences}
                  />
                </CardContent>
              </Card>

              {preferences && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Heart className="h-5 w-5" />
                            Current Preferences
                          </div>
                          <ChevronDown className="h-4 w-4" />
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Card>
                      <CardContent className="pt-6">
                        <ContextMenu>
                          <ContextMenuTrigger>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Preference Type</span>
                                <Badge variant="outline">{preferences.preference_type}</Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Preference Value</span>
                                <span className="text-sm font-medium">{preferences.preference_value}</span>
                              </div>
                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Preferences
                            </ContextMenuItem>
                            <ContextMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Details
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      </CardContent>
                    </Card>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to receive updates and reminders
                    </CardDescription>
                  </div>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge variant="secondary" className="cursor-help">
                        {notificationSettings ? 'Configured' : 'Not Set'}
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-sm">Your notification preferences are {notificationSettings ? 'configured' : 'not set yet'}.</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardHeader>
              <CardContent>
                <NotificationSettingsForm 
                  userId={user.id}
                  currentSettings={notificationSettings}
                  customerPreferences={preferences}
                />
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Account Information */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Card className="mt-6 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Information
                </div>
                <ChevronDown className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6">
              <ContextMenu>
                <ContextMenuTrigger>
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
                      <div className="flex items-center gap-2">
                        <Badge variant={user.email_confirmed_at ? 'default' : 'secondary'} className="text-xs">
                          {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                        </Badge>
                        {!user.email_confirmed_at && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className="h-3 w-3 text-orange-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Please verify your email address</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone Verified</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.phone_confirmed_at ? 'default' : 'secondary'} className="text-xs">
                          {user.phone_confirmed_at ? 'Verified' : 'Unverified'}
                        </Badge>
                        {!user.phone_confirmed_at && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className="h-3 w-3 text-orange-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Phone verification recommended for booking confirmations</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Account Details
                  </ContextMenuItem>
                  <ContextMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download Account Info
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
      </div>
    </TooltipProvider>
  );
}