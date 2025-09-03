'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card'

export interface LocationFormProps {
  className?: string
}

export function LocationForm({ className }: LocationFormProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>LocationForm</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
