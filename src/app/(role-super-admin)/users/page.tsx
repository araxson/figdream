import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { User, Shield, UserCheck, Users, UserCircle } from "lucide-react"

export default async function UsersPage() {
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

  const { data: allUsers } = await supabase
    .from("profiles")
    .select(`
      *,
      user_roles (role, is_active, salon_id, location_id)
    `)
    .order("created_at", { ascending: false })

  const usersByRole = {
    super_admin: allUsers?.filter(u => u.user_roles?.some(r => r.role === "super_admin")) || [],
    salon_owner: allUsers?.filter(u => u.user_roles?.some(r => r.role === "salon_owner")) || [],
    location_manager: allUsers?.filter(u => u.user_roles?.some(r => r.role === "location_manager")) || [],
    staff: allUsers?.filter(u => u.user_roles?.some(r => r.role === "staff")) || [],
    customer: allUsers?.filter(u => u.user_roles?.some(r => r.role === "customer")) || [],
  }

  const roleIcons = {
    super_admin: Shield,
    salon_owner: User,
    location_manager: UserCheck,
    staff: Users,
    customer: UserCircle,
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users Management</h1>
          <p className="text-muted-foreground">Manage all users across the platform</p>
        </div>
        <Button>Add New User</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(usersByRole).map(([role, users]) => {
          const Icon = roleIcons[role as keyof typeof roleIcons]
          return (
            <Card key={role}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {role.replace("_", " ")}s
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="super_admin">Super Admins</TabsTrigger>
          <TabsTrigger value="salon_owner">Salon Owners</TabsTrigger>
          <TabsTrigger value="location_manager">Location Managers</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="customer">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Complete list of all platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "N/A"}</TableCell>
                      <TableCell>
                        {user.user_roles?.map(r => (
                          <Badge key={r.role} variant="outline" className="mr-1">
                            {r.role}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.user_roles?.some(r => r.is_active) ? "default" : "secondary"}>
                          {user.user_roles?.some(r => r.is_active) ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {Object.entries(usersByRole).map(([role, users]) => (
          <TabsContent key={role} value={role}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{role.replace("_", " ")}s</CardTitle>
                <CardDescription>Users with {role.replace("_", " ")} role</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={user.user_roles?.some(r => r.is_active) ? "default" : "secondary"}>
                            {user.user_roles?.some(r => r.is_active) ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">Manage</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}