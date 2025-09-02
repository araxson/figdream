import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui'
import { Users, Briefcase, Clock, Award, TrendingUp, Settings } from 'lucide-react'
import { StaffServiceAssignment } from './staff-service-assignment'
import type { Database } from '@/types/database.types'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
type Service = Database['public']['Tables']['services']['Row']
type StaffService = Database['public']['Tables']['staff_services']['Row']

interface StaffWithServices extends StaffProfile {
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
  staff_services: (StaffService & {
    services: Service & {
      service_categories?: {
        id: string
        name: string
      }
    }
  })[]
}

export default async function StaffServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login/salon-owner')
  }

  // Get salon ID for the user
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .eq('role', 'salon_owner')
    .single()

  if (!userRole?.salon_id) {
    redirect('/role-salon-owner')
  }

  const salonId = userRole.salon_id

  // Fetch all staff members with their assigned services
  const { data: staffMembers, error: staffError } = await supabase
    .from('staff_profiles')
    .select(`
      *,
      profiles!inner(
        id,
        full_name,
        avatar_url
      ),
      staff_services(
        *,
        services(
          *,
          service_categories(id, name)
        )
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('profiles(full_name)')

  if (staffError) {
    console.error('Error fetching staff:', staffError)
  }

  // Fetch all available services
  const { data: allServices } = await supabase
    .from('services')
    .select(`
      *,
      service_categories(id, name)
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('name')

  // Calculate statistics
  const totalStaff = staffMembers?.length || 0
  const totalServices = allServices?.length || 0
  
  const staffWithAllServices = staffMembers?.filter(
    staff => staff.staff_services.length === totalServices
  ).length || 0

  const averageServicesPerStaff = totalStaff > 0
    ? Math.round(
        staffMembers?.reduce((sum, staff) => sum + staff.staff_services.length, 0) / totalStaff
      )
    : 0

  const mostCommonService = allServices?.reduce((prev, current) => {
    const currentCount = staffMembers?.filter(
      staff => staff.staff_services.some(ss => ss.service_id === current.id)
    ).length || 0
    
    const prevCount = staffMembers?.filter(
      staff => staff.staff_services.some(ss => ss.service_id === prev.id)
    ).length || 0
    
    return currentCount > prevCount ? current : prev
  }, allServices?.[0])

  const serviceCategories = [...new Set(allServices?.map(s => s.service_categories?.name || 'General'))]

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Service Assignment</h1>
          <p className="text-muted-foreground">
            Manage which services each staff member can perform
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              Available services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Services/Staff</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageServicesPerStaff}</div>
            <p className="text-xs text-muted-foreground">
              Per staff member
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Full Service Staff</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staffWithAllServices}</div>
            <p className="text-xs text-muted-foreground">
              Can perform all services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {mostCommonService?.name || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Service offered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staff Service Assignment Interface */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="matrix">Matrix View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staffMembers?.map((staff) => (
              <Card key={staff.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={staff.profiles.avatar_url || ''} />
                        <AvatarFallback>
                          {staff.profiles.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {staff.profiles.full_name || 'Staff Member'}
                        </CardTitle>
                        <CardDescription>
                          {staff.title || 'Staff'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <Badge variant="secondary">
                      {staff.staff_services.length} services
                    </Badge>
                    {staff.years_experience && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {staff.years_experience}+ years
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <StaffServiceAssignment
                    staffId={staff.id}
                    staffName={staff.profiles.full_name || 'Staff Member'}
                    assignedServices={staff.staff_services}
                    allServices={allServices || []}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Assignments by Staff</CardTitle>
              <CardDescription>
                Detailed view of all staff members and their assigned services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {staffMembers?.map((staff) => (
                  <div key={staff.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={staff.profiles.avatar_url || ''} />
                          <AvatarFallback>
                            {staff.profiles.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {staff.profiles.full_name || 'Staff Member'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {staff.title || 'Staff'} • {staff.staff_services.length} services
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {staff.staff_services.map((ss) => (
                        <Badge key={ss.id} variant="secondary">
                          {ss.services.name}
                          {ss.custom_duration && (
                            <span className="ml-1 text-xs">
                              ({ss.custom_duration}min)
                            </span>
                          )}
                        </Badge>
                      ))}
                      {staff.staff_services.length === 0 && (
                        <p className="text-sm text-muted-foreground">No services assigned</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Coverage Matrix</CardTitle>
              <CardDescription>
                Overview of which staff members can perform each service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Service</th>
                      <th className="text-left p-2">Category</th>
                      {staffMembers?.map((staff) => (
                        <th key={staff.id} className="text-center p-2 min-w-[100px]">
                          <div className="flex flex-col items-center">
                            <Avatar className="h-8 w-8 mb-1">
                              <AvatarImage src={staff.profiles.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {staff.profiles.full_name?.split(' ').map(n => n[0]).join('') || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs truncate max-w-[90px]">
                              {staff.profiles.full_name?.split(' ')[0] || 'Staff'}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allServices?.map((service) => (
                      <tr key={service.id} className="border-b">
                        <td className="p-2 font-medium">{service.name}</td>
                        <td className="p-2">
                          <Badge variant="outline">
                            {service.service_categories?.name || 'General'}
                          </Badge>
                        </td>
                        {staffMembers?.map((staff) => {
                          const canPerform = staff.staff_services.some(
                            ss => ss.service_id === service.id
                          )
                          return (
                            <td key={`${staff.id}-${service.id}`} className="text-center p-2">
                              {canPerform ? (
                                <Badge variant="default" className="h-6 w-6 p-0 rounded-full">
                                  ✓
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="h-6 w-6 p-0 rounded-full">
                                  -
                                </Badge>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(!staffMembers || staffMembers.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No staff members found</h3>
            <p className="text-muted-foreground">
              Add staff members to start assigning services
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}