'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface Tip {
  id: string
  customer: string
  service: string
  amount: number
  percentage: number | null
  date: string
  payment: string
  avatar?: string | null
}

export function TipsHistory() {
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTips() {
      try {
        const { data: session } = await supabase.auth.getSession()
        if (!session?.session?.user) return

        const { data, error } = await supabase
          .from('staff_earnings')
          .select(`
            id,
            tip_amount,
            commission_rate,
            payment_method,
            created_at,
            customer_name,
            service_name
          `)
          .eq('staff_id', session.session.user.id)
          .not('tip_amount', 'is', null)
          .gt('tip_amount', 0)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) throw error

        const formattedTips = (data || []).map(earning => ({
          id: earning.id,
          customer: earning.customer_name || 'Unknown Customer',
          service: earning.service_name || 'Unknown Service',
          amount: earning.tip_amount || 0,
          percentage: earning.commission_rate,
          date: formatDistanceToNow(new Date(earning.created_at), { addSuffix: true }),
          payment: earning.payment_method || 'Cash',
          avatar: null
        }))

        setTips(formattedTips)
      } catch (error) {
        console.error('Error fetching tips:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTips()
  }, [supabase])

  const getPaymentVariant = (payment: string) => {
    switch (payment) {
      case 'Cash': return 'default'
      case 'Card': return 'secondary'
      case 'App': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tips</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : tips.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No tips recorded yet</p>
        ) : (
          <div className="space-y-4">
            {tips.map((tip) => (
              <div key={tip.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={tip.avatar || undefined} />
                    <AvatarFallback>
                      {tip.customer.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{tip.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {tip.service} • {tip.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">${tip.amount}</p>
                    <p className="text-xs text-muted-foreground">{tip.percentage}% tip</p>
                  </div>
                  <Badge variant={getPaymentVariant(tip.payment)}>
                    {tip.payment}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}