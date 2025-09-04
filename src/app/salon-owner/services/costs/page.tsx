import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Service Costs',
  description: 'Manage service costs',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service Costs</h1>
        <p className="text-muted-foreground">Manage service costs</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Service Costs</CardTitle>
          <CardDescription>Manage service costs</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
