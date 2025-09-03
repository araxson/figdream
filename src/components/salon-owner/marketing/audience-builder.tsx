'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card'

export interface AudienceBuilderProps {
  className?: string
}

export function AudienceBuilder({ className }: AudienceBuilderProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>AudienceBuilder</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
