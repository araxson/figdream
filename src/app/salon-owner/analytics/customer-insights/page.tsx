import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Customer Insights',
  description: 'Customer behavior analytics',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Insights</h1>
        <p className="text-muted-foreground">Customer behavior analytics</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Insights</CardTitle>
          <CardDescription>Customer behavior analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
