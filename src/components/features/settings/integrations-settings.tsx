'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Calendar, Mail, MessageSquare, CreditCard, Link2, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export function SettingsIntegrations() {
  const [integrations, setIntegrations] = useState([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync appointments with Google Calendar',
      icon: Calendar,
      connected: false,
      enabled: false,
      category: 'calendar'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing and automation',
      icon: Mail,
      connected: true,
      enabled: true,
      category: 'marketing'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'SMS notifications and reminders',
      icon: MessageSquare,
      connected: true,
      enabled: false,
      category: 'communication'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing',
      icon: CreditCard,
      connected: true,
      enabled: true,
      category: 'payment'
    }
  ])

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, enabled: !integration.enabled }
        : integration
    ))
  }

  const connectIntegration = (id: string) => {
    // Simulate connection process
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { ...integration, connected: true, enabled: true }
        : integration
    ))
  }

  const categories = [...new Set(integrations.map(i => i.category))]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration Overview</CardTitle>
          <CardDescription>
            Connect your favorite tools to enhance your salon management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{integrations.length}</div>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.connected).length}
              </div>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">
                {integrations.filter(i => i.enabled).length}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category} Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations
                .filter(i => i.category === category)
                .map((integration) => {
                  const Icon = integration.icon
                  
                  return (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{integration.name}</h3>
                            {integration.connected && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {integration.connected ? (
                          <>
                            <Switch
                              checked={integration.enabled}
                              onCheckedChange={() => toggleIntegration(integration.id)}
                            />
                            <Button size="sm" variant="outline">
                              <Link2 className="h-4 w-4 mr-2" />
                              Configure
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => connectIntegration(integration.id)}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}