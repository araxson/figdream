import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "@/components/ui"
import { Eye, Edit, Trash2 } from "lucide-react"

export default async function SalonsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .single()

  if (!userRole) redirect("/error-403")

  const { data: salons } = await supabase
    .from("salons")
    .select(`
      *,
      profiles!salons_owner_id_fkey (full_name, email),
      salon_locations (count),
      staff_profiles (count),
      appointments (count)
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salons Management</h1>
          <p className="text-muted-foreground">Manage all salons on the platform</p>
        </div>
        <Button>Add New Salon</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salons?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Salons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salons?.filter(s => s.is_active).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salons?.reduce((acc, s) => acc + (s.salon_locations?.[0]?.count || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salons?.reduce((acc, s) => acc + (s.staff_profiles?.[0]?.count || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Salons</CardTitle>
          <CardDescription>A list of all salons registered on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salon Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salons?.map((salon) => (
                <TableRow key={salon.id}>
                  <TableCell className="font-medium">{salon.name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{salon.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{salon.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{salon.salon_locations?.[0]?.count || 0}</TableCell>
                  <TableCell>{salon.staff_profiles?.[0]?.count || 0}</TableCell>
                  <TableCell>
                    <Badge variant={salon.is_active ? "default" : "secondary"}>
                      {salon.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(salon.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}