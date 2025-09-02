import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gift, Plus, DollarSign, Send } from "lucide-react"

export default async function GiftCardsPage() {
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

  // Gift cards feature will be implemented when gift_cards table is added to database
  // Using empty arrays as fallback until then
  const giftCards: Array<never> = []
  
  // Calculate totals
  const availableBalance = 0
  const totalReceived = 0
  const totalSent = 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gift Cards</h1>
          <p className="text-muted-foreground">Manage and purchase gift cards</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Purchase Gift Card
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">To use on services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">With balance remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Received</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReceived}</div>
            <p className="text-xs text-muted-foreground">Gifts from others</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
            <p className="text-xs text-muted-foreground">Gifts to others</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Gift Cards</CardTitle>
            <CardDescription>Your active and past gift cards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Gift cards will be displayed here when gift_cards table is implemented */}

              {(!giftCards || giftCards.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No gift cards yet</p>
                  <p className="text-sm">Purchase a gift card to treat someone special!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Purchase</CardTitle>
              <CardDescription>Send a gift card instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline">$25</Button>
                <Button variant="outline">$50</Button>
                <Button variant="outline">$75</Button>
                <Button variant="outline">$100</Button>
              </div>
              
              <div>
                <Input 
                  placeholder="Custom amount" 
                  type="number"
                  min="10"
                  max="500"
                />
              </div>

              <div>
                <Input 
                  placeholder="Recipient email" 
                  type="email"
                />
              </div>

              <div>
                <Input 
                  placeholder="Personal message (optional)" 
                />
              </div>

              <Button className="w-full">
                <Gift className="h-4 w-4 mr-2" />
                Purchase & Send
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redeem a Card</CardTitle>
              <CardDescription>Enter a gift card code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                placeholder="Enter gift card code" 
                className="font-mono"
              />
              <Button className="w-full">Redeem Card</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gift Card Terms</CardTitle>
              <CardDescription>Important information</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Gift cards never expire</li>
                <li>• Can be used for any service</li>
                <li>• Non-refundable and non-transferable</li>
                <li>• Balance can be used across multiple visits</li>
                <li>• Cannot be redeemed for cash</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}