'use client'

import { Suspense } from 'react'
import { TableSkeleton, CalendarSkeleton } from '@/components/ui/skeleton-variants'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, List } from 'lucide-react'
import Calendar16 from '@/components/features/appointments/calendar/calendar-16'

export function AppointmentsTabs() {
  return (
    <Tabs defaultValue="calendar" className="space-y-4">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          List View
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendar View
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="list" className="space-y-4">
        <Suspense fallback={<TableSkeleton count={10} />}>
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <List className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg">No appointments yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Your upcoming appointments will appear here
              </p>
              <Button onClick={() => {}}>Create Appointment</Button>
            </CardContent>
          </Card>
        </Suspense>
      </TabsContent>
      
      <TabsContent value="calendar" className="space-y-4">
        <Suspense fallback={<CalendarSkeleton />}>
          <Calendar16 />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}