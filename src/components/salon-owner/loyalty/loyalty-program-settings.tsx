'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, Save, AlertCircle, DollarSign, Gift, Trophy, Settings2 } from 'lucide-react'

type LoyaltyProgram = Database['public']['Tables']['loyalty_programs']['Row']

interface LoyaltyProgramSettingsProps {
  salonId: string
  currentProgram: LoyaltyProgram | null
}

export default function LoyaltyProgramSettings({
  salonId,
  currentProgram
}: LoyaltyProgramSettingsProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [isActive, setIsActive] = useState(currentProgram?.is_active ?? true)
  const [pointsPerDollar, setPointsPerDollar] = useState(currentProgram?.points_per_dollar?.toString() ?? '1')
  const [redemptionValue, setRedemptionValue] = useState(currentProgram?.redemption_value?.toString() ?? '0.01')
  const [signupBonus, setSignupBonus] = useState(currentProgram?.signup_bonus?.toString() ?? '100')
  const [referralBonus, setReferralBonus] = useState(currentProgram?.referral_bonus?.toString() ?? '50')
  const [birthdayBonus, setBirthdayBonus] = useState(currentProgram?.birthday_bonus?.toString() ?? '100')
  const [reviewBonus, setReviewBonus] = useState(currentProgram?.review_bonus?.toString() ?? '25')
  const [minRedemption, setMinRedemption] = useState(currentProgram?.min_redemption_points?.toString() ?? '100')
  const [maxRedemption, setMaxRedemption] = useState(currentProgram?.max_redemption_per_transaction?.toString() ?? '5000')
  const [pointsExpireDays, setPointsExpireDays] = useState(currentProgram?.points_expire_days?.toString() ?? '365')
  const [terms, setTerms] = useState(currentProgram?.terms_and_conditions ?? '')

  // Tier thresholds
  const [silverThreshold, setSilverThreshold] = useState(currentProgram?.tier_thresholds?.silver?.toString() ?? '500')
  const [goldThreshold, setGoldThreshold] = useState(currentProgram?.tier_thresholds?.gold?.toString() ?? '2000')
  const [platinumThreshold, setPlatinumThreshold] = useState(currentProgram?.tier_thresholds?.platinum?.toString() ?? '5000')

  // Tier multipliers
  const [bronzeMultiplier, setBronzeMultiplier] = useState(currentProgram?.tier_multipliers?.bronze?.toString() ?? '1')
  const [silverMultiplier, setSilverMultiplier] = useState(currentProgram?.tier_multipliers?.silver?.toString() ?? '1.25')
  const [goldMultiplier, setGoldMultiplier] = useState(currentProgram?.tier_multipliers?.gold?.toString() ?? '1.5')
  const [platinumMultiplier, setPlatinumMultiplier] = useState(currentProgram?.tier_multipliers?.platinum?.toString() ?? '2')

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const programData = {
        salon_id: salonId,
        is_active: isActive,
        points_per_dollar: parseFloat(pointsPerDollar) || 1,
        redemption_value: parseFloat(redemptionValue) || 0.01,
        signup_bonus: parseInt(signupBonus) || 0,
        referral_bonus: parseInt(referralBonus) || 0,
        birthday_bonus: parseInt(birthdayBonus) || 0,
        review_bonus: parseInt(reviewBonus) || 0,
        min_redemption_points: parseInt(minRedemption) || 100,
        max_redemption_per_transaction: parseInt(maxRedemption) || 5000,
        points_expire_days: parseInt(pointsExpireDays) || 365,
        tier_thresholds: {
          bronze: 0,
          silver: parseInt(silverThreshold) || 500,
          gold: parseInt(goldThreshold) || 2000,
          platinum: parseInt(platinumThreshold) || 5000
        },
        tier_multipliers: {
          bronze: parseFloat(bronzeMultiplier) || 1,
          silver: parseFloat(silverMultiplier) || 1.25,
          gold: parseFloat(goldMultiplier) || 1.5,
          platinum: parseFloat(platinumMultiplier) || 2
        },
        terms_and_conditions: terms.trim() || null
      }

      const response = await fetch('/api/loyalty/program', {
        method: currentProgram ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData),
      })

      if (!response.ok) {
        throw new Error('Failed to save program settings')
      }

      toast.success('Loyalty program settings saved successfully')
      router.refresh()
    } catch (error) {
      console.error('Error saving program:', error)
      toast.error('Failed to save loyalty program settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Program Status */}
      <Card>
        <CardHeader>
          <CardTitle>Program Status</CardTitle>
          <CardDescription>
            Enable or disable the loyalty program for your salon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="program-active">Loyalty Program Active</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, customers can earn and redeem points
              </p>
            </div>
            <Switch
              id="program-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </CardContent>
      </Card>

      {/* Earning Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earning Settings
          </CardTitle>
          <CardDescription>
            Configure how customers earn loyalty points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="points-per-dollar">Points per Dollar Spent</Label>
              <Input
                id="points-per-dollar"
                type="number"
                step="0.1"
                min="0"
                value={pointsPerDollar}
                onChange={(e) => setPointsPerDollar(e.target.value)}
                placeholder="1"
              />
              <p className="text-xs text-muted-foreground">
                Base points earned for every dollar spent
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-bonus">Sign-up Bonus Points</Label>
              <Input
                id="signup-bonus"
                type="number"
                min="0"
                value={signupBonus}
                onChange={(e) => setSignupBonus(e.target.value)}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                Points awarded when customer joins program
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral-bonus">Referral Bonus Points</Label>
              <Input
                id="referral-bonus"
                type="number"
                min="0"
                value={referralBonus}
                onChange={(e) => setReferralBonus(e.target.value)}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">
                Points for successful referrals
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday-bonus">Birthday Bonus Points</Label>
              <Input
                id="birthday-bonus"
                type="number"
                min="0"
                value={birthdayBonus}
                onChange={(e) => setBirthdayBonus(e.target.value)}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                Annual birthday gift points
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-bonus">Review Bonus Points</Label>
              <Input
                id="review-bonus"
                type="number"
                min="0"
                value={reviewBonus}
                onChange={(e) => setReviewBonus(e.target.value)}
                placeholder="25"
              />
              <p className="text-xs text-muted-foreground">
                Points for leaving a review
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redemption Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Redemption Settings
          </CardTitle>
          <CardDescription>
            Configure how points can be redeemed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="redemption-value">Redemption Value (per point)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="redemption-value"
                  type="number"
                  step="0.001"
                  min="0"
                  value={redemptionValue}
                  onChange={(e) => setRedemptionValue(e.target.value)}
                  className="pl-8"
                  placeholder="0.01"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Dollar value of each point when redeemed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-redemption">Minimum Redemption</Label>
              <Input
                id="min-redemption"
                type="number"
                min="0"
                value={minRedemption}
                onChange={(e) => setMinRedemption(e.target.value)}
                placeholder="100"
              />
              <p className="text-xs text-muted-foreground">
                Minimum points required to redeem
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-redemption">Max Redemption per Transaction</Label>
              <Input
                id="max-redemption"
                type="number"
                min="0"
                value={maxRedemption}
                onChange={(e) => setMaxRedemption(e.target.value)}
                placeholder="5000"
              />
              <p className="text-xs text-muted-foreground">
                Maximum points that can be redeemed at once
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expire-days">Points Expiration (days)</Label>
              <Input
                id="expire-days"
                type="number"
                min="0"
                value={pointsExpireDays}
                onChange={(e) => setPointsExpireDays(e.target.value)}
                placeholder="365"
              />
              <p className="text-xs text-muted-foreground">
                Days before unused points expire (0 = never)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tier Configuration
          </CardTitle>
          <CardDescription>
            Set point thresholds and multipliers for each tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-4">Point Thresholds</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="silver-threshold">Silver Tier (points)</Label>
                  <Input
                    id="silver-threshold"
                    type="number"
                    min="0"
                    value={silverThreshold}
                    onChange={(e) => setSilverThreshold(e.target.value)}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gold-threshold">Gold Tier (points)</Label>
                  <Input
                    id="gold-threshold"
                    type="number"
                    min="0"
                    value={goldThreshold}
                    onChange={(e) => setGoldThreshold(e.target.value)}
                    placeholder="2000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platinum-threshold">Platinum Tier (points)</Label>
                  <Input
                    id="platinum-threshold"
                    type="number"
                    min="0"
                    value={platinumThreshold}
                    onChange={(e) => setPlatinumThreshold(e.target.value)}
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-4">Earning Multipliers</h4>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="bronze-multiplier">Bronze (1x base)</Label>
                  <Input
                    id="bronze-multiplier"
                    type="number"
                    step="0.25"
                    min="1"
                    value={bronzeMultiplier}
                    onChange={(e) => setBronzeMultiplier(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="silver-multiplier">Silver Multiplier</Label>
                  <Input
                    id="silver-multiplier"
                    type="number"
                    step="0.25"
                    min="1"
                    value={silverMultiplier}
                    onChange={(e) => setSilverMultiplier(e.target.value)}
                    placeholder="1.25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gold-multiplier">Gold Multiplier</Label>
                  <Input
                    id="gold-multiplier"
                    type="number"
                    step="0.25"
                    min="1"
                    value={goldMultiplier}
                    onChange={(e) => setGoldMultiplier(e.target.value)}
                    placeholder="1.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platinum-multiplier">Platinum Multiplier</Label>
                  <Input
                    id="platinum-multiplier"
                    type="number"
                    step="0.25"
                    min="1"
                    value={platinumMultiplier}
                    onChange={(e) => setPlatinumMultiplier(e.target.value)}
                    placeholder="2"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Higher tier customers earn points at an increased rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Terms & Conditions
          </CardTitle>
          <CardDescription>
            Optional program terms that customers must accept
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Enter your loyalty program terms and conditions..."
            rows={6}
          />
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Changes to the loyalty program settings will apply to all future transactions.
          Existing points and tiers will not be affected retroactively.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}