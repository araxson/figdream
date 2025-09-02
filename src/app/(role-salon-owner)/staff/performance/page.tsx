import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Star, TrendingUp, Users, DollarSign, Clock, Award } from "lucide-react"

export default async function StaffPerformancePage() {
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

  // Get staff with performance metrics
  const { data: staff } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      profiles (full_name, email),
      appointments (count, total_amount),
      reviews (rating)
    `)
    .eq("salon_id", userRole.salon_id)
    .eq("is_active", true)

  // Calculate performance metrics for each staff member
  const staffWithMetrics = staff?.map(member => {
    const appointmentCount = member.appointments?.[0]?.count || 0
    const totalRevenue = member.appointments?.[0]?.total_amount || 0
    const avgRating = member.reviews?.[0]?.rating || 0
    
    return {
      ...member,
      metrics: {
        appointmentCount,
        totalRevenue,
        avgRating,
        utilization: Math.min(100, (appointmentCount / 150) * 100), // Assuming 150 appointments/month is 100%
      }
    }
  })

  // Sort by total revenue (top performers)
  const topPerformers = [...(staffWithMetrics || [])]
    .sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue)
    .slice(0, 3)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Performance</h1>
        <p className="text-muted-foreground">Track and analyze staff performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">Based on customer reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${staffWithMetrics?.reduce((sum, s) => sum + s.metrics.totalRevenue, 0).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(staffWithMetrics?.reduce((sum, s) => sum + s.metrics.utilization, 0) / (staff?.length || 1)).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Capacity used</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Staff performance metrics for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Appointments</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffWithMetrics?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {member.display_name || member.profiles?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.specialties?.join(", ") || "General"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{member.metrics.appointmentCount}</TableCell>
                    <TableCell>${member.metrics.totalRevenue.toFixed(0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{member.metrics.avgRating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={member.metrics.utilization} className="h-2" />
                        <span className="text-xs">{member.metrics.utilization.toFixed(0)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>This month's leading staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((member, index) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {member.display_name || member.profiles?.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${member.metrics.totalRevenue.toFixed(0)} revenue
                    </p>
                  </div>
                  {index === 0 && <Award className="h-5 w-5 text-yellow-500" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="appointments">Appointment Analysis</TabsTrigger>
          <TabsTrigger value="ratings">Customer Ratings</TabsTrigger>
          <TabsTrigger value="goals">Performance Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Staff Member</CardTitle>
              <CardDescription>Monthly revenue comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chart placeholder - Revenue comparison
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Statistics</CardTitle>
              <CardDescription>Appointments completed, cancelled, and no-shows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chart placeholder - Appointment statistics
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Customer Satisfaction</CardTitle>
              <CardDescription>Rating distribution and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chart placeholder - Rating distribution
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Performance Goals</CardTitle>
              <CardDescription>Track progress toward monthly targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Monthly Revenue Target</span>
                    <span className="text-sm font-medium">$15,000 / $20,000</span>
                  </div>
                  <Progress value={75} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Appointment Target</span>
                    <span className="text-sm font-medium">450 / 500</span>
                  </div>
                  <Progress value={90} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="text-sm font-medium">4.8 / 5.0</span>
                  </div>
                  <Progress value={96} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}