import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Appointment Notes',
  description: 'Manage appointment notes',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointment Notes</h1>
        <p className="text-muted-foreground">Manage appointment notes</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Appointment Notes</CardTitle>
          <CardDescription>Manage appointment notes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
