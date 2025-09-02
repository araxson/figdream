import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Plus, Shield, Check } from "lucide-react"

export default async function PaymentMethodsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get customer
  const { data: customer } = await supabase
    .from("customers")
    .select(`
      *,
      profiles (full_name, email)
    `)
    .eq("user_id", user.id)
    .single()

  if (!customer) redirect("/error-403")

  // Payment methods feature will be implemented when payment_methods table is added to database
  // Using empty arrays as fallback until then
  const paymentMethods: Array<never> = []

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your payment options</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Payment Methods</CardTitle>
              <CardDescription>Your cards and payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Payment methods will be displayed here when payment_methods table is implemented */}

              {(!paymentMethods || paymentMethods.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No payment methods saved</p>
                  <p className="text-sm">Add a payment method for faster checkout</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Payment Method</CardTitle>
              <CardDescription>Add a credit or debit card</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input 
                    id="card-number" 
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Name on Card</Label>
                    <Input 
                      id="card-name" 
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-cvc">CVC</Label>
                    <Input 
                      id="card-cvc" 
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="card-month">Expiry Month</Label>
                    <Input 
                      id="card-month" 
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-year">Expiry Year</Label>
                    <Input 
                      id="card-year" 
                      placeholder="YYYY"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="set-default"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="set-default" className="text-sm font-normal">
                    Set as default payment method
                  </Label>
                </div>

                <Button className="w-full">Add Payment Method</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Security</CardTitle>
              <CardDescription>Your payment information is secure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">PCI Compliant</p>
                    <p className="text-xs text-muted-foreground">
                      We meet industry security standards
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Encrypted Storage</p>
                    <p className="text-xs text-muted-foreground">
                      Your card details are encrypted
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Secure Processing</p>
                    <p className="text-xs text-muted-foreground">
                      Payments processed through Stripe
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accepted Cards</CardTitle>
              <CardDescription>We accept major credit and debit cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Visa</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Mastercard</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>American Express</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Discover</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Apple Pay</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Google Pay</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Haircut & Style</p>
                    <p className="text-xs text-muted-foreground">Dec 15, 2024</p>
                  </div>
                  <span className="font-medium">$65.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Color Treatment</p>
                    <p className="text-xs text-muted-foreground">Dec 1, 2024</p>
                  </div>
                  <span className="font-medium">$120.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Manicure</p>
                    <p className="text-xs text-muted-foreground">Nov 28, 2024</p>
                  </div>
                  <span className="font-medium">$45.00</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}