'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card'

export interface AudienceSelectorProps {
  className?: string
}

export function AudienceSelector({ className }: AudienceSelectorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Audience Selector</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
