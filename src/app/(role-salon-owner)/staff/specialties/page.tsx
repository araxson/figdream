import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Checkbox } from "@/components/ui"
import { Scissors, Palette, Sparkles, Users, Plus } from "lucide-react"

export default async function StaffSpecialtiesPage() {
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

  // Get staff with their specialties
  const { data: staff } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      profiles (full_name, email),
      staff_services (
        service_id,
        services (name, category_id, service_categories (name))
      )
    `)
    .eq("salon_id", userRole.salon_id)
    .eq("is_active", true)
    .order("display_name", { ascending: true })

  // Get all services
  const { data: services } = await supabase
    .from("services")
    .select(`
      *,
      service_categories (name)
    `)
    .eq("salon_id", userRole.salon_id)
    .eq("is_active", true)
    .order("category_id", { ascending: true })
    .order("name", { ascending: true })

  // Group services by category
  const servicesByCategory = services?.reduce((acc, service) => {
    const category = service.service_categories?.name || "Uncategorized"
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {} as Record<string, typeof services>) || {}

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Specialties</h1>
          <p className="text-muted-foreground">Manage service assignments and specializations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Specialty
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hair Services</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff?.filter(s => s.specialties?.includes("hair")).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Specialists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Color Services</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff?.filter(s => s.specialties?.includes("color")).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Specialists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beauty Services</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff?.filter(s => s.specialties?.includes("beauty")).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Specialists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Service Assignments</CardTitle>
          <CardDescription>Assign services to staff members based on their specialties</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Assigned Services</TableHead>
                <TableHead>Certifications</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {member.display_name || member.profiles?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.profiles?.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties?.map((specialty: string) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      )) || <span className="text-muted-foreground">None assigned</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {member.staff_services?.length || 0} services
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.certifications?.map((cert: string) => (
                        <Badge key={cert} variant="outline">
                          {cert}
                        </Badge>
                      )) || <span className="text-muted-foreground text-sm">None</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Assignment Matrix</CardTitle>
          <CardDescription>Quick view and edit of service assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 text-left">Service</th>
                  {staff?.map((member) => (
                    <th key={member.id} className="border p-2 text-center text-xs">
                      {member.display_name || member.profiles?.full_name?.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                  <>
                    <tr key={category}>
                      <td colSpan={(staff?.length || 0) + 1} className="border p-2 bg-muted font-medium">
                        {category}
                      </td>
                    </tr>
                    {categoryServices?.map((service) => (
                      <tr key={service.id}>
                        <td className="border p-2 text-sm">{service.name}</td>
                        {staff?.map((member) => (
                          <td key={`${service.id}-${member.id}`} className="border p-2 text-center">
                            <Checkbox 
                              defaultChecked={
                                member.staff_services?.some(
                                  (ss: any) => ss.service_id === service.id
                                )
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button>Save Assignments</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}