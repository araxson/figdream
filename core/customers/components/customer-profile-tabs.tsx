'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Award,
  Heart,
  ShoppingBag,
  MessageSquare,
  UserCheck
} from 'lucide-react'
import type { CustomerProfileWithRelations } from '../dal/customers-types'

interface CustomerTabsProps {
  customer: CustomerProfileWithRelations
}

export function CustomerOverviewTab({ customer }: CustomerTabsProps) {
  const stats = [
    {
      label: 'Total Appointments',
      value: customer.appointments?.length || 0,
      icon: Calendar,
      color: 'text-blue-500'
    },
    {
      label: 'Lifetime Value',
      value: `$${customer.lifetime_value?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      label: 'Average Rating',
      value: customer.average_rating?.toFixed(1) || 'N/A',
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      label: 'Loyalty Points',
      value: customer.loyalty_points || 0,
      icon: Award,
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Insights</CardTitle>
          <CardDescription>Key metrics and trends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Visit Frequency</span>
              <span className="text-sm text-muted-foreground">
                {customer.visit_frequency || 'New Customer'}
              </span>
            </div>
            <Progress value={customer.visit_frequency === 'frequent' ? 75 : 25} />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Member Since</span>
              <span className="text-sm font-medium">
                {new Date(customer.created_at || '').toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Visit</span>
              <span className="text-sm font-medium">
                {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Preferred Time</span>
              <span className="text-sm font-medium">
                {customer.preferred_time || 'Any time'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function CustomerAppointmentsTab({ customer }: CustomerTabsProps) {
  const appointments = customer.appointments || []
  const upcomingAppointments = appointments.filter(
    app => new Date(app.date) >= new Date()
  )
  const pastAppointments = appointments.filter(
    app => new Date(app.date) < new Date()
  )

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {upcomingAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>{upcomingAppointments.length} scheduled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{appointment.service?.name || 'Service'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                    </p>
                  </div>
                  <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {pastAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
              <CardDescription>{pastAppointments.length} completed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg opacity-75">
                  <div>
                    <p className="font-medium">{appointment.service?.name || 'Service'}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.total_amount && (
                      <span className="text-sm font-medium">${appointment.total_amount}</span>
                    )}
                    <Badge variant="outline">{appointment.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {appointments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No appointments yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}

export function CustomerFavoritesTab({ customer }: CustomerTabsProps) {
  const favorites = customer.favorites || []
  
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {favorites.length > 0 ? (
          favorites.map((favorite) => (
            <Card key={favorite.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                  <div>
                    <p className="font-medium">{favorite.entity_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {favorite.entity_type}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  Added {new Date(favorite.created_at).toLocaleDateString()}
                </Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No favorites yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}

export function CustomerNotesTab({ customer, onAddNote }: CustomerTabsProps & { onAddNote: (note: string) => Promise<void> }) {
  const notes = customer.notes || []
  
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{note.created_by_role}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{note.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No notes yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}