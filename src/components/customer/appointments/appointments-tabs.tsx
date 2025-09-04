"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, CalendarX, Clock, ArrowRight, Star, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  services: Database['public']['Tables']['services']['Row'] | null
  staff_profiles: Database['public']['Tables']['staff_profiles']['Row'] | null
  salons: Database['public']['Tables']['salons']['Row'] | null
}

interface CategorizedAppointments {
  upcoming: Appointment[]
  past: Appointment[]
  cancelled: Appointment[]
}

interface AppointmentsTabsProps {
  categorizedAppointments: CategorizedAppointments
  renderAppointmentCard: (appointment: Appointment) => React.ReactNode
}

export function AppointmentsTabs({ 
  categorizedAppointments, 
  renderAppointmentCard 
}: AppointmentsTabsProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past' | 'cancelled')}>
      <TabsList className="grid w-full grid-cols-3 h-auto p-1">
        <TabsTrigger 
          value="upcoming" 
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium">Upcoming</span>
            {categorizedAppointments.upcoming.length > 0 && (
              <Badge 
                variant="secondary" 
                className="h-5 px-2 text-xs"
              >
                {categorizedAppointments.upcoming.length}
              </Badge>
            )}
          </div>
        </TabsTrigger>
        <TabsTrigger 
          value="past"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium">Past</span>
            {categorizedAppointments.past.length > 0 && (
              <Badge 
                variant="secondary" 
                className="h-5 px-2 text-xs"
              >
                {categorizedAppointments.past.length}
              </Badge>
            )}
          </div>
        </TabsTrigger>
        <TabsTrigger 
          value="cancelled"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium">Cancelled</span>
            {categorizedAppointments.cancelled.length > 0 && (
              <Badge 
                variant="secondary" 
                className="h-5 px-2 text-xs"
              >
                {categorizedAppointments.cancelled.length}
              </Badge>
            )}
          </div>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="mt-6 space-y-4">
        {categorizedAppointments.upcoming.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <CalendarDays className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No upcoming appointments</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                Browse our selection of salons and services to book your next appointment
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href="/book">
                    Book an Appointment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/customer/favorites">
                    View Favorites
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {categorizedAppointments.upcoming.map(renderAppointmentCard)}
            </div>
          </ScrollArea>
        )}
      </TabsContent>
      <TabsContent value="past" className="mt-6 space-y-4">
        {categorizedAppointments.past.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No appointment history</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                Your completed appointments will appear here. Start booking to build your beauty history!
              </p>
              <Button asChild variant="outline">
                <Link href="/book">
                  Book Your First Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {/* Add a prompt to leave reviews for completed appointments */}
              {categorizedAppointments.past.filter(apt => apt.status === 'completed').length > 0 && (
                <Card className="bg-primary/5 border-primary/20 mb-4">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Rate your experiences</p>
                        <p className="text-xs text-muted-foreground">
                          Help others by sharing your feedback
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary">
                      Leave Review
                    </Button>
                  </CardContent>
                </Card>
              )}
              {categorizedAppointments.past.map(renderAppointmentCard)}
            </div>
          </ScrollArea>
        )}
      </TabsContent>
      <TabsContent value="cancelled" className="mt-6 space-y-4">
        {categorizedAppointments.cancelled.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4">
                <CalendarX className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No cancelled appointments</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Great! You haven&apos;t cancelled any appointments. Keep up the consistency!
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {/* Add option to rebook cancelled appointments */}
              <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 mb-4">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="font-medium text-sm">Want to rebook?</p>
                      <p className="text-xs text-muted-foreground">
                        Quickly rebook any cancelled appointment
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Browse Services
                  </Button>
                </CardContent>
              </Card>
              {categorizedAppointments.cancelled.map(renderAppointmentCard)}
            </div>
          </ScrollArea>
        )}
      </TabsContent>
    </Tabs>
  )
}