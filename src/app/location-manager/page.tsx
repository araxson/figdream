import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Location Dashboard',
  description: 'Location management dashboard',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Location Dashboard</h1>
        <p className="text-muted-foreground">Location management dashboard</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Location Dashboard</CardTitle>
          <CardDescription>Location management dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
