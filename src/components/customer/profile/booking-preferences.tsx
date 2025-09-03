'use client'
import { useState } from 'react'
import {
  Label,
  Button,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  Card,
  CardContent,
} from '@/components/ui'
import { Calendar, Clock, Sun, Moon, Cloud, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
interface BookingPreferencesProps {
  customerId: string
}
const timeSlots = [
  { id: 'morning', label: 'Morning', time: '9 AM - 12 PM', icon: Sun },
  { id: 'afternoon', label: 'Afternoon', time: '12 PM - 5 PM', icon: Cloud },
  { id: 'evening', label: 'Evening', time: '5 PM - 9 PM', icon: Moon },
]
const weekDays = [
  { id: 'monday', label: 'Mon', value: 1 },
  { id: 'tuesday', label: 'Tue', value: 2 },
  { id: 'wednesday', label: 'Wed', value: 3 },
  { id: 'thursday', label: 'Thu', value: 4 },
  { id: 'friday', label: 'Fri', value: 5 },
  { id: 'saturday', label: 'Sat', value: 6 },
  { id: 'sunday', label: 'Sun', value: 0 },
]
export function BookingPreferences({ customerId }: BookingPreferencesProps) {
  const [preferredTime, setPreferredTime] = useState('morning')
  const [preferredDays, setPreferredDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]))
  const [bookingReminder, setBookingReminder] = useState('24h')
  const [autoRebook, setAutoRebook] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const handleDayToggle = (dayValue: number) => {
    setPreferredDays(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dayValue)) {
        newSet.delete(dayValue)
      } else {
        newSet.add(dayValue)
      }
      return newSet
    })
  }
  const handleSavePreferences = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const preferences = [
        {
          customer_id: customerId,
          preference_type: 'preferences' as const,
          preference_value: `preferred_time:${preferredTime}`
        },
        {
          customer_id: customerId,
          preference_type: 'preferences' as const,
          preference_value: `preferred_days:${Array.from(preferredDays).join(',')}`
        },
        {
          customer_id: customerId,
          preference_type: 'preferences' as const,
          preference_value: `booking_reminder:${bookingReminder}`
        },
        {
          customer_id: customerId,
          preference_type: 'preferences' as const,
          preference_value: `auto_rebook:${autoRebook}`
        }
      ]
      // Delete old booking preferences
      await supabase
        .from('customer_preferences')
        .delete()
        .eq('customer_id', customerId)
        .in('preference_value', [
          'preferred_time:morning',
          'preferred_time:afternoon',
          'preferred_time:evening',
        ])
      // Insert new preferences
      const { error } = await supabase
        .from('customer_preferences')
        .insert(preferences)
      if (error) throw error
      toast.success('Booking preferences saved successfully')
    } catch (_error) {
      toast.error('Failed to save booking preferences')
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="space-y-6">
      {/* Preferred Time of Day */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Preferred Time of Day
        </Label>
        <RadioGroup value={preferredTime} onValueChange={setPreferredTime}>
          <div className="grid gap-3">
            {timeSlots.map((slot) => {
              const Icon = slot.icon
              return (
                <Card key={slot.id} className="cursor-pointer">
                  <CardContent className="p-3">
                    <label
                      htmlFor={slot.id}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={slot.id} id={slot.id} />
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{slot.label}</p>
                          <p className="text-sm text-muted-foreground">{slot.time}</p>
                        </div>
                      </div>
                    </label>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </RadioGroup>
      </div>
      {/* Preferred Days */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Preferred Days
        </Label>
        <div className="flex gap-2 flex-wrap">
          {weekDays.map((day) => (
            <Button
              key={day.id}
              variant={preferredDays.has(day.value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDayToggle(day.value)}
              className="w-12"
            >
              {day.label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Select your preferred days for appointments
        </p>
      </div>
      {/* Booking Reminders */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Appointment Reminders
        </Label>
        <RadioGroup value={bookingReminder} onValueChange={setBookingReminder}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1h" id="1h" />
              <Label htmlFor="1h">1 hour before</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="24h" id="24h" />
              <Label htmlFor="24h">24 hours before</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="48h" id="48h" />
              <Label htmlFor="48h">48 hours before</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none">No reminders</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
      {/* Auto-Rebooking */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="auto-rebook"
              checked={autoRebook}
              onCheckedChange={(checked) => setAutoRebook(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="auto-rebook" className="cursor-pointer">
                Enable Auto-Rebooking Suggestions
              </Label>
              <p className="text-sm text-muted-foreground">
                Get reminded to book your next appointment based on your service history
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button 
        onClick={handleSavePreferences}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? 'Saving...' : 'Save Booking Preferences'}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        These preferences help us suggest the best appointment times for you
      </p>
    </div>
  )
}