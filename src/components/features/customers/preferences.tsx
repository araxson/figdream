'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { useState } from 'react'

export function ProfilePreferences() {
  const [favoriteServices, setFavoriteServices] = useState([
    'Hair Cut & Style',
    'Hair Color',
    'Manicure',
  ])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your booking experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="preferred-salon">Preferred Salon</Label>
          <Select defaultValue="elegance">
            <SelectTrigger id="preferred-salon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="elegance">Elegance Beauty Spa</SelectItem>
              <SelectItem value="urban">Urban Style Studio</SelectItem>
              <SelectItem value="glamour">Glamour House</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="preferred-stylist">Preferred Stylist</Label>
          <Select defaultValue="emma">
            <SelectTrigger id="preferred-stylist">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Available</SelectItem>
              <SelectItem value="emma">Emma Stylist</SelectItem>
              <SelectItem value="sarah">Sarah Johnson</SelectItem>
              <SelectItem value="mike">Mike Wilson</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="booking-reminder">Booking Reminder</Label>
          <Select defaultValue="24">
            <SelectTrigger id="booking-reminder">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hour before</SelectItem>
              <SelectItem value="2">2 hours before</SelectItem>
              <SelectItem value="24">24 hours before</SelectItem>
              <SelectItem value="48">48 hours before</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Favorite Services</Label>
          <div className="flex flex-wrap gap-2">
            {favoriteServices.map((service, i) => (
              <Badge key={i} variant="secondary" className="pr-1">
                {service}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => setFavoriteServices(favoriteServices.filter((_, index) => index !== i))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}