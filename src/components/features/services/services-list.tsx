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
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Eye,
  Clock,
  DollarSign,
  Tag,
  Plus,
  Package
} from 'lucide-react'
import { formatCurrency, formatDuration } from '@/lib/utils/format'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { cn } from '@/lib/utils'

type Service = Database['public']['Tables']['services']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']

type ServiceWithCategory = Service & {
  service_categories: ServiceCategory | null
}

export function ServicesList() {
  const [services, setServices] = useState<ServiceWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchServices = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_categories(*)
        `)
        .eq('salon_id', salon.id)
        .order('name')

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching services:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchServices()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting service:', error)
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Manage your salon service offerings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-3")}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={cn("flex items-center justify-between p-4 border rounded-lg")}>
                <div className={cn("space-y-2")}>
                  <Skeleton className={cn("h-4 w-[200px]")} />
                  <Skeleton className={cn("h-3 w-[150px]")} />
                </div>
                <Skeleton className={cn("h-8 w-8 rounded")} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className={cn("flex items-center justify-between")}>
          <div>
            <CardTitle className={cn("text-2xl")}>Services</CardTitle>
            <CardDescription>
              Manage your salon service offerings
            </CardDescription>
          </div>
          <Button className={cn("gap-2")}>
            <Plus className={cn("h-4 w-4")} />
            Add Service
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <Card className={cn("border-dashed")}>
            <CardContent className={cn("flex flex-col items-center justify-center py-16")}>
              <div className={cn(
                "rounded-full bg-muted p-6 mb-4",
                "flex items-center justify-center"
              )}>
                <Package className={cn("h-12 w-12 text-muted-foreground")} />
              </div>
              <h3 className={cn("text-lg font-semibold mb-2")}>
                No services yet
              </h3>
              <p className={cn("text-sm text-muted-foreground text-center max-w-sm")}>
                Add your first service to start managing your salon offerings.
              </p>
              <Button className={cn("mt-4 gap-2")}>
                <Plus className={cn("h-4 w-4")} />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={cn("rounded-lg border")}>
            <Table>
              <TableHeader>
                <TableRow className={cn("hover:bg-transparent")}>
                  <TableHead className={cn("w-[300px]")}>Service</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className={cn("text-right")}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <p className={cn("font-medium")}>{service.name}</p>
                        {service.description && (
                          <p className={cn("text-sm text-muted-foreground mt-1")}>
                            {service.description}
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
                        {service.is_active ? 'Active' : 'Inactive'}
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
                            <Eye className={cn("mr-2 h-4 w-4")} />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className={cn("mr-2 h-4 w-4")} />
                            Edit Service
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}