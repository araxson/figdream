import { Database } from "@/types/database.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar } from "lucide-react"
import { AppointmentsTable } from "./appointments-table"
type Appointment = Database['public']['Views']['location_appointments_view']['Row']
interface AppointmentsTabsProps {
  todaysAppointments: Appointment[]
  allAppointments: Appointment[]
}
export function AppointmentsTabs({ todaysAppointments, allAppointments }: AppointmentsTabsProps) {
  return (
    <Tabs defaultValue="today" className="space-y-4">
      <TabsList>
        <TabsTrigger value="today">Today&apos;s Appointments</TabsTrigger>
        <TabsTrigger value="all">All Appointments</TabsTrigger>
      </TabsList>
      <TabsContent value="today" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length > 0 ? (
              <AppointmentsTable appointments={todaysAppointments} />
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No appointments today</h3>
                <p className="text-muted-foreground">
                  There are no appointments scheduled for today.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="all" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
            <CardDescription>Recent appointments at your location</CardDescription>
          </CardHeader>
          <CardContent>
            {allAppointments.length > 0 ? (
              <AppointmentsTable appointments={allAppointments} showDate />
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No appointments yet</h3>
                <p className="text-muted-foreground">
                  There are no appointments recorded for this location.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}