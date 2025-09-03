'use client'
import { Badge, Button, Progress, Card, CardContent } from '@/components/ui'
import { 
  AlertTriangle,
  Mail,
  Phone,
  Calendar,
  User
} from 'lucide-react'
interface ChurnRiskListProps {
  customers: Array<{
    customerId: string
    name: string
    email: string
    riskScore: number
    riskLevel: string
    factors: string[]
    lastVisit: string | null
    totalVisits: number
    customerSince: string
  }>
}
export default function ChurnRiskList({ customers }: ChurnRiskListProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-orange-600'
      default:
        return 'text-yellow-600'
    }
  }
  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'high':
        return 'destructive' as const
      case 'medium':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  const daysSinceLastVisit = (dateString: string | null) => {
    if (!dateString) return 999
    const lastVisit = new Date(dateString)
    const now = new Date()
    const days = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }
  return (
    <div className="space-y-4">
      {customers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No customers at risk
        </div>
      ) : (
        customers.map((customer) => (
          <Card key={customer.customerId}>
            <CardContent className="space-y-3">
            {/* Customer Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
              </div>
              <Badge variant={getRiskBadgeVariant(customer.riskLevel)} className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {customer.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>
            {/* Risk Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Risk Score</span>
                <span className={`font-semibold ${getRiskColor(customer.riskLevel)}`}>
                  {customer.riskScore}%
                </span>
              </div>
              <Progress 
                value={customer.riskScore} 
                className="h-2"
              />
            </div>
            {/* Risk Factors */}
            <div className="space-y-1">
              <p className="text-sm font-medium">Risk Factors:</p>
              <div className="flex flex-wrap gap-1">
                {customer.factors.map((factor, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
            {/* Customer Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground">Last Visit</p>
                <p className="font-medium">{formatDate(customer.lastVisit)}</p>
                <p className="text-muted-foreground">
                  {daysSinceLastVisit(customer.lastVisit)} days ago
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Total Visits</p>
                <p className="font-medium">{customer.totalVisits}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Customer Since</p>
                <p className="font-medium">{formatDate(customer.customerSince)}</p>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}