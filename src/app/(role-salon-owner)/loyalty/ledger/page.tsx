import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Input } from "@/components/ui"
import { Gift, Plus, Minus, ArrowUpDown, Search } from "lucide-react"

export default async function LoyaltyLedgerPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("*, salons (*)")
    .eq("user_id", user.id)
    .eq("role", "salon_owner")
    .single()

  if (!userRole) redirect("/error-403")

  // Get loyalty transactions
  const { data: transactions } = await supabase
    .from("loyalty_transactions")
    .select(`
      *,
      customers (profiles (full_name, email)),
      appointments (services (name))
    `)
    .eq("salon_id", userRole.salon_id)
    .order("created_at", { ascending: false })
    .limit(100)

  // Get customer points balances
  const { data: loyaltyAccounts } = await supabase
    .from("loyalty_accounts")
    .select(`
      *,
      customers (profiles (full_name, email))
    `)
    .eq("salon_id", userRole.salon_id)
    .order("current_points", { ascending: false })

  // Calculate totals
  const totalPointsIssued = transactions?.filter(t => t.points_change > 0)
    .reduce((sum, t) => sum + t.points_change, 0) || 0
  const totalPointsRedeemed = Math.abs(transactions?.filter(t => t.points_change < 0)
    .reduce((sum, t) => sum + t.points_change, 0) || 0)
  const totalActivePoints = loyaltyAccounts?.reduce((sum, acc) => sum + acc.current_points, 0) || 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Points Ledger</h1>
          <p className="text-muted-foreground">Track all loyalty points transactions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Manual Adjustment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActivePoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Issued</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsIssued.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPointsRedeemed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyAccounts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">With points balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Transactions</CardTitle>
          <CardDescription>Find specific loyalty transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Search by customer name or transaction ID..." 
              className="flex-1"
            />
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest points activity</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {transaction.customers?.profiles?.full_name || "Guest"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.transaction_type === "earned" ? "default" :
                        transaction.transaction_type === "redeemed" ? "secondary" :
                        "outline"
                      }>
                        {transaction.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.description || 
                       transaction.appointments?.services?.name ||
                       "Manual adjustment"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={transaction.points_change > 0 ? "text-green-600" : "text-red-600"}>
                        {transaction.points_change > 0 ? "+" : ""}{transaction.points_change}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.balance_after}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Point Holders</CardTitle>
            <CardDescription>Customers with highest balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loyaltyAccounts?.slice(0, 5).map((account, index) => (
                <div key={account.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {account.customers?.profiles?.full_name || "Guest"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {account.customers?.profiles?.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{account.current_points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Points Summary by Type</CardTitle>
          <CardDescription>Breakdown of points transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Service Purchases</p>
              <p className="text-2xl font-bold">
                {transactions?.filter(t => t.transaction_type === "earned" && t.appointment_id)
                  .reduce((sum, t) => sum + t.points_change, 0) || 0}
              </p>
              <p className="text-xs text-muted-foreground">Points earned from services</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Rewards Redeemed</p>
              <p className="text-2xl font-bold">
                {Math.abs(transactions?.filter(t => t.transaction_type === "redeemed")
                  .reduce((sum, t) => sum + t.points_change, 0) || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Points used for rewards</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Manual Adjustments</p>
              <p className="text-2xl font-bold">
                {transactions?.filter(t => t.transaction_type === "adjustment")
                  .reduce((sum, t) => sum + Math.abs(t.points_change), 0) || 0}
              </p>
              <p className="text-xs text-muted-foreground">Admin adjustments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}