import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Badge } from "@/components/ui"
import { Star, TrendingUp, Users, DollarSign, Clock, Award, Target, Calendar } from "lucide-react"

export default async function StaffPerformancePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get staff profile
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      profiles (full_name, email),
      salons (name)
    `)
    .eq("user_id", user.id)
    .single()

  if (!staffProfile) redirect("/error-403")

  // Get performance metrics
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: appointments } = await supabase
    .from("appointments")
    .select("*, services (name, price)")
    .eq("staff_id", staffProfile.id)
    .gte("appointment_date", thirtyDaysAgo.toISOString().split("T")[0])

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("staff_id", staffProfile.id)
    .gte("created_at", thirtyDaysAgo.toISOString())

  // Calculate metrics
  const completedAppointments = appointments?.filter(a => a.status === "completed").length || 0
  const totalRevenue = appointments?.filter(a => a.status === "completed")
    .reduce((sum, a) => sum + (a.total_amount || 0), 0) || 0
  const avgRating = reviews?.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0
  const utilization = Math.min(100, (completedAppointments / 60) * 100) // Assuming 60 appointments/month is 100%

  // Monthly goals
  const goals = {
    appointments: { target: 60, current: completedAppointments },
    revenue: { target: 5000, current: totalRevenue },
    rating: { target: 4.5, current: avgRating },
    utilization: { target: 80, current: utilization }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Performance</h1>
        <p className="text-muted-foreground">Track your performance metrics and goals</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAppointments}</div>
            <p className="text-xs text-muted-foreground">This month</p>
            <Progress 
              value={(completedAppointments / goals.appointments.target) * 100} 
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Generated this month</p>
            <Progress 
              value={(totalRevenue / goals.revenue.target) * 100} 
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {avgRating.toFixed(1)}
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-muted-foreground">Average rating</p>
            <Progress 
              value={(avgRating / 5) * 100} 
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilization.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Time booked</p>
            <Progress 
              value={utilization} 
              className="mt-2 h-1"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Goals</CardTitle>
            <CardDescription>Track your progress toward monthly targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Appointments</span>
                <span className="text-sm text-muted-foreground">
                  {goals.appointments.current} / {goals.appointments.target}
                </span>
              </div>
              <Progress value={(goals.appointments.current / goals.appointments.target) * 100} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Revenue</span>
                <span className="text-sm text-muted-foreground">
                  ${goals.revenue.current} / ${goals.revenue.target}
                </span>
              </div>
              <Progress value={(goals.revenue.current / goals.revenue.target) * 100} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Customer Rating</span>
                <span className="text-sm text-muted-foreground">
                  {goals.rating.current.toFixed(1)} / {goals.rating.target}
                </span>
              </div>
              <Progress value={(goals.rating.current / goals.rating.target) * 100} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Utilization Rate</span>
                <span className="text-sm text-muted-foreground">
                  {goals.utilization.current.toFixed(0)}% / {goals.utilization.target}%
                </span>
              </div>
              <Progress value={(goals.utilization.current / goals.utilization.target) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Customer feedback from your appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews?.slice(0, 5).map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${
                            i < review.rating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No reviews yet this month</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
            <CardDescription>Your most performed services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments && Object.entries(
                appointments.reduce((acc, apt) => {
                  const service = apt.services?.name || "Unknown"
                  acc[service] = (acc[service] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([service, count]) => (
                  <div key={service} className="flex justify-between items-center">
                    <span className="text-sm">{service}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Recognition and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Top Performer</p>
                  <p className="text-xs text-muted-foreground">November 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">5-Star Streak</p>
                  <p className="text-xs text-muted-foreground">10 reviews in a row</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Goal Crusher</p>
                  <p className="text-xs text-muted-foreground">Exceeded monthly target</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improvement Tips</CardTitle>
            <CardDescription>Suggestions to boost performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p>Consider upselling add-on services to increase average ticket</p>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p>Build client relationships to improve rebooking rate</p>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p>Optimize appointment timing to reduce gaps in schedule</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}