'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export interface ReviewStatsProps {
  className?: string
}

export function ReviewStats({ className }: ReviewStatsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Review Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
