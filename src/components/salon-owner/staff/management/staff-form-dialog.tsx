'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export interface StaffFormDialogProps {
  className?: string
}

export function StaffFormDialog({ className }: StaffFormDialogProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>StaffFormDialog</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
