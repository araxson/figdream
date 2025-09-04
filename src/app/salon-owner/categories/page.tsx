import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Service Categories',
  description: 'Manage service categories',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Service Categories</h1>
        <p className="text-muted-foreground">Manage service categories</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
          <CardDescription>Manage service categories</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
