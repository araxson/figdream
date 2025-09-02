import { createClient } from "@/lib/database/supabase/server"
import { redirect } from "next/navigation"
import { 
  getLocationManagerData, 
  getLocationStaff 
} from "@/lib/data-access/location-manager"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui"
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  Award,
  DollarSign,
  Clock,
  UserCheck
} from "lucide-react"
import { format } from "date-fns"

export default async function LocationStaffPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login/location-manager")
  }
  
  // Get location manager's data and staff
  let locationData
  let staff
  
  try {
    locationData = await getLocationManagerData(user.id)
    staff = await getLocationStaff(locationData.locationId)
  } catch (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Error: Unable to load staff data. {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
  
  // Calculate staff statistics
  const activeStaff = staff.filter(s => s.is_active)
  const bookableStaff = staff.filter(s => s.is_bookable)
  const averageCommission = staff.length > 0
    ? staff.reduce((sum, s) => sum + (s.commission_rate || 0), 0) / staff.length
    : 0
  
  // Get today's appointments for each staff member
  const today = new Date()
  const { data: todaysAppointments } = await supabase
    .from('appointments')
    .select('staff_id, status')
    .eq('location_id', locationData.locationId)
    .gte('start_time', today.toISOString().split('T')[0])
    .lt('start_time', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  
  const staffAppointmentCounts = new Map<string, number>()
  todaysAppointments?.forEach(apt => {
    if (apt.staff_id) {
      staffAppointmentCounts.set(
        apt.staff_id, 
        (staffAppointmentCounts.get(apt.staff_id) || 0) + 1
      )
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground">
          View and manage staff at {locationData.location.name}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
            <p className="text-xs text-muted-foreground">At this location</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStaff.length}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookable</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookableStaff.length}</div>
            <p className="text-xs text-muted-foreground">Available for appointments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCommission.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Commission rate</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Staff</TabsTrigger>
          <TabsTrigger value="active">Active Only</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>All staff assigned to this location</CardDescription>
            </CardHeader>
            <CardContent>
              {staff.length > 0 ? (
                <div className="space-y-4">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.profiles?.avatar_url || undefined} />
                          <AvatarFallback>
                            {member.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.profiles?.full_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{member.title || 'Staff Member'}</div>
                          <div className="flex items-center gap-4 mt-1">
                            {member.profiles?.email && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {member.profiles.email}
                              </div>
                            )}
                            {member.profiles?.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {member.profiles.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {staffAppointmentCounts.get(member.id) || 0} appointments today
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Hired {member.hire_date ? format(new Date(member.hire_date), 'MMM d, yyyy') : 'Unknown'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {member.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                          {member.is_bookable && (
                            <Badge variant="secondary">Bookable</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No staff members</h3>
                  <p className="text-muted-foreground">
                    No staff members are assigned to this location.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Staff</CardTitle>
              <CardDescription>Currently active staff members</CardDescription>
            </CardHeader>
            <CardContent>
              {activeStaff.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Today's Appointments</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeStaff.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.profiles?.avatar_url || undefined} />
                              <AvatarFallback>
                                {member.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{member.profiles?.full_name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{member.title || 'Staff Member'}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {member.profiles?.email && (
                              <div className="text-sm">{member.profiles.email}</div>
                            )}
                            {member.profiles?.phone && (
                              <div className="text-sm text-muted-foreground">{member.profiles.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {staffAppointmentCounts.get(member.id) || 0}
                          </div>
                        </TableCell>
                        <TableCell>{member.commission_rate}%</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Badge variant="default">Active</Badge>
                            {member.is_bookable && (
                              <Badge variant="secondary">Bookable</Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No active staff</h3>
                  <p className="text-muted-foreground">
                    No active staff members at this location.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>Today's performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {staff.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead className="text-center">Appointments</TableHead>
                      <TableHead className="text-center">Utilization</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead>Experience</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staff.map((member) => {
                      const appointmentCount = staffAppointmentCounts.get(member.id) || 0
                      const utilization = appointmentCount > 0 ? Math.min(100, (appointmentCount / 8) * 100) : 0
                      const experience = member.hire_date 
                        ? Math.floor((new Date().getTime() - new Date(member.hire_date).getTime()) / (1000 * 60 * 60 * 24 * 365))
                        : 0
                      
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.profiles?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {member.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{member.profiles?.full_name || 'Unknown'}</div>
                                <div className="text-sm text-muted-foreground">{member.title}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="font-medium">{appointmentCount}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="font-medium">{utilization.toFixed(0)}%</div>
                              {utilization > 75 && <Badge variant="default" className="text-xs">High</Badge>}
                              {utilization > 0 && utilization <= 25 && <Badge variant="outline" className="text-xs">Low</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>{member.commission_rate}%</TableCell>
                          <TableCell>
                            {experience > 0 ? `${experience} year${experience > 1 ? 's' : ''}` : 'New'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No performance data</h3>
                  <p className="text-muted-foreground">
                    No staff members to show performance for.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}