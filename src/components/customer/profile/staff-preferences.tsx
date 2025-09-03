'use client'
import { useState } from 'react'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
} from '@/components/ui'
import { Star, UserPlus, UserMinus } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
interface FavoriteStaff {
  id: string
  name: string
  avatar: string
  title: string
  visitCount: number
}
interface StaffPreferencesProps {
  customerId: string
  favoriteStaff: FavoriteStaff[]
}
export function StaffPreferences({ 
  customerId, 
  favoriteStaff 
}: StaffPreferencesProps) {
  const [preferredStaff, setPreferredStaff] = useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const handleTogglePreference = async (staffId: string, isAdding: boolean) => {
    setIsUpdating(staffId)
    try {
      const supabase = createClient()
      if (isAdding) {
        const { error } = await supabase
          .from('customer_preferences')
          .insert({
            customer_id: customerId,
            preference_type: 'preferences',
            preference_value: `preferred_staff:${staffId}`
          })
        if (error) throw error
        setPreferredStaff(prev => new Set([...prev, staffId]))
        toast.success('Added to preferred staff')
      } else {
        const { error } = await supabase
          .from('customer_preferences')
          .delete()
          .eq('customer_id', customerId)
          .eq('preference_value', `preferred_staff:${staffId}`)
        if (error) throw error
        setPreferredStaff(prev => {
          const newSet = new Set(prev)
          newSet.delete(staffId)
          return newSet
        })
        toast.success('Removed from preferred staff')
      }
    } catch (_error) {
      toast.error('Failed to update preference')
    } finally {
      setIsUpdating(null)
    }
  }
  if (favoriteStaff.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Book appointments to discover your favorite staff members
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Based on your appointment history, here are your most visited staff members
      </p>
      <div className="grid gap-4">
        {favoriteStaff.map((staff) => (
          <Card key={staff.id}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={staff.avatar} />
                  <AvatarFallback>
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{staff.name}</p>
                  <p className="text-sm text-muted-foreground">{staff.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      {staff.visitCount} visits
                    </Badge>
                    {preferredStaff.has(staff.id) && (
                      <Badge variant="default">
                        <Star className="h-3 w-3 mr-1" />
                        Preferred
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant={preferredStaff.has(staff.id) ? 'outline' : 'default'}
                size="sm"
                onClick={() => handleTogglePreference(
                  staff.id, 
                  !preferredStaff.has(staff.id)
                )}
                disabled={isUpdating === staff.id}
              >
                {preferredStaff.has(staff.id) ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Set as Preferred
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Setting preferred staff helps us match you with your favorites when booking
      </p>
    </div>
  )
}