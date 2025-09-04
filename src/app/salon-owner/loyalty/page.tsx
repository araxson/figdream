import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Loyalty Program',
  description: 'Manage loyalty program',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loyalty Program</h1>
        <p className="text-muted-foreground">Manage loyalty program</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Program</CardTitle>
          <CardDescription>Manage loyalty program</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
