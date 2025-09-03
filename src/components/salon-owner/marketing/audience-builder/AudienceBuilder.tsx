import React from 'react'
import { Card } from '@/components/ui/data-display/card'

export interface AudienceBuilderProps {
  salonId: string
  onSelect?: (audienceId: string) => void
}

export function AudienceBuilder({ salonId: _salonId, onSelect: _onSelect }: AudienceBuilderProps) {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Audience Builder</h2>
      <p className="text-muted-foreground">
        Build custom audiences for salon {_salonId}
      </p>
    </Card>
  )
}