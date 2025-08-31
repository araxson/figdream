import { createServerClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Gift, Percent, DollarSign, Calendar, Star, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import RewardDialog from './reward-dialog'
import { getLoyaltyRewards } from '@/lib/data-access/loyalty-admin'

export default async function LoyaltyRewardsPage() {
  const supabase = await createServerClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's salon
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.salon_id) {
    redirect('/401')
  }

  // Get rewards
  const rewards = await getLoyaltyRewards(userRole.salon_id)

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'discount_percentage':
        return <Percent className="h-4 w-4" />
      case 'discount_fixed':
        return <DollarSign className="h-4 w-4" />
      case 'free_service':
        return <Gift className="h-4 w-4" />
      case 'birthday_special':
        return <Calendar className="h-4 w-4" />
      case 'tier_exclusive':
        return <Star className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  const getRewardValue = (reward: any) => {
    switch (reward.reward_type) {
      case 'discount_percentage':
        return `${reward.discount_percentage}% off`
      case 'discount_fixed':
        return `$${reward.discount_amount} off`
      case 'free_service':
        return 'Free service'
      default:
        return 'Special reward'
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
          <p className="text-muted-foreground mt-1">
            Configure rewards that customers can redeem with points
          </p>
        </div>
        <div className="flex gap-2">
          <RewardDialog salonId={userRole.salon_id}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Reward
            </Button>
          </RewardDialog>
          <Button variant="outline" asChild>
            <Link href="/salon-admin/loyalty">
              Back to Loyalty
            </Link>
          </Button>
        </div>
      </div>

      {/* Rewards Grid */}
      {rewards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Rewards Configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create rewards that customers can redeem with their loyalty points
            </p>
            <RewardDialog salonId={userRole.salon_id}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Reward
              </Button>
            </RewardDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => (
            <Card key={reward.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getRewardIcon(reward.reward_type)}
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                  </div>
                  <Badge variant={reward.is_active ? 'default' : 'secondary'}>
                    {reward.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>{reward.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reward Value */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Value</span>
                  <span className="font-semibold">{getRewardValue(reward)}</span>
                </div>

                {/* Points Cost */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Points Required</span>
                  <span className="font-semibold">{reward.points_cost.toLocaleString()} pts</span>
                </div>

                {/* Tier Requirement */}
                {reward.min_tier && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Min Tier</span>
                    <Badge variant="outline" className="capitalize">
                      {reward.min_tier}+
                    </Badge>
                  </div>
                )}

                {/* Usage Limits */}
                {reward.usage_limit && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Usage Limit</span>
                    <span className="text-sm">{reward.usage_limit} per customer</span>
                  </div>
                )}

                {/* Valid Period */}
                {(reward.valid_from || reward.valid_until) && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Valid Period</span>
                    <div className="text-sm">
                      {reward.valid_from && (
                        <p>From: {new Date(reward.valid_from).toLocaleDateString()}</p>
                      )}
                      {reward.valid_until && (
                        <p>Until: {new Date(reward.valid_until).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <RewardDialog 
                    salonId={userRole.salon_id} 
                    reward={reward}
                  >
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </RewardDialog>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Redemption History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Redemptions</CardTitle>
              <CardDescription>
                Track which rewards are being redeemed
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/salon-admin/loyalty/redemptions">
                View All
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No redemptions yet
          </div>
        </CardContent>
      </Card>
    </div>
  )
}