'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Progress } from '@/components/ui'
interface ServiceAnalyticsProps {
  data?: {
    topServices: Array<{
      name: string
      count: number
      revenue: number
      category?: string
    }>
    categoryBreakdown: Record<string, number>
  }
}
export function ServiceAnalytics({ data }: ServiceAnalyticsProps) {
  const maxCount = Math.max(...(data?.topServices.map(s => s.count) || [1]))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Performance</CardTitle>
        <CardDescription>
          Most popular services and category breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Top Services Table */}
          <div>
            <h4 className="text-sm font-medium mb-3">Top Services</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Popularity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.topServices.slice(0, 5).map((service) => (
                  <TableRow key={service.name}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {service.category || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.count}</TableCell>
                    <TableCell>${service.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Progress 
                        value={(service.count / maxCount) * 100} 
                        className="w-[60px]"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Category Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Category Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(data?.categoryBreakdown || {}).map(([category, count]) => {
                const percentage = (count / Object.values(data?.categoryBreakdown || {}).reduce((a, b) => a + b, 0)) * 100
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{category}</span>
                      <Badge variant="secondary">
                        {count} services
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="w-[100px]" />
                      <span className="text-xs text-muted-foreground w-10">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}