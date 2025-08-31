'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Star,
  Calendar,
  CheckCircle,
  Camera,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  Users,
  ThumbsUp,
  Clock,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { getReviews } from '@/lib/data-access/reviews/reviews'
import type { ReviewFilterInput } from '@/lib/validations/review-schema'
import type { Database } from '@/types/database'
import { ReviewCard } from './review-card'

type Review = Database['public']['Tables']['reviews']['Row'] & {
  customers?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
  salons?: {
    name: string
    logo_url?: string
  }
  locations?: {
    name: string
  }
  services?: {
    name: string
  }
  staff?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
  review_responses?: Array<any>
  review_votes?: Array<any>
}

interface ReviewListProps {
  salonId?: string
  locationId?: string
  serviceId?: string
  staffId?: string
  customerId?: string
  className?: string
  showFilters?: boolean
  showStats?: boolean
  allowModeration?: boolean
  itemsPerPage?: number
  defaultFilters?: Partial<ReviewFilterInput>
}

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First', icon: SortDesc },
  { value: 'date_asc', label: 'Oldest First', icon: SortAsc },
  { value: 'rating_desc', label: 'Highest Rated', icon: Star },
  { value: 'rating_asc', label: 'Lowest Rated', icon: Star },
  { value: 'helpful_desc', label: 'Most Helpful', icon: ThumbsUp },
  { value: 'verified_first', label: 'Verified First', icon: CheckCircle }
]

const RATING_FILTERS = [
  { value: 'all', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4+ Stars' },
  { value: '3', label: '3+ Stars' },
  { value: '2', label: '2+ Stars' },
  { value: '1', label: '1+ Stars' }
]

export function ReviewList({
  salonId,
  locationId,
  serviceId,
  staffId,
  customerId,
  className,
  showFilters = true,
  showStats = true,
  allowModeration = false,
  itemsPerPage = 20,
  defaultFilters = {}
}: ReviewListProps) {
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [total, setTotal] = React.useState(0)
  const [averageRating, setAverageRating] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState(defaultFilters.search || '')
  const [sortBy, setSortBy] = React.useState<string>(defaultFilters.sort_by || 'date_desc')
  const [ratingFilter, setRatingFilter] = React.useState<string>('all')
  const [showVerifiedOnly, setShowVerifiedOnly] = React.useState(defaultFilters.verified_only || false)
  const [showWithPhotos, setShowWithPhotos] = React.useState(defaultFilters.has_photos || false)
  const [showWithResponses, setShowWithResponses] = React.useState(defaultFilters.has_response || false)
  const [dateFrom, setDateFrom] = React.useState(defaultFilters.date_from || '')
  const [dateTo, setDateTo] = React.useState(defaultFilters.date_to || '')

  const fetchReviews = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const filters: ReviewFilterInput = {
        salon_id: salonId,
        location_id: locationId,
        service_id: serviceId,
        staff_id: staffId,
        customer_id: customerId,
        search: searchQuery || undefined,
        sort_by: sortBy as any,
        min_rating: ratingFilter !== 'all' ? parseInt(ratingFilter) : undefined,
        verified_only: showVerifiedOnly || undefined,
        has_photos: showWithPhotos || undefined,
        has_response: showWithResponses || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      }

      const result = await getReviews(filters)
      setReviews(result.reviews)
      setTotal(result.total)
      setAverageRating(result.average_rating)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [
    salonId,
    locationId,
    serviceId,
    staffId,
    customerId,
    searchQuery,
    sortBy,
    ratingFilter,
    showVerifiedOnly,
    showWithPhotos,
    showWithResponses,
    dateFrom,
    dateTo,
    currentPage,
    itemsPerPage
  ])

  React.useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleRefresh = () => {
    fetchReviews()
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = () => {
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSortBy('date_desc')
    setRatingFilter('all')
    setShowVerifiedOnly(false)
    setShowWithPhotos(false)
    setShowWithResponses(false)
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (searchQuery) count++
    if (ratingFilter !== 'all') count++
    if (showVerifiedOnly) count++
    if (showWithPhotos) count++
    if (showWithResponses) count++
    if (dateFrom || dateTo) count++
    return count
  }

  const renderStats = () => {
    if (!showStats) return null

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.verified_purchase).length}
                </p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Camera className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => r.photos && r.photos.length > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">With Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderFilters = () => {
    if (!showFilters) return null

    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()} active
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-3 w-3 mr-1", isLoading && "animate-spin")} />
                Refresh
              </Button>
              {getActiveFilterCount() > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Sort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search Reviews</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by content or title..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value)
                handleFilterChange()
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => {
                    const Icon = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <Select value={ratingFilter} onValueChange={(value) => {
                setRatingFilter(value)
                handleFilterChange()
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATING_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={showVerifiedOnly}
                onCheckedChange={(checked) => {
                  setShowVerifiedOnly(checked as boolean)
                  handleFilterChange()
                }}
              />
              <Label htmlFor="verified" className="text-sm font-normal">
                Verified purchases only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="photos"
                checked={showWithPhotos}
                onCheckedChange={(checked) => {
                  setShowWithPhotos(checked as boolean)
                  handleFilterChange()
                }}
              />
              <Label htmlFor="photos" className="text-sm font-normal">
                Reviews with photos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="responses"
                checked={showWithResponses}
                onCheckedChange={(checked) => {
                  setShowWithResponses(checked as boolean)
                  handleFilterChange()
                }}
              />
              <Label htmlFor="responses" className="text-sm font-normal">
                Business responded
              </Label>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <DatePicker
                date={dateFrom ? new Date(dateFrom) : undefined}
                onDateChange={(date) => {
                  setDateFrom(date ? format(date, 'yyyy-MM-dd') : '')
                  handleFilterChange()
                }}
                placeholder="Select start date"
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <DatePicker
                date={dateTo ? new Date(dateTo) : undefined}
                onDateChange={(date) => {
                  setDateTo(date ? format(date, 'yyyy-MM-dd') : '')
                  handleFilterChange()
                }}
                placeholder="Select end date"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderPagination = () => {
    if (total <= itemsPerPage) return null

    const totalPages = Math.ceil(total / itemsPerPage)
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, total)

    const renderPageNumbers = () => {
      const pages = []
      const showEllipsisStart = currentPage > 3
      const showEllipsisEnd = currentPage < totalPages - 2

      if (totalPages <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Always show first page
        pages.push(1)
        
        if (showEllipsisStart) {
          pages.push('ellipsis-start')
        }
        
        // Show pages around current page
        const start = Math.max(2, currentPage - 1)
        const end = Math.min(totalPages - 1, currentPage + 1)
        
        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) {
            pages.push(i)
          }
        }
        
        if (showEllipsisEnd) {
          pages.push('ellipsis-end')
        }
        
        // Always show last page
        if (!pages.includes(totalPages)) {
          pages.push(totalPages)
        }
      }
      
      return pages
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <p className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {total} reviews
        </p>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) setCurrentPage(currentPage - 1)
                }}
                className={cn(
                  currentPage === 1 && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
            
            {renderPageNumbers().map((pageNum, index) => (
              <PaginationItem key={index}>
                {pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(pageNum as number)
                    }}
                    isActive={pageNum === currentPage}
                  >
                    {pageNum}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                }}
                className={cn(
                  currentPage === totalPages && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  const renderContent = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-4" />
                      ))}
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (reviews.length === 0) {
      return (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-muted rounded-full">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">No reviews found</h3>
                <p className="text-muted-foreground">
                  {getActiveFilterCount() > 0 
                    ? "Try adjusting your filters to see more reviews"
                    : "Be the first to write a review!"
                  }
                </p>
              </div>
              {getActiveFilterCount() > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            allowModeration={allowModeration}
            onUpdate={fetchReviews}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {renderStats()}
      {renderFilters()}
      {renderContent()}
      {renderPagination()}
    </div>
  )
}