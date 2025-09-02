import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Calendar, Badge, Button } from "@/components/ui"
import { CalendarDays, Clock, User } from "lucide-react"

export default async function AppointmentsCalendarPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("*, salons (*)")
    .eq("user_id", user.id)
    .eq("role", "salon_owner")
    .single()

  if (!userRole) redirect("/error-403")

  // Get appointments for the salon
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      customers (profiles (full_name, email, phone)),
      services (name, duration, price),
      staff_profiles (display_name, profiles (full_name))
    `)
    .eq("salon_id", userRole.salon_id)
    .gte("appointment_date", new Date().toISOString().split("T")[0])
    .order("appointment_date", { ascending: true })
    .order("start_time", { ascending: true })

  // Group appointments by date
  const appointmentsByDate = appointments?.reduce((acc, apt) => {
    const date = apt.appointment_date
    if (!acc[date]) acc[date] = []
    acc[date].push(apt)
    return acc
  }, {} as Record<string, typeof appointments>) || {}

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Appointment Calendar</h1>
        <p className="text-muted-foreground">View and manage appointments in calendar view</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="single"
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentsByDate[new Date().toISOString().split("T")[0]]?.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{appointment.services?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {appointment.customers?.profiles?.full_name || "Guest"}
                      </p>
                    </div>
                    <Badge variant={
                      appointment.status === "confirmed" ? "default" :
                      appointment.status === "completed" ? "secondary" :
                      appointment.status === "cancelled" ? "destructive" :
                      "outline"
                    }>
                      {appointment.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{appointment.start_time} - {appointment.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>
                        {appointment.staff_profiles?.display_name || 
                         appointment.staff_profiles?.profiles?.full_name || 
                         "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      <span>{appointment.services?.duration} min</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Reschedule</Button>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  No appointments scheduled for today
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>All appointments for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(appointmentsByDate).map(([date, apts]) => (
              <div key={date}>
                <h3 className="font-medium mb-3">
                  {new Date(date).toLocaleDateString("en-US", { 
                    weekday: "long", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </h3>
                <div className="grid gap-2">
                  {apts?.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium">
                          {apt.start_time}
                        </div>
                        <div>
                          <p className="font-medium">{apt.services?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {apt.customers?.profiles?.full_name} • {apt.staff_profiles?.display_name}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{apt.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}