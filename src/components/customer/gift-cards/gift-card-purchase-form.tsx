"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Gift, Mail, User, DollarSign, Calendar, Loader2 } from "lucide-react"
import { createClient } from "@/lib/database/supabase/client"
import { toast } from "sonner"
const giftCardSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num >= 10 && num <= 500
  }, "Amount must be between $10 and $500"),
  recipientEmail: z.string().email("Invalid email address"),
  recipientName: z.string().min(2, "Name must be at least 2 characters"),
  senderName: z.string().min(2, "Name must be at least 2 characters"),
  message: z.string().max(200, "Message must be less than 200 characters").optional(),
  deliveryMethod: z.enum(["email", "print"]),
  scheduledDate: z.string().optional(),
})
type GiftCardFormData = z.infer<typeof giftCardSchema>
const presetAmounts = [25, 50, 75, 100, 150, 200]
export function GiftCardPurchaseForm() {
  const [loading, setLoading] = useState(false)
  const [customAmount, setCustomAmount] = useState(false)
  const form = useForm<GiftCardFormData>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      amount: "50",
      deliveryMethod: "email",
      recipientEmail: "",
      recipientName: "",
      senderName: "",
      message: "",
    },
  })
  async function onSubmit(_data: GiftCardFormData) {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to purchase gift cards")
        return
      }
      // Process gift card purchase
      // This would integrate with payment processing and create the gift card
      toast.success("Gift card purchased successfully!")
      form.reset()
    } catch (_error) {
      toast.error("Failed to purchase gift card")
    } finally {
      setLoading(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Purchase Gift Card
        </CardTitle>
        <CardDescription>
          Send a gift card to someone special or purchase one for yourself
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Amount Selection */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gift Card Amount</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {presetAmounts.map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant={field.value === amount.toString() && !customAmount ? "default" : "outline"}
                            onClick={() => {
                              field.onChange(amount.toString())
                              setCustomAmount(false)
                            }}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={customAmount ? "default" : "outline"}
                          onClick={() => setCustomAmount(true)}
                        >
                          Custom Amount
                        </Button>
                        {customAmount && (
                          <div className="flex items-center gap-2 flex-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              min="10"
                              max="500"
                              step="5"
                              {...field}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Recipient Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="John Doe" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="john@example.com" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Sender Name */}
            <FormField
              control={form.control}
              name="senderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Your name" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Personal Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personal message to the gift card..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Delivery Method */}
            <FormField
              control={form.control}
              name="deliveryMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="font-normal cursor-pointer">
                          Send via Email (Instant delivery)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="print" id="print" />
                        <Label htmlFor="print" className="font-normal cursor-pointer">
                          Print at Home (PDF format)
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Scheduled Delivery */}
            {form.watch("deliveryMethod") === "email" && (
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Delivery (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          className="pl-9"
                          min={new Date().toISOString().slice(0, 16)}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Purchase Gift Card (${form.watch("amount")})
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}