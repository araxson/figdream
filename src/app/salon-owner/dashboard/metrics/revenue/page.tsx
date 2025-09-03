import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Revenue Metrics',
  description: 'Revenue analytics',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revenue Metrics</h1>
        <p className="text-muted-foreground">Revenue analytics</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Revenue Metrics</CardTitle>
          <CardDescription>Revenue analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
