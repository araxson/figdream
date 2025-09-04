'use client'
import * as React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Gift,
  Award,
  Star,
  Sparkles,
  Trophy,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Heart,
  Share2,
  Copy,
  ExternalLink,
  Info,
  Crown,
  Gem,
  Medal,
  Target,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { getCustomerLoyalty, getPointsHistory } from '@/lib/data-access/loyalty/loyalty-program'
import type { CustomerLoyalty, PointsTransaction } from '@/lib/data-access/loyalty/loyalty-program'
interface LoyaltyDashboardProps {
  customerId: string
  programId: string
  className?: string
}
export function LoyaltyDashboard({ customerId, programId, className }: LoyaltyDashboardProps) {
  const [loyaltyData, setLoyaltyData] = React.useState<CustomerLoyalty | null>(null)
  const [pointsHistory, setPointsHistory] = React.useState<PointsTransaction[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState('overview')
  // Load loyalty data
  React.useEffect(() => {
    async function loadLoyaltyData() {
      try {
        setIsLoading(true)
        setError(null)
        const [loyaltyResult, historyResult] = await Promise.all([
          getCustomerLoyalty(customerId, programId),
          getPointsHistory(customerId, programId, 20)
        ])
        if (!loyaltyResult.success) {
          throw new Error(loyaltyResult.error || 'Failed to load loyalty data')
        }
        if (!historyResult.success) {
        }
        setLoyaltyData(loyaltyResult.data)
        setPointsHistory(historyResult.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load loyalty data')
      } finally {
        setIsLoading(false)
      }
    }
    loadLoyaltyData()
  }, [customerId, programId])
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return <Medal className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      case 'silver':
        return <Award className="h-5 w-5 text-muted-foreground" />
      case 'gold':
        return <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      case 'platinum':
        return <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      case 'diamond':
        return <Gem className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      default:
        return <Star className="h-5 w-5 text-muted-foreground/60" />
    }
  }
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950/30 dark:to-orange-900/30 dark:border-orange-800'
      case 'silver':
        return 'from-muted to-muted/50 border-border'
      case 'gold':
        return 'from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-950/30 dark:to-yellow-900/30 dark:border-yellow-800'
      case 'platinum':
        return 'from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950/30 dark:to-purple-900/30 dark:border-purple-800'
      case 'diamond':
        return 'from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/30 dark:to-blue-900/30 dark:border-blue-800'
      default:
        return 'from-muted/50 to-muted/30 border-border'
    }
  }
  const getTransactionIcon = (type: string) => {
    if (type.startsWith('earned_')) {
      switch (type) {
        case 'earned_booking':
          return <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
        case 'earned_referral':
          return <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        case 'earned_review':
          return <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        case 'earned_bonus':
          return <Gift className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        default:
          return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
      }
    } else if (type.startsWith('redeemed_')) {
      return <CheckCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
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
  const copyReferralCode = async () => {
    if (!loyaltyData?.referral_code) return
    try {
      await navigator.clipboard.writeText(loyaltyData.referral_code)
      // In a real app, you'd show a toast notification
    } catch (_err) {
    }
  }
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  if (error || !loyaltyData) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {error || 'Unable to load loyalty information. Please try again later.'}
        </AlertDescription>
      </Alert>
    )
  }
  return (
    <div className={cn("space-y-6", className)}>
      {/* Tier Status Card */}
      <Card className={cn("bg-gradient-to-br", getTierColor(loyaltyData.current_tier))}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTierIcon(loyaltyData.current_tier)}
              <div>
                <CardTitle className="capitalize text-lg">
                  {loyaltyData.current_tier} Member
                </CardTitle>
                <CardDescription>
                  Member since {format(new Date(loyaltyData.enrolled_at), 'MMMM yyyy')}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="font-semibold">
              {loyaltyData.current_points.toLocaleString()} pts
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loyaltyData.next_tier && loyaltyData.points_to_next_tier !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Progress to {loyaltyData.next_tier}</span>
                <span className="font-medium">
                  {loyaltyData.points_to_next_tier.toLocaleString()} pts to go
                </span>
              </div>
              <Progress value={loyaltyData.tier_progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Keep earning points to reach the next tier and unlock exclusive benefits!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loyaltyData.current_points.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Current Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950/50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loyaltyData.total_earned.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-950/50 rounded-lg">
                <Gift className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loyaltyData.total_redeemed.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Redeemed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-950/50 rounded-lg">
                {getTierIcon(loyaltyData.current_tier)}
              </div>
              <div>
                <p className="text-lg font-bold capitalize">{loyaltyData.current_tier}</p>
                <p className="text-sm text-muted-foreground">Current Tier</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Tabs for detailed information */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {/* Current Tier Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Your Benefits
              </CardTitle>
              <CardDescription>
                Enjoy these perks as a {loyaltyData.current_tier} member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm">Earn 1 point for every $1 spent</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm">Birthday bonus points</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm">Exclusive member promotions</span>
                </div>
                {loyaltyData.current_tier !== 'bronze' && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm">Priority booking access</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button className="justify-start" variant="outline">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Book Appointment</p>
                      <p className="text-xs text-muted-foreground">Earn points on your next visit</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button className="justify-start" variant="outline">
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-medium">Redeem Rewards</p>
                      <p className="text-xs text-muted-foreground">Use your points for discounts</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Points Activity</CardTitle>
              <CardDescription>
                Your recent points transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pointsHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No points activity yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start earning points by booking appointments!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pointsHistory.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <p className="font-medium">
                            {formatTransactionType(transaction.transaction_type)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold",
                          transaction.points > 0 ? "text-green-600 dark:text-green-400" : "text-destructive"
                        )}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Refer Friends
              </CardTitle>
              <CardDescription>
                Share the love and earn bonus points for every friend you refer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loyaltyData.referral_code && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Your referral code:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-background rounded border font-mono text-lg">
                        {loyaltyData.referral_code}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyReferralCode}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button className="justify-start" variant="outline">
                      <div className="flex items-center gap-3">
                        <Share2 className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Share via Social</p>
                          <p className="text-xs text-muted-foreground">Instagram, Facebook, Twitter</p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                    <Button className="justify-start" variant="outline">
                      <div className="flex items-center gap-3">
                        <Heart className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Send Invite</p>
                          <p className="text-xs text-muted-foreground">Email or text message</p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </div>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      You&apos;ll earn 100 bonus points when your friend makes their first appointment!
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}