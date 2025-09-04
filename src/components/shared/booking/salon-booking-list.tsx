'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'

interface SalonWithStats {
  id: string
  name: string
  description: string | null
  image_url: string | null
  address_line_1: string | null
  city: string | null
  rating: number
  reviewCount: number
  serviceCategories: string[]
}

export interface SalonBookingListProps {
  salons: SalonWithStats[]
  className?: string
}

export function SalonBookingList({ salons, className }: SalonBookingListProps) {
  if (!salons || salons.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No salons available for booking at this time.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {salons.map((salon) => (
          <Link key={salon.id} href={`/book/${salon.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-lg">{salon.name}</CardTitle>
                {salon.city && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{salon.city}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {salon.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {salon.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{salon.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({salon.reviewCount})</span>
                  </div>
                  {salon.serviceCategories.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {salon.serviceCategories.length} categories
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
