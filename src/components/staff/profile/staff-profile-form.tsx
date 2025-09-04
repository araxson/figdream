'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export interface StaffProfileFormProps {
  className?: string
}

export function StaffProfileForm({ className }: StaffProfileFormProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>StaffProfileForm</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
