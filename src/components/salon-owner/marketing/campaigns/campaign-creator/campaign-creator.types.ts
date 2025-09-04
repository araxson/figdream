export interface Campaign {
  id?: string
  name: string
  description: string
  type: 'email' | 'sms' | 'push'
  audience: string[]
  startDate: Date
  endDate?: Date
  status?: 'draft' | 'active' | 'paused' | 'completed'
}

export interface CampaignCreatorProps {
  salonId: string
  onSubmit?: (campaign: Campaign) => void
}