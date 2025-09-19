'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Package,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  Tag,
  Star,
  TrendingUp,
  Percent,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Archive,
  ChevronUp,
  ChevronDown,
  Grid,
  List,
  Layers
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface ServiceCatalogProps {
  salonId: string
}

interface Service {
  id: string
  name: string
  category_id: string
  category_name?: string
  description: string
  duration_minutes: number
  buffer_minutes: number
  base_price: number
  sale_price?: number
  current_price: number
  is_active: boolean
  is_bookable: boolean
  is_featured: boolean
  is_package: boolean
  is_addon: boolean
  booking_count: number
  revenue_total: number
  rating_average: number
}

interface ServiceCategory {
  id: string
  name: string
  description?: string
  display_order: number
  service_count: number
  is_active: boolean
  is_featured: boolean
  color?: string
  icon?: string
}

function ServiceCard({ service, onEdit, onDelete, onToggle }: {
  service: Service
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const hasDiscount = service.sale_price && service.sale_price < service.base_price
  const discountPercentage = hasDiscount
    ? Math.round(((service.base_price - service.sale_price) / service.base_price) * 100)
    : 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{service.name}</CardTitle>
            {service.category_name && (
              <Badge variant="outline" className="text-xs">
                {service.category_name}
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggle}>
                {service.is_active ? (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{service.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            {hasDiscount && (
              <>
                <span className="text-sm line-through text-muted-foreground">
                  ${service.base_price}
                </span>
                <Badge variant="destructive" className="text-xs">
                  -{discountPercentage}%
                </Badge>
              </>
            )}
            <span className="font-semibold">${service.current_price}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {service.is_featured && (
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {service.is_package && (
              <Badge variant="outline" className="text-xs">
                <Layers className="h-3 w-3 mr-1" />
                Package
              </Badge>
            )}
            {service.is_addon && (
              <Badge variant="outline" className="text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add-on
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {service.booking_count > 0 && (
              <span>{service.booking_count} bookings</span>
            )}
            {service.rating_average > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{service.rating_average.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant={service.is_active ? 'default' : 'secondary'}>
            {service.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Badge variant={service.is_bookable ? 'default' : 'secondary'}>
            {service.is_bookable ? 'Bookable' : 'Not Bookable'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export function ServiceCatalog({ salonId }: ServiceCatalogProps) {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Mock data - replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      setServices([
        {
          id: '1',
          name: 'Classic Haircut',
          category_id: 'cat1',
          category_name: 'Hair Services',
          description: 'Professional haircut with consultation and styling',
          duration_minutes: 45,
          buffer_minutes: 15,
          base_price: 50,
          current_price: 50,
          is_active: true,
          is_bookable: true,
          is_featured: true,
          is_package: false,
          is_addon: false,
          booking_count: 156,
          revenue_total: 7800,
          rating_average: 4.8
        },
        {
          id: '2',
          name: 'Hair Color & Highlights',
          category_id: 'cat1',
          category_name: 'Hair Services',
          description: 'Full color service with highlights and gloss treatment',
          duration_minutes: 120,
          buffer_minutes: 30,
          base_price: 150,
          sale_price: 120,
          current_price: 120,
          is_active: true,
          is_bookable: true,
          is_featured: false,
          is_package: false,
          is_addon: false,
          booking_count: 89,
          revenue_total: 10680,
          rating_average: 4.9
        },
        {
          id: '3',
          name: 'Deluxe Spa Package',
          category_id: 'cat2',
          category_name: 'Spa Treatments',
          description: 'Complete spa experience with massage, facial, and aromatherapy',
          duration_minutes: 180,
          buffer_minutes: 30,
          base_price: 250,
          current_price: 250,
          is_active: true,
          is_bookable: true,
          is_featured: true,
          is_package: true,
          is_addon: false,
          booking_count: 45,
          revenue_total: 11250,
          rating_average: 5.0
        }
      ])

      setCategories([
        {
          id: 'cat1',
          name: 'Hair Services',
          description: 'All hair-related services',
          display_order: 1,
          service_count: 12,
          is_active: true,
          is_featured: true,
          color: '#3B82F6'
        },
        {
          id: 'cat2',
          name: 'Spa Treatments',
          description: 'Relaxation and wellness services',
          display_order: 2,
          service_count: 8,
          is_active: true,
          is_featured: false,
          color: '#10B981'
        },
        {
          id: 'cat3',
          name: 'Nail Services',
          description: 'Manicure and pedicure services',
          display_order: 3,
          service_count: 6,
          is_active: true,
          is_featured: false,
          color: '#F59E0B'
        }
      ])

      setLoading(false)
    }, 1000)
  }, [])

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category_id === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleToggleService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    try {
      // API call would go here
      setServices(prev => prev.map(s =>
        s.id === serviceId ? { ...s, is_active: !s.is_active } : s
      ))
      toast.success(`Service ${service.is_active ? 'deactivated' : 'activated'}`)
    } catch (error) {
      toast.error('Failed to update service')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    try {
      // API call would go here
      setServices(prev => prev.filter(s => s.id !== serviceId))
      toast.success('Service deleted successfully')
    } catch (error) {
      toast.error('Failed to delete service')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Service Catalog</h2>
          <p className="text-muted-foreground">Manage your salon's services and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCategoryDialog(true)}>
            <Layers className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              {services.filter(s => s.is_active).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {categories.filter(c => c.is_active).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(services.reduce((sum, s) => sum + s.current_price, 0) / services.length)}
            </div>
            <p className="text-xs text-muted-foreground">per service</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.reduce((sum, s) => sum + s.booking_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name} ({cat.service_count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Services Display */}
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-semibold">No services found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'Add your first service to get started'}
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => setEditingService(service)}
              onDelete={() => handleDeleteService(service.id)}
              onToggle={() => handleToggleService(service.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map(service => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{service.name}</div>
                      {service.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {service.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.category_name}</Badge>
                  </TableCell>
                  <TableCell>{service.duration_minutes} min</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">${service.current_price}</div>
                      {service.sale_price && service.sale_price < service.base_price && (
                        <Badge variant="destructive" className="text-xs">
                          -{Math.round(((service.base_price - service.sale_price) / service.base_price) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{service.booking_count}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={service.is_active ? 'default' : 'secondary'}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingService(service)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleService(service.id)}>
                          {service.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}