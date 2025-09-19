'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface MessagesProps {
  role?: string
}

export function Messages({ role }: MessagesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Message management system is coming soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This feature will be available in a future update.
        </p>
      </CardContent>
    </Card>
  )
}