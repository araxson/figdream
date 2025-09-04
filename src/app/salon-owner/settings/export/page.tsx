import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Export Settings',
  description: 'Data export settings',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Export Settings</h1>
        <p className="text-muted-foreground">Data export settings</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Export Settings</CardTitle>
          <CardDescription>Data export settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
