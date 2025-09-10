import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Clock, Calendar } from 'lucide-react'
import { CustomerFavorite } from './favorites-types'

interface ServiceFavoritesProps {
  favorites: CustomerFavorite[]
  onRemove: (favoriteId: string) => void
}

export function ServiceFavorites({ favorites, onRemove }: ServiceFavoritesProps) {
  return (
    <>
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="font-semibold">{favorite.services?.name}</h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {favorite.services?.duration_minutes} min
                </div>
                <div className="font-medium text-foreground">
                  ${favorite.services?.price}
                </div>
              </div>
              {favorite.services?.description && (
                <p className="text-sm text-muted-foreground">
                  {favorite.services.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Book
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(favorite.id)}
              >
                <Heart className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}