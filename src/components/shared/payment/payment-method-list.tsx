/**
 * Payment Method List Component for FigDream
 * Displays and manages user's saved payment methods
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  CreditCard,
  Plus,
  Trash2,
  Star,
  StarOff,
  Loader2,
  AlertCircle,
  Smartphone,
  Building2,
} from 'lucide-react'
import { toast } from 'sonner'
import { getPaymentMethodDisplayName, isWalletPaymentMethod } from '@/lib/integrations/stripe/client'

interface PaymentMethod {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    exp_month: number
    exp_year: number
  }
  us_bank_account?: {
    account_holder_type: string
    account_type: string
    bank_name: string
    last4: string
  }
  billing_details: {
    name?: string
    email?: string
    address?: {
      city?: string
      state?: string
      postal_code?: string
    }
  }
}

interface PaymentMethodListProps {
  userId: string
  onPaymentMethodSelect?: (paymentMethodId: string) => void
  allowSelection?: boolean
  selectedPaymentMethodId?: string
  showAddButton?: boolean
  onAddNewMethod?: () => void
}

// Payment method card component
function PaymentMethodCard({
  paymentMethod,
  isSelected,
  isDefault,
  onSelect,
  onDelete,
  onSetDefault,
  allowSelection = false,
  isDeleting = false,
}: {
  paymentMethod: PaymentMethod
  isSelected?: boolean
  isDefault?: boolean
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
  onSetDefault?: (id: string) => void
  allowSelection?: boolean
  isDeleting?: boolean
}) {
  const getPaymentMethodIcon = (type: string) => {
    if (type === 'card') return <CreditCard className="w-5 h-5" />
    if (type === 'us_bank_account') return <Building2 className="w-5 h-5" />
    if (isWalletPaymentMethod(type)) return <Smartphone className="w-5 h-5" />
    return <CreditCard className="w-5 h-5" />
  }

  const getPaymentMethodDetails = (pm: PaymentMethod) => {
    if (pm.type === 'card' && pm.card) {
      return {
        display: `•••• ${pm.card.last4}`,
        brand: pm.card.brand.toUpperCase(),
        expiry: `${pm.card.exp_month.toString().padStart(2, '0')}/${pm.card.exp_year}`,
      }
    }
    
    if (pm.type === 'us_bank_account' && pm.us_bank_account) {
      return {
        display: `•••• ${pm.us_bank_account.last4}`,
        brand: pm.us_bank_account.bank_name,
        expiry: pm.us_bank_account.account_type.toUpperCase(),
      }
    }

    return {
      display: getPaymentMethodDisplayName(pm.type),
      brand: '',
      expiry: '',
    }
  }

  const details = getPaymentMethodDetails(paymentMethod)

  return (
    <Card 
      className={`transition-all cursor-pointer hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 border-blue-200' : ''
      }`}
      onClick={() => allowSelection && onSelect?.(paymentMethod.id)}
    >
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getPaymentMethodIcon(paymentMethod.type)}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{details.display}</span>
                {details.brand && (
                  <Badge variant="secondary" className="text-xs">
                    {details.brand}
                  </Badge>
                )}
                {isDefault && (
                  <Badge variant="default" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{getPaymentMethodDisplayName(paymentMethod.type)}</span>
                {details.expiry && (
                  <>
                    <span>•</span>
                    <span>{details.expiry}</span>
                  </>
                )}
              </div>
              {paymentMethod.billing_details.name && (
                <p className="text-sm text-gray-500 mt-1">
                  {paymentMethod.billing_details.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allowSelection && (
              <div className="flex items-center">
                {isSelected && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            )}
            
            {!allowSelection && (
              <div className="flex items-center gap-1">
                {!isDefault && onSetDefault && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSetDefault(paymentMethod.id)
                          }}
                        >
                          <StarOff className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set as default</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isDeleting}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this payment method? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(paymentMethod.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading skeleton
function PaymentMethodSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-8 h-8" />
            <Skeleton className="w-8 h-8" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Empty state
function EmptyPaymentMethods({ onAddNew }: { onAddNew?: () => void }) {
  return (
    <div className="text-center py-8">
      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
      <p className="text-gray-600 mb-4">
        Add a payment method to make booking faster and more convenient.
      </p>
      {onAddNew && (
        <Button onClick={onAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      )}
    </div>
  )
}

// Main component
export function PaymentMethodList({
  userId,
  onPaymentMethodSelect,
  allowSelection = false,
  selectedPaymentMethodId,
  showAddButton = true,
  onAddNewMethod,
}: PaymentMethodListProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // Load payment methods
  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(`/api/payment/methods?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to load payment methods')
      }

      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    } catch (error) {
      console.error('Error loading payment methods:', error)
      setError('Failed to load payment methods')
      toast.error('Failed to load payment methods')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete payment method
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      setDeletingIds(prev => new Set(prev).add(paymentMethodId))

      const response = await fetch(`/api/payment/methods/${paymentMethodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove payment method')
      }

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId))
      toast.success('Payment method removed')
    } catch (error) {
      console.error('Error removing payment method:', error)
      toast.error('Failed to remove payment method')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(paymentMethodId)
        return newSet
      })
    }
  }

  // Set default payment method
  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/payment/methods/${paymentMethodId}/default`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to set default payment method')
      }

      // Refresh payment methods to update default status
      await loadPaymentMethods()
      toast.success('Default payment method updated')
    } catch (error) {
      console.error('Error setting default payment method:', error)
      toast.error('Failed to set default payment method')
    }
  }

  // Load payment methods on mount
  useEffect(() => {
    if (userId) {
      loadPaymentMethods()
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <PaymentMethodSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPaymentMethods}
            className="ml-2"
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (paymentMethods.length === 0) {
    return <EmptyPaymentMethods onAddNew={onAddNewMethod} />
  }

  return (
    <div className="space-y-4">
      {/* Add new button */}
      {showAddButton && onAddNewMethod && (
        <Button
          variant="outline"
          onClick={onAddNewMethod}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Payment Method
        </Button>
      )}

      {/* Payment methods list */}
      <div className="space-y-3">
        {paymentMethods.map((paymentMethod, index) => (
          <PaymentMethodCard
            key={paymentMethod.id}
            paymentMethod={paymentMethod}
            isSelected={selectedPaymentMethodId === paymentMethod.id}
            isDefault={index === 0} // Assuming first method is default
            onSelect={onPaymentMethodSelect}
            onDelete={allowSelection ? undefined : handleDeletePaymentMethod}
            onSetDefault={allowSelection ? undefined : handleSetDefaultPaymentMethod}
            allowSelection={allowSelection}
            isDeleting={deletingIds.has(paymentMethod.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default PaymentMethodList