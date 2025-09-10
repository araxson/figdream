'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Calendar,
  Clock,
  MapPin,
  MoreVertical,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  PhoneCall,
  MessageSquare,
  CalendarX,
  CalendarCheck,
  Timer,
  Scissors
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns'

interface Appointment {
  id: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  computed_total_price: number
  computed_total_duration: number
  staff?: {
    full_name: string
    avatar_url?: string
  }
  customer?: {
    first_name: string
    last_name: string
    phone?: string
  }
  salon?: {
    name: string
    address?: string
  }
  services?: Array<{
    name: string
    price: number
    duration_minutes: number
  }>
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: AlertCircle,
    variant: 'secondary' as const,
    color: 'text-yellow-600'
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    variant: 'default' as const,
    color: 'text-green-600'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    variant: 'outline' as const,
    color: 'text-blue-600'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    variant: 'destructive' as const,
    color: 'text-red-600'
  },
  no_show: {
    label: 'No Show',
    icon: CalendarX,
    variant: 'destructive' as const,
    color: 'text-red-600'
  }
}

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const supabase = createClient()

  useEffect(() => {
    fetchAppointments()
  }, [activeTab])

  async function fetchAppointments() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('appointments')
        .select(`
          *,
          staff:profiles!appointments_staff_id_fkey(full_name, avatar_url),
          customers(first_name, last_name, phone),
          salons(name, address),
          appointment_services(
            services(name, price, duration_minutes)
          )
        `)
        .eq('customer_id', user.id)
        .order('start_time', { ascending: activeTab === 'upcoming' })

      if (activeTab === 'upcoming') {
        query = query.gte('start_time', new Date().toISOString())
          .in('status', ['pending', 'confirmed'])
      } else {
        query = query.lt('start_time', new Date().toISOString())
          .in('status', ['completed', 'cancelled', 'no_show'])
      }

      const { data, error } = await query.limit(20)
      
      if (error) throw error
      
      // Transform the data
      const transformedData = (data || []).map(apt => ({
        ...apt,
        services: apt.appointment_services?.map((as: any) => as.services).filter(Boolean) || []
      }))
      
      setAppointments(transformedData)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isThisWeek(date)) return format(date, 'EEEE')
    return format(date, 'MMM d, yyyy')
  }

  const EmptyState = ({ type }: { type: string }) => (
    <Card className={cn("border-dashed")}>
      <CardContent className={cn("flex flex-col items-center justify-center py-16")}>
        <div className={cn(
          "rounded-full bg-muted p-6 mb-4",
          "flex items-center justify-center"
        )}>
          {type === 'upcoming' ? (
            <CalendarCheck className={cn("h-12 w-12 text-muted-foreground")} />
          ) : (
            <Calendar className={cn("h-12 w-12 text-muted-foreground")} />
          )}
        </div>
        <h3 className={cn("text-lg font-semibold mb-2")}>
          No {type} appointments
        </h3>
        <p className={cn("text-sm text-muted-foreground text-center max-w-sm")}>
          {type === 'upcoming' 
            ? "You don't have any upcoming appointments. Book a new appointment to get started."
            : "You don't have any past appointments yet."
          }
        </p>
        {type === 'upcoming' && (
          <Button className={cn("mt-4")}>
            Book New Appointment
          </Button>
        )}
      </CardContent>
    </Card>
  )

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const status = statusConfig[appointment.status]
    const StatusIcon = status.icon
    const appointmentDate = new Date(appointment.start_time)
    const isPastAppointment = isPast(appointmentDate) && appointment.status !== 'completed'

    return (
      <Card className={cn(
        "transition-all hover:shadow-md",
        isPastAppointment && "opacity-60"
      )}>
        <CardContent className={cn("p-6")}>
          <div className={cn("flex items-start justify-between mb-4")}>
            <div className={cn("flex items-center gap-3")}>
              <Avatar className={cn("h-12 w-12")}>
                <AvatarImage src={appointment.staff?.avatar_url} />
                <AvatarFallback>
                  {appointment.staff?.full_name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className={cn("font-semibold")}>
                  {appointment.staff?.full_name || 'Staff Member'}
                </p>
                <p className={cn("text-sm text-muted-foreground")}>
                  {appointment.salon?.name}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-8 w-8")}>
                  <MoreVertical className={cn("h-4 w-4")} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {appointment.status === 'confirmed' && (
                  <>
                    <DropdownMenuItem>
                      <CalendarCheck className={cn("mr-2 h-4 w-4")} />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem className={cn("text-destructive")}>
                      <CalendarX className={cn("mr-2 h-4 w-4")} />
                      Cancel Appointment
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem>
                  <PhoneCall className={cn("mr-2 h-4 w-4")} />
                  Call Salon
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className={cn("mr-2 h-4 w-4")} />
                  Message Staff
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className={cn("space-y-3")}>
            {/* Date and Time */}
            <div className={cn("flex items-center gap-6 text-sm")}>
              <div className={cn("flex items-center gap-2")}>
                <Calendar className={cn("h-4 w-4 text-muted-foreground")} />
                <span className={cn("font-medium")}>
                  {getTimeLabel(appointment.start_time)}
                </span>
              </div>
              <div className={cn("flex items-center gap-2")}>
                <Clock className={cn("h-4 w-4 text-muted-foreground")} />
                <span>
                  {format(appointmentDate, 'h:mm a')}
                </span>
              </div>
              <div className={cn("flex items-center gap-2")}>
                <Timer className={cn("h-4 w-4 text-muted-foreground")} />
                <span>{appointment.computed_total_duration} min</span>
              </div>
            </div>

            {/* Services */}
            {appointment.services && appointment.services.length > 0 && (
              <div className={cn("flex flex-wrap gap-2")}>
                {appointment.services.map((service, idx) => (
                  <Badge key={idx} variant="secondary" className={cn("gap-1")}>
                    <Scissors className={cn("h-3 w-3")} />
                    {service.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Location */}
            {appointment.salon?.address && (
              <div className={cn("flex items-center gap-2 text-sm text-muted-foreground")}>
                <MapPin className={cn("h-4 w-4")} />
                <span>{appointment.salon.address}</span>
              </div>
            )}

            {/* Footer */}
            <div className={cn("flex items-center justify-between pt-3 border-t")}>
              <div className={cn("flex items-center gap-2")}>
                <StatusIcon className={cn("h-4 w-4", status.color)} />
                <Badge variant={status.variant}>
                  {status.label}
                </Badge>
              </div>
              <div className={cn("flex items-center gap-2 text-sm font-semibold")}>
                <DollarSign className={cn("h-4 w-4 text-muted-foreground")} />
                ${appointment.computed_total_price}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
          <CardDescription>View and manage your appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-4")}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={cn("flex items-center space-x-4")}>
                <Skeleton className={cn("h-12 w-12 rounded-full")} />
                <div className={cn("space-y-2 flex-1")}>
                  <Skeleton className={cn("h-4 w-[200px]")} />
                  <Skeleton className={cn("h-4 w-[150px]")} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className={cn("flex items-center justify-between")}>
          <div>
            <CardTitle className={cn("text-2xl")}>Your Appointments</CardTitle>
            <CardDescription>
              View and manage all your salon appointments
            </CardDescription>
          </div>
          <Button>
            <Calendar className={cn("mr-2 h-4 w-4")} />
            Book New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={cn("grid w-full grid-cols-2")}>
            <TabsTrigger value="upcoming" className={cn("gap-2")}>
              <CalendarCheck className={cn("h-4 w-4")} />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className={cn("gap-2")}>
              <Calendar className={cn("h-4 w-4")} />
              Past
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className={cn("mt-6")}>
            {appointments.length === 0 ? (
              <EmptyState type="upcoming" />
            ) : (
              <ScrollArea className={cn("h-[600px] pr-4")}>
                <div className={cn("space-y-4")}>
                  {appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="past" className={cn("mt-6")}>
            {appointments.length === 0 ? (
              <EmptyState type="past" />
            ) : (
              <ScrollArea className={cn("h-[600px] pr-4")}>
                <div className={cn("space-y-4")}>
                  {appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}