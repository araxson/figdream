import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Gift Cards',
  description: 'Manage your gift cards',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gift Cards</h1>
        <p className="text-muted-foreground">Manage your gift cards</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gift Cards</CardTitle>
          <CardDescription>Manage your gift cards</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
