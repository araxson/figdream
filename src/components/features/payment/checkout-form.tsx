/**
 * Checkout Form Component for FigDream
 * Comprehensive Stripe payment form with Elements integration
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
  AddressElement,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, CreditCard, Shield, AlertCircle } from 'lucide-react'
import { 
  createElementsOptions, 
  formatAmountForDisplay, 
  formatStripeError,
  checkBrowserSupport,
} from '@/lib/integrations/stripe/client'
import { toast } from 'sonner'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  clientSecret: string
  amount: number
  currency?: string
  bookingId?: string
  isDeposit?: boolean
  depositAmount?: number
  metadata?: Record<string, string>
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
  showSavePaymentMethod?: boolean
  returnUrl?: string
}

interface PaymentFormProps extends Omit<CheckoutFormProps, 'clientSecret'> {
  stripe: any
  elements: any
  clientSecret: string
}

// Inner form component that uses Stripe hooks
function PaymentForm({
  stripe,
  elements,
  clientSecret,
  amount,
  currency = 'usd',
  bookingId,
  isDeposit,
  depositAmount,
  onSuccess,
  onError,
  showSavePaymentMethod = true,
  returnUrl,
}: PaymentFormProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [savePaymentMethod, setSavePaymentMethod] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const finalAmount = isDeposit ? (depositAmount || amount) : amount

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage('')

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/payment/confirmation`,
          save_payment_method: savePaymentMethod,
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(formatStripeError(error))
        onError?.(formatStripeError(error))
        toast.error('Payment failed', {
          description: formatStripeError(error),
        })
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentComplete(true)
        onSuccess?.(paymentIntent)
        toast.success('Payment successful!', {
          description: isDeposit ? 'Deposit paid successfully' : 'Payment completed successfully',
        })
        
        // Redirect to success page if provided
        if (bookingId) {
          router.push(`/customer/appointments/${bookingId}`)
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment failed'
      setErrorMessage(errorMsg)
      onError?.(errorMsg)
      toast.error('Payment failed', {
        description: errorMsg,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentComplete) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
        <p className="text-gray-600">
          {isDeposit ? 'Your deposit has been processed.' : 'Your payment has been processed successfully.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4" />
          <Label className="text-sm font-medium">Payment Information</Label>
        </div>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultCollapsed: false,
          }}
        />
      </div>

      {/* Address Element */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Billing Address</Label>
        <AddressElement 
          options={{
            mode: 'billing',
            allowedCountries: ['US', 'CA'],
          }}
        />
      </div>

      {/* Save Payment Method Option */}
      {showSavePaymentMethod && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="save-payment-method"
            checked={savePaymentMethod}
            onCheckedChange={(checked) => setSavePaymentMethod(checked as boolean)}
          />
          <Label
            htmlFor="save-payment-method"
            className="text-sm font-normal cursor-pointer"
          >
            Save payment method for future bookings
          </Label>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Pay {formatAmountForDisplay(finalAmount, currency)}
            {isDeposit && ' (Deposit)'}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <p className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted. We never store your card details.
      </p>
    </form>
  )
}

// Main checkout form component
export function CheckoutForm(props: CheckoutFormProps) {
  const { clientSecret, amount, currency = 'usd', isDeposit, depositAmount } = props
  const [browserSupport, setBrowserSupport] = useState<{
    supportsPaymentRequest: boolean
    supportsSecurePayments: boolean
  } | null>(null)

  useEffect(() => {
    setBrowserSupport(checkBrowserSupport())
  }, [])

  const elementsOptions = createElementsOptions(clientSecret, {
    locale: 'en',
  })

  const finalAmount = isDeposit ? (depositAmount || amount) : amount

  // Check for browser support
  if (browserSupport && !browserSupport.supportsSecurePayments) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Secure payments require HTTPS. Please ensure you're on a secure connection.
        </AlertDescription>
      </Alert>
    )
  }

  if (!clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to initialize payment. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Payment Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">
              {isDeposit ? 'Deposit Amount' : 'Total Amount'}
            </span>
            <span className="font-semibold">
              {formatAmountForDisplay(finalAmount, currency)}
            </span>
          </div>
          
          {isDeposit && (
            <>
              <Separator />
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Total Booking Amount</span>
                <span>{formatAmountForDisplay(amount, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Remaining Balance</span>
                <span>{formatAmountForDisplay(amount - finalAmount, currency)}</span>
              </div>
            </>
          )}
          
          <Separator />
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {isDeposit ? 'Deposit Payment' : 'Full Payment'}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currency.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Elements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={elementsOptions}>
            <PaymentForm {...props} />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading state component
export function CheckoutFormSkeleton() {
  return (
    <div className="max-w-md mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Separator />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export default CheckoutForm