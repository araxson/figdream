'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AlertCircle, Bell, History, Settings } from 'lucide-react'
import { AlertConfigurationForm } from '@/components/features/platform/alerts/alert-configuration-form'
import { AlertHistoryList } from '@/components/features/platform/alerts/alert-history-list'

type AlertConfiguration = Database['public']['Tables']['alert_configuration']['Row']
type AlertHistory = Database['public']['Tables']['alert_history']['Row']

export function AlertsManagementClient() {
  const [configurations, setConfigurations] = useState<AlertConfiguration[]>([])
  const [history, setHistory] = useState<AlertHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAlerts() {
    try {
      const [configResult, historyResult] = await Promise.all([
        supabase
          .from('alert_configuration')
          .select('*')
          .order('alert_name'),
        supabase
          .from('alert_history')
          .select('*')
          .order('triggered_at', { ascending: false })
          .limit(100)
      ])

      if (configResult.error) throw configResult.error
      if (historyResult.error) throw historyResult.error

      setConfigurations(configResult.data || [])
      setHistory(historyResult.data || [])
    } catch (error) {
      console.error('Error loading alerts:', error)
      toast.error('Failed to load alerts')
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleAlert(id: string, enabled: boolean) {
    try {
      const { error } = await supabase
        .from('alert_configuration')
        .update({ is_enabled: enabled })
        .eq('id', id)

      if (error) throw error

      setConfigurations(prev =>
        prev.map(config =>
          config.id === id ? { ...config, is_enabled: enabled } : config
        )
      )

      toast.success(`Alert ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      console.error('Error toggling alert:', error)
      toast.error('Failed to update alert')
    }
  }

  if (isLoading) {
    return <div>Loading alerts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Alert Management</h1>
        <Button>
          <Bell className="mr-2 h-4 w-4" />
          Test Alerts
        </Button>
      </div>

      <Tabs defaultValue="configurations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configurations">
            <Settings className="mr-2 h-4 w-4" />
            Configurations
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Alert History
          </TabsTrigger>
          <TabsTrigger value="new">
            <AlertCircle className="mr-2 h-4 w-4" />
            Create Alert
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configurations" className="space-y-4">
          <div className="grid gap-4">
            {configurations.map((config) => (
              <Card key={config.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{config.alert_name}</CardTitle>
                      <CardDescription>
                        Metric: {config.metric_name}
                      </CardDescription>
                    </div>
                    <Switch
                      checked={config.is_enabled || false}
                      onCheckedChange={(checked) => toggleAlert(config.id, checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Badge variant="outline">
                      Warning: {config.warning_threshold || 'N/A'}
                    </Badge>
                    <Badge variant="outline">
                      Critical: {config.critical_threshold || 'N/A'}
                    </Badge>
                    <Badge variant="outline">
                      Check every: {config.check_frequency_minutes || 60} min
                    </Badge>
                  </div>
                  {config.notification_channels && (
                    <div className="mt-2 flex gap-2">
                      {config.notification_channels.map(channel => (
                        <Badge key={channel} variant="secondary">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AlertHistoryList history={history} />
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Alert</CardTitle>
              <CardDescription>
                Configure a new alert for system monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertConfigurationForm onSuccess={loadAlerts} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}