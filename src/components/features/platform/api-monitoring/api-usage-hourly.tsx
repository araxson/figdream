'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UsageStats } from '@/types/features/api-usage-types'

interface APIUsageHourlyProps {
  stats: UsageStats
}

export function APIUsageHourly({ stats }: APIUsageHourlyProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Distribution</CardTitle>
        <CardDescription>Request patterns by hour</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hour</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Errors</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.hourlyUsage.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No hourly data available
                </TableCell>
              </TableRow>
            ) : (
              stats.hourlyUsage.slice(0, 10).map((hour) => (
                <TableRow key={hour.hour}>
                  <TableCell>{hour.hour}</TableCell>
                  <TableCell>{hour.requests}</TableCell>
                  <TableCell>{hour.errors}</TableCell>
                  <TableCell>
                    <Badge variant={hour.errors > 0 ? 'destructive' : 'default'}>
                      {hour.errors > 0 ? 'Has Errors' : 'Healthy'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}