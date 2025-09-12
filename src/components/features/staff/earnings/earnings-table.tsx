import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { StaffEarning } from '@/types/features/earnings-types'

interface EarningsTableProps {
  earnings: StaffEarning[]
}

export function EarningsTable({ earnings }: EarningsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {earnings.slice(0, 5).map((earning) => (
            <div key={earning.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatDate(earning.service_date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {earning.service_name && (
                    <span>{earning.service_name}</span>
                  )}
                  {earning.payment_method && (
                    <Badge variant="outline" className="text-xs">
                      {earning.payment_method}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(earning.total_earnings || 0)}</p>
                {earning.tip_amount && earning.tip_amount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    +{formatCurrency(earning.tip_amount)} tip
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}