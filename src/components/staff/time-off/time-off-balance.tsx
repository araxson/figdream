
import { Calendar, Heart, User, TrendingUp, AlertCircle } from "lucide-react"
import type { Database } from "@/types/database.types"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui"
interface TimeOffBalanceProps {
  staffId: string
  balance: {
    vacation: {
      total: number
      used: number
      pending: number
      available: number
    }
    sick: {
      total: number
      used: number
      pending: number
      available: number
    }
    personal: {
      total: number
      used: number
      pending: number
      available: number
    }
  }
  accrualRate?: {
    vacation: number
    sick: number
    personal: number
  }
  nextAccrualDate?: Date
}
export function TimeOffBalance({
  staffId,
  balance,
  accrualRate,
  nextAccrualDate,
}: TimeOffBalanceProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "vacation":
        return Calendar
      case "sick":
        return Heart
      case "personal":
        return User
      default:
        return Calendar
    }
  }
  const getColor = (type: string) => {
    switch (type) {
      case "vacation":
        return "blue"
      case "sick":
        return "red"
      case "personal":
        return "green"
      default:
        return "gray"
    }
  }
  const calculatePercentage = (used: number, total: number) => {
    if (total === 0) return 0
    return Math.round((used / total) * 100)
  }
  const balanceTypes = [
    { key: "vacation", label: "Vacation", data: balance.vacation },
    { key: "sick", label: "Sick Leave", data: balance.sick },
    { key: "personal", label: "Personal", data: balance.personal },
  ]
  const totalAvailable = balance.vacation.available + balance.sick.available + balance.personal.available
  const totalUsed = balance.vacation.used + balance.sick.used + balance.personal.used
  const totalPending = balance.vacation.pending + balance.sick.pending + balance.personal.pending
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Time Off Balance</CardTitle>
          <CardDescription>
            Your available time off days for the current year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {balanceTypes.map(({ key, label, data }) => {
              const Icon = getIcon(key)
              const color = getColor(key)
              const percentage = calculatePercentage(data.used, data.total)
              return (
                <Card key={key}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
                          <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
                        </div>
                        <Badge variant="outline">
                          {data.available} days
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-medium">{label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {data.used} of {data.total} days used
                        </p>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Used</p>
                          <p className="font-medium">{data.used}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pending</p>
                          <p className="font-medium">{data.pending}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-medium text-green-600 dark:text-green-400">
                            {data.available}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Available</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {totalAvailable} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Used</span>
                <span className="font-medium">{totalUsed} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Requests</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {totalPending} days
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        {accrualRate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Accrual Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Monthly Accrual</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Vacation</span>
                    <span className="font-medium">+{accrualRate.vacation} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Sick Leave</span>
                    <span className="font-medium">+{accrualRate.sick} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Personal</span>
                    <span className="font-medium">+{accrualRate.personal} days</span>
                  </div>
                </div>
                {nextAccrualDate && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Next Accrual</span>
                      <span className="font-medium">
                        {nextAccrualDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {totalPending > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Pending Requests
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-200">
                  You have {totalPending} days of time off pending approval. These days are not yet deducted from your available balance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
