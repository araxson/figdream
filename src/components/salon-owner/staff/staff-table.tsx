'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card'

export interface StaffTableProps {
  className?: string
}

export function StaffTable({ className }: StaffTableProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>StaffTable</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
