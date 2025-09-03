import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Staff Specialties',
  description: 'Manage specialties',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Specialties</h1>
        <p className="text-muted-foreground">Manage specialties</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Specialties</CardTitle>
          <CardDescription>Manage specialties</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
