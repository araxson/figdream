import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getSalonOverview } from './queries'

export async function AdminSalonOverview() {
  const salons = await getSalonOverview()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salon Overview</CardTitle>
        <CardDescription>Active salons and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {salons.map((salon) => (
              <div key={salon.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{salon.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {salon.appointments_today} appointments today
                  </p>
                </div>
                <Badge variant={salon.is_active ? 'default' : 'secondary'}>
                  {salon.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}