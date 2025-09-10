'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Gift, Star, Trophy, TrendingUp, Award } from 'lucide-react'
import { useEffect, useState } from 'react'

// TODO: Add loyalty_programs and customer_loyalty tables to database
type LoyaltyProgram = {
  id: string
  name: string
  points_per_dollar: number
  tier_thresholds: Record<string, number>
}

type CustomerLoyalty = {
  id: string
  user_id: string
  points: number
  tier: string
  total_points_earned: number
  total_points_redeemed: number
}

export function ProfileLoyalty() {
  const [loyaltyData, setLoyaltyData] = useState<CustomerLoyalty | null>(null)
  const [program, setProgram] = useState<LoyaltyProgram | null>(null)
  const [rewards, setRewards] = useState<Array<{
    id: string
    name: string
    description: string
    points_required: number
    discount_value: number
    is_available: boolean
  }>>([])
  const [loading, setLoading] = useState(true)
   
  useEffect(() => {
    fetchLoyaltyData()
  }, [])

  async function fetchLoyaltyData() {
    try {
      // Loyalty program feature not yet implemented in database
      // TODO: Add loyalty_programs, customer_loyalty, and loyalty_rewards tables
      setProgram(null)
      setLoyaltyData(null)
      setRewards([])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching loyalty data:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          Loading loyalty program...
        </CardContent>
      </Card>
    )
  }

  if (!program || !loyaltyData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No loyalty program available at this salon yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return { name: 'Bronze', color: 'text-orange-600', icon: Award, next: 'Silver', pointsToNext: 500 }
      case 'silver':
        return { name: 'Silver', color: 'text-gray-500', icon: Trophy, next: 'Gold', pointsToNext: 1500 }
      case 'gold':
        return { name: 'Gold', color: 'text-yellow-600', icon: Star, next: 'Platinum', pointsToNext: 3000 }
      case 'platinum':
        return { name: 'Platinum', color: 'text-purple-600', icon: Star, next: null, pointsToNext: null }
      default:
        return { name: 'Bronze', color: 'text-orange-600', icon: Award, next: 'Silver', pointsToNext: 500 }
    }
  }

  const tierInfo = getTierInfo(loyaltyData.tier)
  const TierIcon = tierInfo.icon
  const progressToNext = tierInfo.pointsToNext 
    ? Math.min((loyaltyData.points / tierInfo.pointsToNext) * 100, 100)
    : 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Loyalty Program</CardTitle>
            <Badge variant="outline" className={tierInfo.color}>
              <TierIcon className="h-3 w-3 mr-1" />
              {tierInfo.name} Member
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{loyaltyData.points}</div>
            <p className="text-muted-foreground">Available Points</p>
          </div>

          {tierInfo.next && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress to {tierInfo.next}</span>
                <span className="font-medium">
                  {loyaltyData.points} / {tierInfo.pointsToNext}
                </span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {tierInfo.pointsToNext - loyaltyData.points} points to {tierInfo.next}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{loyaltyData.total_points_earned}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{loyaltyData.total_points_redeemed}</p>
              <p className="text-xs text-muted-foreground">Total Redeemed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No rewards available at the moment.
            </p>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => {
                const canRedeem = loyaltyData.points >= reward.points_required
                
                return (
                  <div
                    key={reward.id}
                    className={`border rounded-lg p-4 ${
                      canRedeem ? 'border-primary' : 'border-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{reward.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {reward.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{reward.points_required}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                    {canRedeem && (
                      <button className="mt-3 text-sm text-primary font-medium hover:underline">
                        Redeem Reward →
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Book Appointments</p>
                <p className="text-sm text-muted-foreground">
                  Earn {program.points_per_dollar || 1} point per dollar spent
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Leave Reviews</p>
                <p className="text-sm text-muted-foreground">
                  Get 50 bonus points for each review
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Gift className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Refer Friends</p>
                <p className="text-sm text-muted-foreground">
                  Earn 100 points for each successful referral
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}