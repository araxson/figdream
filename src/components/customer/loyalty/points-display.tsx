'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Progress,
  Skeleton,
  Alert,
  AlertDescription,
} from '@/components/ui'
import {
  Sparkles,
  TrendingUp,
  Gift,
  Clock,
  Star,
  Calendar,
  Users,
  Award,
  Trophy,
  Crown,
  Gem,
  Medal,
  ArrowUp,
  ArrowDown,
  Info,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, isAfter } from 'date-fns'
import { getCustomerLoyalty, getPointsHistory } from '@/lib/data-access/loyalty/loyalty-program'
import type { CustomerLoyalty, PointsTransaction } from '@/lib/data-access/loyalty/loyalty-program'

interface PointsDisplayProps {
  customerId: string
  programId: string
  variant?: 'compact' | 'full' | 'widget'
  showHistory?: boolean
  showTierProgress?: boolean
  showQuickActions?: boolean
  className?: string
  onRedeemClick?: () => void
  onBookingClick?: () => void
}

export function PointsDisplay({
  customerId,
  programId,
  variant = 'compact',
  showHistory = true,
  showTierProgress = true,
  showQuickActions = true,
  className,
  onRedeemClick,
  onBookingClick,
}: PointsDisplayProps) {
  const [loyaltyData, setLoyaltyData] = React.useState<CustomerLoyalty | null>(null)
  const [pointsHistory, setPointsHistory] = React.useState<PointsTransaction[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Load loyalty data
  React.useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        const [loyaltyResult, historyResult] = await Promise.all([
          getCustomerLoyalty(customerId, programId),
          showHistory ? getPointsHistory(customerId, programId, 10) : Promise.resolve({ success: true, data: [] })
        ])

        if (!loyaltyResult.success) {
          throw new Error(loyaltyResult.error || 'Failed to load loyalty data')
        }

        if (showHistory && !historyResult.success) {
          console.warn('Failed to load points history:', historyResult.error)
        }

        setLoyaltyData(loyaltyResult.data)
        setPointsHistory(historyResult.data || [])
      } catch (err) {
        console.error('Error loading points data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load points data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [customerId, programId, showHistory])

  const getTierIcon = (tier: string, size = 'h-5 w-5') => {
    const iconClass = cn(size, getTierIconColor(tier))
    
    switch (tier) {
      case 'bronze':
        return <Medal className={iconClass} />
      case 'silver':
        return <Award className={iconClass} />
      case 'gold':
        return <Trophy className={iconClass} />
      case 'platinum':
        return <Crown className={iconClass} />
      case 'diamond':
        return <Gem className={iconClass} />
      default:
        return <Star className={iconClass} />
    }
  }

  const getTierIconColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'text-amber-600'
      case 'silver':
        return 'text-gray-500'
      case 'gold':
        return 'text-yellow-500'
      case 'platinum':
        return 'text-purple-500'
      case 'diamond':
        return 'text-blue-500'
      default:
        return 'text-gray-400'
    }
  }

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-amber-50 to-amber-100'
      case 'silver':
        return 'from-gray-50 to-gray-100'
      case 'gold':
        return 'from-yellow-50 to-yellow-100'
      case 'platinum':
        return 'from-purple-50 to-purple-100'
      case 'diamond':
        return 'from-blue-50 to-blue-100'
      default:
        return 'from-gray-25 to-gray-50'
    }
  }

  const getTransactionIcon = (type: string) => {
    if (type.startsWith('earned_')) {
      switch (type) {
        case 'earned_booking':
          return <Calendar className="h-4 w-4 text-green-500" />
        case 'earned_referral':
          return <Users className="h-4 w-4 text-blue-500" />
        case 'earned_review':
          return <Star className="h-4 w-4 text-yellow-500" />
        case 'earned_bonus':
          return <Gift className="h-4 w-4 text-purple-500" />
        default:
          return <TrendingUp className="h-4 w-4 text-green-500" />
      }
    } else if (type.startsWith('redeemed_')) {
      return <Gift className="h-4 w-4 text-orange-500" />
    } else if (type === 'expired') {
      return <Clock className="h-4 w-4 text-destructive" />
    }
    return <Target className="h-4 w-4 text-muted-foreground" />
  }

  const formatTransactionType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  // Check for expiring points (within 30 days)
  const getExpiringPoints = () => {
    if (!loyaltyData || !pointsHistory) return null
    
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const expiringTransactions = pointsHistory.filter(
      (t) => t.expires_at && 
             t.points > 0 && 
             isAfter(new Date(t.expires_at), new Date()) &&
             isAfter(thirtyDaysFromNow, new Date(t.expires_at))
    )
    
    if (expiringTransactions.length === 0) return null
    
    const totalExpiring = expiringTransactions.reduce((sum, t) => sum + t.points, 0)
    const soonestExpiry = expiringTransactions
      .map(t => new Date(t.expires_at!))
      .sort((a, b) => a.getTime() - b.getTime())[0]
    
    return {
      points: totalExpiring,
      expiryDate: soonestExpiry,
    }
  }

  const expiringPoints = getExpiringPoints()

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-8 w-24" />
              {variant === 'full' && <Skeleton className="h-4 w-full" />}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !loyaltyData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Unable to load points information.'}
        </AlertDescription>
      </Alert>
    )
  }

  // Widget variant for small spaces
  if (variant === 'widget') {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{loyaltyData.current_points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTierIcon(loyaltyData.current_tier, 'h-4 w-4')}
              <Badge variant="secondary" className="capitalize">
                {loyaltyData.current_tier}
              </Badge>
            </div>
          </div>
          {showQuickActions && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={onBookingClick}>
                <Calendar className="h-3 w-3 mr-1" />
                Book
              </Button>
              <Button size="sm" variant="outline" onClick={onRedeemClick}>
                <Gift className="h-3 w-3 mr-1" />
                Redeem
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn("space-y-4", className)}>
        <Card className={cn("bg-gradient-to-r", getTierGradient(loyaltyData.current_tier))}>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getTierIcon(loyaltyData.current_tier)}
                <div>
                  <h3 className="font-semibold text-lg">
                    {loyaltyData.current_points.toLocaleString()} Points
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {loyaltyData.current_tier} Member
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="font-semibold">
                  Active
                </Badge>
              </div>
            </div>

            {showTierProgress && loyaltyData.next_tier && loyaltyData.points_to_next_tier !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress to {loyaltyData.next_tier}</span>
                  <span className="font-medium">
                    {loyaltyData.points_to_next_tier.toLocaleString()} pts to go
                  </span>
                </div>
                <Progress value={loyaltyData.tier_progress} className="h-2" />
              </div>
            )}

            {showQuickActions && (
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={onBookingClick} className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button size="sm" variant="outline" onClick={onRedeemClick} className="flex-1">
                  <Gift className="h-4 w-4 mr-2" />
                  Redeem Points
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring Points Alert */}
        {expiringPoints && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{expiringPoints.points.toLocaleString()} points</strong> expire on{' '}
              {format(expiringPoints.expiryDate, 'MMM d, yyyy')}. Use them soon!
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Full variant with detailed view
  return (
    <div className={cn("space-y-6", className)}>
      {/* Main Points Card */}
      <Card className={cn("bg-gradient-to-br", getTierGradient(loyaltyData.current_tier))}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTierIcon(loyaltyData.current_tier, 'h-8 w-8')}
              <div>
                <CardTitle className="text-2xl">
                  {loyaltyData.current_points.toLocaleString()} Points
                </CardTitle>
                <CardDescription className="capitalize text-base">
                  {loyaltyData.current_tier} Member since {format(new Date(loyaltyData.enrolled_at), 'MMMM yyyy')}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
              ${((loyaltyData.current_points * 0.01)).toFixed(2)} Value
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {showTierProgress && loyaltyData.next_tier && loyaltyData.points_to_next_tier !== null && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress to {loyaltyData.next_tier}</span>
                <span className="text-sm text-muted-foreground">
                  {loyaltyData.points_to_next_tier.toLocaleString()} pts to go
                </span>
              </div>
              <Progress value={loyaltyData.tier_progress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Keep earning points to unlock {loyaltyData.next_tier} benefits!
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold">{loyaltyData.total_earned.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Gift className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-semibold">{loyaltyData.total_redeemed.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Redeemed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold">
                  {loyaltyData.last_activity 
                    ? formatDistanceToNow(new Date(loyaltyData.last_activity), { addSuffix: true })
                    : 'Never'
                  }
                </p>
                <p className="text-xs text-muted-foreground">Last Activity</p>
              </div>
            </div>
          </div>

          {showQuickActions && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={onBookingClick} className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
              <Button variant="outline" onClick={onRedeemClick} className="flex-1">
                <Gift className="h-4 w-4 mr-2" />
                Redeem Points
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expiring Points Alert */}
      {expiringPoints && (
        <Alert>
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>{expiringPoints.points.toLocaleString()} points</strong> expire on{' '}
            <strong>{format(expiringPoints.expiryDate, 'MMM d, yyyy')}</strong>. 
            Don't lose them - book an appointment or redeem rewards soon!
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Points Activity */}
      {showHistory && pointsHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest points transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pointsHistory.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-medium text-sm">
                        {formatTransactionType(transaction.transaction_type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {transaction.points > 0 ? (
                        <ArrowUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={cn(
                        "font-semibold text-sm",
                        transaction.points > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                      </span>
                    </div>
                    {transaction.expires_at && transaction.points > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Expires {format(new Date(transaction.expires_at), 'MMM d')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {pointsHistory.length > 5 && (
                <Button variant="outline" className="w-full" size="sm">
                  View All Activity
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips for Earning More Points */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-blue-600" />
            Earn More Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Book Regular Appointments</p>
                <p className="text-xs text-muted-foreground">Earn 1 point per $1 spent</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Refer Friends</p>
                <p className="text-xs text-muted-foreground">Get 100 points per referral</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Leave Reviews</p>
                <p className="text-xs text-muted-foreground">Earn 25 points per review</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Gift className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Birthday Bonus</p>
                <p className="text-xs text-muted-foreground">Special points on your birthday</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}