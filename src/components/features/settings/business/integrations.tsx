'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Zap,
  Mail,
  MessageSquare,
  CreditCard,
  Calendar,
  Cloud,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

type Integration = {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category: string
  enabled: boolean
  configured: boolean
  configFields?: Array<{
    key: string
    label: string
    type: 'text' | 'password' | 'url'
    required: boolean
    value?: string
  }>
}

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'email',
      name: 'Email Service',
      description: 'Send transactional emails and campaigns',
      icon: Mail,
      category: 'communication',
      enabled: true,
      configured: true,
      configFields: [
        { key: 'provider', label: 'Provider', type: 'text', required: true, value: 'Resend' },
        { key: 'api_key', label: 'API Key', type: 'password', required: true, value: '***' }
      ]
    },
    {
      id: 'sms',
      name: 'SMS Service',
      description: 'Send SMS notifications and reminders',
      icon: MessageSquare,
      category: 'communication',
      enabled: false,
      configured: false,
      configFields: [
        { key: 'provider', label: 'Provider', type: 'text', required: true },
        { key: 'account_sid', label: 'Account SID', type: 'text', required: true },
        { key: 'auth_token', label: 'Auth Token', type: 'password', required: true }
      ]
    },
    {
      id: 'payment',
      name: 'Payment Gateway',
      description: 'Process online payments',
      icon: CreditCard,
      category: 'payments',
      enabled: true,
      configured: true,
      configFields: [
        { key: 'provider', label: 'Provider', type: 'text', required: true, value: 'Stripe' },
        { key: 'public_key', label: 'Publishable Key', type: 'text', required: true, value: 'pk_test_***' },
        { key: 'secret_key', label: 'Secret Key', type: 'password', required: true, value: '***' }
      ]
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Sync appointments with Google Calendar',
      icon: Calendar,
      category: 'productivity',
      enabled: false,
      configured: false,
      configFields: [
        { key: 'client_id', label: 'Client ID', type: 'text', required: true },
        { key: 'client_secret', label: 'Client Secret', type: 'password', required: true }
      ]
    },
    {
      id: 'storage',
      name: 'Cloud Storage',
      description: 'Store files and backups',
      icon: Cloud,
      category: 'infrastructure',
      enabled: true,
      configured: true,
      configFields: [
        { key: 'provider', label: 'Provider', type: 'text', required: true, value: 'Supabase' },
        { key: 'bucket', label: 'Bucket Name', type: 'text', required: true, value: 'figdream-storage' }
      ]
    },
    {
      id: 'auth',
      name: 'Authentication',
      description: 'User authentication and security',
      icon: Shield,
      category: 'security',
      enabled: true,
      configured: true,
      configFields: [
        { key: 'provider', label: 'Provider', type: 'text', required: true, value: 'Supabase Auth' },
        { key: 'mfa_enabled', label: 'MFA Enabled', type: 'text', required: false, value: 'Yes' }
      ]
    }
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [configValues, setConfigValues] = useState<Record<string, string>>({})

  const toggleIntegration = (id: string, enabled: boolean) => {
    setIntegrations(prev => 
      prev.map(i => i.id === id ? { ...i, enabled } : i)
    )
    toast.success(`Integration ${enabled ? 'enabled' : 'disabled'}`)
  }

  const saveConfiguration = (id: string) => {
    setIntegrations(prev => 
      prev.map(i => i.id === id ? { ...i, configured: true } : i)
    )
    setEditingId(null)
    setConfigValues({})
    toast.success('Configuration saved')
  }

  const categoryIcons = {
    communication: Mail,
    payments: CreditCard,
    productivity: Calendar,
    infrastructure: Cloud,
    security: Shield
  }

  const categories = Array.from(new Set(integrations.map(i => i.category)))

  return (
    <div className="space-y-6">
      {categories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize flex items-center gap-2">
              {(() => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons]
                return Icon ? <Icon className="h-5 w-5" /> : null
              })()}
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrations
                .filter(i => i.category === category)
                .map(integration => {
                  const Icon = integration.icon
                  const isEditing = editingId === integration.id
                  
                  return (
                    <div key={integration.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{integration.name}</h3>
                              {integration.configured ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <Badge variant={integration.enabled ? 'default' : 'secondary'}>
                                {integration.enabled ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {integration.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={(checked) => 
                            toggleIntegration(integration.id, checked)
                          }
                        />
                      </div>
                      
                      {isEditing && integration.configFields && (
                        <div className="space-y-3 pt-3 border-t">
                          {integration.configFields.map(field => (
                            <div key={field.key} className="space-y-1">
                              <Label htmlFor={field.key}>
                                {field.label} {field.required && '*'}
                              </Label>
                              <Input
                                id={field.key}
                                type={field.type}
                                value={configValues[field.key] || field.value || ''}
                                onChange={(e) => setConfigValues(prev => ({
                                  ...prev,
                                  [field.key]: e.target.value
                                }))}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                              />
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveConfiguration(integration.id)}>
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {!isEditing && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingId(integration.id)}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      )}
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