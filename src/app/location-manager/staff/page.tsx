import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Staff',
  description: 'Manage location staff',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
        <p className="text-muted-foreground">Manage location staff</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff</CardTitle>
          <CardDescription>Manage location staff</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
