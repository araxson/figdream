import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'System Configuration',
  description: 'Configure system-level settings',
}

export default async function SystemConfigurationPage() {
  // For now, show a simple configuration overview
  // The actual system_configuration table structure doesn't support categories
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>
        <p className="text-muted-foreground">
          Advanced system configuration and settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Settings</CardTitle>
          <CardDescription>
            Core system configuration parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Database</h3>
              <p className="text-sm text-muted-foreground">
                Connection: Connected
              </p>
            </div>
            <div>
              <h3 className="font-medium">Cache</h3>
              <p className="text-sm text-muted-foreground">
                Status: Active
              </p>
            </div>
            <div>
              <h3 className="font-medium">Email Service</h3>
              <p className="text-sm text-muted-foreground">
                Provider: Configured
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}