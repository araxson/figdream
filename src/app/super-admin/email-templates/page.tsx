import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Email Templates',
  description: 'Manage system email templates',
}

export default async function EmailTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
        <p className="text-muted-foreground">
          Customize system email notifications
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Template Management</CardTitle>
          <CardDescription>
            Configure and customize email templates for system notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Email template management interface coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}