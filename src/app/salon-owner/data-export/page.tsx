import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Data Export',
  description: 'Export your data',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Export</h1>
        <p className="text-muted-foreground">Export your data</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>Export your data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
