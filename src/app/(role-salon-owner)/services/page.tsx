import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/database/supabase/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Badge,
  Input,
  Label,
  ScrollArea,
  Skeleton,
  Switch,
  Slider,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { Copy } from 'lucide-react'
import { 
  Scissors,
  Clock,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Tag,
  TrendingUp,
  Users,
  Star,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type Service = Database['public']['Tables']['services']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type ServiceCost = Database['public']['Tables']['service_costs']['Row']
type StaffService = Database['public']['Tables']['staff_services']['Row']

async function getServices(salonId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      service_categories (
        id,
        name,
        color,
        icon
      ),
      service_costs (
        id,
        cost_type,
        amount,
        effective_date
      )
    `)
    .eq('salon_id', salonId)
    .order('category_id', { ascending: true })
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data || []
}

async function getServiceCategories(salonId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('salon_id', salonId)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching service categories:', error)
    return []
  }

  return data || []
}

async function getStaffServices(salonId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_services')
    .select(`
      *,
      services (
        id,
        name
      ),
      staff_profiles (
        id,
        profiles:user_id (
          full_name
        )
      )
    `)
    .eq('salon_id', salonId)

  if (error) {
    console.error('Error fetching staff services:', error)
    return []
  }

  return data || []
}

async function getServiceStats(salonId: string) {
  const supabase = await createClient()
  
  // Get appointment counts per service for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data, error } = await supabase
    .from('appointment_services')
    .select(`
      service_id,
      services!inner(
        name,
        salon_id
      )
    `)
    .eq('services.salon_id', salonId)
    .gte('created_at', thirtyDaysAgo.toISOString())

  if (error) {
    console.error('Error fetching service stats:', error)
    return {}
  }

  // Count appointments per service
  const stats = (data || []).reduce((acc, item) => {
    const serviceId = item.service_id
    acc[serviceId] = (acc[serviceId] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return stats
}

function ServiceLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i}>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function ServicesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login/salon-owner')
  }

  // Get salon ID for the current user
  const { data: salonData } = await supabase
    .from('salons')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!salonData) {
    redirect('/salon-admin/dashboard')
  }

  const [services, categories, staffServices, serviceStats] = await Promise.all([
    getServices(salonData.id),
    getServiceCategories(salonData.id),
    getStaffServices(salonData.id),
    getServiceStats(salonData.id)
  ])

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const categoryId = service.category_id || 'uncategorized'
    if (!acc[categoryId]) {
      acc[categoryId] = []
    }
    acc[categoryId].push(service)
    return acc
  }, {} as Record<string, typeof services>)

  // Calculate staff count per service
  const staffCountByService = staffServices.reduce((acc, item) => {
    acc[item.service_id] = (acc[item.service_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate totals
  const totalServices = services.length
  const activeServices = services.filter(s => s.is_active).length
  const averagePrice = services.reduce((sum, s) => sum + (s.base_price || 0), 0) / (services.length || 1)
  const totalBookings = Object.values(serviceStats).reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
          <p className="text-muted-foreground">
            Manage your salon services, pricing, and availability
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Tag className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {activeServices} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePrice)}</div>
            <p className="text-xs text-muted-foreground">
              Per service
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Service groups
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">30-Day Bookings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Total appointments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="staff">Staff Assignment</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search services..." className="pl-8 w-[200px]" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Services</CardTitle>
              <CardDescription>
                Complete list of services offered at your salon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>A list of all services with their details</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Staff</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <ContextMenu key={service.id}>
                      <ContextMenuTrigger asChild>
                        <TableRow className="cursor-context-menu">
                          <TableCell className="font-medium">
                            <div>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <p className="cursor-pointer hover:underline">{service.name}</p>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">{service.name}</h4>
                                <p className="text-sm">
                                  {service.description || 'No description available'}
                                </p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock className="mr-2 h-4 w-4" />
                                  Duration: {service.duration} minutes
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Price: {formatCurrency(service.base_price || 0)}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Users className="mr-2 h-4 w-4" />
                                  {staffCountByService[service.id] || 0} staff members
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">
                              {service.description.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.service_categories ? (
                          <Badge variant="outline">
                            {service.service_categories.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Uncategorized</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.duration} min
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(service.base_price || 0)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {staffCountByService[service.id] || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {serviceStats[service.id] || 0}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() => {}}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <div className="flex justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit service details</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete service</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                        </TableRow>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-64">
                        <ContextMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Service
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate Service
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          Assign Staff
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Tag className="mr-2 h-4 w-4" />
                          Change Category
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Service
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {categories.map((category) => {
            const categoryServices = servicesByCategory[category.id] || []
            
            return (
              <Collapsible key={category.id} defaultOpen>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="hover:bg-muted/50 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <ChevronRight className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90" />
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {category.icon && <span>{category.icon}</span>}
                              {category.name}
                            </CardTitle>
                            <CardDescription>
                              {categoryServices.length} services • {category.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Category
                        </Button>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                  <div className="space-y-3">
                    {categoryServices.map((service) => (
                      <Card key={service.id}>
                        <CardContent className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{service.duration} min</span>
                              <span>{formatCurrency(service.base_price || 0)}</span>
                              <span>{staffCountByService[service.id] || 0} staff</span>
                            </div>
                          </div>
                          <Badge variant={service.is_active ? "default" : "secondary"}>
                            {service.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                    </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}
          
          {servicesByCategory['uncategorized'] && servicesByCategory['uncategorized'].length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uncategorized Services</CardTitle>
                <CardDescription>
                  Services without a category assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {servicesByCategory['uncategorized'].map((service) => (
                    <Card key={service.id}>
                      <CardContent className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{service.duration} min</span>
                            <span>{formatCurrency(service.base_price || 0)}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Assign Category
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Pricing</CardTitle>
              <CardDescription>
                Manage pricing for all services with advanced filtering
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price Range Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Filter by Price Range</Label>
                <div className="px-3">
                  <Slider
                    defaultValue={[0, Math.max(...services.map(s => s.base_price || 0))]}
                    max={Math.max(...services.map(s => s.base_price || 0)) || 200}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>${Math.max(...services.map(s => s.base_price || 0)) || 200}</span>
                  </div>
                </div>
              </div>
              
              {/* Duration Range Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Filter by Duration (minutes)</Label>
                <div className="px-3">
                  <Slider
                    defaultValue={[15, Math.max(...services.map(s => s.duration || 0))]}
                    max={Math.max(...services.map(s => s.duration || 0)) || 240}
                    min={15}
                    step={15}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>15 min</span>
                    <span>{Math.max(...services.map(s => s.duration || 0)) || 240} min</span>
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price/Hour</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => {
                    const pricePerHour = service.base_price && service.duration 
                      ? (service.base_price / service.duration) * 60 
                      : 0
                    
                    return (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={service.base_price || 0}
                              className="w-24"
                              onChange={() => {}}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{service.duration} min</TableCell>
                        <TableCell>{formatCurrency(pricePerHour)}/hr</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(service.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline">
                            Update Price
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Service Assignment</CardTitle>
              <CardDescription>
                Manage which staff members can perform each service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service) => {
                  const assignedStaff = staffServices.filter(ss => ss.service_id === service.id)
                  
                  return (
                    <Card key={service.id}>
                      <CardContent>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {assignedStaff.length} staff members assigned
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Plus className="h-3 w-3 mr-1" />
                            Assign Staff
                          </Button>
                        </div>
                        
                        {assignedStaff.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {assignedStaff.map((ss) => (
                              <Badge key={ss.id} variant="secondary" className="pr-1">
                                {ss.staff_profiles?.profiles?.full_name || 'Staff Member'}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="ml-1 h-4 w-4 p-0 hover:bg-transparent hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}