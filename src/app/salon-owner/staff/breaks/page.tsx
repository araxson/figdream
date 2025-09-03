import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Staff Breaks',
  description: 'Configure breaks',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Breaks</h1>
        <p className="text-muted-foreground">Configure breaks</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Staff Breaks</CardTitle>
          <CardDescription>Configure breaks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
