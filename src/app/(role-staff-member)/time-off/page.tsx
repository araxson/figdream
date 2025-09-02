import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge } from "@/components/ui"
import { Calendar, Clock, Plus, CalendarOff } from "lucide-react"

export default async function StaffTimeOffPage() {
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

  // Get time off requests
  const { data: timeOffRequests } = await supabase
    .from("time_off_requests")
    .select("*")
    .eq("staff_id", staffProfile.id)
    .order("start_date", { ascending: false })

  // Calculate time off stats
  const currentYear = new Date().getFullYear()
  const yearRequests = timeOffRequests?.filter(r => 
    new Date(r.start_date).getFullYear() === currentYear
  ) || []
  
  const approvedDays = yearRequests
    .filter(r => r.status === "approved")
    .reduce((sum, r) => {
      const start = new Date(r.start_date)
      const end = new Date(r.end_date)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return sum + days
    }, 0)

  const pendingRequests = timeOffRequests?.filter(r => r.status === "pending").length || 0
  const upcomingRequests = timeOffRequests?.filter(r => 
    r.status === "approved" && new Date(r.start_date) > new Date()
  ).length || 0

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Time Off Requests</h1>
          <p className="text-muted-foreground">Manage your time off and vacation requests</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Time Off
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Taken</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedDays}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
            <CalendarOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{21 - approvedDays}</div>
            <p className="text-xs text-muted-foreground">Of 21 days total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingRequests}</div>
            <p className="text-xs text-muted-foreground">Approved time off</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Time Off History</CardTitle>
          <CardDescription>Your time off requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeOffRequests?.map((request) => {
                const start = new Date(request.start_date)
                const end = new Date(request.end_date)
                const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
                
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.request_type}</Badge>
                    </TableCell>
                    <TableCell>{start.toLocaleDateString()}</TableCell>
                    <TableCell>{end.toLocaleDateString()}</TableCell>
                    <TableCell>{days}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {request.reason || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        request.status === "approved" ? "default" :
                        request.status === "pending" ? "secondary" :
                        "destructive"
                      }>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === "pending" && (
                        <Button size="sm" variant="ghost">Cancel</Button>
                      )}
                      {request.status === "approved" && new Date(request.start_date) > new Date() && (
                        <Button size="sm" variant="ghost">Modify</Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Time Off Policy</CardTitle>
            <CardDescription>Your time off allowances and policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Annual Leave</span>
                <span className="font-medium">21 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sick Leave</span>
                <span className="font-medium">10 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Personal Days</span>
                <span className="font-medium">3 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Carry Over</span>
                <span className="font-medium">5 days maximum</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Time off requests must be submitted at least 2 weeks in advance for vacation 
                  and 48 hours for personal days, except in emergencies.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
            <CardDescription>Salon holidays and closures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">New Year's Day</p>
                  <p className="text-xs text-muted-foreground">Monday, January 1</p>
                </div>
                <Badge>Closed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Memorial Day</p>
                  <p className="text-xs text-muted-foreground">Monday, May 27</p>
                </div>
                <Badge>Closed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Independence Day</p>
                  <p className="text-xs text-muted-foreground">Thursday, July 4</p>
                </div>
                <Badge>Closed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Thanksgiving</p>
                  <p className="text-xs text-muted-foreground">Thursday, November 28</p>
                </div>
                <Badge>Closed</Badge>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Christmas Day</p>
                  <p className="text-xs text-muted-foreground">Wednesday, December 25</p>
                </div>
                <Badge>Closed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}