"use client"
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { Clock, DollarSign, Star, Users, Tag, AlertCircle } from "lucide-react"
import type { Database } from "@/types/database.types"
type Service = Database['public']['Tables']['services']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type ServiceDetails = Service & {
  service_categories?: ServiceCategory | null
  average_rating?: number
  booking_count?: number
  staff_count?: number
  popularity_rank?: number
  requirements?: string[]
}
interface ServiceHoverCardProps {
  service: ServiceDetails
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
}
export function ServiceHoverCard({ service, children, side = "right" }: ServiceHoverCardProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }
  // Get popularity badge
  const getPopularityBadge = (rank?: number) => {
    if (!rank) return null
    if (rank <= 3) {
      return <Badge variant="default">Most Popular</Badge>
    } else if (rank <= 10) {
      return <Badge variant="secondary">Popular</Badge>
    }
    return null
  }
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent side={side} className="w-80">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold">{service.name}</h4>
            {service.service_categories?.name && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {service.service_categories.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(service.duration_minutes)}
            </Badge>
            <Badge variant="outline">
              <DollarSign className="h-3 w-3 mr-1" />
              {formatCurrency(service.base_price)}
            </Badge>
            {getPopularityBadge(service.popularity_rank)}
          </div>
          {service.description && (
            <p className="text-xs text-muted-foreground line-clamp-3">
              {service.description}
            </p>
          )}
          <Separator />
          <div className="grid grid-cols-2 gap-2 text-xs">
            {service.average_rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span>{service.average_rating.toFixed(1)} rating</span>
              </div>
            )}
            {service.booking_count && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                <span>{service.booking_count} bookings</span>
              </div>
            )}
            {service.staff_count && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-green-500" />
                <span>{service.staff_count} staff</span>
              </div>
            )}
            {service.buffer_time_after && service.buffer_time_after > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-500" />
                <span>{service.buffer_time_after}m buffer</span>
              </div>
            )}
          </div>
          {service.requirements && service.requirements.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Requirements:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {service.requirements.slice(0, 3).map((req, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span>•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                  {service.requirements.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      +{service.requirements.length - 3} more requirements
                    </li>
                  )}
                </ul>
              </div>
            </>
          )}
          {!service.is_active && (
            <>
              <Separator />
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>Service currently unavailable</span>
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
