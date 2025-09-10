import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SalonsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salons List</CardTitle>
        <CardDescription>Manage all salons in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Salon list will be displayed here</p>
      </CardContent>
    </Card>
  )
}