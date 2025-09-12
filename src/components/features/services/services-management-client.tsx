'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Clock,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface Service {
  id: string
  salon_id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  duration_minutes: number
  price: number
  is_addon: boolean
  requires_consultation: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  salon?: { id: string; name: string }
  category?: { id: string; name: string }
}

interface ServicesManagementClientProps {
  services: Service[]
  counts: {
    total: number
    active: number
    inactive: number
    addons: number
  }
  salons: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string }>
}

export function ServicesManagementClient({ 
  services: initialServices, 
  counts,
  salons,
  categories
}: ServicesManagementClientProps) {
  const [services, setServices] = useState(initialServices)
  const [searchQuery, setSearchQuery] = useState('')
  const [salonFilter, setSalonFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)

  // Filter services
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSalon = salonFilter === 'all' || service.salon_id === salonFilter
    const matchesCategory = categoryFilter === 'all' || service.category_id === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && service.is_active) ||
      (statusFilter === 'inactive' && !service.is_active) ||
      (statusFilter === 'addon' && service.is_addon)
    
    return matchesSearch && matchesSalon && matchesCategory && matchesStatus
  })

  const handleDelete = async () => {
    if (!selectedService) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/services/${selectedService.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete service')
      }
      
      setServices(prev => prev.filter(s => s.id !== selectedService.id))
      toast.success('Service deleted successfully')
    } catch (error) {
      console.error('Error deleting service:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete service')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setSelectedService(null)
    }
  }

  const handleDuplicate = async (service: Service) => {
    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...service,
          name: `${service.name} (Copy)`,
          id: undefined,
          created_at: undefined,
          updated_at: undefined
        })
      })
      
      if (!response.ok) throw new Error('Failed to duplicate service')
      
      const { service: newService } = await response.json()
      setServices(prev => [newService, ...prev])
      toast.success('Service duplicated successfully')
    } catch (error) {
      console.error('Error duplicating service:', error)
      toast.error('Failed to duplicate service')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`
    }
    return `${mins}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
          <p className="text-muted-foreground">
            Manage all platform services and pricing
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Link>
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered services
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.active}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Services</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Not available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Add-on Services</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.addons}</div>
            <p className="text-xs text-muted-foreground">
              Additional services
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Services Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Services</CardTitle>
                <CardDescription>
                  View and manage all services across the platform
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {filteredServices.length} services
              </Badge>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={salonFilter} onValueChange={setSalonFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Salons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salons</SelectItem>
                  {salons.map(salon => (
                    <SelectItem key={salon.id} value={salon.id}>
                      {salon.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="addon">Add-ons</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Salon</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No services found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {service.salon?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {service.category?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDuration(service.duration_minutes)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          {formatCurrency(service.price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {service.is_addon && (
                            <Badge variant="secondary">Add-on</Badge>
                          )}
                          {service.requires_consultation && (
                            <Badge variant="outline">Consult</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.is_active ? 'default' : 'secondary'}>
                          {service.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/services/${service.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Service
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(service)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedService(service)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the service
              &quot;{selectedService?.name}&quot;.
              {selectedService && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Note: Services with existing appointments cannot be deleted.
                  Consider deactivating the service instead.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}