"use client"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'

import { Star, DollarSign, Heart, Phone, Mail, Calendar } from "lucide-react"
import type { Database } from "@/types/database.types"
type Profile = Database['public']['Tables']['profiles']['Row']
type Customer = Profile & {
  appointments_count?: number
  total_spent?: number
  loyalty_points?: number
  average_rating?: number
  last_appointment?: string
  favorite_services?: string[]
  loyalty_tier?: string
  phone?: string
  email?: string
}
interface CustomerHoverCardProps {
  customer: Customer
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
}
export function CustomerHoverCard({ customer, children, side = "right" }: CustomerHoverCardProps) {
  const displayName = customer.full_name || 'Unknown Customer'
  const initials = displayName.split(' ').map(name => name[0]).join('').toUpperCase()
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'}).format(amount)
  }
  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  // Get loyalty tier badge variant
  const getLoyaltyBadgeVariant = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'gold': return 'default'
      case 'silver': return 'secondary'
      case 'bronze': return 'outline'
      default: return 'outline'
    }
  }
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent side={side} className="w-80">
        <div className="flex gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={customer.avatar_url || undefined} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="text-sm font-semibold">{displayName}</h4>
              {customer.email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {customer.email}
                </p>
              )}
              {customer.phone && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {customer.loyalty_tier && (
                <Badge variant={getLoyaltyBadgeVariant(customer.loyalty_tier)}>
                  {customer.loyalty_tier} Member
                </Badge>
              )}
              {customer.loyalty_points && customer.loyalty_points > 0 && (
                <Badge variant="outline">
                  <Heart className="h-3 w-3 mr-1" />
                  {customer.loyalty_points} pts
                </Badge>
              )}
            </div>
            {customer.favorite_services && customer.favorite_services.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Favorite Services:</p>
                <div className="flex flex-wrap gap-1">
                  {customer.favorite_services.slice(0, 2).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {customer.favorite_services.length > 2 && (
                    <Badge variant="secondary">
                      +{customer.favorite_services.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-2 text-xs">
              {customer.appointments_count && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-blue-500" />
                  <span>{customer.appointments_count} visits</span>
                </div>
              )}
              {customer.total_spent && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-500" />
                  <span>{formatCurrency(customer.total_spent)}</span>
                </div>
              )}
              {customer.average_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{customer.average_rating.toFixed(1)} rating</span>
                </div>
              )}
              {customer.last_appointment && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span>Last: {formatDate(customer.last_appointment)}</span>
                </div>
              )}
            </div>
            {customer.created_at && (
              <>
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Customer since {formatDate(customer.created_at)}
                </p>
              </>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
