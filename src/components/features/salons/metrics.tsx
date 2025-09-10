import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SalonMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salon Metrics</CardTitle>
        <CardDescription>Performance metrics for all salons</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Metrics will be displayed here</p>
      </CardContent>
    </Card>
  )
}