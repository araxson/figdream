export interface AudienceSelectorProps {
  salonId: string
  selectedAudiences?: string[]
  onSelect?: (audienceIds: string[]) => void
}