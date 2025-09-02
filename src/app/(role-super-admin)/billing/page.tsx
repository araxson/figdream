import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { DollarSign, CreditCard, TrendingUp, AlertCircle } from "lucide-react"

export default async function BillingPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .single()

  if (!userRole) redirect("/error-403")

  // Get billing data
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select(`
      *,
      salons (name, owner_id),
      profiles!subscriptions_user_id_fkey (full_name, email)
    `)
    .order("created_at", { ascending: false })

  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      profiles (full_name, email),
      salons (name)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  // Calculate metrics
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active") || []
  const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => sum + (sub.price_amount || 0), 0)
  const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
  const pendingPayments = payments?.filter(p => p.status === "pending")?.length || 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground">Manage subscriptions and payment processing</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {subscriptions?.length || 0} total subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
              <CardDescription>All active platform subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salon</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions?.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        {subscription.salons?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{subscription.profiles?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {subscription.profiles?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{subscription.plan_name}</TableCell>
                      <TableCell>${subscription.price_amount?.toFixed(2)}/mo</TableCell>
                      <TableCell>
                        <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscription.current_period_end 
                          ? new Date(subscription.current_period_end).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Salon</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{payment.profiles?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.profiles?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.salons?.name || "N/A"}</TableCell>
                      <TableCell>${payment.amount?.toFixed(2)}</TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            payment.status === "completed" ? "default" :
                            payment.status === "pending" ? "secondary" :
                            "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Generated invoices for subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No invoices to display
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <CardTitle>Refunds</CardTitle>
              <CardDescription>Processed and pending refunds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No refunds to display
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}