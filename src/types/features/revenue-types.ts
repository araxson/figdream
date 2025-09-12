export interface ChartDataItem {
  date: string
  revenue: number
  tips: number
  count: number
}

export const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  tips: {
    label: "Tips",
    color: "hsl(var(--chart-2))",
  },
  services: {
    label: "Services",
    color: "hsl(var(--chart-3))",
  },
} as const