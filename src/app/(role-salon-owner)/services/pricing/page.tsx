import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, Input, Label } from "@/components/ui"
import { DollarSign, TrendingUp, TrendingDown, Edit } from "lucide-react"

export default async function ServicesPricingPage() {
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

  // Get services with categories
  const { data: services } = await supabase
    .from("services")
    .select(`
      *,
      service_categories (name)
    `)
    .eq("salon_id", userRole.salon_id)
    .order("category_id", { ascending: true })
    .order("display_order", { ascending: true })

  // Calculate pricing stats
  const avgPrice = services?.reduce((sum, s) => sum + (s.price || 0), 0) / (services?.length || 1) || 0
  const minPrice = Math.min(...(services?.map(s => s.price || 0) || [0]))
  const maxPrice = Math.max(...(services?.map(s => s.price || 0) || [0]))

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Service Pricing</h1>
          <p className="text-muted-foreground">Manage pricing for all services</p>
        </div>
        <Button>Update All Prices</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Price</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${minPrice.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${maxPrice.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Price Adjustment</CardTitle>
          <CardDescription>Apply percentage or fixed amount changes to all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <select className="w-full rounded-md border px-3 py-2">
                <option>Percentage Increase</option>
                <option>Percentage Decrease</option>
                <option>Fixed Amount Increase</option>
                <option>Fixed Amount Decrease</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="Enter amount" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">Apply to All Services</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
          <CardDescription>Individual service prices and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>New Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services?.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.service_categories?.name || "Uncategorized"}</TableCell>
                  <TableCell>{service.duration} min</TableCell>
                  <TableCell className="font-mono">${service.price?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      defaultValue={service.price}
                      className="w-24"
                      step="0.01"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Rules</CardTitle>
          <CardDescription>Set up dynamic pricing rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">Peak Hours Pricing</p>
                <p className="text-sm text-muted-foreground">
                  Increase prices during peak hours (5pm-8pm weekdays)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">+15%</span>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">Weekend Premium</p>
                <p className="text-sm text-muted-foreground">
                  Apply premium pricing for weekend appointments
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">+10%</span>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">Last-Minute Discount</p>
                <p className="text-sm text-muted-foreground">
                  Offer discounts for same-day bookings to fill empty slots
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">-20%</span>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}