'use client'

import * as React from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { Badge } from '@/src/components/ui/badge'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Checkbox } from '@/src/components/ui/checkbox'
import { Separator } from '@/src/components/ui/separator'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import { 
  Shield,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  MessageSquare,
  Filter,
  Search,
  MoreVertical,
  FileText,
  Mail,
  User,
  Calendar,
  Star,
  ThumbsUp,
  Camera,
  RefreshCw,
  Download,
  Settings,
  Loader2,
  Check,
  X,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/src/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { moderateReview, getReviews } from '@/lib/data-access/reviews/reviews'
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

interface ReviewModerationProps {
  salonId: string
  locationId?: string
  className?: string
}

interface ModerationAction {
  action: 'approve' | 'reject' | 'flag' | 'hide'
  reason?: string
  notes?: string
  notifyCustomer?: boolean
  notificationMessage?: string
}

const MODERATION_REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
  { value: 'fake_review', label: 'Fake Review' },
  { value: 'offensive_language', label: 'Offensive Language' },
  { value: 'personal_information', label: 'Contains Personal Information' },
  { value: 'competitor_mention', label: 'Mentions Competitor' },
  { value: 'off_topic', label: 'Off Topic' },
  { value: 'duplicate', label: 'Duplicate Review' },
  { value: 'other', label: 'Other' }
]

const QUICK_RESPONSES = [
  {
    title: 'Thank you for positive feedback',
    content: 'Thank you so much for your wonderful review! We truly appreciate your feedback and are thrilled that you had such a positive experience with us.'
  },
  {
    title: 'Apologize for negative experience',
    content: 'We sincerely apologize for your experience. Your feedback is valuable to us and we would love the opportunity to make this right. Please contact us directly so we can address your concerns.'
  },
  {
    title: 'Request more details',
    content: 'Thank you for your feedback. We would appreciate more details about your experience so we can better understand and improve our service. Please feel free to contact us directly.'
  },
  {
    title: 'Acknowledge and improve',
    content: 'Thank you for bringing this to our attention. We take all feedback seriously and are taking steps to ensure this doesn\'t happen again. We appreciate your patience as we work to improve.'
  }
]

export function ReviewModeration({
  salonId,
  locationId,
  className
}: ReviewModerationProps) {
  const [reviews, setReviews] = React.useState<Review[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedTab, setSelectedTab] = React.useState('pending')
  const [selectedReviews, setSelectedReviews] = React.useState<Set<string>>(new Set())
  const [showModerationDialog, setShowModerationDialog] = React.useState(false)
  const [currentReview, setCurrentReview] = React.useState<Review | null>(null)
  const [moderationAction, setModerationAction] = React.useState<ModerationAction>({
    action: 'approve'
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterRating, setFilterRating] = React.useState('all')
  const [stats, setStats] = React.useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
    total: 0
  })

  const fetchReviews = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const filters: ReviewFilterInput = {
        salon_id: salonId,
        location_id: locationId,
        status: selectedTab as any,
        search: searchQuery || undefined,
        min_rating: filterRating !== 'all' ? parseInt(filterRating) : undefined,
        limit: 50,
        offset: 0
      }

      const result = await getReviews(filters)
      setReviews(result.reviews)

      // Fetch stats for all statuses
      const [pending, approved, rejected, flagged] = await Promise.all([
        getReviews({ ...filters, status: 'pending' }),
        getReviews({ ...filters, status: 'approved' }),
        getReviews({ ...filters, status: 'rejected' }),
        getReviews({ ...filters, status: 'flagged' })
      ])

      setStats({
        pending: pending.total,
        approved: approved.total,
        rejected: rejected.total,
        flagged: flagged.total,
        total: pending.total + approved.total + rejected.total + flagged.total
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reviews'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [salonId, locationId, selectedTab, searchQuery, filterRating])

  React.useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleModerate = async (review: Review, action: ModerationAction) => {
    setIsSubmitting(true)
    try {
      await moderateReview({
        review_id: review.id,
        action: action.action,
        reason: action.reason as any,
        notes: action.notes,
        notify_customer: action.notifyCustomer || false,
        notification_message: action.notificationMessage
      })

      // Remove from current list and refresh
      setReviews(prev => prev.filter(r => r.id !== review.id))
      fetchReviews()
      
      setShowModerationDialog(false)
      setCurrentReview(null)
      setModerationAction({ action: 'approve' })
    } catch (err) {
      console.error('Failed to moderate review:', err)
      // You could show a toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkAction = async (action: 'approve' | 'reject' | 'flag' | 'hide') => {
    if (selectedReviews.size === 0) return

    setIsSubmitting(true)
    try {
      const promises = Array.from(selectedReviews).map(reviewId => 
        moderateReview({
          review_id: reviewId,
          action,
          notify_customer: false
        })
      )

      await Promise.all(promises)
      setSelectedReviews(new Set())
      fetchReviews()
    } catch (err) {
      console.error('Failed to perform bulk action:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectReview = (reviewId: string, selected: boolean) => {
    setSelectedReviews(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(reviewId)
      } else {
        newSet.delete(reviewId)
      }
      return newSet
    })
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedReviews(new Set(reviews.map(r => r.id)))
    } else {
      setSelectedReviews(new Set())
    }
  }

  const openModerationDialog = (review: Review, action: 'approve' | 'reject' | 'flag' | 'hide') => {
    setCurrentReview(review)
    setModerationAction({ action })
    setShowModerationDialog(true)
  }

  const renderStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Flag className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.flagged}</p>
              <p className="text-xs text-muted-foreground">Flagged</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters & Actions
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchReviews} disabled={isLoading}>
              <RefreshCw className={cn("h-3 w-3 mr-1", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Search Reviews</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content, titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Minimum Rating</Label>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="2">2+ Stars</SelectItem>
                <SelectItem value="1">1+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bulk Actions</Label>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('approve')}
                disabled={selectedReviews.size === 0 || isSubmitting}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve ({selectedReviews.size})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('reject')}
                disabled={selectedReviews.size === 0 || isSubmitting}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject ({selectedReviews.size})
              </Button>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedReviews.size === reviews.length}
                onCheckedChange={handleSelectAll}
              />
              <Label className="text-sm">
                Select all {reviews.length} reviews
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedReviews.size} of {reviews.length} selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderReviewActions = (review: Review) => {
    const actions = []

    if (review.status === 'pending') {
      actions.push(
        <Button
          key="approve"
          size="sm"
          variant="outline"
          onClick={() => openModerationDialog(review, 'approve')}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Approve
        </Button>,
        <Button
          key="reject"
          size="sm"
          variant="outline"
          onClick={() => openModerationDialog(review, 'reject')}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Reject
        </Button>
      )
    }

    actions.push(
      <Button
        key="flag"
        size="sm"
        variant="outline"
        onClick={() => openModerationDialog(review, 'flag')}
        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
      >
        <Flag className="h-3 w-3 mr-1" />
        Flag
      </Button>
    )

    if (review.status !== 'hidden') {
      actions.push(
        <Button
          key="hide"
          size="sm"
          variant="outline"
          onClick={() => openModerationDialog(review, 'hide')}
          className="text-gray-600 border-gray-200 hover:bg-gray-50"
        >
          <EyeOff className="h-3 w-3 mr-1" />
          Hide
        </Button>
      )
    }

    return (
      <div className="flex flex-wrap gap-1 mt-3">
        {actions}
      </div>
    )
  }

  const renderReviewList = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button variant="outline" size="sm" onClick={fetchReviews} className="mt-2">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
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
                <h3 className="text-lg font-semibold">No reviews to moderate</h3>
                <p className="text-muted-foreground">
                  {selectedTab === 'pending' 
                    ? "All reviews have been moderated"
                    : `No ${selectedTab} reviews found`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedReviews.has(review.id)}
                  onCheckedChange={(checked) => handleSelectReview(review.id, checked as boolean)}
                />
                <div className="flex-1">
                  <ReviewCard
                    review={review}
                    allowVoting={false}
                    allowResponse={true}
                    showSalon={false}
                    compact={false}
                    onUpdate={fetchReviews}
                  />
                  {renderReviewActions(review)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={className}>
      {renderStats()}
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="pending" className="relative">
              Pending Reviews
              {stats.pending > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({stats.rejected})
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged ({stats.flagged})
            </TabsTrigger>
          </TabsList>
        </div>

        {renderFilters()}

        <TabsContent value={selectedTab}>
          {renderReviewList()}
        </TabsContent>
      </Tabs>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {moderationAction.action === 'approve' && 'Approve Review'}
              {moderationAction.action === 'reject' && 'Reject Review'}
              {moderationAction.action === 'flag' && 'Flag Review'}
              {moderationAction.action === 'hide' && 'Hide Review'}
            </DialogTitle>
            <DialogDescription>
              Please provide details for this moderation action.
            </DialogDescription>
          </DialogHeader>

          {currentReview && (
            <div className="space-y-4">
              {/* Review Preview */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < currentReview.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium">
                    {currentReview.customers 
                      ? `${currentReview.customers.first_name} ${currentReview.customers.last_name}`
                      : 'Anonymous'
                    }
                  </span>
                  <Badge variant="outline">{currentReview.status}</Badge>
                </div>
                {currentReview.title && (
                  <h4 className="font-semibold mb-2">{currentReview.title}</h4>
                )}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {currentReview.content}
                </p>
              </div>

              {/* Moderation Form */}
              <div className="space-y-4">
                {(moderationAction.action === 'reject' || moderationAction.action === 'flag') && (
                  <div className="space-y-2">
                    <Label>Reason *</Label>
                    <Select 
                      value={moderationAction.reason} 
                      onValueChange={(value) => setModerationAction(prev => ({ ...prev, reason: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MODERATION_REASONS.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Internal Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add notes for your team..."
                    value={moderationAction.notes || ''}
                    onChange={(e) => setModerationAction(prev => ({ ...prev, notes: e.target.value }))}
                    className="min-h-20"
                  />
                </div>

                {moderationAction.action === 'reject' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="notify"
                        checked={moderationAction.notifyCustomer || false}
                        onCheckedChange={(checked) => 
                          setModerationAction(prev => ({ ...prev, notifyCustomer: checked as boolean }))
                        }
                      />
                      <Label htmlFor="notify">Notify customer about rejection</Label>
                    </div>

                    {moderationAction.notifyCustomer && (
                      <div className="space-y-2">
                        <Label>Notification Message</Label>
                        <Textarea
                          placeholder="Explain why the review was rejected..."
                          value={moderationAction.notificationMessage || ''}
                          onChange={(e) => setModerationAction(prev => ({ 
                            ...prev, 
                            notificationMessage: e.target.value 
                          }))}
                          className="min-h-20"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {moderationAction.action === 'approve' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    This review will be made public and visible to customers.
                  </AlertDescription>
                </Alert>
              )}

              {moderationAction.action === 'reject' && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    This review will be rejected and will not appear publicly.
                    {moderationAction.notifyCustomer && ' The customer will be notified.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModerationDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => currentReview && handleModerate(currentReview, moderationAction)}
              disabled={isSubmitting || (
                (moderationAction.action === 'reject' || moderationAction.action === 'flag') && 
                !moderationAction.reason
              )}
              className={cn(
                moderationAction.action === 'approve' && "bg-green-600 hover:bg-green-700",
                moderationAction.action === 'reject' && "bg-red-600 hover:bg-red-700",
                moderationAction.action === 'flag' && "bg-yellow-600 hover:bg-yellow-700",
                moderationAction.action === 'hide' && "bg-gray-600 hover:bg-gray-700"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {moderationAction.action === 'approve' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {moderationAction.action === 'reject' && <XCircle className="h-4 w-4 mr-2" />}
                  {moderationAction.action === 'flag' && <Flag className="h-4 w-4 mr-2" />}
                  {moderationAction.action === 'hide' && <EyeOff className="h-4 w-4 mr-2" />}
                  {moderationAction.action.charAt(0).toUpperCase() + moderationAction.action.slice(1)} Review
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}