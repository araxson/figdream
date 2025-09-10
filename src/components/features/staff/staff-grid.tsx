'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Star } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  appointments?: Array<{ id: string }>
}

export function StaffGrid() {
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchStaff = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get salon owned by user
      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const today = new Date().toISOString().split('T')[0]

      // Get staff with their profiles and today's appointment count
      const { data, error } = await supabase
        .from('staff_profiles')
        .select(`
          *,
          profiles!staff_profiles_user_id_fkey(*),
          appointments:appointments(id)
        `)
        .eq('salon_id', salon.id)
        .eq('appointments.appointment_date', today)

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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="gap-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 flex-1" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {staff.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">No staff members found</p>
            <Button className="mt-4">Add Staff Member</Button>
          </CardContent>
        </Card>
      ) : (
        staff.map((member) => {
          const displayName = member.profiles?.full_name || member.profiles?.email || 'Staff Member'
          const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase()
          const appointmentsToday = member.appointments?.length || 0

          return (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.profiles?.avatar_url || ''} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{displayName}</CardTitle>
                      <CardDescription className="text-xs">
                        {member.profiles?.email}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={member.is_active ? 'default' : 'secondary'}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>4.8</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{appointmentsToday} today</span>
                  </div>
                </div>
                {member.specialties && member.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {member.specialties.slice(0, 3).map((specialty, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
                {member.title && (
                  <p className="text-sm text-muted-foreground">{member.title}</p>
                )}
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Schedule
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </CardFooter>
            </Card>
          )
        })
      )}
    </div>
  )
}