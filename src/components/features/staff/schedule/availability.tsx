'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export function Availability() {
  const availability = [
    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', enabled: true, start: '10:00', end: '18:00' },
    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', enabled: true, start: '10:00', end: '16:00' },
    { day: 'Sunday', enabled: false, start: '10:00', end: '16:00' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>Set your regular working hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availability.map((schedule) => (
            <div key={schedule.day} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch defaultChecked={schedule.enabled} />
                <Label className="w-20">{schedule.day}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  type="time" 
                  defaultValue={schedule.start}
                  className="w-28"
                  disabled={!schedule.enabled}
                />
                <span className="text-sm">to</span>
                <Input 
                  type="time" 
                  defaultValue={schedule.end}
                  className="w-28"
                  disabled={!schedule.enabled}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}