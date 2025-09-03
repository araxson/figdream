import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Staff Services',
  description: 'Assign services',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Services</h1>
        <p className="text-muted-foreground">Assign services</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Services</CardTitle>
          <CardDescription>Assign services</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
