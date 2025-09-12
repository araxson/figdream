export interface GrowthData {
  newUsers: number
  totalUsers: number
  growthRate: number
  churnRate: number
  usersByRole: Array<{
    role: string
    count: number
    percentage: number
  }>
  monthlyGrowth: Array<{
    month: string
    new_users: number
    churned_users: number
    net_growth: number
  }>
  retentionCohorts: Array<{
    cohort: string
    initial_users: number
    retained_users: number
    retention_rate: number
  }>
}

export type TimeRange = 'month' | 'quarter' | 'year'