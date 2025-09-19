'use client'

import { Calendar, Star, Heart, Gift, Bell, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type {
  CustomerProfile,
  AppointmentHistoryItem,
  CustomerFavorite,
  CustomerLoyalty,
  Notification
} from '../../types'

interface CustomerDashboardProps {
  profile: CustomerProfile
  upcomingAppointments: AppointmentHistoryItem[]
  recentAppointments: AppointmentHistoryItem[]
  favorites: CustomerFavorite[]
  loyaltyPrograms: CustomerLoyalty[]
  notifications: Notification[]
}

export function CustomerDashboard({
  profile,
  upcomingAppointments,
  recentAppointments,
  favorites,
  loyaltyPrograms,
  notifications
}: CustomerDashboardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile.firstName}!</h1>
          <p className="text-muted-foreground">
            Manage your appointments and discover new salon experiences
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Book Appointment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Appointments */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming appointments</p>
                <Button variant="outline" className="mt-4">Book Now</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={appointment.salonLogoUrl} />
                      <AvatarFallback>{getInitials(appointment.salonName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{appointment.salonName}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.date.toLocaleDateString()} at {appointment.time}
                      </div>
                    </div>
                    <Badge>{appointment.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Total Visits</span>
              <span className="font-medium">{recentAppointments.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Favorites</span>
              <span className="font-medium">{favorites.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Loyalty Programs</span>
              <span className="font-medium">{loyaltyPrograms.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="text-sm">
                  <div className="font-medium">{appointment.salonName}</div>
                  <div className="text-muted-foreground">
                    {appointment.date.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Your Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {favorites.slice(0, 3).map((favorite) => (
                <div key={favorite.id} className="text-sm">
                  <div className="font-medium">{favorite.itemName}</div>
                  <div className="text-muted-foreground capitalize">{favorite.type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Programs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Loyalty Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loyaltyPrograms.slice(0, 2).map((program) => (
                <div key={program.id} className="space-y-1">
                  <div className="font-medium">{program.program.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {program.currentPoints} points
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}