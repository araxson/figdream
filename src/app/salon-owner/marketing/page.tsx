import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Marketing',
  description: 'Marketing campaigns',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
        <p className="text-muted-foreground">Marketing campaigns</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Marketing</CardTitle>
          <CardDescription>Marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
