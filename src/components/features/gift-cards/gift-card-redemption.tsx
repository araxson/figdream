'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import {
  Gift,
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  Info,
  Calendar,
  DollarSign,
  Clock,
  User,
  Mail,
  Search,
  RefreshCw,
  ShoppingCart,
  Wallet,
  Receipt,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isAfter, isBefore } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  redeemGiftCardSchema, 
  checkGiftCardBalanceSchema,
  type RedeemGiftCardInput, 
  type CheckGiftCardBalanceInput 
} from '@/lib/validations/advanced-features-schema'
import { 
  redeemGiftCard, 
  checkGiftCardBalance, 
  getGiftCardHistory 
} from '@/lib/data-access/loyalty/gift-cards'
import type { GiftCard, GiftCardTransaction } from '@/lib/data-access/loyalty/gift-cards'

interface GiftCardRedemptionProps {
  customerId?: string
  bookingId?: string
  bookingTotal?: number
  salonId?: string
  mode?: 'check_balance' | 'redeem' | 'full'
  className?: string
  onRedemptionSuccess?: (redemption: {
    redeemedAmount: number
    remainingBalance: number
    giftCardId: string
  }) => void
  onClose?: () => void
}

export function GiftCardRedemption({ 
  customerId,
  bookingId,
  bookingTotal,
  salonId,
  mode = 'full',
  className,
  onRedemptionSuccess,
  onClose,
}: GiftCardRedemptionProps) {
  const [step, setStep] = React.useState<'input' | 'verify' | 'redeem' | 'success'>('input')
  const [giftCard, setGiftCard] = React.useState<any | null>(null)
  const [history, setHistory] = React.useState<GiftCardTransaction[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [redemptionAmount, setRedemptionAmount] = React.useState<number>(0)
  const [showConfirmDialog, setShowConfirmDialog] = React.useState(false)

  const balanceForm = useForm<CheckGiftCardBalanceInput>({
    resolver: zodResolver(checkGiftCardBalanceSchema),
    defaultValues: {
      code: '',
    },
  })

  const redeemForm = useForm<RedeemGiftCardInput>({
    resolver: zodResolver(redeemGiftCardSchema),
    defaultValues: {
      code: '',
      customer_id: customerId || '',
      booking_id: bookingId,
      amount: undefined,
    },
  })

  const watchedCode = balanceForm.watch('code')

  const formatGiftCardCode = (code: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
    // Format as XXXX-XXXX-XXXX-XXXX
    return cleaned.replace(/(.{4})/g, '$1-').slice(0, -1)
  }

  const handleCodeChange = (value: string) => {
    const formatted = formatGiftCardCode(value)
    if (formatted.length <= 19) { // Max length with dashes
      balanceForm.setValue('code', formatted)
    }
  }

  const handleCheckBalance = async (data: CheckGiftCardBalanceInput) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await checkGiftCardBalance(data)

      if (!result.success) {
        throw new Error(result.error || 'Failed to check gift card balance')
      }

      setGiftCard(result.data)

      // Load transaction history if available
      if (result.data?.id) {
        const historyResult = await getGiftCardHistory(result.data.id)
        if (historyResult.success) {
          setHistory(historyResult.data || [])
        }
      }

      // Set default redemption amount
      if (bookingTotal && result.data) {
        setRedemptionAmount(Math.min(bookingTotal, result.data.current_balance))
      } else {
        setRedemptionAmount(result.data?.current_balance || 0)
      }

      setStep(mode === 'check_balance' ? 'verify' : 'redeem')
    } catch (err) {
      console.error('Check balance error:', err)
      setError(err instanceof Error ? err.message : 'Failed to check gift card balance')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRedemption = async () => {
    if (!giftCard || !customerId) return

    try {
      setIsLoading(true)
      setError(null)

      const redemptionData: RedeemGiftCardInput = {
        code: giftCard.code,
        customer_id: customerId,
        booking_id: bookingId,
        amount: redemptionAmount,
      }

      const result = await redeemGiftCard(redemptionData)

      if (!result.success) {
        throw new Error(result.error || 'Failed to redeem gift card')
      }

      // Update local state
      setGiftCard({
        ...giftCard,
        current_balance: result.data.remainingBalance,
        status: result.data.remainingBalance <= 0 ? 'redeemed' : 'active',
      })

      setStep('success')
      onRedemptionSuccess?.(result.data)
    } catch (err) {
      console.error('Redemption error:', err)
      setError(err instanceof Error ? err.message : 'Failed to redeem gift card')
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
    }
  }

  const resetForm = () => {
    setStep('input')
    setGiftCard(null)
    setHistory([])
    setError(null)
    setRedemptionAmount(0)
    balanceForm.reset()
    redeemForm.reset()
  }

  const isExpired = giftCard?.expires_at ? isAfter(new Date(), new Date(giftCard.expires_at)) : false
  const maxRedeemable = bookingTotal 
    ? Math.min(bookingTotal, giftCard?.current_balance || 0)
    : giftCard?.current_balance || 0

  const renderInputStep = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          {mode === 'check_balance' ? 'Check Gift Card Balance' : 'Redeem Gift Card'}
        </CardTitle>
        <CardDescription>
          Enter your gift card code to {mode === 'check_balance' ? 'check balance' : 'apply to your booking'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...balanceForm}>
          <form onSubmit={balanceForm.handleSubmit(handleCheckBalance)} className="space-y-4">
            <FormField
              control={balanceForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gift Card Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="font-mono text-lg text-center tracking-wider"
                        onChange={(e) => handleCodeChange(e.target.value)}
                        maxLength={19}
                      />
                      <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the 16-character code from your gift card
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              {onClose && (
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isLoading || watchedCode.length < 19}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    {mode === 'check_balance' ? 'Check Balance' : 'Verify Gift Card'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )

  const renderVerifyStep = () => {
    if (!giftCard) return null

    return (
      <div className="space-y-6">
        {/* Gift Card Details */}
        <Card className={cn(
          "border-2",
          giftCard.status === 'active' 
            ? "border-green-200 bg-green-50" 
            : giftCard.status === 'redeemed'
            ? "border-gray-200 bg-gray-50"
            : "border-red-200 bg-red-50"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>{giftCard.salons?.name || 'Salon'} Gift Card</CardTitle>
                  <CardDescription>Code: {giftCard.code}</CardDescription>
                </div>
              </div>
              <Badge 
                variant={giftCard.status === 'active' ? 'default' : giftCard.status === 'redeemed' ? 'secondary' : 'destructive'}
                className="capitalize"
              >
                {isExpired ? 'Expired' : giftCard.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">
                  ${giftCard.current_balance?.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Current Balance</p>
              </div>
              
              <div className="text-center p-4 bg-background rounded-lg">
                <Wallet className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-lg font-semibold">
                  ${giftCard.original_amount?.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Original Amount</p>
              </div>
              
              <div className="text-center p-4 bg-background rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium">
                  {giftCard.expires_at 
                    ? format(new Date(giftCard.expires_at), 'MMM d, yyyy')
                    : 'Never'
                  }
                </p>
                <p className="text-sm text-muted-foreground">Expires</p>
              </div>
            </div>

            {/* Recipient Info */}
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">For: {giftCard.recipient_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Purchased: {giftCard.purchased_at 
                    ? format(new Date(giftCard.purchased_at), 'MMM d, yyyy')
                    : 'Pending'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        {isExpired && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              This gift card expired on {format(new Date(giftCard.expires_at), 'MMMM d, yyyy')} and can no longer be used.
            </AlertDescription>
          </Alert>
        )}

        {giftCard.status === 'redeemed' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This gift card has been fully redeemed and has no remaining balance.
            </AlertDescription>
          </Alert>
        )}

        {giftCard.current_balance <= 0 && giftCard.status !== 'redeemed' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This gift card has a zero balance and cannot be used for purchases.
            </AlertDescription>
          </Alert>
        )}

        {/* Transaction History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {transaction.transaction_type === 'purchase' ? (
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                      ) : transaction.transaction_type === 'redemption' ? (
                        <Gift className="h-4 w-4 text-orange-600" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-blue-600" />
                      )}
                      <div>
                        <p className="font-medium text-sm capitalize">
                          {transaction.transaction_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-semibold text-sm",
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={resetForm}>
            Check Another
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderRedeemStep = () => {
    if (!giftCard || mode === 'check_balance') return null

    return (
      <div className="space-y-6">
        {/* Gift Card Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Apply Gift Card
            </CardTitle>
            <CardDescription>
              Choose how much to redeem from this gift card
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Gift Card Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${giftCard.current_balance.toFixed(2)}
                  </p>
                </div>
                
                {bookingTotal && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Booking Total</p>
                    <p className="text-xl font-semibold">
                      ${bookingTotal.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="redemption-amount">Redemption Amount</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">$</span>
                    <Input
                      id="redemption-amount"
                      type="number"
                      value={redemptionAmount.toFixed(2)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setRedemptionAmount(Math.min(maxRedeemable, Math.max(0, value)))
                      }}
                      min="0.01"
                      max={maxRedeemable}
                      step="0.01"
                      className="text-lg font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum: ${maxRedeemable.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRedemptionAmount(Math.min(25, maxRedeemable))}
                    disabled={maxRedeemable < 25}
                  >
                    $25
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRedemptionAmount(Math.min(50, maxRedeemable))}
                    disabled={maxRedeemable < 50}
                  >
                    $50
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRedemptionAmount(maxRedeemable)}
                  >
                    Max
                  </Button>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Redemption Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Redemption Amount:</span>
                <span className="font-medium">${redemptionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining Balance:</span>
                <span className="font-medium">
                  ${(giftCard.current_balance - redemptionAmount).toFixed(2)}
                </span>
              </div>
              {bookingTotal && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Booking Total:</span>
                    <span className="font-medium">${bookingTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Amount Due:</span>
                    <span className="text-primary">
                      ${Math.max(0, bookingTotal - redemptionAmount).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep('verify')}>
            Back
          </Button>
          <Button 
            onClick={() => setShowConfirmDialog(true)}
            disabled={redemptionAmount <= 0 || redemptionAmount > maxRedeemable || isLoading}
            className="flex-1"
          >
            Apply Gift Card - ${redemptionAmount.toFixed(2)}
          </Button>
        </div>
      </div>
    )
  }

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-green-900">
          Gift Card Applied Successfully!
        </h2>
        <p className="text-muted-foreground mt-2">
          ${redemptionAmount.toFixed(2)} has been applied from your gift card.
        </p>
      </div>

      <Card className="text-left">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Redeemed Amount:</span>
              <span className="font-semibold text-green-600">
                ${redemptionAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Remaining Balance:</span>
              <span className="font-semibold">
                ${(giftCard?.current_balance || 0).toFixed(2)}
              </span>
            </div>
            {bookingTotal && (
              <>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Amount Still Due:</span>
                  <span className="text-primary">
                    ${Math.max(0, bookingTotal - redemptionAmount).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button onClick={onClose}>Close</Button>
        <Button variant="outline" onClick={resetForm}>
          Apply Another Gift Card
        </Button>
      </div>
    </div>
  )

  if (isLoading && step === 'input') {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {step === 'input' && renderInputStep()}
      {step === 'verify' && renderVerifyStep()}
      {step === 'redeem' && renderRedeemStep()}
      {step === 'success' && renderSuccessStep()}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Gift Card Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem ${redemptionAmount.toFixed(2)} from this gift card?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Gift Card Code:</span>
                <span className="font-mono">{giftCard?.code}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Current Balance:</span>
                <span>${giftCard?.current_balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Redemption Amount:</span>
                <span className="font-semibold text-orange-600">
                  ${redemptionAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Remaining Balance:</span>
                <span className="font-semibold">
                  ${((giftCard?.current_balance || 0) - redemptionAmount).toFixed(2)}
                </span>
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This action cannot be undone. The redeemed amount will be applied to your booking.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRedemption}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                `Confirm - $${redemptionAmount.toFixed(2)}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}