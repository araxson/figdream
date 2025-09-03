'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card'

export interface ReviewListProps {
  className?: string
}

export function ReviewList({ className }: ReviewListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Review List</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
