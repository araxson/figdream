'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  CreditCard, 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Star,
  StarOff 
} from 'lucide-react'
import { createClient } from '@/lib/database/supabase/client'
import { toast } from 'sonner'

interface PaymentMethod {
  id: string
  stripe_payment_method_id: string | null
  card_brand: string | null
  last_four: string | null
  exp_month: number | null
  exp_year: number | null
  is_default: boolean
  created_at: string
}

export function PaymentMethodList() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  async function fetchPaymentMethods() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please sign in to view payment methods')
        return
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        setError('Failed to load payment methods')
        return
      }

      setPaymentMethods(data || [])
    } catch (_err) {
      setError('Failed to load payment methods')
    } finally {
      setLoading(false)
    }
  }

  async function setDefaultPaymentMethod(paymentMethodId: string) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please sign in')
        return
      }

      // First, set all payment methods to not default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)

      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('user_id', user.id)

      if (error) {
        toast.error('Failed to set default payment method')
        return
      }

      setPaymentMethods(prev => 
        prev.map(pm => ({
          ...pm,
          is_default: pm.id === paymentMethodId
        }))
      )

      toast.success('Default payment method updated')
    } catch (_err) {
      toast.error('Failed to set default payment method')
    }
  }

  async function deletePaymentMethod(paymentMethodId: string) {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please sign in')
        return
      }

      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', user.id)

      if (error) {
        toast.error('Failed to delete payment method')
        return
      }

      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId))
      toast.success('Payment method deleted')
    } catch (_err) {
      toast.error('Failed to delete payment method')
    }
  }

  const getCardIcon = (_brand: string | null) => {
    // For now, just return credit card icon
    // In a real implementation, you'd return different icons for Visa, Mastercard, etc.
    return <CreditCard className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16 ml-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            onClick={fetchPaymentMethods}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Payment Methods</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add a payment method to make booking and purchasing easier.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((paymentMethod) => (
            <Card key={paymentMethod.id} className={paymentMethod.is_default ? 'ring-2 ring-primary' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-lg">
                      {getCardIcon(paymentMethod.card_brand)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {paymentMethod.card_brand?.charAt(0).toUpperCase() + paymentMethod.card_brand?.slice(1)} 
                          ending in {paymentMethod.last_four}
                        </span>
                        {paymentMethod.is_default && (
                          <Badge variant="default" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {paymentMethod.exp_month?.toString().padStart(2, '0')}/{paymentMethod.exp_year}
                      </p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {!paymentMethod.is_default && (
                        <DropdownMenuItem
                          onClick={() => setDefaultPaymentMethod(paymentMethod.id)}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      {paymentMethod.is_default && (
                        <DropdownMenuItem disabled>
                          <StarOff className="h-4 w-4 mr-2" />
                          Default Method
                        </DropdownMenuItem>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this payment method? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePaymentMethod(paymentMethod.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}