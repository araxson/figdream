import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Badge, ScrollArea, Button, Label, Input, Switch, Separator } from '@/components/ui'
import { Settings, Shield, Mail, MessageSquare, CreditCard, Calendar, Gift, BarChart3, Wrench } from 'lucide-react'
import { 
  getAllSystemConfigs,
  getSystemConfigsByCategory,
  type ConfigCategory
} from '@/lib/data-access/system/configuration'

export default async function SystemConfigurationPage() {
  const allConfigs = await getAllSystemConfigs()
  
  // Group configs by category
  const configsByCategory = allConfigs.reduce((acc, config) => {
    const category = config.category as ConfigCategory
    if (!acc[category]) acc[category] = []
    acc[category].push(config)
    return acc
  }, {} as Record<ConfigCategory, typeof allConfigs>)
  
  const getCategoryIcon = (category: ConfigCategory) => {
    switch (category) {
      case 'general': return <Settings className="h-4 w-4" />
      case 'security': return <Shield className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
      case 'booking': return <Calendar className="h-4 w-4" />
      case 'loyalty': return <Gift className="h-4 w-4" />
      case 'analytics': return <BarChart3 className="h-4 w-4" />
      case 'maintenance': return <Wrench className="h-4 w-4" />
      default: return <Settings className="h-4 w-4" />
    }
  }
  
  const renderConfigInput = (config: typeof allConfigs[0]) => {
    const value = config.value
    const type = config.value_type
    
    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch 
              id={config.key}
              checked={value === 'true'}
              disabled
            />
            <Label htmlFor={config.key}>
              {value === 'true' ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        )
      case 'number':
        return (
          <Input 
            type="number" 
            value={value} 
            disabled
            className="max-w-[200px]"
          />
        )
      case 'json':
      case 'array':
        return (
          <pre className="p-2 bg-muted rounded text-xs max-w-[400px] overflow-auto">
            {JSON.stringify(JSON.parse(value), null, 2)}
          </pre>
        )
      default:
        return (
          <Input 
            type="text" 
            value={value} 
            disabled
            className="max-w-[400px]"
          />
        )
    }
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">Manage application-wide settings and configurations</p>
      </div>

      {/* Configuration Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allConfigs.length}</div>
            <p className="text-xs text-muted-foreground">Configuration entries</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allConfigs.filter(c => c.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently enabled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(configsByCategory).length}</div>
            <p className="text-xs text-muted-foreground">Configuration groups</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-5 lg:grid-cols-9 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        
        {Object.entries(configsByCategory).map(([category, configs]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category as ConfigCategory)}
                  <CardTitle className="capitalize">{category.replace('_', ' ')} Settings</CardTitle>
                </div>
                <CardDescription>
                  Configure {category} related settings for the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {configs.map((config) => (
                      <div key={config.key} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-base font-medium">
                                {config.key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Label>
                              {!config.is_active && (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {config.value_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {config.description || `Configuration key: ${config.key}`}
                            </p>
                          </div>
                        </div>
                        <div className="pl-0">
                          {renderConfigInput(config)}
                        </div>
                        {config.validation_rules && Object.keys(config.validation_rules).length > 0 && (
                          <div className="text-xs text-muted-foreground pl-0">
                            Validation: {JSON.stringify(config.validation_rules)}
                          </div>
                        )}
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            System configurations control various aspects of the application. These settings are stored in the database
            and can be modified without code changes. Changes to critical settings may require application restart.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Export Configuration
            </Button>
            <Button variant="outline" size="sm" disabled>
              Import Configuration
            </Button>
            <Button variant="outline" size="sm" disabled>
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}