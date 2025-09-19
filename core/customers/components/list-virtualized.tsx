'use client'

import { useState, useTransition, useMemo, useCallback } from 'react'
import { MoreHorizontal, Mail, Phone, AlertTriangle, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VirtualList, useInfiniteScroll } from '@/core/performance/components/virtual-list'
import type { CustomerProfileWithRelations } from '../dal/customers-types'
import { EmptyState } from '@/core/ui/components/empty-state'
import { toast } from 'sonner'

interface CustomersListVirtualizedProps {
  customers: CustomerProfileWithRelations[]
  role: 'admin' | 'owner' | 'manager' | 'staff'
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => Promise<void>
  onUpdateCustomer?: (customerId: string, update: any) => Promise<void>
}

export function CustomersListVirtualized({
  customers,
  role,
  loading = false,
  hasMore = false,
  onLoadMore,
  onUpdateCustomer
}: CustomersListVirtualizedProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [loadingMore, setLoadingMore] = useState(false)

  // Use infinite scroll hook
  const infiniteScrollRef = useInfiniteScroll(async () => {
    if (hasMore && !loadingMore && onLoadMore) {
      setLoadingMore(true)
      try {
        await onLoadMore()
      } finally {
        setLoadingMore(false)
      }
    }
  })

  const getCustomerSegment = useCallback((customer: CustomerProfileWithRelations) => {
    const visitCount = customer.visit_count || 0
    const lastVisit = customer.last_visit
      ? new Date(customer.last_visit)
      : null
    const daysSinceLastVisit = lastVisit
      ? Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      : null

    if (customer.is_premium)
      return { label: 'VIP', variant: 'default' as const }
    if (visitCount === 0)
      return { label: 'New', variant: 'secondary' as const }
    if (daysSinceLastVisit && daysSinceLastVisit > 90)
      return { label: 'At Risk', variant: 'destructive' as const }
    if (visitCount > 10) return { label: 'Loyal', variant: 'default' as const }
    return { label: 'Active', variant: 'outline' as const }
  }, [])

  // Render individual customer row
  const renderCustomerRow = useCallback((customer: CustomerProfileWithRelations, index: number) => {
    const segment = getCustomerSegment(customer)
    if (!customer.id) return null

    return (
      <div
        key={customer.id}
        className={`flex items-center p-4 border-b hover:bg-muted/50 transition-colors ${
          customer.is_premium ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''
        }`}
      >
        <div className="w-[50px]">
          <Checkbox
            checked={selectedIds.includes(customer.id)}
            onCheckedChange={() => {
              setSelectedIds(prev =>
                prev.includes(customer.id!)
                  ? prev.filter(i => i !== customer.id)
                  : [...prev, customer.id!]
              )
            }}
          />
        </div>

        <div className="flex-1 flex items-center space-x-4">
          <div className="flex items-center space-x-3 min-w-[200px]">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={customer.avatar_url || ''}
                loading="lazy"
              />
              <AvatarFallback>
                {customer.display_name?.slice(0, 2).toUpperCase() || 'CU'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{customer.display_name}</p>
              <p className="text-sm text-muted-foreground">
                Since{' '}
                {customer.created_at
                  ? new Date(customer.created_at).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="min-w-[200px] space-y-1">
            {customer.email && (
              <div className="flex items-center text-sm">
                <Mail className="mr-1 h-3 w-3" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center text-sm">
                <Phone className="mr-1 h-3 w-3" />
                {customer.phone}
              </div>
            )}
          </div>

          <div className="min-w-[100px]">
            <Badge variant={segment.variant}>
              {segment.label === 'At Risk' && (
                <AlertTriangle className="mr-1 h-3 w-3" />
              )}
              {segment.label}
            </Badge>
          </div>

          <div className="min-w-[120px] space-y-1">
            <p className="text-sm">{customer.visit_count || 0} visits</p>
            {customer.last_visit && (
              <p className="text-xs text-muted-foreground">
                Last: {new Date(customer.last_visit).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="min-w-[100px]">
            <p className="font-medium">
              ${(customer.total_spent || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="w-[60px] flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  startTransition(() => {
                    window.location.href = `/dashboard/customers/${customer.id}`
                  })
                }}
                disabled={isPending}
              >
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  startTransition(() => {
                    window.location.href = `/dashboard/customers/${customer.id}/history`
                  })
                }}
                disabled={isPending}
              >
                View History
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info('Opening message composer...')}
                disabled={isPending}
              >
                Send Message
              </DropdownMenuItem>
              {(role === 'admin' || role === 'owner') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      if (onUpdateCustomer && customer.id) {
                        await onUpdateCustomer(customer.id, { is_premium: true })
                        toast.success('Customer added to VIP')
                      }
                    }}
                    disabled={customer.is_premium || isPending}
                  >
                    {customer.is_premium ? 'Already VIP' : 'Add to VIP'}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }, [selectedIds, role, isPending, onUpdateCustomer, getCustomerSegment])

  // Memoize item height (fixed height for table rows)
  const itemHeight = 73 // Height of each row in pixels

  // Show empty state
  if (!loading && customers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No customers yet"
        description="Start building your customer base by adding your first customer."
        action={{
          label: 'Add Customer',
          onClick: () => {
            window.location.href = '/dashboard/customers/new'
          },
        }}
      />
    )
  }

  return (
    <div className="rounded-md border">
      {/* Table Header */}
      <div className="flex items-center p-4 border-b bg-muted/50 font-medium text-sm">
        <div className="w-[50px]">
          <Checkbox
            checked={selectedIds.length === customers.length && customers.length > 0}
            onCheckedChange={() => {
              setSelectedIds(prev =>
                prev.length === customers.length
                  ? []
                  : customers.map(c => c.id).filter((id): id is string => id !== null)
              )
            }}
            aria-label="Select all customers"
          />
        </div>
        <div className="flex-1 flex items-center space-x-4">
          <div className="min-w-[200px]">Customer</div>
          <div className="min-w-[200px]">Contact</div>
          <div className="min-w-[100px]">Segment</div>
          <div className="min-w-[120px]">Activity</div>
          <div className="min-w-[100px]">Lifetime Value</div>
        </div>
        <div className="w-[60px] text-right">Actions</div>
      </div>

      {/* Virtual List for Customer Rows */}
      <VirtualList
        items={customers}
        height={600} // Fixed height for virtual scrolling
        itemHeight={itemHeight}
        renderItem={renderCustomerRow}
        overscan={5} // Render 5 extra items outside viewport
        className="bg-background"
        getItemKey={(customer, index) => customer.id || `customer-${index}`}
      />

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div
          ref={infiniteScrollRef}
          className="p-4 text-center border-t"
        >
          {loadingMore && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span className="text-sm text-muted-foreground">Loading more customers...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}