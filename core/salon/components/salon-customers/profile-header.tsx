"use client"

import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface CustomerProfileHeaderProps {
  customer: {
    id: string
    display_name?: string | null
    avatar_url?: string | null
    is_vip?: boolean
    created_at?: string | null
  }
  onToggleVIP: () => void
  isPending: boolean
}

export function CustomerProfileHeader({
  customer,
  onToggleVIP,
  isPending
}: CustomerProfileHeaderProps) {
  return (
    <SheetHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={customer.avatar_url || undefined} />
            <AvatarFallback>
              {customer.display_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <SheetTitle className="text-xl flex items-center gap-2">
              {customer.display_name || 'Unknown Customer'}
              {customer.is_vip && (
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  VIP
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Customer since {new Date(customer.created_at!).toLocaleDateString()}
            </SheetDescription>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleVIP}
          disabled={isPending}
        >
          {customer.is_vip ? (
            <>
              <Star className="h-4 w-4 mr-2 fill-current" />
              VIP
            </>
          ) : (
            <>
              <Star className="h-4 w-4 mr-2" />
              Make VIP
            </>
          )}
        </Button>
      </div>
    </SheetHeader>
  )
}