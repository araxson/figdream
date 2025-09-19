'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, Star, Filter, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AppointmentHistoryItem, AppointmentFilters } from '../../types'

interface AppointmentHistoryProps {
  appointments: AppointmentHistoryItem[]
  onLoadMore?: () => Promise<void>
  onViewDetails: (appointmentId: string) => void
  onDownloadReceipt?: (appointmentId: string) => Promise<void>
  hasMore?: boolean
  isLoading?: boolean
}

export function AppointmentHistory({
  appointments,
  onLoadMore,
  onViewDetails,
  onDownloadReceipt,
  hasMore = false,
  isLoading = false
}: AppointmentHistoryProps) {
  const [filters, setFilters] = useState<AppointmentFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: AppointmentHistoryItem['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: AppointmentHistoryItem['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const filteredAppointments = appointments.filter(appointment => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSalon = appointment.salonName.toLowerCase().includes(query)
      const matchesStaff = appointment.staffName?.toLowerCase().includes(query)
      const matchesServices = appointment.services.some(service =>
        service.name.toLowerCase().includes(query)
      )
      if (!matchesSalon && !matchesStaff && !matchesServices) {
        return false
      }
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(appointment.status)) {
        return false
      }
    }

    // Date range filter
    if (filters.dateRange) {
      const appointmentDate = appointment.date
      if (appointmentDate < filters.dateRange.start || appointmentDate > filters.dateRange.end) {
        return false
      }
    }

    return true
  })

  const AppointmentCard = ({ appointment }: { appointment: AppointmentHistoryItem }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {appointment.salonLogoUrl ? (
              <Avatar>
                <AvatarImage src={appointment.salonLogoUrl} alt={appointment.salonName} />
                <AvatarFallback>{getInitials(appointment.salonName)}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar>
                <AvatarFallback>{getInitials(appointment.salonName)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <CardTitle className="text-lg">{appointment.salonName}</CardTitle>
              <CardDescription>
                {formatDate(appointment.date)} at {appointment.time}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn('text-xs', getStatusColor(appointment.status))}>
              {appointment.status.replace('_', ' ')}
            </Badge>
            <Badge className={cn('text-xs', getPaymentStatusColor(appointment.paymentStatus))}>
              {appointment.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Services */}
        <div>
          <h4 className="font-medium text-sm mb-2">Services</h4>
          <div className="space-y-1">
            {appointment.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span>{service.name}</span>
                <span className="text-muted-foreground">${service.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Member */}
        {appointment.staffName && (
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={appointment.staffImageUrl} alt={appointment.staffName} />
              <AvatarFallback className="text-xs">
                {getInitials(appointment.staffName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">with {appointment.staffName}</span>
          </div>
        )}

        {/* Total and Duration */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{appointment.duration}min</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-foreground">${appointment.totalPrice}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {onDownloadReceipt && appointment.receiptUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadReceipt(appointment.id)}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(appointment.id)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        {(appointment.canReview || appointment.canCancel || appointment.canReschedule) && (
          <div className="flex gap-2 pt-2">
            {appointment.canReview && !appointment.hasReviewed && (
              <Button size="sm" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Review
              </Button>
            )}
            {appointment.canCancel && (
              <Button size="sm" variant="outline">
                Cancel
              </Button>
            )}
            {appointment.canReschedule && (
              <Button size="sm" variant="outline">
                Reschedule
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading && appointments.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Appointment History</h2>
          <p className="text-muted-foreground">
            View and manage your past and upcoming appointments
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Appointments</SheetTitle>
                <SheetDescription>
                  Filter your appointments by status and date
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status?.[0] || 'all'}
                    onValueChange={(value) =>
                      setFilters(prev => ({
                        ...prev,
                        status: value === 'all' ? undefined : [value as any]
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowFilters(false)}
                    className="flex-1"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({})
                      setSearchQuery('')
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || Object.keys(filters).length > 0
                ? "No appointments match your current filters"
                : "You haven't booked any appointments yet"
              }
            </p>
            {(!searchQuery && Object.keys(filters).length === 0) && (
              <Button>Book Your First Appointment</Button>
            )}
          </Card>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
            </div>
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Appointments
          </Button>
        </div>
      )}

      {isLoading && appointments.length > 0 && (
        <div className="flex justify-center">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}
    </div>
  )
}