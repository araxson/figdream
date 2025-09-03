import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Staff Schedule',
  description: 'Manage schedules',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Schedule</h1>
        <p className="text-muted-foreground">Manage schedules</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Schedule</CardTitle>
          <CardDescription>Manage schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
