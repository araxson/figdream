import { ChartDataItem } from './revenue-types'

interface RevenueStatsProps {
  data: ChartDataItem[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function RevenueStats({ data }: RevenueStatsProps) {
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalTransactions = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Total Revenue</p>
        <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        <p className="text-xs text-muted-foreground">Including tips</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Total Transactions</p>
        <p className="text-2xl font-bold">{totalTransactions}</p>
        <p className="text-xs text-muted-foreground">Manual entries</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Average Transaction</p>
        <p className="text-2xl font-bold">
          {totalTransactions > 0 ? formatCurrency(totalRevenue / totalTransactions) : '$0'}
        </p>
        <p className="text-xs text-muted-foreground">Per entry</p>
      </div>
    </div>
  )
}