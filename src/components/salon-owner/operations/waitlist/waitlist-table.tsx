"use client"
import { useState, useEffect } from "react"
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { 
  Users, 
  Clock, 
  Calendar, 
  Phone, 
  Mail, 
  MoreVertical,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Bell
} from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/database/supabase/client"
import { toast } from "sonner"
type WaitlistEntry = {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceRequested: string
  preferredStaff?: string
  preferredDate?: string
  preferredTime?: string
  flexibleSchedule: boolean
  addedAt: string
  position: number
  status: 'waiting' | 'contacted' | 'booked' | 'cancelled' | 'expired'
  notes?: string
  lastContactedAt?: string
  estimatedWaitTime?: string
}
export function WaitlistTable() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [_loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, _setFilterStatus] = useState<string>("all")
  useEffect(() => {
    fetchWaitlist()
  }, [])
  async function fetchWaitlist() {
    try {
      const supabase = createClient()
      
      // Get current user's salon
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to view waitlist")
        return
      }

      // Fetch salon owner's salon
      const { data: salonData } = await supabase
        .from('salon_owners')
        .select('salon_id')
        .eq('user_id', user.id)
        .single()

      if (!salonData) {
        toast.error("No salon found for this user")
        return
      }

      // Fetch waitlist entries for the salon
      const { data: waitlistData, error } = await supabase
        .from('waitlist_entries')
        .select(`
          id,
          position,
          status,
          joined_at,
          preferred_date,
          preferred_time,
          flexible_schedule,
          notes,
          contacted_at,
          estimated_wait_minutes,
          customer:customer_id (
            id,
            name,
            email,
            phone
          ),
          service:service_id (
            id,
            name
          ),
          staff:staff_member_id (
            id,
            name
          )
        `)
        .eq('salon_id', salonData.salon_id)
        .order('position', { ascending: true })

      if (error) {
        toast.error('Failed to load waitlist')
        return
      }

      // Format waitlist entries
      const formattedWaitlist: WaitlistEntry[] = (waitlistData || []).map(entry => ({
        id: entry.id,
        customerName: entry.customer?.name || 'Unknown',
        customerEmail: entry.customer?.email || '',
        customerPhone: entry.customer?.phone || '',
        serviceRequested: entry.service?.name || 'Service',
        preferredStaff: entry.staff?.name,
        preferredDate: entry.preferred_date,
        preferredTime: entry.preferred_time,
        flexibleSchedule: entry.flexible_schedule || false,
        addedAt: entry.joined_at,
        position: entry.position,
        status: entry.status,
        notes: entry.notes,
        lastContactedAt: entry.contacted_at,
        estimatedWaitTime: entry.estimated_wait_minutes 
          ? `${Math.floor(entry.estimated_wait_minutes / 1440)} days` 
          : undefined
      }))

      setWaitlist(formattedWaitlist)
    } catch (_error) {
      toast.error("Failed to load waitlist")
    } finally {
      setLoading(false)
    }
  }
  const handleNotifyCustomer = async (entry: WaitlistEntry) => {
    try {
      // Send notification logic
      toast.success(`Notification sent to ${entry.customerName}`)
      // Update status
      setWaitlist(waitlist.map(item => 
        item.id === entry.id 
          ? { ...item, status: 'contacted', lastContactedAt: new Date().toISOString() }
          : item
      ))
    } catch (_error) {
      toast.error("Failed to send notification")
    }
  }
  const handleBookAppointment = async (entry: WaitlistEntry) => {
    try {
      // Create appointment logic
      toast.success(`Appointment booked for ${entry.customerName}`)
      // Update status
      setWaitlist(waitlist.map(item => 
        item.id === entry.id 
          ? { ...item, status: 'booked' }
          : item
      ))
    } catch (_error) {
      toast.error("Failed to book appointment")
    }
  }
  const handleRemoveFromWaitlist = async (entryId: string) => {
    try {
      setWaitlist(waitlist.filter(item => item.id !== entryId))
      toast.success("Removed from waitlist")
    } catch (_error) {
      toast.error("Failed to remove from waitlist")
    }
  }
  const filteredWaitlist = waitlist.filter(entry => {
    const matchesSearch = entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.serviceRequested.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || entry.status === filterStatus
    return matchesSearch && matchesFilter
  })
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Waiting</Badge>
      case 'contacted':
        return <Badge variant="secondary"><Phone className="h-3 w-3 mr-1" />Contacted</Badge>
      case 'booked':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Booked</Badge>
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case 'expired':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  const stats = {
    total: waitlist.length,
    waiting: waitlist.filter(e => e.status === 'waiting').length,
    contacted: waitlist.filter(e => e.status === 'contacted').length,
    booked: waitlist.filter(e => e.status === 'booked').length
  }
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Waiting</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Customers on waitlist</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waiting}</div>
            <p className="text-xs text-muted-foreground">Not yet contacted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacted}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Booked</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.booked}</div>
            <p className="text-xs text-muted-foreground">Successfully booked</p>
          </CardContent>
        </Card>
      </div>
      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Waitlist</CardTitle>
              <CardDescription>Manage customers waiting for appointments</CardDescription>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add to Waitlist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Entries</TabsTrigger>
                <TabsTrigger value="waiting">Waiting</TabsTrigger>
                <TabsTrigger value="contacted">Contacted</TabsTrigger>
                <TabsTrigger value="booked">Booked</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search waitlist..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Preferred Date/Time</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Wait Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWaitlist.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.position}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.customerName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {entry.customerEmail}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {entry.customerPhone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.serviceRequested}</p>
                            {entry.preferredStaff && (
                              <p className="text-xs text-muted-foreground">
                                Staff: {entry.preferredStaff}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.preferredDate ? (
                            <div>
                              <p className="text-sm">{format(new Date(entry.preferredDate), 'MMM d, yyyy')}</p>
                              {entry.preferredTime && (
                                <p className="text-xs text-muted-foreground">{entry.preferredTime}</p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">Flexible</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{format(new Date(entry.addedAt), 'MMM d')}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.addedAt), 'h:mm a')}
                          </p>
                        </TableCell>
                        <TableCell>
                          {entry.estimatedWaitTime && (
                            <Badge variant="secondary">{entry.estimatedWaitTime}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleNotifyCustomer(entry)}>
                                <Bell className="h-4 w-4 mr-2" />
                                Notify Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBookAppointment(entry)}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Book Appointment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleRemoveFromWaitlist(entry.id)}
                                className="text-destructive"
                              >
                                Remove from Waitlist
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}