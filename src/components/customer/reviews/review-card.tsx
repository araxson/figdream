'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MoreVertical,
  Flag,
  Share2,
  Edit,
  Trash2,
  Reply,
  CheckCircle,
  AlertCircle,
  Camera,
  Calendar,
  MapPin,
  User,
  Award,
  Clock,
  ExternalLink,
  Heart,
  Eye,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { voteReview, createReviewResponse, moderateReview } from '@/lib/data-access/reviews/reviews'
import type { Database } from '@/types/database.types'

type ReviewPhoto = {
  url: string
  caption?: string
  thumbnail_url?: string
}

type Review = Database['public']['Tables']['reviews']['Row'] & {
  photos?: ReviewPhoto[]
  tags?: string[]
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
  review_responses?: Array<{
    id: string
    content: string
    responder_id: string
    respondent_name?: string
    respondent_title?: string
    created_at: string
    updated_at?: string
  }>
  review_votes?: Array<{
    vote_type: 'helpful' | 'not_helpful'
  }>
}

interface ReviewCardProps {
  review: Review
  allowModeration?: boolean
  allowVoting?: boolean
  allowResponse?: boolean
  allowEdit?: boolean
  showSalon?: boolean
  showService?: boolean
  showStaff?: boolean
  showLocation?: boolean
  compact?: boolean
  className?: string
  onUpdate?: () => void
  onEdit?: (review: Review) => void
  onDelete?: (reviewId: string) => void
}

export function ReviewCard({
  review,
  allowModeration = false,
  allowVoting = true,
  allowResponse = false,
  allowEdit = false,
  showSalon = true,
  showService = true,
  showStaff = true,
  showLocation = false,
  compact = false,
  className,
  onUpdate,
  onEdit,
  onDelete
}: ReviewCardProps) {
  const [userVote, setUserVote] = React.useState<'helpful' | 'not_helpful' | null>(null)
  const [helpfulCount, setHelpfulCount] = React.useState(review.helpful_count || 0)
  const [isVoting, setIsVoting] = React.useState(false)
  const [showReplyDialog, setShowReplyDialog] = React.useState(false)
  const [replyContent, setReplyContent] = React.useState('')
  const [isSubmittingReply, setIsSubmittingReply] = React.useState(false)
  const [showImageDialog, setShowImageDialog] = React.useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0)

  // Get customer name for display
  const customerName = React.useMemo(() => {
    if (review.is_anonymous) return 'Anonymous'
    if (review.customers) {
      return `${review.customers.first_name} ${review.customers.last_name}`
    }
    return 'Customer'
  }, [review])

  // Get customer initials
  const customerInitials = React.useMemo(() => {
    if (review.is_anonymous) return 'A'
    if (review.customers) {
      return `${review.customers.first_name[0]}${review.customers.last_name[0]}`.toUpperCase()
    }
    return 'C'
  }, [review])

  // Parse photos if they exist
  const photos = React.useMemo(() => {
    if (!review.photos) return []
    if (Array.isArray(review.photos)) return review.photos
    try {
      return JSON.parse(review.photos as string)
    } catch {
      return []
    }
  }, [review.photos])

  // Parse tags if they exist
  const tags = React.useMemo(() => {
    if (!review.tags) return []
    if (Array.isArray(review.tags)) return review.tags
    try {
      return JSON.parse(review.tags as string)
    } catch {
      return []
    }
  }, [review.tags])

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    if (isVoting) return
    
    setIsVoting(true)
    try {
      // In a real app, you'd get the session ID or user ID
      await voteReview({
        review_id: review.id,
        vote_type: voteType,
        session_id: 'session-' + Date.now() // Temporary session ID
      })

      // Update local state
      if (userVote === voteType) {
        // Remove vote
        setUserVote(null)
        setHelpfulCount(prev => voteType === 'helpful' ? prev - 1 : prev)
      } else {
        // Add or change vote
        if (userVote === 'helpful' && voteType === 'not_helpful') {
          setHelpfulCount(prev => prev - 1)
        } else if (userVote === null && voteType === 'helpful') {
          setHelpfulCount(prev => prev + 1)
        }
        setUserVote(voteType)
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim() || isSubmittingReply) return

    setIsSubmittingReply(true)
    try {
      await createReviewResponse({
        review_id: review.id,
        response_type: 'custom',
        content: replyContent.trim(),
        is_public: true,
        respondent_name: 'Business Owner', // This would come from user context
        respondent_title: 'Owner'
      })

      setShowReplyDialog(false)
      setReplyContent('')
      onUpdate?.()
    } catch (error) {
      console.error('Failed to reply:', error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleModerate = async (action: 'approve' | 'reject' | 'flag' | 'hide') => {
    try {
      await moderateReview({
        review_id: review.id,
        action,
        notify_customer: false
      })
      onUpdate?.()
    } catch (error) {
      console.error('Failed to moderate review:', error)
    }
  }

  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'xs' | 'sm' | 'md' }) => {
    const sizeClasses = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4', 
      md: 'h-5 w-5'
    }

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
          />
        ))}
      </div>
    )
  }

  const renderBadges = () => {
    const badges = []
    
    if (review.verified_purchase) {
      badges.push(
        <Badge key="verified" variant="secondary" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )
    }

    if (photos.length > 0) {
      badges.push(
        <Badge key="photos" variant="outline" className="text-xs">
          <Camera className="h-3 w-3 mr-1" />
          {photos.length} Photo{photos.length > 1 ? 's' : ''}
        </Badge>
      )
    }

    if (review.review_responses && review.review_responses.length > 0) {
      badges.push(
        <Badge key="response" variant="outline" className="text-xs">
          <Reply className="h-3 w-3 mr-1" />
          Business Replied
        </Badge>
      )
    }

    if (review.would_recommend) {
      badges.push(
        <Badge key="recommend" variant="secondary" className="text-xs">
          <Heart className="h-3 w-3 mr-1" />
          Recommends
        </Badge>
      )
    }

    return badges
  }

  const renderPhotos = () => {
    if (photos.length === 0) return null

    return (
      <div className="mt-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.slice(0, 4).map((photo, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImageIndex(index)
                setShowImageDialog(true)
              }}
              className="relative flex-shrink-0 w-20 bg-muted rounded-lg overflow-hidden hover:opacity-80 transition-opacity group"
            >
              <AspectRatio ratio={1}>
                <img 
                  src={photo.url} 
                  alt={photo.caption || `Review photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && photos.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      +{photos.length - 3}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </AspectRatio>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const renderDetailedRatings = () => {
    if (compact) return null

    const ratings = [
      { label: 'Service', value: review.service_rating },
      { label: 'Staff', value: review.staff_rating },
      { label: 'Cleanliness', value: review.cleanliness_rating },
      { label: 'Value', value: review.value_rating }
    ].filter(r => r.value && r.value > 0)

    if (ratings.length === 0) return null

    return (
      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
        <h5 className="text-xs font-medium text-muted-foreground mb-2">Detailed Ratings</h5>
        <div className="grid grid-cols-2 gap-2">
          {ratings.map((rating) => (
            <div key={rating.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{rating.label}</span>
              <div className="flex items-center gap-1">
                <StarRating rating={rating.value!} size="xs" />
                <span className="text-xs font-medium ml-1">{rating.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderResponse = () => {
    if (!review.review_responses || review.review_responses.length === 0) return null

    const response = review.review_responses[0] // Show only the first response

    return (
      <div className="mt-4 bg-muted/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                Business Response
              </Badge>
              <span className="text-xs text-muted-foreground">
                {response.respondent_name}
                {response.respondent_title && ` • ${response.respondent_title}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm">{response.content}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderActions = () => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          {allowVoting && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('helpful')}
                disabled={isVoting}
                className={cn(
                  "text-xs",
                  userVote === 'helpful' && "text-green-600 bg-green-50"
                )}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful ({helpfulCount})
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('not_helpful')}
                disabled={isVoting}
                className={cn(
                  "text-xs",
                  userVote === 'not_helpful' && "text-red-600 bg-red-50"
                )}
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                Not helpful
              </Button>
            </>
          )}
          
          <Button variant="ghost" size="sm" className="text-xs">
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Flag className="h-4 w-4 mr-2" />
              Report Review
            </DropdownMenuItem>
            
            {allowResponse && (
              <DropdownMenuItem onClick={() => setShowReplyDialog(true)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply to Review
              </DropdownMenuItem>
            )}
            
            {allowEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit?.(review)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Review
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete?.(review.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Review
                </DropdownMenuItem>
              </>
            )}
            
            {allowModeration && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleModerate('approve')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModerate('reject')}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reject
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModerate('flag')}>
                  <Flag className="h-4 w-4 mr-2" />
                  Flag for Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleModerate('hide')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Hide Review
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <>
      <Card className={className}>
        <CardContent>
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage 
                src={review.is_anonymous ? undefined : review.customers?.avatar_url} 
              />
              <AvatarFallback>{customerInitials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm">{customerName}</h4>
                  
                  {showSalon && review.salons && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{review.salons.name}</span>
                    </>
                  )}
                  
                  {showLocation && review.locations && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {review.locations.name}
                      </span>
                    </>
                  )}
                </div>

                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Service/Staff Info */}
              {(showService || showStaff) && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  {showService && review.services && (
                    <span>{review.services.name}</span>
                  )}
                  
                  {showStaff && review.staff && (
                    <>
                      {showService && <span>•</span>}
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {review.staff.first_name} {review.staff.last_name}
                      </span>
                    </>
                  )}
                  
                  {review.visited_date && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Visited {format(new Date(review.visited_date), 'MMM d, yyyy')}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Rating and Badges */}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm font-medium">{review.rating}</span>
                </div>
                
                {renderBadges()}
              </div>

              {/* Review Title */}
              {review.title && (
                <h5 className="font-semibold mb-2">{review.title}</h5>
              )}

              {/* Review Content */}
              <p className="text-sm leading-relaxed mb-3">{review.content}</p>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.slice(0, 8).map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{tags.length - 8} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Photos */}
              {renderPhotos()}

              {/* Detailed Ratings */}
              {renderDetailedRatings()}

              {/* Business Response */}
              {renderResponse()}

              {/* Actions */}
              {renderActions()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Respond to this customer's review professionally and helpfully.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} />
                <span className="font-medium">{customerName}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {review.content}
              </p>
            </div>
            
            <Textarea
              placeholder="Write your response..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-32"
              maxLength={1000}
            />
            
            <p className="text-xs text-muted-foreground text-right">
              {replyContent.length}/1000 characters
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReplyDialog(false)}
              disabled={isSubmittingReply}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={!replyContent.trim() || isSubmittingReply}
            >
              {isSubmittingReply ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Replying...
                </>
              ) : (
                'Send Reply'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Gallery Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Photos</DialogTitle>
          </DialogHeader>
          
          {photos.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <AspectRatio ratio={16 / 9}>
                    <img 
                      src={photos[selectedImageIndex]?.url} 
                      alt={photos[selectedImageIndex]?.caption || 'Review photo'}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </AspectRatio>
                </div>
              </div>
              
              {photos[selectedImageIndex]?.caption && (
                <p className="text-center text-sm text-muted-foreground">
                  {photos[selectedImageIndex].caption}
                </p>
              )}
              
              {photos.length > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "flex-shrink-0 w-16 rounded-lg overflow-hidden border-2",
                        index === selectedImageIndex 
                          ? "border-primary" 
                          : "border-transparent hover:border-muted-foreground/50"
                      )}
                    >
                      <AspectRatio ratio={1}>
                        <img 
                          src={photo.url} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}