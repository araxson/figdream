export interface AudienceBuilderProps {
  salonId: string
  onSelect?: (audienceId: string) => void
}

export interface AudienceFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between'
  value: string | number | [number, number]
}

export interface Audience {
  id: string
  name: string
  filters: AudienceFilter[]
  customerCount: number
}