'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { startOfMonth } from 'date-fns'

interface ServiceTip {
  service: string
  amount: number
  percentage: number
}

interface TopTipper {
  name: string
  total: number
  average: number
}

export function TipsAnalytics() {
  const [analytics, setAnalytics] = useState<ServiceTip[]>([])
  const [topTippers, setTopTippers] = useState<TopTipper[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session?.user) return

        const monthStart = startOfMonth(new Date())

        // Fetch staff earnings with service information
        const { data: earnings } = await supabase
          .from('staff_earnings')
          .select(`
            tip_amount,
            service_name
          `)
          .eq('staff_id', session.session.user.id)
          .gte('created_at', monthStart.toISOString())

        // Group tips by service
        const serviceMap = new Map<string, number>()
        let totalAmount = 0
        
        earnings?.forEach(earning => {
          const serviceName = earning.service_name || 'Other'
          const existing = serviceMap.get(serviceName) || 0
          serviceMap.set(serviceName, existing + (earning.tip_amount || 0))
          totalAmount += earning.tip_amount || 0
        })

        // Convert to array and calculate percentages
        const serviceAnalytics = Array.from(serviceMap.entries())
          .map(([service, amount]) => ({
            service,
            amount,
            percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5)

        setAnalytics(serviceAnalytics)

        // Fetch top tippers from staff earnings
        const { data: tipperData } = await supabase
          .from('staff_earnings')
          .select(`
            tip_amount,
            customer_name
          `)
          .eq('staff_id', session.session.user.id)
          .gte('created_at', monthStart.toISOString())
          .not('tip_amount', 'is', null)
          .gt('tip_amount', 0)

        // Group by customer
        const customerMap = new Map<string, { name: string; total: number; count: number }>()
        
        tipperData?.forEach(earning => {
          const customerName = earning.customer_name || 'Unknown Customer'
          const existing = customerMap.get(customerName) || { name: customerName, total: 0, count: 0 }
          customerMap.set(customerName, {
            name: customerName,
            total: existing.total + (earning.tip_amount || 0),
            count: existing.count + 1
          })
        })

        // Convert to array and calculate averages
        const topTippersList = Array.from(customerMap.values())
          .map(({ name, total, count }) => ({
            name,
            total,
            average: Math.round(total / count)
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 4)

        setTopTippers(topTippersList)
      } catch (error) {
        console.error('Error fetching tips analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tips by Service</CardTitle>
          <CardDescription>This month&apos;s breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No tips recorded this month</p>
          ) : (
            <div className="space-y-4">
              {analytics.map((item) => (
                <div key={item.service} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{item.service}</p>
                    <p className="text-sm text-muted-foreground">${item.amount}</p>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Tippers</CardTitle>
          <CardDescription>Most generous customers</CardDescription>
        </CardHeader>
        <CardContent>
          {topTippers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No tips recorded this month</p>
          ) : (
            <div className="space-y-3">
              {topTippers.map((tipper, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{tipper.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Avg: ${tipper.average}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">${tipper.total}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}