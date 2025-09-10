'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle,
  XCircle,
  Building,
  Mail,
  Shield,
  Phone,
  Globe
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Salon = Database['public']['Tables']['salons']['Row'] & {
  profiles?: {
    first_name: string | null
    last_name: string | null
    email: string
  } | null
}

export function SalonVerification() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const supabase = createClient()

  const fetchSalons = useCallback(async () => {
    try {
      let query = supabase
        .from('salons')
        .select(`
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `)

      if (filter === 'active') {
        query = query.eq('is_active', true)
      } else if (filter === 'inactive') {
        query = query.eq('is_active', false)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw error

      setSalons(data || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching salons:', error)
      }
      toast.error('Failed to fetch salons')
    } finally {
      setLoading(false)
    }
  }, [filter, supabase])

  useEffect(() => {
    fetchSalons()
  }, [fetchSalons])

  async function toggleSalonStatus(salonId: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('salons')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', salonId)

      if (error) throw error

      // Refresh the list
      await fetchSalons()

      toast.success(`Salon ${isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating salon status:', error)
      }
      toast.error('Failed to update salon status')
    }
  }

  function getStatusIcon(isActive: boolean) {
    return isActive 
      ? <CheckCircle className="h-4 w-4 text-green-600" />
      : <XCircle className="h-4 w-4 text-red-600" />
  }

  function getStatusColor(isActive: boolean): 'default' | 'destructive' {
    return isActive ? 'default' : 'destructive'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Salon Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading salons...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Salon Management</CardTitle>
          </div>
          <Badge variant="outline">
            {salons.filter(s => s.is_active).length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'active' | 'inactive')}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            <div className="space-y-4">
              {salons.map((salon) => (
                <div key={salon.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{salon.name}</h3>
                        <Badge variant={getStatusColor(salon.is_active)}>
                          {getStatusIcon(salon.is_active)}
                          <span className="ml-1">{salon.is_active ? 'Active' : 'Inactive'}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {salon.email}
                        </span>
                        {salon.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {salon.phone}
                          </span>
                        )}
                        {salon.website && (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {salon.website}
                          </span>
                        )}
                      </div>
                      {salon.address && (
                        <p className="text-xs text-muted-foreground">{salon.address}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(salon.created_at).toLocaleDateString()}
                        {salon.profiles && (
                          <> • Owner: {salon.profiles.first_name} {salon.profiles.last_name}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {salon.description && (
                    <div className="bg-muted/50 rounded p-2">
                      <p className="text-xs text-muted-foreground">Description:</p>
                      <p className="text-sm">{salon.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {salon.is_active ? (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => toggleSalonStatus(salon.id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => toggleSalonStatus(salon.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {salons.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No salons found
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}