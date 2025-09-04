import { Database } from "@/types/database.types"
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from "date-fns"
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
type Appointment = Database['public']['Views']['location_appointments_view']['Row']
interface AppointmentsTableProps {
  appointments: Appointment[]
  showDate?: boolean
}
export function AppointmentsTable({ appointments, showDate = false }: AppointmentsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "outline" as const, icon: AlertCircle },
      confirmed: { label: "Confirmed", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "In Progress", variant: "secondary" as const, icon: Clock },
      completed: { label: "Completed", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
      no_show: { label: "No Show", variant: "destructive" as const, icon: XCircle }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Badge variant={config.variant} className="gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a')
  }
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showDate && <TableHead>Date</TableHead>}
          <TableHead>Time</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Staff</TableHead>
          <TableHead>Services</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            {showDate && (
              <TableCell>
                <div className="font-medium">
                  {formatDate(appointment.start_time)}
                </div>
              </TableCell>
            )}
            <TableCell>
              <div className="font-medium">
                {formatTime(appointment.start_time)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatTime(appointment.end_time)}
              </div>
            </TableCell>
            <TableCell>
              <div className="font-medium">
                {appointment.profiles?.full_name || 'Guest'}
              </div>
              <div className="text-sm text-muted-foreground">
                {appointment.profiles?.phone || appointment.profiles?.email || 'No contact'}
              </div>
            </TableCell>
            <TableCell>
              {appointment.staff_profiles?.profiles?.full_name || 'Unassigned'}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {appointment.appointment_services?.map((service: Database['public']['Tables']['appointment_services']['Row']) => (
                  <div key={service.id} className="text-sm">
                    {service.services?.name || 'Unknown Service'}
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {getStatusBadge(appointment.status)}
            </TableCell>
            <TableCell className="text-right font-medium">
              ${appointment.total_amount?.toFixed(2) || '0.00'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}