import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Service Availability',
  description: 'Configure availability',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service Availability</h1>
        <p className="text-muted-foreground">Configure availability</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Service Availability</CardTitle>
          <CardDescription>Configure availability</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
