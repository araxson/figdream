'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export interface CampaignCreatorProps {
  className?: string
}

export function CampaignCreator({ className }: CampaignCreatorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Campaign Creator</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
