export interface RevenueData {
  date: string
  revenue: number
  bookings?: number
  customers?: number
}

export interface RevenueSummary {
  total: number
  change: number
  average: number
  trend: 'up' | 'down' | 'stable'
}

export interface RevenueChartProps {
  data: RevenueData[]
  summary?: RevenueSummary
  height?: number
  showLegend?: boolean
}

export interface ChartDataItem {
  date: string
  revenue: number
  bookings?: number
  appointments?: number
  customers?: number
}

export const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  bookings: {
    label: "Bookings",
    color: "hsl(var(--chart-2))",
  },
  customers: {
    label: "Customers",
    color: "hsl(var(--chart-3))",
  },
}