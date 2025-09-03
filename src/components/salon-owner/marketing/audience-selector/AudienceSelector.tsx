import React from 'react'
import { Card } from '@/components/ui/data-display/card'

export interface AudienceSelectorProps {
  salonId: string
  selectedAudiences?: string[]
  onSelect?: (audienceIds: string[]) => void
}

export function AudienceSelector({ salonId: _salonId, selectedAudiences: _selectedAudiences = [], onSelect: _onSelect }: AudienceSelectorProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-2">Select Audience</h3>
      <p className="text-sm text-muted-foreground">
        Choose target audiences for your campaign
      </p>
    </Card>
  )
}