'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Activity,
  Clock,
  User,
  Calendar,
  MapPin,
  Smartphone
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

type ActivityLog = {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  profiles?: {
    full_name: string | null
    email: string | null
    role: string | null
    avatar_url: string | null
  } | null
}

export function UserActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'auth' | 'data' | 'admin'>('all')
  const supabase = createClient()

  const fetchActivities = useCallback(async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles (
            full_name,
            email,
            role,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (filter !== 'all') {
        query = query.eq('category', filter)
      }

      const { data } = await query

      if (data) {
        const formattedActivities: ActivityLog[] = data.map(item => ({
          ...item,
          old_data: item.old_data as Record<string, unknown> | null,
          new_data: item.new_data as Record<string, unknown> | null,
          ip_address: item.ip_address as string | null
        }))
        setActivities(formattedActivities)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching activities:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase, filter])

  useEffect(() => {
    fetchActivities()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('activity-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        () => {
          fetchActivities()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchActivities, supabase])

  function getActionColor(action: string) {
    if (action.includes('login') || action.includes('auth')) return 'default'
    if (action.includes('create') || action.includes('add')) return 'secondary'
    if (action.includes('update') || action.includes('edit')) return 'outline'
    if (action.includes('delete') || action.includes('remove')) return 'destructive'
    return 'default'
  }

  function getActionIcon(action: string) {
    if (action.includes('login') || action.includes('auth')) return User
    if (action.includes('appointment')) return Calendar
    if (action.includes('location')) return MapPin
    return Activity
  }

  function formatTimeAgo(date: string) {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return then.toLocaleDateString()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading activity logs...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Activity</CardTitle>
          <div className="flex gap-2">
            <Badge 
              variant={filter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('all')}
            >
              All
            </Badge>
            <Badge 
              variant={filter === 'auth' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('auth')}
            >
              Auth
            </Badge>
            <Badge 
              variant={filter === 'data' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('data')}
            >
              Data
            </Badge>
            <Badge 
              variant={filter === 'admin' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilter('admin')}
            >
              Admin
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {activities.map((activity) => {
              const Icon = getActionIcon(activity.action)
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {activity.profiles?.full_name || activity.profiles?.email || 'Unknown User'}
                      </span>
                      <Badge variant={getActionColor(activity.action)} className="text-xs">
                        {activity.action}
                      </Badge>
                      {activity.profiles?.role && (
                        <Badge variant="outline" className="text-xs">
                          {activity.profiles.role}
                        </Badge>
                      )}
                    </div>
                    {activity.new_data && Object.keys(activity.new_data).length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {JSON.stringify(activity.new_data).substring(0, 100)}...
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(activity.created_at)}
                      </span>
                      {activity.ip_address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {activity.ip_address}
                        </span>
                      )}
                      {activity.user_agent && activity.user_agent.includes('Mobile') && (
                        <span className="flex items-center gap-1">
                          <Smartphone className="h-3 w-3" />
                          Mobile
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}