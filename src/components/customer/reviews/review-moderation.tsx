'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export interface ReviewModerationProps {
  className?: string
}

export function ReviewModeration({ className }: ReviewModerationProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Review Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
