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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  Star,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

interface Review {
  id: string
  salon_id: string
  customer_id: string
  service_id: string | null
  staff_id: string | null
  appointment_id: string | null
  rating: number
  comment: string | null
  is_verified: boolean
  is_flagged: boolean
  status: 'pending' | 'approved' | 'rejected'
  response: string | null
  response_at: string | null
  created_at: string
  customer?: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  }
  salon?: {
    id: string
    name: string
    address: string
  }
  service?: {
    id: string
    name: string
  }
  staff?: {
    id: string
    user_id: string
    user?: {
      full_name: string | null
    }
  }
}

interface ReviewsManagementClientProps {
  reviews: Review[]
  counts: {
    total: number
    pending: number
    approved: number
    flagged: number
    avgRating: number
  }
  salons: Array<{ id: string; name: string }>
}

export function ReviewsManagementClient({ 
  reviews: initialReviews, 
  counts,
  salons
}: ReviewsManagementClientProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [searchQuery, setSearchQuery] = useState('')
  const [salonFilter, setSalonFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = !searchQuery || 
      review.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSalon = salonFilter === 'all' || review.salon_id === salonFilter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && review.status === 'pending') ||
      (statusFilter === 'approved' && review.status === 'approved') ||
      (statusFilter === 'flagged' && review.is_flagged)
    const matchesRating = ratingFilter === 'all' || 
      review.rating === parseInt(ratingFilter)
    
    return matchesSearch && matchesSalon && matchesStatus && matchesRating
  })

  const handleApprove = async (review: Review) => {
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', is_flagged: false })
      })
      
      if (!response.ok) throw new Error('Failed to approve review')
      
      setReviews(prev => prev.map(r => 
        r.id === review.id ? { ...r, status: 'approved' as const, is_flagged: false } : r
      ))
      toast.success('Review approved')
    } catch (error) {
      console.error('Error approving review:', error)
      toast.error('Failed to approve review')
    }
  }

  const handleReject = async (review: Review) => {
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      })
      
      if (!response.ok) throw new Error('Failed to reject review')
      
      setReviews(prev => prev.map(r => 
        r.id === review.id ? { ...r, status: 'rejected' as const } : r
      ))
      toast.success('Review rejected')
    } catch (error) {
      console.error('Error rejecting review:', error)
      toast.error('Failed to reject review')
    }
  }

  const handleFlag = async (review: Review) => {
    try {
      const response = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_flagged: !review.is_flagged })
      })
      
      if (!response.ok) throw new Error('Failed to flag review')
      
      setReviews(prev => prev.map(r => 
        r.id === review.id ? { ...r, is_flagged: !review.is_flagged } : r
      ))
      toast.success(review.is_flagged ? 'Review unflagged' : 'Review flagged')
    } catch (error) {
      console.error('Error flagging review:', error)
      toast.error('Failed to flag review')
    }
  }

  const handleDelete = async () => {
    if (!selectedReview) return
    
    try {
      const response = await fetch(`/api/admin/reviews/${selectedReview.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete review')
      
      setReviews(prev => prev.filter(r => r.id !== selectedReview.id))
      toast.success('Review deleted')
    } catch (error) {
      console.error('Error deleting review:', error)
      toast.error('Failed to delete review')
    } finally {
      setDeleteDialogOpen(false)
      setSelectedReview(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Management</h1>
          <p className="text-muted-foreground">
            Moderate and manage customer reviews across the platform
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.avgRating.toFixed(1)}</div>
            {renderStars(Math.round(counts.avgRating))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{counts.flagged}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Reviews</CardTitle>
                <CardDescription>
                  View and moderate customer reviews and ratings
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <MessageSquare className="h-3 w-3" />
                {filteredReviews.length} reviews
              </Badge>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search reviews..."
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
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Salon/Service</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="max-w-[300px]">Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No reviews found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.customer?.avatar_url || ''} />
                            <AvatarFallback>
                              {review.customer?.full_name?.split(' ').map(n => n[0]).join('') || 
                               review.customer?.email?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {review.customer?.full_name || 'Unknown'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {review.customer?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{review.salon?.name}</div>
                          {review.service && (
                            <div className="text-muted-foreground">
                              {review.service.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderStars(review.rating)}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm line-clamp-2">
                          {review.comment || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(review.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant={
                              review.status === 'approved' ? 'default' :
                              review.status === 'rejected' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {review.status}
                          </Badge>
                          {review.is_flagged && (
                            <Badge variant="destructive" className="text-xs">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
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
                            {review.status === 'pending' && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(review)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(review)}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleFlag(review)}>
                              <Flag className="mr-2 h-4 w-4" />
                              {review.is_flagged ? 'Unflag' : 'Flag'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedReview(review)
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
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}