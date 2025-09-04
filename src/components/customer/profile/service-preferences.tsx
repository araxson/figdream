'use client'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Palette, Clock, DollarSign, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
interface FavoriteService {
  id: string
  name: string
  category: string
  bookingCount: number
}
interface ServicePreferencesProps {
  customerId: string
  favoriteServices: FavoriteService[]
}
export function ServicePreferences({ 
  customerId, 
  favoriteServices 
}: ServicePreferencesProps) {
  const [preferredDuration, setPreferredDuration] = useState<number[]>([60])
  const [preferredPriceRange, setPreferredPriceRange] = useState<number[]>([50, 200])
  const [favoriteServiceIds, setFavoriteServiceIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const handleSavePreferences = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      // Save duration preference
      await supabase
        .from('customer_preferences')
        .upsert({
          customer_id: customerId,
          preference_type: 'preferences',
          preference_value: `preferred_duration:${preferredDuration[0]}`
        })
      // Save price range preference
      await supabase
        .from('customer_preferences')
        .upsert({
          customer_id: customerId,
          preference_type: 'preferences',
          preference_value: `price_range:${preferredPriceRange[0]}-${preferredPriceRange[1]}`
        })
      toast.success('Service preferences saved')
    } catch (_error) {
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }
  const toggleFavoriteService = async (serviceId: string) => {
    try {
      const supabase = createClient()
      if (favoriteServiceIds.has(serviceId)) {
        await supabase
          .from('customer_preferences')
          .delete()
          .eq('customer_id', customerId)
          .eq('preference_value', `favorite_service:${serviceId}`)
        setFavoriteServiceIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(serviceId)
          return newSet
        })
      } else {
        await supabase
          .from('customer_preferences')
          .insert({
            customer_id: customerId,
            preference_type: 'preferences',
            preference_value: `favorite_service:${serviceId}`
          })
        setFavoriteServiceIds(prev => new Set([...prev, serviceId]))
      }
      toast.success('Service preference updated')
    } catch (_error) {
      toast.error('Failed to update preference')
    }
  }
  return (
    <div className="space-y-6">
      {/* Service Duration Preference */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Preferred Service Duration
        </Label>
        <div className="px-4">
          <Slider
            value={preferredDuration}
            onValueChange={setPreferredDuration}
            min={30}
            max={240}
            step={30}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>30 min</span>
            <span className="font-medium text-foreground">
              {preferredDuration[0]} minutes
            </span>
            <span>4 hours</span>
          </div>
        </div>
      </div>
      {/* Price Range Preference */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Preferred Price Range
        </Label>
        <div className="px-4">
          <Slider
            value={preferredPriceRange}
            onValueChange={setPreferredPriceRange}
            min={0}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>$0</span>
            <span className="font-medium text-foreground">
              ${preferredPriceRange[0]} - ${preferredPriceRange[1]}
            </span>
            <span>$500</span>
          </div>
        </div>
      </div>
      {/* Frequently Booked Services */}
      {favoriteServices.length > 0 && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Your Most Booked Services
          </Label>
          <div className="grid gap-3">
            {favoriteServices.map((service) => (
              <Card key={service.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {service.category}
                      </Badge>
                      <Badge variant="secondary">
                        {service.bookingCount} bookings
                      </Badge>
                      {favoriteServiceIds.has(service.id) && (
                        <Badge variant="default">
                          <Heart className="h-3 w-3 mr-1" />
                          Favorite
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavoriteService(service.id)}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        favoriteServiceIds.has(service.id) 
                          ? 'fill-current text-red-500' 
                          : ''
                      }`}
                    />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <Button 
        onClick={handleSavePreferences}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? 'Saving...' : 'Save Service Preferences'}
      </Button>
      <p className="text-xs text-muted-foreground">
        Your preferences help us recommend services that match your needs
      </p>
    </div>
  )
}