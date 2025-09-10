'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Clock } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Salon = Database['public']['Tables']['salons']['Row']

export function SalonSelection() {
  const [salons, setSalons] = useState<Salon[]>([])
  const [selectedSalon, setSelectedSalon] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSalons = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setSalons(data || [])
      if (data && data.length > 0) {
        setSelectedSalon(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching salons:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSalons()
  }, [fetchSalons])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Select a Salon</CardTitle>
          <CardDescription>Choose your preferred location</CardDescription>
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
        <CardTitle>Select a Salon</CardTitle>
        <CardDescription>Choose your preferred location</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedSalon} onValueChange={setSelectedSalon}>
          <div className="space-y-4">
            {salons.map((salon) => (
              <div key={salon.id} className="flex items-start space-x-3">
                <RadioGroupItem value={salon.id} id={salon.id} className="mt-1" />
                <Label htmlFor={salon.id} className="flex-1 cursor-pointer">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{salon.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="text-sm">4.8</span>
                        </div>
                        <Badge variant="secondary">Open</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{salon.address || 'Downtown Location'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>9:00 AM - 7:00 PM</span>
                      </div>
                    </div>
                    {salon.description && (
                      <p className="text-sm text-muted-foreground">{salon.description}</p>
                    )}
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}