import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Skeleton, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Button } from '@/components/ui'
import { SettingsForm } from '@/components/salon-owner/settings/settings-form'
import { getSettings, SETTING_TEMPLATES } from '@/lib/data-access/settings'
import { getUserSalonId } from '@/lib/data-access/auth/utils'
import { redirect } from 'next/navigation'
import { 
  Settings, 
  Bell, 
  CreditCard, 
  Users, 
  Star, 
  Calendar,
  Megaphone,
  Shield
} from 'lucide-react'

export default async function SettingsPage() {
  const salonId = await getUserSalonId()
  
  if (!salonId) {
    redirect('/salon-admin')
  }

  const settings = await getSettings(undefined, salonId)

  // Convert settings array to key-value object
  const settingsMap = settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {} as Record<string, any>)

  const categories = [
    {
      id: 'general',
      label: 'General',
      icon: Settings,
      description: 'Basic business information and preferences',
    },
    {
      id: 'booking',
      label: 'Booking',
      icon: Calendar,
      description: 'Configure booking rules and availability',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'Manage notification preferences',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      description: 'Payment methods and processing settings',
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      description: 'Marketing and promotional settings',
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: Users,
      description: 'Staff permissions and commission settings',
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: Star,
      description: 'Customer review settings',
    },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your salon settings and preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            {categories.map((category) => (
              <Tooltip key={category.id}>
                <TooltipTrigger asChild>
                  <TabsTrigger value={category.id}>
                    <category.icon className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">{category.label}</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{category.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  <CardTitle>{category.label} Settings</CardTitle>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                  <SettingsForm
                    category={category.id}
                    templates={SETTING_TEMPLATES[category.id as keyof typeof SETTING_TEMPLATES] || []}
                    currentSettings={settingsMap}
                    salonId={salonId}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Additional Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>
              Manage data export and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your salon data
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <a href="/salon-admin/settings/export">
                    Export
                  </a>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and data
                  </p>
                </div>
                <Button variant="destructive" disabled>
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integration & API</CardTitle>
            <CardDescription>
              Connect with third-party services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">API Keys</p>
                  <p className="text-sm text-muted-foreground">
                    Manage API access tokens
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Webhooks</p>
                  <p className="text-sm text-muted-foreground">
                    Configure webhook endpoints
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}