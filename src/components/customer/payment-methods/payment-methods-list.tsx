"use client"
import { useState, useEffect } from "react"
import { CreditCard, Plus, Trash2, Star } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Skeleton
} from "@/components/ui"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database.types"
type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"]
interface PaymentMethodsListProps {
  customerId: string
  onAddNew?: () => void
}
export function PaymentMethodsList({ customerId, onAddNew }: PaymentMethodsListProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()
  useEffect(() => {
    loadPaymentMethods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId])
  const loadPaymentMethods = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("customer_id", customerId)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })
      if (error) throw error
      setPaymentMethods(data || [])
    } catch (error) {
      console.error("Error loading payment methods:", error)
      toast.error("Failed to load payment methods")
    } finally {
      setLoading(false)
    }
  }
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      // In a real app, this would also remove the payment method from Stripe
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id)
      if (error) throw error
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id))
      toast.success("Payment method removed successfully")
    } catch (error) {
      console.error("Error deleting payment method:", error)
      toast.error("Failed to remove payment method")
    } finally {
      setDeleteId(null)
      setDeletingId(null)
    }
  }
  const handleSetDefault = async (id: string) => {
    try {
      // First, unset any existing default
      await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("customer_id", customerId)
        .eq("is_default", true)
      // Then set the new default
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_default: true })
        .eq("id", id)
      if (error) throw error
      setPaymentMethods(prev =>
        prev.map(pm => ({
          ...pm,
          is_default: pm.id === id,
        }))
      )
      toast.success("Default payment method updated")
    } catch (error) {
      console.error("Error setting default payment method:", error)
      toast.error("Failed to update default payment method")
    }
  }
  const getCardBrand = (_brand: string | null) => {
    const brandMap: Record<string, string> = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      diners: "Diners Club",
      jcb: "JCB",
      unionpay: "UnionPay",
    }
    return brandMap[_brand?.toLowerCase() || ""] || "Card"
  }
  const getCardIcon = (_brand: string | null) => {
    // In a real app, you'd have brand-specific icons
    return <CreditCard className="h-8 w-8 text-muted-foreground" />
  }
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Loading your payment methods...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }
  if (paymentMethods.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Add a payment method to make bookings faster
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No payment methods saved yet
            </p>
            {onAddNew && (
              <Button onClick={onAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your saved payment methods
              </CardDescription>
            </div>
            {onAddNew && (
              <Button onClick={onAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center gap-4 rounded-lg border p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                {getCardIcon(method.card_brand)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {getCardBrand(method.card_brand)} •••• {method.last_four}
                  </p>
                  {method.is_default && (
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Expires {method.exp_month?.toString().padStart(2, "0")}/{method.exp_year}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!method.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(method.id)}
                  disabled={deletingId === method.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
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
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}