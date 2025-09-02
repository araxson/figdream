import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui'
import { 
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter
} from 'lucide-react'
import TimeOffRequestDialog from '@/components/salon-owner/timeoff/timeoff-request-dialog'
import TimeOffApprovalActions from '@/components/salon-owner/timeoff/timeoff-approval-actions'

export default async function TimeOffManagementPage() {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's salon
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id, role')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.salon_id) {
    redirect('/401')
  }

  // Get time-off requests
  const { data: timeOffRequests } = await supabase
    .from('time_off_requests')
    .select(`
      *,
      staff_profiles (
        id,
        display_name,
        profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('salon_id', userRole.salon_id)
    .order('created_at', { ascending: false })

  // Categorize requests
  const pendingRequests = timeOffRequests?.filter(r => r.status === 'pending') || []
  const approvedRequests = timeOffRequests?.filter(r => r.status === 'approved') || []
  const deniedRequests = timeOffRequests?.filter(r => r.status === 'denied') || []
  
  // Get upcoming approved time off (next 30 days)
  const upcomingTimeOff = approvedRequests.filter(r => {
    const startDate = new Date(r.start_date)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return startDate >= now && startDate <= thirtyDaysFromNow
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'denied':
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    return `${start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })} - ${end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}`
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Time Off Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage staff time-off requests and schedules
          </p>
        </div>
        <TimeOffRequestDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Request Time Off
          </Button>
        </TimeOffRequestDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            {pendingRequests.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Requires approval
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Upcoming Time Off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTimeOff.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved This Month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvedRequests.filter(r => {
                const created = new Date(r.created_at)
                const now = new Date()
                return created.getMonth() === now.getMonth() && 
                       created.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Days Off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvedRequests.reduce((total, r) => 
                total + calculateDays(r.start_date, r.end_date), 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="denied">
            Denied ({deniedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="calendar">
            Calendar View
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length > 0 ? (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={request.staff_profiles?.profiles?.avatar_url} />
                          <AvatarFallback>
                            {request.staff_profiles?.profiles?.full_name?.[0] || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {request.staff_profiles?.profiles?.full_name || 'Staff Member'}
                            </p>
                            <Badge variant="secondary">
                              {getStatusIcon(request.status)}
                              <span className="ml-1">Pending</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateRange(request.start_date, request.end_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {calculateDays(request.start_date, request.end_date)} days
                            </span>
                          </div>
                          {request.reason && (
                            <p className="text-sm mt-2">{request.reason}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Requested {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {userRole.role === 'salon_owner' && (
                        <TimeOffApprovalActions requestId={request.id} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center space-y-2">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No pending requests</h3>
                <p className="text-muted-foreground">
                  All time-off requests have been processed
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Approved Requests */}
        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length > 0 ? (
            <div className="grid gap-4">
              {approvedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={request.staff_profiles?.profiles?.avatar_url} />
                          <AvatarFallback>
                            {request.staff_profiles?.profiles?.full_name?.[0] || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {request.staff_profiles?.profiles?.full_name || 'Staff Member'}
                            </p>
                            <Badge variant="outline" className="text-green-600">
                              {getStatusIcon(request.status)}
                              <span className="ml-1">Approved</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateRange(request.start_date, request.end_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {calculateDays(request.start_date, request.end_date)} days
                            </span>
                          </div>
                          {request.reason && (
                            <p className="text-sm mt-2">{request.reason}</p>
                          )}
                          {request.approved_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Approved {new Date(request.approved_at).toLocaleDateString()}
                              {request.approved_by && ' by Admin'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center space-y-2">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No approved requests</h3>
                <p className="text-muted-foreground">
                  No time-off requests have been approved yet
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Denied Requests */}
        <TabsContent value="denied" className="space-y-4">
          {deniedRequests.length > 0 ? (
            <div className="grid gap-4">
              {deniedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarImage src={request.staff_profiles?.profiles?.avatar_url} />
                          <AvatarFallback>
                            {request.staff_profiles?.profiles?.full_name?.[0] || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {request.staff_profiles?.profiles?.full_name || 'Staff Member'}
                            </p>
                            <Badge variant="destructive">
                              {getStatusIcon(request.status)}
                              <span className="ml-1">Denied</span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateRange(request.start_date, request.end_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {calculateDays(request.start_date, request.end_date)} days
                            </span>
                          </div>
                          {request.denial_reason && (
                            <div className="mt-2 p-2 bg-destructive/10 rounded">
                              <p className="text-sm text-destructive">
                                <span className="font-medium">Reason:</span> {request.denial_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center space-y-2">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No denied requests</h3>
                <p className="text-muted-foreground">
                  No time-off requests have been denied
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Calendar</CardTitle>
              <CardDescription>
                Visual overview of staff time off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Calendar view coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}