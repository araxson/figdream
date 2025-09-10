'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function BusinessHours() {
  const days = [
    { day: 'Monday', open: '9:00 AM', close: '7:00 PM', isOpen: true },
    { day: 'Tuesday', open: '9:00 AM', close: '7:00 PM', isOpen: true },
    { day: 'Wednesday', open: '9:00 AM', close: '7:00 PM', isOpen: true },
    { day: 'Thursday', open: '9:00 AM', close: '7:00 PM', isOpen: true },
    { day: 'Friday', open: '9:00 AM', close: '8:00 PM', isOpen: true },
    { day: 'Saturday', open: '10:00 AM', close: '6:00 PM', isOpen: true },
    { day: 'Sunday', open: '11:00 AM', close: '5:00 PM', isOpen: false },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Hours</CardTitle>
        <CardDescription>Set your salon operating hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {days.map((schedule) => (
          <div key={schedule.day} className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Switch defaultChecked={schedule.isOpen} />
              <Label className="w-24">{schedule.day}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                type="time" 
                defaultValue="09:00" 
                className="w-32"
                disabled={!schedule.isOpen}
              />
              <span>to</span>
              <Input 
                type="time" 
                defaultValue="19:00" 
                className="w-32"
                disabled={!schedule.isOpen}
              />
            </div>
          </div>
        ))}
        <Button className="w-full">Save Hours</Button>
      </CardContent>
    </Card>
  )
}