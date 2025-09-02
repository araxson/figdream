import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, Input } from "@/components/ui"
import { FileText, Search, Edit, Plus } from "lucide-react"

export default async function AppointmentNotesPage() {
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

  // Get appointments with notes
  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      *,
      customers (profiles (full_name, email)),
      services (name),
      staff_profiles (display_name, profiles (full_name)),
      appointment_notes (*)
    `)
    .eq("salon_id", userRole.salon_id)
    .not("appointment_notes", "is", null)
    .order("appointment_date", { ascending: false })
    .limit(100)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointment Notes</h1>
          <p className="text-muted-foreground">View and manage notes for appointments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Notes</CardTitle>
          <CardDescription>Find notes by customer, service, or content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Search notes..." 
              className="flex-1"
            />
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Appointment Notes</CardTitle>
          <CardDescription>Notes from recent appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments?.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.start_time}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {appointment.customers?.profiles?.full_name || "Guest"}
                  </TableCell>
                  <TableCell>{appointment.services?.name}</TableCell>
                  <TableCell>
                    {appointment.staff_profiles?.display_name || 
                     appointment.staff_profiles?.profiles?.full_name || 
                     "Unassigned"}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="space-y-1">
                      {appointment.appointment_notes?.map((note: any) => (
                        <div key={note.id} className="text-sm">
                          <Badge variant="outline" className="text-xs mr-2">
                            {note.note_type}
                          </Badge>
                          <span className="line-clamp-2">{note.content}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Note Categories</CardTitle>
            <CardDescription>Breakdown of notes by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Service Notes</span>
                <Badge>24</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Preferences</span>
                <Badge>18</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Medical/Allergy</span>
                <Badge>7</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Follow-up Required</span>
                <Badge>5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">General Notes</span>
                <Badge>31</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Add Note</CardTitle>
            <CardDescription>Add a note to a recent appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Select an appointment from the list above to add a note
            </div>
            <Button className="w-full" disabled>
              Select Appointment First
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}