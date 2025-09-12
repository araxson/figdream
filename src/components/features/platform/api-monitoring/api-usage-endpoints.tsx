'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UsageStats } from '@/types/features/api-usage-types'

interface APIUsageEndpointsProps {
  stats: UsageStats
}

export function APIUsageEndpoints({ stats }: APIUsageEndpointsProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Top Endpoints</CardTitle>
        <CardDescription>Most frequently accessed API endpoints</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Endpoint</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Avg Latency</TableHead>
              <TableHead>Usage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.topEndpoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No API usage data available
                </TableCell>
              </TableRow>
            ) : (
              stats.topEndpoints.map((endpoint) => (
                <TableRow key={endpoint.endpoint}>
                  <TableCell className="font-mono text-sm">
                    {endpoint.endpoint}
                  </TableCell>
                  <TableCell>{endpoint.count.toLocaleString()}</TableCell>
                  <TableCell>{endpoint.avgLatency.toFixed(0)}ms</TableCell>
                  <TableCell>
                    <Badge variant={endpoint.avgLatency > 1000 ? 'destructive' : 'default'}>
                      {endpoint.avgLatency > 1000 ? 'Slow' : 'Normal'}
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