'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, TrendingUp, DollarSign } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth, subMonths } from 'date-fns'

interface TopSalon {
  id: string
  name: string
  owner: string
  revenue: number
  bookings: number
  rating: number
  growth: number
}

interface TopStaffMember {
  id: string
  name: string
  salon: string
  revenue: number
  clients: number
  rating: number
  avatar: string
}

interface UserData {
  email: string | null
}

interface SalonData {
  name: string | null
}

export function TopPerformers() {
  const [topSalons, setTopSalons] = useState<TopSalon[]>([])
  const [topStaff, setTopStaff] = useState<TopStaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchPerformers() {
      try {
        const currentMonth = startOfMonth(new Date())
        const lastMonth = startOfMonth(subMonths(new Date(), 1))

        // Fetch top salons by revenue
        const { data: salons } = await supabase
          .from('salons')
          .select(`
            id,
            name,
            profiles!inner (email),
            appointments (
              status,
              start_time,
              computed_total_price
            ),
            reviews (rating)
          `)
          .limit(3)

        if (salons) {
          const salonStats = await Promise.all(salons.map(async (salon) => {
            // Calculate current month revenue and bookings
            const currentMonthAppts = salon.appointments?.filter(apt => 
              new Date(apt.start_time) >= currentMonth && 
              apt.status === 'completed'
            ) || []
            
            const currentRevenue = currentMonthAppts.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0)
            const currentBookings = currentMonthAppts.length

            // Calculate last month revenue for growth
            const lastMonthAppts = salon.appointments?.filter(apt => 
              new Date(apt.start_time) >= lastMonth &&
              new Date(apt.start_time) < currentMonth &&
              apt.status === 'completed'
            ) || []
            
            const lastRevenue = lastMonthAppts.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0)
            const growth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0

            // Calculate average rating
            const avgRating = salon.reviews?.length ? 
              salon.reviews.reduce((sum, r) => sum + r.rating, 0) / salon.reviews.length : 0

            const user = Array.isArray(salon.profiles) ? salon.profiles[0] as UserData : salon.profiles as UserData
            const ownerEmail = user?.email || ''
            
            return {
              id: salon.id,
              name: salon.name,
              owner: ownerEmail ? ownerEmail.split('@')[0] : 'Unknown',
              revenue: currentRevenue,
              bookings: currentBookings,
              rating: Math.round(avgRating * 10) / 10,
              growth: Math.round(growth)
            }
          }))

          setTopSalons(salonStats.sort((a, b) => b.revenue - a.revenue).slice(0, 3))
        }

        // Fetch top staff by revenue
        const { data: staff } = await supabase
          .from('staff_profiles')
          .select(`
            id,
            user_id,
            salon_id,
            profiles!inner (email),
            salons (name),
            appointments (
              status,
              start_time,
              customer_id,
              computed_total_price
            ),
            reviews (rating)
          `)
          .limit(10)

        if (staff) {
          const staffStats = staff.map(member => {
            // Calculate current month stats
            const currentMonthAppts = member.appointments?.filter(apt => 
              new Date(apt.start_time) >= currentMonth && 
              apt.status === 'completed'
            ) || []
            
            const revenue = currentMonthAppts.reduce((sum, apt) => sum + (apt.computed_total_price || 0), 0)
            const uniqueClients = new Set(currentMonthAppts.map(apt => apt.customer_id)).size
            
            // Calculate average rating
            const avgRating = member.reviews?.length ? 
              member.reviews.reduce((sum, r) => sum + r.rating, 0) / member.reviews.length : 0

            const user = Array.isArray(member.profiles) ? member.profiles[0] as UserData : member.profiles as UserData
            const userEmail = user?.email || ''
            const salonData = member.salons as SalonData | null
            
            return {
              id: member.id,
              name: userEmail ? userEmail.split('@')[0] : 'Unknown',
              salon: salonData?.name || 'Unknown Salon',
              revenue,
              clients: uniqueClients,
              rating: Math.round(avgRating * 10) / 10,
              avatar: ''
            }
          })

          setTopStaff(staffStats.sort((a, b) => b.revenue - a.revenue).slice(0, 3))
        }
      } catch (error) {
        console.error('Error fetching performers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformers()
  }, [supabase])

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Salons</CardTitle>
          <CardDescription>Highest revenue generating salons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSalons.map((salon, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{salon.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Owned by {salon.owner}
                    </p>
                  </div>
                  <Badge variant="default">#{i + 1}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${(salon.revenue / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span>{salon.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+{salon.growth}%</span>
                  </div>
                  <span className="text-muted-foreground">
                    {salon.bookings} bookings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Staff Members</CardTitle>
          <CardDescription>Highest performing staff across platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStaff.map((staff, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={staff.avatar} />
                    <AvatarFallback>
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{staff.name}</p>
                    <p className="text-sm text-muted-foreground">{staff.salon}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${(staff.revenue / 1000).toFixed(1)}k</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span>{staff.rating}</span>
                    <span className="text-muted-foreground">• {staff.clients} clients</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}