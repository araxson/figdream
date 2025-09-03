"use client"
import { useState } from "react"
import { CreditCard, Lock, Info } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  Checkbox,
  Alert,
  AlertDescription
} from "@/components/ui"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { createClient } from "@/lib/database/supabase/client"
const paymentMethodSchema = z.object({
  cardNumber: z.string()
    .min(13, "Card number must be at least 13 digits")
    .max(19, "Card number must be at most 19 digits")
    .regex(/^[0-9\s]+$/, "Card number must contain only digits"),
  cardholderName: z.string().min(1, "Cardholder name is required"),
  expiryMonth: z.string()
    .regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
  expiryYear: z.string()
    .regex(/^[0-9]{2}$/, "Invalid year"),
  cvc: z.string()
    .min(3, "CVC must be at least 3 digits")
    .max(4, "CVC must be at most 4 digits")
    .regex(/^[0-9]+$/, "CVC must contain only digits"),
  setAsDefault: z.boolean().default(false),
  saveForFuture: z.boolean().default(true),
})
type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>
interface AddPaymentMethodProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  onSuccess?: () => void
}
export function AddPaymentMethod({
  open,
  onOpenChange,
  customerId,
  onSuccess,
}: AddPaymentMethodProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
      setAsDefault: false,
      saveForFuture: true,
    },
  })
  const onSubmit = async (values: PaymentMethodFormValues) => {
    try {
      setLoading(true)
      // In a real app, this would:
      // 1. Tokenize the card with Stripe
      // 2. Create a payment method in Stripe
      // 3. Save the payment method reference in the database
      // For demo, we'll just save mock data
      const cardNumber = values.cardNumber.replace(/\s/g, "")
      const last4 = cardNumber.slice(-4)
      const cardBrand = detectCardBrand(cardNumber)
      // If setting as default, unset other defaults first
      if (values.setAsDefault) {
        await supabase
          .from("payment_methods")
          .update({ is_default: false })
          .eq("customer_id", customerId)
          .eq("is_default", true)
      }
      const { error } = await supabase
        .from("payment_methods")
        .insert({
          customer_id: customerId,
          stripe_payment_method_id: `pm_mock_${Date.now()}`, // Mock Stripe ID
          type: "card",
          card_brand: cardBrand,
          last_four: last4,
          exp_month: parseInt(values.expiryMonth),
          exp_year: parseInt("20" + values.expiryYear),
          is_default: values.setAsDefault,
        })
      if (error) throw error
      toast.success("Payment method added successfully")
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error adding payment method:", error)
      toast.error("Failed to add payment method")
    } finally {
      setLoading(false)
    }
  }
  const detectCardBrand = (cardNumber: string): string => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
    }
    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cardNumber)) {
        return brand
      }
    }
    return "unknown"
  }
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return value
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <DialogTitle>Add Payment Method</DialogTitle>
          </div>
          <DialogDescription>
            Add a new card for faster checkout
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Your payment information is encrypted and secure. We never store your full card details.
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="1234 5678 9012 3456"
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value)
                        field.onChange(formatted)
                      }}
                      maxLength={19}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="expiryMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="MM"
                        maxLength={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="YY"
                        maxLength={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVC</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123"
                        type="password"
                        maxLength={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="setAsDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Set as default payment method
                      </FormLabel>
                      <FormDescription>
                        This card will be used for future bookings
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="saveForFuture"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Save for future use
                      </FormLabel>
                      <FormDescription>
                        Securely save this card for faster checkout
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Card"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            We use industry-standard encryption to protect your payment information. 
            Your full card number is never stored on our servers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}