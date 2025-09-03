import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Staff Time Off',
  description: 'Manage time off',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Time Off</h1>
        <p className="text-muted-foreground">Manage time off</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Time Off</CardTitle>
          <CardDescription>Manage time off</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
