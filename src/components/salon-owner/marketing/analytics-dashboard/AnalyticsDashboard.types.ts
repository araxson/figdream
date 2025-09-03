export interface AnalyticsDashboardProps {
  salonId: string
  dateRange?: {
    from: Date
    to: Date
  }
}

export type MetricType = 'clicks' | 'opens' | 'conversions' | 'revenue'

export interface CampaignMetric {
  id: string
  campaignId: string
  type: MetricType
  value: number
  date: Date
}