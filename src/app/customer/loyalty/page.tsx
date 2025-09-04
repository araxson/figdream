import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Loyalty Program',
  description: 'View your loyalty points and rewards',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loyalty Program</h1>
        <p className="text-muted-foreground">View your loyalty points and rewards</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
          <CardDescription>View your loyalty points and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
