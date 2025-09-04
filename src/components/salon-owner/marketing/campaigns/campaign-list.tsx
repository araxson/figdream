'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
export interface CampaignListProps {
  className?: string
}

export function CampaignList({ className }: CampaignListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Campaign List</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Component implementation pending</p>
      </CardContent>
    </Card>
  )
}
