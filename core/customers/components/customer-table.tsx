'use client'

import { useRouter } from 'next/navigation'
import {
  MoreVertical,
  Edit,
  Trash2,
  Star,
  StarOff,
  Eye,
  Phone,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react'

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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import type { CustomerProfileWithRelations } from '../dal/customers-types'

interface CustomerTableProps {
  customers: CustomerProfileWithRelations[]
  selectedCustomers: Set<string>
  onSelectAll: (checked: boolean) => void
  onSelectCustomer: (customerId: string, checked: boolean) => void
  onToggleVIP: (customer: CustomerProfileWithRelations) => void
  onToggleStatus: (customer: CustomerProfileWithRelations) => void
  onDeleteCustomer: (customerId: string) => void
  onViewProfile: (customer: CustomerProfileWithRelations) => void
  loadingStates: Record<string, boolean>
  isPending: boolean
}

export function CustomerTable({
  customers,
  selectedCustomers,
  onSelectAll,
  onSelectCustomer,
  onToggleVIP,
  onToggleStatus,
  onDeleteCustomer,
  onViewProfile,
  loadingStates,
  isPending
}: CustomerTableProps) {
  const router = useRouter()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  customers.length > 0 &&
                  customers.every(c => selectedCustomers.has(c.id))
                }
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Visits</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Last Visit</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No customers found
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCustomers.has(customer.id)}
                    onCheckedChange={(checked) =>
                      onSelectCustomer(customer.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={customer.avatar_url || undefined} />
                      <AvatarFallback>
                        {customer.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {customer.display_name || 'Unknown'}
                        {customer.is_vip && (
                          <Badge variant="secondary" className="text-xs">
                            VIP
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {customer.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {customer.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </div>
                    )}
                    {customer.date_of_birth && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(customer.date_of_birth).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.is_active !== false ? 'default' : 'secondary'}>
                    {customer.is_active !== false ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{customer.visit_count || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {(customer.total_spent || 0).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.last_visit
                    ? new Date(customer.last_visit).toLocaleDateString()
                    : 'Never'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={loadingStates[`delete-${customer.id}`]}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => onViewProfile(customer)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onToggleVIP(customer)}
                        disabled={loadingStates[`vip-${customer.id}`]}
                      >
                        {customer.is_vip ? (
                          <>
                            <StarOff className="mr-2 h-4 w-4" />
                            Remove VIP
                          </>
                        ) : (
                          <>
                            <Star className="mr-2 h-4 w-4" />
                            Make VIP
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(customer)}
                        disabled={loadingStates[`status-${customer.id}`]}
                      >
                        {customer.is_active !== false ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteCustomer(customer.id)}
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
  )
}