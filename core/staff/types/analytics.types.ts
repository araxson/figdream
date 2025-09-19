export interface PerformanceMetric {
  staffId: string
  staffName: string
  revenue: number
  appointments: number
  rating: number
  utilization: number
  tips: number
  rebookRate: number
  avgServiceTime: number
  clientRetention: number
}

export interface TeamAverages {
  revenue: number
  appointments: number
  rating: number
  utilization: number
  tips: number
  rebookRate: number
  clientRetention: number
}

export interface TrendDataPoint {
  month: string
  value: number
}

export interface TopPerformers {
  revenue: PerformanceMetric[]
  rating: PerformanceMetric[]
  appointments: PerformanceMetric[]
  utilization: PerformanceMetric[]
}