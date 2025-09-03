'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
interface RewardData {
  salon_id: string
  name: string
  description: string | null
  reward_type: string
  points_cost: number
  is_active: boolean
  min_tier: string | null
  usage_limit: number | null
  expiry_date: string | null
  discount_percentage?: number | null
  discount_fixed?: number | null
  service_id?: string | null
  points_multiplier?: number | null
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
type LoyaltyReward = Database['public']['Tables']['loyalty_rewards']['Row']
interface RewardDialogProps {
  salonId: string
  reward?: LoyaltyReward
  children?: React.ReactNode
}
export default function RewardDialog({
  salonId,
  reward,
  children
}: RewardDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Form state
  const [name, setName] = useState(reward?.name || '')
  const [description, setDescription] = useState(reward?.description || '')
  const [rewardType, setRewardType] = useState(reward?.reward_type || 'discount_percentage')
  const [pointsCost, setPointsCost] = useState(reward?.points_cost?.toString() || '')
  const [discountPercentage, setDiscountPercentage] = useState(reward?.discount_percentage?.toString() || '')
  const [discountAmount, setDiscountAmount] = useState(reward?.discount_amount?.toString() || '')
  const [serviceId, setServiceId] = useState(reward?.service_id || '')
  const [minTier, setMinTier] = useState(reward?.min_tier || '')
  const [usageLimit, setUsageLimit] = useState(reward?.usage_limit?.toString() || '')
  const [isActive, setIsActive] = useState(reward?.is_active ?? true)
  const [validFrom, setValidFrom] = useState<Date | undefined>(
    reward?.valid_from ? new Date(reward.valid_from) : undefined
  )
  const [validUntil, setValidUntil] = useState<Date | undefined>(
    reward?.valid_until ? new Date(reward.valid_until) : undefined
  )
  const [terms, setTerms] = useState(reward?.terms_and_conditions || '')
  // Load services for free service reward type
  const [services, setServices] = useState<Array<{id: string, name: string}>>([])
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch(`/api/services?salon_id=${salonId}`)
        if (response.ok) {
          const data = await response.json()
          setServices(data.services || [])
        }
      } catch (_error) {
      }
    }
    if (isOpen && rewardType === 'free_service') {
      loadServices()
    }
  }, [isOpen, rewardType, salonId])
  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      toast.error('Please enter a reward name')
      return
    }
    if (!pointsCost || parseInt(pointsCost) <= 0) {
      toast.error('Please enter a valid points cost')
      return
    }
    if (rewardType === 'discount_percentage' && (!discountPercentage || parseFloat(discountPercentage) <= 0)) {
      toast.error('Please enter a valid discount percentage')
      return
    }
    if (rewardType === 'discount_fixed' && (!discountAmount || parseFloat(discountAmount) <= 0)) {
      toast.error('Please enter a valid discount amount')
      return
    }
    if (rewardType === 'free_service' && !serviceId) {
      toast.error('Please select a service')
      return
    }
    setIsSubmitting(true)
    try {
      const rewardData: RewardData = {
        salon_id: salonId,
        name: name.trim(),
        description: description.trim() || null,
        reward_type: rewardType,
        points_cost: parseInt(pointsCost),
        is_active: isActive,
        min_tier: minTier || null,
        usage_limit: usageLimit ? parseInt(usageLimit) : null,
        valid_from: validFrom?.toISOString() || null,
        valid_until: validUntil?.toISOString() || null,
        terms_and_conditions: terms.trim() || null
      }
      // Add type-specific fields
      if (rewardType === 'discount_percentage') {
        rewardData.discount_percentage = parseFloat(discountPercentage)
        rewardData.discount_amount = null
        rewardData.service_id = null
      } else if (rewardType === 'discount_fixed') {
        rewardData.discount_percentage = null
        rewardData.discount_amount = parseFloat(discountAmount)
        rewardData.service_id = null
      } else if (rewardType === 'free_service') {
        rewardData.discount_percentage = null
        rewardData.discount_amount = null
        rewardData.service_id = serviceId
      }
      const response = await fetch(
        reward ? `/api/loyalty/rewards/${reward.id}` : '/api/loyalty/rewards',
        {
          method: reward ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rewardData),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to save reward')
      }
      toast.success(reward ? 'Reward updated successfully' : 'Reward created successfully')
      setIsOpen(false)
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save reward')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || <Button>Add Reward</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reward ? 'Edit Reward' : 'Create New Reward'}</DialogTitle>
          <DialogDescription>
            Configure a reward that customers can redeem with loyalty points
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Reward Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., 20% Off Any Service"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points-cost">Points Cost *</Label>
              <Input
                id="points-cost"
                type="number"
                value={pointsCost}
                onChange={(e) => setPointsCost(e.target.value)}
                placeholder="1000"
                min="1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this reward offers..."
              rows={3}
            />
          </div>
          {/* Reward Type & Value */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reward-type">Reward Type</Label>
              <Select value={rewardType} onValueChange={setRewardType}>
                <SelectTrigger id="reward-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount_percentage">Percentage Discount</SelectItem>
                  <SelectItem value="discount_fixed">Fixed Amount Discount</SelectItem>
                  <SelectItem value="free_service">Free Service</SelectItem>
                  <SelectItem value="birthday_special">Birthday Special</SelectItem>
                  <SelectItem value="tier_exclusive">Tier Exclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Type-specific fields */}
            {rewardType === 'discount_percentage' && (
              <div className="space-y-2">
                <Label htmlFor="discount-percentage">Discount Percentage *</Label>
                <div className="relative">
                  <Input
                    id="discount-percentage"
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="20"
                    min="1"
                    max="100"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
            )}
            {rewardType === 'discount_fixed' && (
              <div className="space-y-2">
                <Label htmlFor="discount-amount">Discount Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="discount-amount"
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="10.00"
                    min="0.01"
                    step="0.01"
                    className="pl-8"
                  />
                </div>
              </div>
            )}
            {rewardType === 'free_service' && (
              <div className="space-y-2">
                <Label htmlFor="service">Free Service *</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {/* Restrictions */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min-tier">Minimum Tier Required</Label>
              <Select value={minTier} onValueChange={setMinTier}>
                <SelectTrigger id="min-tier">
                  <SelectValue placeholder="Any tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any tier</SelectItem>
                  <SelectItem value="bronze">Bronze+</SelectItem>
                  <SelectItem value="silver">Silver+</SelectItem>
                  <SelectItem value="gold">Gold+</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="usage-limit">Usage Limit (per customer)</Label>
              <Input
                id="usage-limit"
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
                min="1"
              />
            </div>
          </div>
          {/* Valid Period */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Valid From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validFrom ? format(validFrom, "PPP") : "No start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={validFrom}
                    onSelect={setValidFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validUntil && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validUntil ? format(validUntil, "PPP") : "No end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={validUntil}
                    onSelect={setValidUntil}
                    disabled={(date) => validFrom ? date < validFrom : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {/* Terms & Conditions */}
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Any special terms or conditions for this reward..."
              rows={3}
            />
          </div>
          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Make this reward available for redemption
              </p>
            </div>
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
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
              reward ? 'Update Reward' : 'Create Reward'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}