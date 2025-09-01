'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database.types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Search, ChevronLeft, ChevronRight, Trophy, Star, Award, Coins } from 'lucide-react'
import PointsAdjustmentDialog from './points-adjustment-dialog'

type Customer = Database['public']['Tables']['customers']['Row'] & {
  loyalty_points_ledger?: Array<{
    points_balance: number
  }>
}

interface CustomerPointsTableProps {
  salonId: string
}

export default function CustomerPointsTable({ salonId }: CustomerPointsTableProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadCustomers()
  }, [currentPage, searchQuery])

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        salon_id: salonId,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      })
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/loyalty/customers?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
        setTotalPages(Math.ceil((data.total || 0) / itemsPerPage))
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTierInfo = (points: number) => {
    if (points >= 5000) {
      return {
        tier: 'Platinum',
        color: 'bg-purple-500',
        icon: <Trophy className="h-3 w-3" />
      }
    } else if (points >= 2000) {
      return {
        tier: 'Gold',
        color: 'bg-yellow-500',
        icon: <Star className="h-3 w-3" />
      }
    } else if (points >= 500) {
      return {
        tier: 'Silver',
        color: 'bg-gray-400',
        icon: <Award className="h-3 w-3" />
      }
    } else {
      return {
        tier: 'Bronze',
        color: 'bg-orange-600',
        icon: <Coins className="h-3 w-3" />
      }
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadCustomers()
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Points Balance</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const points = customer.loyalty_points_ledger?.[0]?.points_balance || 0
                const tierInfo = getTierInfo(points)
                
                return (
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <TableRow key={customer.id}>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="cursor-pointer">
                                <p className="font-medium">
                                  {customer.first_name} {customer.last_name}
                                </p>
                                {customer.preferred_name && (
                                  <p className="text-xs text-muted-foreground">
                                    Prefers: {customer.preferred_name}
                                  </p>
                                )}
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">{customer.first_name} {customer.last_name}</h4>
                                <div className="text-sm text-muted-foreground">
                                  <p><strong>Email:</strong> {customer.email}</p>
                                  {customer.phone && <p><strong>Phone:</strong> {customer.phone}</p>}
                                  <p><strong>Points:</strong> {points}</p>
                                  <p><strong>Tier:</strong> {tierInfo.name}</p>
                                  {customer.date_of_birth && (
                                    <p><strong>Birthday:</strong> {new Date(customer.date_of_birth).toLocaleDateString()}</p>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{customer.email}</p>
                        {customer.phone && (
                          <p className="text-muted-foreground">{customer.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{points.toLocaleString()}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <span className={`h-2 w-2 rounded-full ${tierInfo.color}`} />
                        {tierInfo.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {customer.last_visit_date 
                          ? new Date(customer.last_visit_date).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <PointsAdjustmentDialog 
                        salonId={salonId}
                        customerId={customer.id}
                      >
                        <Button variant="outline" size="sm">
                          Adjust Points
                        </Button>
                      </PointsAdjustmentDialog>
                    </TableCell>
                      </TableRow>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem>
                        View Full Profile
                      </ContextMenuItem>
                      <ContextMenuItem>
                        View Booking History
                      </ContextMenuItem>
                      <ContextMenuItem>
                        Send Message
                      </ContextMenuItem>
                      <ContextMenuItem>
                        Export Data
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}