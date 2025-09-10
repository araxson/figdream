"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, Star, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export function CustomerDashboard() {
  // This would normally fetch data from your API
  const stats = {
    upcomingAppointments: 2,
    pastAppointments: 8,
    favoriteServices: 3,
    loyaltyPoints: 250
  }

  const quickActions = [
    {
      title: "Book Appointment",
      description: "Schedule your next visit",
      icon: Calendar,
      href: "/customer/book",
      color: "text-blue-600"
    },
    {
      title: "My Appointments",
      description: "View and manage bookings",
      icon: Clock,
      href: "/customer/appointments",
      color: "text-green-600"
    },
    {
      title: "Browse Services",
      description: "Explore our offerings",
      icon: Star,
      href: "/services",
      color: "text-purple-600"
    },
    {
      title: "My Profile",
      description: "Update your information",
      icon: Users,
      href: "/customer/profile",
      color: "text-orange-600"
    }
  ]

  const upcomingAppointments = [
    {
      id: 1,
      service: "Haircut & Styling",
      date: "Dec 15, 2024",
      time: "2:00 PM",
      staff: "Sarah Johnson",
      location: "Downtown Salon"
    },
    {
      id: 2,
      service: "Hair Color",
      date: "Dec 22, 2024",
      time: "10:00 AM",
      staff: "Mike Chen",
      location: "Westside Branch"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Next: Today at 2:00 PM
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Past Visits
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pastAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Total appointments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Favorite Services
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favoriteServices}</div>
            <p className="text-xs text-muted-foreground">
              Saved for quick booking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Loyalty Points
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.loyaltyPoints}</div>
            <p className="text-xs text-muted-foreground">
              50 points until next reward
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                    <div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>
                Your scheduled visits for the next 30 days
              </CardDescription>
            </div>
            <Link href="/customer/appointments">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{appointment.service}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {appointment.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appointment.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {appointment.staff}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {appointment.location}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Reschedule</Button>
                  <Button variant="outline" size="sm">Cancel</Button>
                </div>
              </div>
            ))}
            {upcomingAppointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming appointments</p>
                <Link href="/customer/book">
                  <Button className="mt-4">Book Your First Appointment</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Special Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Special Offers</CardTitle>
          <CardDescription>
            Exclusive deals for our valued customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <h3 className="font-semibold mb-1">20% Off Hair Color</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Valid until Dec 31, 2024
              </p>
              <Button size="sm">Claim Offer</Button>
            </div>
            <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <h3 className="font-semibold mb-1">Free Treatment with Cut</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Book any haircut and get a free hair treatment
              </p>
              <Button size="sm">Learn More</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}