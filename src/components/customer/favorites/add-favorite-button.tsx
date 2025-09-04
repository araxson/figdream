"use client"
import { useState, useEffect, useCallback } from "react"
import { Button } from '@/components/ui/button'
import { Heart, Loader2 } from "lucide-react"
import { createClient } from "@/lib/database/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
type FavoriteType = 'salon' | 'staff' | 'service'
interface AddFavoriteButtonProps {
  itemId: string
  itemType: FavoriteType
  itemName: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
}
export function AddFavoriteButton({
  itemId,
  itemType,
  itemName,
  className,
  variant = 'ghost',
  size = 'icon',
  showText = false
}: AddFavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const checkFavoriteStatus = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setChecking(false)
        return
      }
      // Check if item is in favorites
      // For now, using localStorage as mock
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      const exists = favorites.some((f: { itemId: string; type: string }) => f.itemId === itemId && f.type === itemType)
      setIsFavorite(exists)
    } catch (_error) {
    } finally {
      setChecking(false)
    }
  }, [itemId, itemType])

  useEffect(() => {
    checkFavoriteStatus()
  }, [checkFavoriteStatus])
  async function toggleFavorite() {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to save favorites")
        return
      }
      // Toggle favorite status
      // For now, using localStorage as mock
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (isFavorite) {
        // Remove from favorites
        const updated = favorites.filter((f: { itemId: string; type: string }) => !(f.itemId === itemId && f.type === itemType))
        localStorage.setItem('favorites', JSON.stringify(updated))
        setIsFavorite(false)
        toast.success(`${itemName} removed from favorites`)
      } else {
        // Add to favorites
        const newFavorite = {
          id: `fav-${Date.now()}`,
          itemId,
          type: itemType,
          itemName,
          addedAt: new Date().toISOString()
        }
        favorites.push(newFavorite)
        localStorage.setItem('favorites', JSON.stringify(favorites))
        setIsFavorite(true)
        toast.success(`${itemName} added to favorites`)
      }
    } catch (_error) {
      toast.error("Failed to update favorites")
    } finally {
      setLoading(false)
    }
  }
  if (checking) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        {showText && <span className="ml-2">Loading...</span>}
      </Button>
    )
  }
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        isFavorite && variant === 'ghost' && "text-red-500 hover:text-red-600",
        className
      )}
      onClick={toggleFavorite}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart 
          className={cn(
            "h-4 w-4",
            isFavorite && "fill-current"
          )} 
        />
      )}
      {showText && (
        <span className="ml-2">
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </span>
      )}
    </Button>
  )
}