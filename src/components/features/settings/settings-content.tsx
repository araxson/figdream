import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  Clock, 
  Calendar, 
  Bell,
  Settings,
  Shield,
  CreditCard,
  Users
} from 'lucide-react'

const settingsSections = [
  {
    value: 'salon',
    label: 'General',
    icon: Building2,
    description: 'Basic salon information and branding'
  },
  {
    value: 'hours',
    label: 'Business Hours',
    icon: Clock,
    description: 'Operating hours and holidays'
  },
  {
    value: 'booking',
    label: 'Booking',
    icon: Calendar,
    description: 'Appointment rules and policies'
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Email and SMS preferences'
  },
  {
    value: 'staff',
    label: 'Staff',
    icon: Users,
    description: 'Team management and permissions'
  },
  {
    value: 'payment',
    label: 'Payment',
    icon: CreditCard,
    description: 'Payment methods and processing'
  },
  {
    value: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Security and privacy settings'
  },
  {
    value: 'integrations',
    label: 'Integrations',
    icon: Settings,
    description: 'Third-party connections'
  }
]

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your salon preferences and configuration.
        </p>
      </div>
      <Separator />
      
      <Tabs defaultValue="salon" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 h-auto gap-4">
          {settingsSections.map((section) => (
            <TabsTrigger
              key={section.value}
              value={section.value}
              className="flex flex-col items-center justify-center gap-2 h-auto p-4"
            >
              <section.icon className="h-5 w-5" />
              <span className="text-xs">{section.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {settingsSections.map((section) => (
          <TabsContent key={section.value} value={section.value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="h-5 w-5" />
                  {section.label} Settings
                </CardTitle>
                <CardDescription>
                  {section.description}
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="rounded-lg border p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">{section.label} Configuration</h3>
              <p className="text-muted-foreground">
                {section.label} settings will be displayed here
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}