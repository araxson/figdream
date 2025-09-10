'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Copy,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Plus,
  Clock,
  DollarSign,
  Tag,
  Sparkles,
  Package,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react'
import { formatCurrency, formatDuration } from '@/lib/utils/format'
import { useEffect, useCallback, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { cn } from '@/lib/utils'

type Service = Database['public']['Tables']['services']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']

type ServiceWithCategory = Service & {
  service_categories?: ServiceCategory | null
}

type SortField = 'name' | 'price' | 'duration_minutes' | 'category'
type SortOrder = 'asc' | 'desc'

export function ServicesTable() {
  const [services, setServices] = useState<ServiceWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const itemsPerPage = 10
  const supabase = createClient()

  const fetchServices = useCallback(async () => {
    try {
      // Get the current user's salon
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check if user is salon owner
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      let salonId: string | null = null

      if (profile?.role !== 'salon_owner') {
        // If not owner, get staff profile to find salon
        const { data: staffProfile } = await supabase
          .from('staff_profiles')
          .select('salon_id')
          .eq('user_id', user.id)
          .single()

        salonId = staffProfile?.salon_id || null
      } else {
        // If owner, get their salon
        const { data: salon } = await supabase
          .from('salons')
          .select('id')
          .eq('created_by', user.id)
          .single()

        salonId = salon?.id || null
      }

      if (!salonId) return

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          *,
          service_categories(*)
        `)
        .eq('salon_id', salonId)
        .order('name')

      if (servicesError) throw servicesError
      setServices(servicesData || [])

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*')
        .eq('salon_id', salonId)
        .order('name')

      if (categoriesError) throw categoriesError
      setCategories(categoriesData || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...services]
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(service => 
        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service => 
        service.category_id === categoryFilter
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => 
        statusFilter === 'active' ? service.is_active : !service.is_active
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any
      
      if (sortField === 'category') {
        aValue = a.service_categories?.name || ''
        bValue = b.service_categories?.name || ''
      } else {
        aValue = a[sortField] || ''
        bValue = b[sortField] || ''
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    return filtered
  }, [services, searchQuery, categoryFilter, statusFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedServices.length / itemsPerPage)
  const paginatedServices = filteredAndSortedServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId)

      if (error) throw error
      await fetchServices()
    } catch (error) {
      console.error('Error toggling service status:', error)
    }
  }

  const handleDuplicate = async (service: ServiceWithCategory) => {
    try {
      const { id, created_at, updated_at, ...serviceData } = service
      const { error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          name: `${service.name} (Copy)`,
          is_active: false
        })

      if (error) throw error
      await fetchServices()
    } catch (error) {
      console.error('Error duplicating service:', error)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error
      await fetchServices()
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  // Calculate stats
  const stats = useMemo(() => {
    const activeCount = services.filter(s => s.is_active).length
    const avgPrice = services.length > 0 
      ? services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length
      : 0
    const avgDuration = services.length > 0
      ? services.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / services.length
      : 0

    return {
      total: services.length,
      active: activeCount,
      inactive: services.length - activeCount,
      avgPrice,
      avgDuration
    }
  }, [services])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Management</CardTitle>
          <CardDescription>Manage your salon services and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-4")}>
            {/* Stats skeleton */}
            <div className={cn("grid gap-4 md:grid-cols-4")}>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className={cn("h-20")} />
              ))}
            </div>
            {/* Table skeleton */}
            <div className={cn("space-y-3")}>
              <Skeleton className={cn("h-10 w-full")} />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className={cn("h-16 w-full")} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6")}>
      {/* Stats Cards */}
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-5")}>
        <Card>
          <CardContent className={cn("p-6")}>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <p className={cn("text-sm font-medium text-muted-foreground")}>Total Services</p>
                <p className={cn("text-2xl font-bold")}>{stats.total}</p>
              </div>
              <Package className={cn("h-8 w-8 text-muted-foreground")} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={cn("p-6")}>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <p className={cn("text-sm font-medium text-muted-foreground")}>Active</p>
                <p className={cn("text-2xl font-bold text-green-600")}>{stats.active}</p>
              </div>
              <Activity className={cn("h-8 w-8 text-green-600")} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={cn("p-6")}>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <p className={cn("text-sm font-medium text-muted-foreground")}>Inactive</p>
                <p className={cn("text-2xl font-bold text-muted-foreground")}>{stats.inactive}</p>
              </div>
              <ToggleLeft className={cn("h-8 w-8 text-muted-foreground")} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={cn("p-6")}>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <p className={cn("text-sm font-medium text-muted-foreground")}>Avg Price</p>
                <p className={cn("text-2xl font-bold")}>{formatCurrency(stats.avgPrice)}</p>
              </div>
              <DollarSign className={cn("h-8 w-8 text-blue-600")} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={cn("p-6")}>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <p className={cn("text-sm font-medium text-muted-foreground")}>Avg Duration</p>
                <p className={cn("text-2xl font-bold")}>{Math.round(stats.avgDuration)} min</p>
              </div>
              <Clock className={cn("h-8 w-8 text-purple-600")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className={cn("flex flex-col gap-4")}>
            <div className={cn("flex items-center justify-between")}>
              <div>
                <CardTitle className={cn("text-2xl")}>Service Management</CardTitle>
                <CardDescription>
                  Manage your salon services, pricing, and availability
                </CardDescription>
              </div>
              <Button className={cn("gap-2")}>
                <Plus className={cn("h-4 w-4")} />
                Add Service
              </Button>
            </div>
            
            {/* Filters */}
            <div className={cn("flex flex-col sm:flex-row gap-3")}>
              <div className={cn("relative flex-1")}>
                <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4")} />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className={cn("pl-9")}
                />
              </div>
              <Select 
                value={categoryFilter} 
                onValueChange={(value) => {
                  setCategoryFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className={cn("w-full sm:w-[200px]")}>
                  <Tag className={cn("mr-2 h-4 w-4")} />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className={cn("w-full sm:w-[150px]")}>
                  <Filter className={cn("mr-2 h-4 w-4")} />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedServices.length === 0 ? (
            <Card className={cn("border-dashed")}>
              <CardContent className={cn("flex flex-col items-center justify-center py-16")}>
                <div className={cn(
                  "rounded-full bg-muted p-6 mb-4",
                  "flex items-center justify-center"
                )}>
                  <Sparkles className={cn("h-12 w-12 text-muted-foreground")} />
                </div>
                <h3 className={cn("text-lg font-semibold mb-2")}>
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' 
                    ? 'No services found'
                    : 'No services yet'
                  }
                </h3>
                <p className={cn("text-sm text-muted-foreground text-center max-w-sm")}>
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'Add your first service to start managing your salon offerings.'
                  }
                </p>
                {!searchQuery && categoryFilter === 'all' && statusFilter === 'all' && (
                  <Button className={cn("mt-4 gap-2")}>
                    <Plus className={cn("h-4 w-4")} />
                    Add Your First Service
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <ScrollArea className={cn("h-[500px]")}>
                <Table>
                  <TableHeader>
                    <TableRow className={cn("hover:bg-transparent")}>
                      <TableHead className={cn("w-[300px]")}>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('name')}
                          className={cn("h-8 p-0 font-medium hover:bg-transparent gap-1")}
                        >
                          Service Name
                          <ArrowUpDown className={cn("h-4 w-4")} />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('category')}
                          className={cn("h-8 p-0 font-medium hover:bg-transparent gap-1")}
                        >
                          Category
                          <ArrowUpDown className={cn("h-4 w-4")} />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('duration_minutes')}
                          className={cn("h-8 p-0 font-medium hover:bg-transparent gap-1")}
                        >
                          Duration
                          <ArrowUpDown className={cn("h-4 w-4")} />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('price')}
                          className={cn("h-8 p-0 font-medium hover:bg-transparent gap-1")}
                        >
                          Price
                          <ArrowUpDown className={cn("h-4 w-4")} />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className={cn("text-right")}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <div>
                            <p className={cn("font-medium")}>{service.name}</p>
                            {service.description && (
                              <p className={cn("text-sm text-muted-foreground mt-1")}>
                                {service.description.length > 50 
                                  ? `${service.description.substring(0, 50)}...`
                                  : service.description
                                }
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("gap-1")}>
                            <Tag className={cn("h-3 w-3")} />
                            {service.service_categories?.name || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className={cn("flex items-center gap-1")}>
                            <Clock className={cn("h-4 w-4 text-muted-foreground")} />
                            <span>{formatDuration(service.duration_minutes)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={cn("flex items-center gap-1")}>
                            <DollarSign className={cn("h-4 w-4 text-muted-foreground")} />
                            <span className={cn("font-medium")}>
                              {formatCurrency(service.price)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={service.is_active ? 'default' : 'secondary'}
                            className={cn("gap-1")}
                          >
                            {service.is_active ? (
                              <><ToggleRight className={cn("h-3 w-3")} /> Active</>
                            ) : (
                              <><ToggleLeft className={cn("h-3 w-3")} /> Inactive</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn("text-right")}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className={cn("h-8 w-8")}>
                                <MoreHorizontal className={cn("h-4 w-4")} />
                                <span className={cn("sr-only")}>Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={cn("w-48")}>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className={cn("mr-2 h-4 w-4")} />
                                Edit Service
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(service)}
                              >
                                <Copy className={cn("mr-2 h-4 w-4")} />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(service.id, service.is_active)}
                              >
                                {service.is_active ? (
                                  <><ToggleLeft className={cn("mr-2 h-4 w-4")} /> Deactivate</>
                                ) : (
                                  <><ToggleRight className={cn("mr-2 h-4 w-4")} /> Activate</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className={cn("text-destructive")}
                                onClick={() => handleDelete(service.id)}
                              >
                                <Trash className={cn("mr-2 h-4 w-4")} />
                                Delete Service
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className={cn("flex items-center justify-between pt-4")}>
                  <p className={cn("text-sm text-muted-foreground")}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedServices.length)} of{' '}
                    {filteredAndSortedServices.length} services
                  </p>
                  <div className={cn("flex items-center gap-2")}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className={cn("h-4 w-4")} />
                      Previous
                    </Button>
                    <div className={cn("flex items-center gap-1")}>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1
                        if (totalPages > 5) {
                          if (currentPage > 3) {
                            pageNum = currentPage - 2 + i
                          }
                          if (currentPage > totalPages - 3) {
                            pageNum = totalPages - 4 + i
                          }
                        }
                        return pageNum
                      }).filter(p => p > 0 && p <= totalPages).map(pageNum => (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn("w-9")}
                        >
                          {pageNum}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className={cn("h-4 w-4")} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}