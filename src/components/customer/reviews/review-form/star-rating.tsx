'use client'
import * as React from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StarRatingProps } from './review-form.types'
import { getRatingLabel, getRatingColor, getStarSizeClass } from './review-form.utils'

export function StarRating({ 
  value, 
  onChange, 
  size = 'lg',
  showLabel = true,
  allowHalf = true,
  disabled = false
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number>(0)

  const handleClick = (rating: number) => {
    onChange(rating)
  }

  const handleMouseEnter = (rating: number) => {
    setHoverValue(rating)
  }

  const handleMouseLeave = () => {
    setHoverValue(0)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => {
          const isFilled = (hoverValue || value) >= rating
          const isHalfFilled = allowHalf && (hoverValue || value) >= rating - 0.5 && (hoverValue || value) < rating
          
          return (
            <Button
              key={rating}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              disabled={disabled}
              className={cn(
                'p-1 h-auto rounded',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <Star
                className={cn(
                  getStarSizeClass(size),
                  '',
                  isFilled 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : isHalfFilled
                    ? 'fill-yellow-200 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            </Button>
          )
        })}
      </div>
      {showLabel && (
        <span className={cn(
          'text-sm font-medium',
          getRatingColor(hoverValue || value)
        )}>
          {getRatingLabel(hoverValue || value)}
        </span>
      )}
    </div>
  )
}