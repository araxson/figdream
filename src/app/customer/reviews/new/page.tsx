import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Write Review',
  description: 'Write a new review',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Write Review</h1>
        <p className="text-muted-foreground">Write a new review</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Write Review</CardTitle>
          <CardDescription>Write a new review</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
