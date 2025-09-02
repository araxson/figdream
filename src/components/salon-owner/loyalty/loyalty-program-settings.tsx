'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Switch,
  Toggle,
  Slider,
  Textarea,
  Separator,
  Alert,
  AlertDescription,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui'
import { toast } from 'sonner'
import { Loader2, Save, AlertCircle, DollarSign, Gift, Trophy, Settings2, HelpCircle } from 'lucide-react'

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
            <Toggle
              id="program-active"
              pressed={isActive}
              onPressedChange={setIsActive}
              variant={isActive ? 'default' : 'outline'}
              className="data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:border-green-200"
            >
              {isActive ? 'Active' : 'Inactive'}
            </Toggle>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="points-per-dollar">Points per Dollar Spent</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Points Earning Rate</h4>
                        <p className="text-sm text-muted-foreground">
                          Sets the base rate for how many points customers earn per dollar spent. 
                          Higher rates encourage more spending but reduce profit margins. 
                          Typical rates range from 1-3 points per dollar.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <span className="text-sm font-medium">{pointsPerDollar} points</span>
              </div>
              <Slider
                id="points-per-dollar"
                min={0.1}
                max={5}
                step={0.1}
                value={[parseFloat(pointsPerDollar) || 1]}
                onValueChange={(value) => setPointsPerDollar(value[0].toString())}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Base points earned for every dollar spent (0.1 - 5.0 range)
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="redemption-value">Redemption Value (per point)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-1">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Point Value</h4>
                        <p className="text-sm text-muted-foreground">
                          Determines how much each point is worth when redeemed. 
                          Lower values (like $0.01) mean customers need more points for rewards, 
                          while higher values provide more immediate gratification but cost more.
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <span className="text-sm font-medium">${redemptionValue}</span>
              </div>
              <Slider
                id="redemption-value"
                min={0.001}
                max={0.1}
                step={0.001}
                value={[parseFloat(redemptionValue) || 0.01]}
                onValueChange={(value) => setRedemptionValue(value[0].toFixed(3))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Dollar value of each point when redeemed ($0.001 - $0.1 range)
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
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bronze-multiplier">Bronze Tier</Label>
                      <span className="text-sm font-medium">{bronzeMultiplier}x</span>
                    </div>
                    <Slider
                      id="bronze-multiplier"
                      min={1}
                      max={3}
                      step={0.25}
                      value={[parseFloat(bronzeMultiplier) || 1]}
                      onValueChange={(value) => setBronzeMultiplier(value[0].toString())}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="silver-multiplier">Silver Tier</Label>
                      <span className="text-sm font-medium">{silverMultiplier}x</span>
                    </div>
                    <Slider
                      id="silver-multiplier"
                      min={1}
                      max={3}
                      step={0.25}
                      value={[parseFloat(silverMultiplier) || 1.25]}
                      onValueChange={(value) => setSilverMultiplier(value[0].toString())}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gold-multiplier">Gold Tier</Label>
                      <span className="text-sm font-medium">{goldMultiplier}x</span>
                    </div>
                    <Slider
                      id="gold-multiplier"
                      min={1}
                      max={3}
                      step={0.25}
                      value={[parseFloat(goldMultiplier) || 1.5]}
                      onValueChange={(value) => setGoldMultiplier(value[0].toString())}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="platinum-multiplier">Platinum Tier</Label>
                      <span className="text-sm font-medium">{platinumMultiplier}x</span>
                    </div>
                    <Slider
                      id="platinum-multiplier"
                      min={1}
                      max={3}
                      step={0.25}
                      value={[parseFloat(platinumMultiplier) || 2]}
                      onValueChange={(value) => setPlatinumMultiplier(value[0].toString())}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Higher tier customers earn points at an increased rate (1x - 3x range)
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