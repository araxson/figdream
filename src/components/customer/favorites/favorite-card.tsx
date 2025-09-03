"use client"
import { Card, CardContent, CardHeader, Button, Badge } from "@/components/ui"
import { 
  Heart, 
  Store, 
  User, 
  Scissors, 
  Star, 
  MapPin, 
  Clock,
  DollarSign,
  Calendar,
  MoreVertical,
  Trash2
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui"
import { format } from "date-fns"
import { QuickBookFromFavorite } from "./quick-book-from-favorite"
import { toast } from "sonner"
type FavoriteType = 'salon' | 'staff' | 'service'
type Favorite = {
  id: string
  type: FavoriteType
  itemId: string
  itemName: string
  itemImage?: string
  itemDescription?: string
  addedAt: string
  lastVisited?: string
  bookingCount: number
  rating?: number
  price?: number
  duration?: number
  location?: string
}
interface FavoriteCardProps {
  favorite: Favorite
  viewMode: 'grid' | 'list'
  onRemove: () => void
}
export function FavoriteCard({ favorite, viewMode, onRemove }: FavoriteCardProps) {
  const getIcon = () => {
    switch (favorite.type) {
      case 'salon':
        return <Store className="h-4 w-4" />
      case 'staff':
        return <User className="h-4 w-4" />
      case 'service':
        return <Scissors className="h-4 w-4" />
    }
  }
  const getTypeColor = () => {
    switch (favorite.type) {
      case 'salon':
        return 'bg-purple-100 text-purple-800'
      case 'staff':
        return 'bg-blue-100 text-blue-800'
      case 'service':
        return 'bg-green-100 text-green-800'
    }
  }
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: favorite.itemName,
        text: `Check out ${favorite.itemName}`,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }
  if (viewMode === 'list') {
    return (
      <Card>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1">
            {favorite.itemImage && (
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                {/* Image would go here */}
                {getIcon()}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{favorite.itemName}</h3>
                <Badge variant="outline" className={getTypeColor()}>
                  {getIcon()}
                  <span className="ml-1">{favorite.type}</span>
                </Badge>
              </div>
              {favorite.itemDescription && (
                <p className="text-sm text-muted-foreground mb-2">{favorite.itemDescription}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {favorite.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{favorite.rating}</span>
                  </div>
                )}
                {favorite.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{favorite.location}</span>
                  </div>
                )}
                {favorite.price && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${favorite.price}</span>
                  </div>
                )}
                {favorite.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{favorite.duration} min</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{favorite.bookingCount} bookings</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <QuickBookFromFavorite favorite={favorite} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove from favorites
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge variant="outline" className={getTypeColor()}>
            {getIcon()}
            <span className="ml-1">{favorite.type}</span>
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-2 -mt-2"
            onClick={onRemove}
          >
            <Heart className="h-4 w-4 fill-current" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {favorite.itemImage && (
          <div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center">
            {/* Image would go here */}
            {getIcon()}
          </div>
        )}
        <div>
          <h3 className="font-semibold">{favorite.itemName}</h3>
          {favorite.itemDescription && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {favorite.itemDescription}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {favorite.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{favorite.rating}</span>
            </div>
          )}
          {favorite.bookingCount > 0 && (
            <span>{favorite.bookingCount} bookings</span>
          )}
        </div>
        {favorite.location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{favorite.location}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          {favorite.price ? (
            <span className="text-lg font-semibold">${favorite.price}</span>
          ) : favorite.duration ? (
            <span className="text-sm text-muted-foreground">{favorite.duration} min</span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Added {format(new Date(favorite.addedAt), 'MMM d')}
            </span>
          )}
          <QuickBookFromFavorite favorite={favorite} size="sm" />
        </div>
      </CardContent>
    </Card>
  )
}