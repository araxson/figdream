import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function UserGrowth() {
  const growthData = [
    { category: 'New Customers', count: 1245, growth: 23, target: 1500 },
    { category: 'New Salon Owners', count: 28, growth: 15, target: 35 },
    { category: 'New Staff Members', count: 89, growth: 18, target: 100 },
    { category: 'Returning Customers', count: 3456, growth: 12, target: 4000 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Growth</CardTitle>
        <CardDescription>Monthly user acquisition and retention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {growthData.map((item) => (
            <div key={item.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.count} / {item.target} target
                  </p>
                </div>
                <span className="text-sm font-medium text-green-600">
                  +{item.growth}%
                </span>
              </div>
              <Progress value={(item.count / item.target) * 100} className="h-2" />
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">8,456</p>
              </div>
              <div>
                <p className="text-muted-foreground">Monthly Active</p>
                <p className="text-2xl font-bold">6,234</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}