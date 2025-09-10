'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

export function StaffSelection() {
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string>('any')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStaff = useCallback(async () => {
    try {
      // In a real app, this would filter by selected salon and available services
      const { data, error } = await supabase
        .from('staff_profiles')
        .select(`
          *,
          profiles!staff_profiles_user_id_fkey(*)
        `)
        .eq('is_active', true)
        .eq('is_bookable', true)

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select Staff Member</CardTitle>
          <CardDescription>Choose your preferred stylist or select any available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading staff...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Staff Member</CardTitle>
        <CardDescription>Choose your preferred stylist or select any available</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedStaff} onValueChange={setSelectedStaff}>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="any" id="any" className="mt-1" />
              <Label htmlFor="any" className="flex-1 cursor-pointer">
                <div className="space-y-1">
                  <span className="font-medium">Any Available Staff</span>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll match you with the next available professional
                  </p>
                </div>
              </Label>
            </div>
            
            {staff.map((member) => {
              const name = member.profiles?.full_name || member.profiles?.email || 'Staff Member'
              const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
              
              return (
                <div key={member.id} className="flex items-start space-x-3">
                  <RadioGroupItem value={member.id} id={member.id} className="mt-1" />
                  <Label htmlFor={member.id} className="flex-1 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={member.profiles?.avatar_url || ''} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                            <span className="text-sm">4.9</span>
                          </div>
                        </div>
                        {member.title && (
                          <p className="text-sm text-muted-foreground">{member.title}</p>
                        )}
                        {member.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{member.bio}</p>
                        )}
                        {member.specialties && member.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.specialties.slice(0, 3).map((specialty, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {member.specialties.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{member.specialties.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              )
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}