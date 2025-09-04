import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Review Requests',
  description: 'Manage review requests',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Review Requests</h1>
        <p className="text-muted-foreground">Manage review requests</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Review Requests</CardTitle>
          <CardDescription>Manage review requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
