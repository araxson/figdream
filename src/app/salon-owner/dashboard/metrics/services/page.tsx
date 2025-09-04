import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Service Metrics',
  description: 'Service performance',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service Metrics</h1>
        <p className="text-muted-foreground">Service performance</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Service Metrics</CardTitle>
          <CardDescription>Service performance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
