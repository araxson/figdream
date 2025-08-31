/**
 * Subscription Card Component for FigDream
 * Displays and manages salon subscription information
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpCircle,
  Loader2,
  Settings,
} from 'lucide-react'
import { formatAmountForDisplay } from '@/lib/integrations/stripe/client'
import { toast } from 'sonner'

interface SubscriptionData {
  id: string
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  trial_end?: string
  items: {
    price: {
      id: string
      nickname?: string
      unit_amount: number
      currency: string
      recurring: {
        interval: 'month' | 'year'
        interval_count: number
      }
    }
    quantity: number
  }[]
  default_payment_method?: {
    id: string
    type: string
    card?: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
    }
  }
}

interface SubscriptionCardProps {
  subscription: SubscriptionData
  onUpgrade?: () => void
  onDowngrade?: () => void
  onCancel?: (subscriptionId: string) => void
  onReactivate?: (subscriptionId: string) => void
  onUpdatePaymentMethod?: () => void
  isProcessing?: boolean
}

// Status badge component
function StatusBadge({ status }: { status: SubscriptionData['status'] }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { 
          variant: 'default' as const, 
          icon: <CheckCircle className="w-3 h-3" />, 
          label: 'Active' 
        }
      case 'trialing':
        return { 
          variant: 'secondary' as const, 
          icon: <Clock className="w-3 h-3" />, 
          label: 'Trial' 
        }
      case 'past_due':
        return { 
          variant: 'destructive' as const, 
          icon: <AlertCircle className="w-3 h-3" />, 
          label: 'Past Due' 
        }
      case 'canceled':
        return { 
          variant: 'secondary' as const, 
          icon: <XCircle className="w-3 h-3" />, 
          label: 'Canceled' 
        }
      case 'unpaid':
        return { 
          variant: 'destructive' as const, 
          icon: <AlertCircle className="w-3 h-3" />, 
          label: 'Unpaid' 
        }
      case 'incomplete':
        return { 
          variant: 'destructive' as const, 
          icon: <AlertCircle className="w-3 h-3" />, 
          label: 'Incomplete' 
        }
      default:
        return { 
          variant: 'secondary' as const, 
          icon: <Clock className="w-3 h-3" />, 
          label: status 
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  )
}

// Trial progress component
function TrialProgress({ 
  trialEnd, 
  currentPeriodStart 
}: { 
  trialEnd: string
  currentPeriodStart: string 
}) {
  const trialStart = new Date(currentPeriodStart)
  const trialEndDate = new Date(trialEnd)
  const now = new Date()
  
  const totalTrialDays = Math.ceil((trialEndDate.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24))
  const remainingDays = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const usedDays = totalTrialDays - remainingDays
  
  const progress = Math.max(0, Math.min(100, (usedDays / totalTrialDays) * 100))

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Trial Progress</span>
        <span className="font-medium">{remainingDays} days left</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

// Payment method display
function PaymentMethodDisplay({ 
  paymentMethod 
}: { 
  paymentMethod: SubscriptionData['default_payment_method'] 
}) {
  if (!paymentMethod) {
    return (
      <div className="flex items-center gap-2 text-amber-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">No payment method</span>
      </div>
    )
  }

  if (paymentMethod.card) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <CreditCard className="w-4 h-4" />
        <span className="text-sm">
          {paymentMethod.card.brand.toUpperCase()} •••• {paymentMethod.card.last4}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-gray-600">
      <CreditCard className="w-4 h-4" />
      <span className="text-sm capitalize">{paymentMethod.type}</span>
    </div>
  )
}

export function SubscriptionCard({
  subscription,
  onUpgrade,
  onDowngrade,
  onCancel,
  onReactivate,
  onUpdatePaymentMethod,
  isProcessing = false,
}: SubscriptionCardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const primaryItem = subscription.items[0]
  const price = primaryItem?.price
  
  const currentPeriodStart = new Date(subscription.current_period_start)
  const currentPeriodEnd = new Date(subscription.current_period_end)
  const isTrialing = subscription.status === 'trialing' && subscription.trial_end
  const isCanceled = subscription.status === 'canceled'
  const willCancelAtPeriodEnd = subscription.cancel_at_period_end

  const handleCancel = async () => {
    if (!onCancel) return

    try {
      setIsLoading(true)
      await onCancel(subscription.id)
      setShowCancelDialog(false)
      toast.success('Subscription canceled successfully')
    } catch (error) {
      toast.error('Failed to cancel subscription')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivate = async () => {
    if (!onReactivate) return

    try {
      setIsLoading(true)
      await onReactivate(subscription.id)
      toast.success('Subscription reactivated successfully')
    } catch (error) {
      toast.error('Failed to reactivate subscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            {price?.nickname || 'Subscription Plan'}
          </CardTitle>
          <StatusBadge status={subscription.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trial Progress */}
        {isTrialing && subscription.trial_end && (
          <TrialProgress 
            trialEnd={subscription.trial_end} 
            currentPeriodStart={subscription.current_period_start}
          />
        )}

        {/* Pricing */}
        {price && (
          <div className="text-center py-4">
            <div className="text-3xl font-bold">
              {formatAmountForDisplay(price.unit_amount, price.currency)}
            </div>
            <div className="text-gray-600 text-sm">
              per {price.recurring.interval_count > 1 
                ? `${price.recurring.interval_count} ${price.recurring.interval}s` 
                : price.recurring.interval}
            </div>
          </div>
        )}

        <Separator />

        {/* Billing Period */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Billing Period</span>
          </div>
          <div className="text-sm text-gray-600 ml-6">
            {currentPeriodStart.toLocaleDateString()} - {currentPeriodEnd.toLocaleDateString()}
          </div>
          
          {willCancelAtPeriodEnd && (
            <div className="text-sm text-amber-600 ml-6 font-medium">
              Will cancel on {currentPeriodEnd.toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-sm font-medium">Payment Method</span>
            </div>
            {onUpdatePaymentMethod && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onUpdatePaymentMethod}
                disabled={isProcessing}
              >
                <Settings className="w-3 h-3" />
              </Button>
            )}
          </div>
          <div className="ml-0">
            <PaymentMethodDisplay paymentMethod={subscription.default_payment_method} />
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="grid gap-2">
          {!isCanceled && !willCancelAtPeriodEnd && (
            <>
              {onUpgrade && (
                <Button
                  variant="default"
                  onClick={onUpgrade}
                  disabled={isProcessing}
                  className="w-full"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {onDowngrade && (
                  <Button
                    variant="outline"
                    onClick={onDowngrade}
                    disabled={isProcessing}
                    size="sm"
                  >
                    Downgrade
                  </Button>
                )}

                {onCancel && (
                  <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={isProcessing}
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your subscription? You'll continue to have access 
                          until the end of your current billing period ({currentPeriodEnd.toLocaleDateString()}).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>
                          Keep Subscription
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          disabled={isLoading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Canceling...
                            </>
                          ) : (
                            'Cancel Subscription'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </>
          )}

          {willCancelAtPeriodEnd && onReactivate && (
            <Button
              variant="default"
              onClick={handleReactivate}
              disabled={isProcessing}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reactivating...
                </>
              ) : (
                'Reactivate Subscription'
              )}
            </Button>
          )}

          {isCanceled && onReactivate && (
            <Button
              variant="default"
              onClick={handleReactivate}
              disabled={isProcessing}
              className="w-full"
            >
              Resubscribe
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {subscription.status === 'past_due' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Payment Past Due</span>
            </div>
            <p className="text-sm text-amber-600 mt-1">
              Please update your payment method to avoid service interruption.
            </p>
          </div>
        )}

        {subscription.status === 'unpaid' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Payment Failed</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Your subscription is suspended. Please update your payment method.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Loading skeleton
export function SubscriptionCardSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-6 rounded-full w-16" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center py-4 space-y-2">
          <Skeleton className="h-8 w-24 mx-auto" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="grid gap-2">
          <Skeleton className="h-10" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionCard