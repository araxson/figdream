'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/client'
import {
  getStaffBySalon,
  createStaffProfile,
  updateStaffProfile,
  updateStaffServices,
  getStaffServices
} from '@/lib/data-access/staff'
import { getSalonServices } from '@/lib/data-access/services'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Skeleton,
  TooltipProvider
} from '@/components/ui'
import { Plus, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { StaffFormDialog, StaffTable, StaffFilters, StaffStats } from '@/components/salon-owner/staff'
import type { Database } from '@/types/database.types'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
type Service = Database['public']['Tables']['services']['Row']
type StaffService = Database['public']['Tables']['staff_services']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

type StaffMember = StaffProfile & {
  profiles?: Profile | null
  staff_services?: (StaffService & {
    services?: Service | null
  })[] | null
  appointments_count?: number
  revenue_generated?: number
  average_rating?: number
}

interface StaffFormData {
  email: string
  first_name: string
  last_name: string
  display_name: string
  phone: string
  hire_date: string
  commission_rate: number
  base_salary: number
  is_active: boolean
  can_book_online: boolean
  bio: string
  specialties: string[]
  selected_services: string[]
}

export default function SalonOwnerStaffPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [savingStaff, setSavingStaff] = useState(false)
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null)
  const [salonId, setSalonId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  const [formData, setFormData] = useState<StaffFormData>({
    email: '',
    first_name: '',
    last_name: '',
    display_name: '',
    phone: '',
    hire_date: new Date().toISOString().split('T')[0],
    commission_rate: 50,
    base_salary: 0,
    is_active: true,
    can_book_online: true,
    bio: '',
    specialties: [],
    selected_services: []
  })

  // Load salon data
  useEffect(() => {
    loadSalonData()
  }, [])

  // Apply filters
  useEffect(() => {
    applyFilters()
  }, [staff, searchQuery, statusFilter, roleFilter])

  const loadSalonData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login/salon-owner')
        return
      }

      const { data: salon } = await supabase
        .from('salons')
        .select('id, name')
        .eq('owner_id', user.id)
        .single()

      if (!salon) {
        toast.error('No salon found for this account')
        router.push('/salon-admin/dashboard')
        return
      }

      setSalonId(salon.id)
      
      const [staffData, servicesData] = await Promise.all([
        loadStaff(salon.id),
        loadServices(salon.id)
      ])

      setStaff(staffData)
      setServices(servicesData.data || [])
    } catch (error) {
      console.error('Error loading salon:', error)
      toast.error('Failed to load salon data')
    } finally {
      setLoading(false)
    }
  }

  const loadStaff = async (salonId: string): Promise<StaffMember[]> => {
    try {
      const staffData = await getStaffBySalon(salonId)
      
      const enhancedStaff = await Promise.all(
        (staffData || []).map(async (member) => {
          const supabase = createClient()
          
          const { count: appointmentsCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('staff_id', member.id)
            .eq('status', 'completed')

          const { data: reviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('staff_id', member.id)

          const { data: appointments } = await supabase
            .from('appointments')
            .select('total_amount')
            .eq('staff_id', member.id)
            .eq('status', 'completed')

          const averageRating = reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0

          const revenueGenerated = appointments
            ? appointments.reduce((sum, a) => sum + (a.total_amount || 0), 0)
            : 0

          return {
            ...member,
            appointments_count: appointmentsCount || 0,
            average_rating: averageRating,
            revenue_generated: revenueGenerated
          }
        })
      )

      return enhancedStaff
    } catch (error) {
      console.error('Error loading staff:', error)
      toast.error('Failed to load staff data')
      return []
    }
  }

  const loadServices = async (salonId: string) => {
    try {
      return await getSalonServices(salonId)
    } catch (error) {
      console.error('Error loading services:', error)
      toast.error('Failed to load services')
      return { data: [] }
    }
  }

  const applyFilters = () => {
    let filtered = staff

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(member =>
        member.first_name.toLowerCase().includes(query) ||
        member.last_name.toLowerCase().includes(query) ||
        member.display_name.toLowerCase().includes(query) ||
        member.profiles?.email?.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(member =>
        statusFilter === 'active' ? member.is_active : !member.is_active
      )
    }

    setFilteredStaff(filtered)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      display_name: '',
      phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      commission_rate: 50,
      base_salary: 0,
      is_active: true,
      can_book_online: true,
      bio: '',
      specialties: [],
      selected_services: []
    })
  }

  const handleAddStaff = async () => {
    if (!salonId) return

    setSavingStaff(true)
    try {
      const newStaff = await createStaffProfile({
        salon_id: salonId,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        phone: formData.phone,
        hire_date: formData.hire_date,
        commission_rate: formData.commission_rate,
        base_salary: formData.base_salary,
        is_active: formData.is_active,
        can_book_online: formData.can_book_online,
        bio: formData.bio
      })

      if (newStaff && formData.selected_services.length > 0) {
        await updateStaffServices(newStaff.id, formData.selected_services)
      }

      toast.success('Staff member added successfully')
      setIsAddDialogOpen(false)
      resetForm()
      loadSalonData()
    } catch (error) {
      console.error('Error adding staff:', error)
      toast.error('Failed to add staff member')
    } finally {
      setSavingStaff(false)
    }
  }

  const handleEditStaff = async () => {
    if (!selectedStaff) return

    setSavingStaff(true)
    try {
      await updateStaffProfile(selectedStaff.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: formData.display_name,
        phone: formData.phone,
        hire_date: formData.hire_date,
        commission_rate: formData.commission_rate,
        base_salary: formData.base_salary,
        is_active: formData.is_active,
        can_book_online: formData.can_book_online,
        bio: formData.bio
      })

      if (formData.selected_services.length > 0) {
        await updateStaffServices(selectedStaff.id, formData.selected_services)
      }

      toast.success('Staff member updated successfully')
      setIsEditDialogOpen(false)
      resetForm()
      loadSalonData()
    } catch (error) {
      console.error('Error updating staff:', error)
      toast.error('Failed to update staff member')
    } finally {
      setSavingStaff(false)
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    setDeletingStaffId(staffId)
    try {
      const supabase = createClient()
      await supabase.from('staff_profiles').delete().eq('id', staffId)
      toast.success('Staff member deleted successfully')
      loadSalonData()
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast.error('Failed to delete staff member')
    } finally {
      setDeletingStaffId(null)
    }
  }

  const openEditDialog = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember)
    setFormData({
      email: staffMember.profiles?.email || '',
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
      display_name: staffMember.display_name,
      phone: staffMember.phone || '',
      hire_date: staffMember.hire_date || '',
      commission_rate: staffMember.commission_rate || 0,
      base_salary: staffMember.base_salary || 0,
      is_active: staffMember.is_active,
      can_book_online: staffMember.can_book_online,
      bio: staffMember.bio || '',
      specialties: [],
      selected_services: staffMember.staff_services?.map(ss => ss.service_id) || []
    })
    setIsEditDialogOpen(true)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setRoleFilter('all')
  }

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || roleFilter !== 'all'

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground">Manage your salon staff members and their services</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staff-list">Staff List</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StaffStats staff={staff} />
          </TabsContent>

          <TabsContent value="staff-list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Members</CardTitle>
                <CardDescription>View and manage all staff members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <StaffFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  roleFilter={roleFilter}
                  onRoleFilterChange={setRoleFilter}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                  totalStaff={staff.length}
                  filteredCount={filteredStaff.length}
                />

                <StaffTable
                  staff={filteredStaff}
                  onEditStaff={openEditDialog}
                  onDeleteStaff={handleDeleteStaff}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <StaffFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          title="Add New Staff Member"
          description="Create a new staff profile with detailed information"
          formData={formData}
          setFormData={setFormData}
          services={services}
          onSubmit={handleAddStaff}
          isLoading={savingStaff}
          submitText="Add Staff Member"
        />

        <StaffFormDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Edit Staff Member"
          description="Update staff profile with ultra-precision"
          formData={formData}
          setFormData={setFormData}
          services={services}
          onSubmit={handleEditStaff}
          isLoading={savingStaff}
          submitText="Update Staff Member"
        />

        <Alert className="mt-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Note:</strong> Staff members will receive an email to set their password. 
            Ensure email addresses are correct. Use role-based permissions to control access levels.
          </AlertDescription>
        </Alert>
      </div>
    </TooltipProvider>
  )
}