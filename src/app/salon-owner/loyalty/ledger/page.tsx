import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Points Ledger',
  description: 'Loyalty points ledger',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Points Ledger</h1>
        <p className="text-muted-foreground">Loyalty points ledger</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Points Ledger</CardTitle>
          <CardDescription>Loyalty points ledger</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Content coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
