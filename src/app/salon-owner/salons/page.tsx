import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'My Salons',
  description: 'Manage your salons',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Salons</h1>
        <p className="text-muted-foreground">Manage your salons</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Salons</CardTitle>
          <CardDescription>Manage your salons</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
