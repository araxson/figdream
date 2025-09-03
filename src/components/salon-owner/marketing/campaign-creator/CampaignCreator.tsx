import React from 'react'
import { Card } from '@/components/ui/data-display/card'
import type { CampaignCreatorProps } from './CampaignCreator.types'

export function CampaignCreator({ salonId, onSubmit: _onSubmit }: CampaignCreatorProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create Campaign</h2>
      <p className="text-muted-foreground">
        Create a new marketing campaign for salon {salonId}
      </p>
    </Card>
  )
}