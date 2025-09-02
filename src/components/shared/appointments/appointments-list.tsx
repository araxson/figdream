"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, User, MapPin, Search, Filter, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { hasPermission } from "@/lib/permissions"
import type { Database } from "@/types/database.types"

type UserRole = Database["public"]["Enums"]["user_role_type"]
type AppointmentStatus = Database["public"]["Enums"]["appointment_status"]

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  total_price: number
  notes?: string
  created_at: string
  customers?: {
    profiles?: {
      full_name: string
      email: string
      phone?: string
    }
  }
  staff_profiles?: {
    display_name: string
    profiles?: {
      full_name: string
    }
  }
  services?: {
    name: string
    duration: number
    price: number
  }
  salon_locations?: {
    name: string
    address: string
  }
}

interface AppointmentsListProps {
  appointments: Appointment[]
  userRole: UserRole
  onView?: (appointment: Appointment) => void
  onEdit?: (appointment: Appointment) => void
  onCancel?: (appointment: Appointment) => void
  onReschedule?: (appointment: Appointment) => void
  onDelete?: (appointment: Appointment) => void
  showCustomer?: boolean
  showStaff?: boolean
  showLocation?: boolean
  title?: string
  description?: string
}

export function AppointmentsList({
  appointments,
  userRole,
  onView,
  onEdit,
  onCancel,
  onReschedule,
  onDelete,
  showCustomer = true,
  showStaff = true,
  showLocation = false,
  title = "Appointments",
  description = "Manage your appointments"
}: AppointmentsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === "" || 
      appointment.customers?.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.services?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.staff_profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    const matchesDate = dateFilter === "all" || (() => {
      const appointmentDate = new Date(appointment.appointment_date)
      const today = new Date()
      
      switch (dateFilter) {
        case "today":
          return appointmentDate.toDateString() === today.toDateString()
        case "week":
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          return appointmentDate >= today && appointmentDate <= weekFromNow
        case "month":
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
          return appointmentDate >= today && appointmentDate <= monthFromNow
        default:
          return true
      }
    })()

    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed": return "default"
      case "pending": return "secondary"
      case "completed": return "success"
      case "cancelled": return "destructive"
      case "no_show": return "warning"
      default: return "outline"
    }
  }

  const canViewAll = hasPermission(userRole, "appointments.view_all")
  const canEditAll = hasPermission(userRole, "appointments.edit_all")
  const canCancelAll = hasPermission(userRole, "appointments.cancel_all")
  const canRescheduleAll = hasPermission(userRole, "appointments.reschedule_all")
  const canDeleteAll = hasPermission(userRole, "appointments.delete_all")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {hasPermission(userRole, "appointments.create") && (
            <Button>New Appointment</Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as "all" | "today" | "week" | "month")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  {showCustomer && <TableHead>Customer</TableHead>}
                  <TableHead>Service</TableHead>
                  {showStaff && <TableHead>Staff</TableHead>}
                  {showLocation && <TableHead>Location</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7 + (showCustomer ? 1 : 0) + (showStaff ? 1 : 0) + (showLocation ? 1 : 0)} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Calendar className="mx-auto h-12 w-12 mb-3 opacity-50" />
                        <p>No appointments found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.appointment_time}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      {showCustomer && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {appointment.customers?.profiles?.full_name || "Unknown"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.customers?.profiles?.phone || "No phone"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.services?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {appointment.services?.duration} min
                          </p>
                        </div>
                      </TableCell>
                      {showStaff && (
                        <TableCell>
                          {appointment.staff_profiles?.display_name || 
                           appointment.staff_profiles?.profiles?.full_name || 
                           "Unassigned"}
                        </TableCell>
                      )}
                      {showLocation && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {appointment.salon_locations?.name || "Main Location"}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${appointment.total_price?.toFixed(2) || appointment.services?.price?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {onView && (
                              <DropdownMenuItem onClick={() => onView(appointment)}>
                                View Details
                              </DropdownMenuItem>
                            )}
                            {onEdit && (canEditAll || userRole === "customer") && (
                              <DropdownMenuItem onClick={() => onEdit(appointment)}>
                                Edit Appointment
                              </DropdownMenuItem>
                            )}
                            {onReschedule && (canRescheduleAll || userRole === "customer") && (
                              <DropdownMenuItem onClick={() => onReschedule(appointment)}>
                                Reschedule
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {onCancel && appointment.status !== "cancelled" && (canCancelAll || userRole === "customer") && (
                              <DropdownMenuItem 
                                onClick={() => onCancel(appointment)}
                                className="text-destructive"
                              >
                                Cancel Appointment
                              </DropdownMenuItem>
                            )}
                            {onDelete && canDeleteAll && (
                              <DropdownMenuItem 
                                onClick={() => onDelete(appointment)}
                                className="text-destructive"
                              >
                                Delete Appointment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}