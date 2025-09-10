'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ActiveUser {
  user: Profile
  lastActivity: string
  sessionCount: number
}

export function ActiveUsers() {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchActiveUsers = useCallback(async () => {
    try {
      // Get recently active users (last 24 hours)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select(`
          user_id,
          created_at,
          action
        `)
        .not('user_id', 'is', null)
        .gte('created_at', dayAgo)
        .order('created_at', { ascending: false })

      // Get unique user IDs
      const userIds = [...new Set(auditLogs?.map(log => log.user_id).filter((id): id is string => Boolean(id)) || [])]
      
      // Fetch user details
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      // Process unique users
      const userMap = new Map<string, ActiveUser>()
      
      users?.forEach(user => {
        const userLogs = auditLogs?.filter(log => log.user_id === user.id) || []
        userMap.set(user.id, {
          user: user,
          lastActivity: userLogs[0]?.created_at || '',
          sessionCount: userLogs.length
        })
      })

      setActiveUsers(Array.from(userMap.values()).slice(0, 10))
    } catch {
      // Fallback to profiles table
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10)

      setActiveUsers(
        profiles?.map(profile => ({
          user: profile,
          lastActivity: profile.updated_at || profile.created_at,
          sessionCount: 1
        })) || []
      )
    } finally {
      setLoading(false)
    }
  }, [supabase])
  
  useEffect(() => {
    fetchActiveUsers()
  }, [fetchActiveUsers])

  const getActivityBadge = (lastActivity: string) => {
    const minutes = Math.floor((Date.now() - new Date(lastActivity).getTime()) / 60000)
    
    if (minutes < 5) {
      return <Badge variant="default" className="text-xs">Online</Badge>
    } else if (minutes < 60) {
      return <Badge variant="secondary" className="text-xs">{minutes}m ago</Badge>
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      return <Badge variant="outline" className="text-xs">{hours}h ago</Badge>
    } else {
      return <Badge variant="outline" className="text-xs">Offline</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Users</CardTitle>
        <CardDescription>Recently active platform users</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : activeUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No active users in the last 24 hours
          </p>
        ) : (
          <div className="space-y-3">
            {activeUsers.map((activeUser) => (
              <div key={activeUser.user.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {activeUser.user.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {activeUser.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeUser.user.role || 'user'} • {activeUser.sessionCount} session{activeUser.sessionCount !== 1 ? 's' : ''}
                  </p>
                </div>
                {getActivityBadge(activeUser.lastActivity)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}