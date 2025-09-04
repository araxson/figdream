'use client'

import * as React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { format, addDays } from 'date-fns'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { CreateCampaignInput, UpdateCampaignInput } from '@/lib/validations/marketing-schema'

interface CampaignFormScheduleProps {
  form: UseFormReturn<CreateCampaignInput | UpdateCampaignInput>
  scheduledDate: Date | undefined
  onScheduledDateChange: (date: Date | undefined) => void
}

export function CampaignFormSchedule({
  form,
  scheduledDate,
  onScheduledDateChange
}: CampaignFormScheduleProps) {
  const watchedStatus = form.watch('status')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={watchedStatus === 'scheduled'}
            onCheckedChange={(checked) => {
              form.setValue('status', checked ? 'scheduled' : 'draft')
            }}
          />
          <Label>Schedule for later</Label>
        </div>

        {watchedStatus === 'scheduled' && (
          <div className="space-y-4">
            <Label>Schedule Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={onScheduledDateChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {scheduledDate && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  onChange={(e) => {
                    if (scheduledDate && e.target.value) {
                      const [hours, minutes] = e.target.value.split(':')
                      const newDate = new Date(scheduledDate)
                      newDate.setHours(parseInt(hours), parseInt(minutes))
                      onScheduledDateChange(newDate)
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tomorrow = addDays(new Date(), 1)
                    tomorrow.setHours(9, 0, 0, 0)
                    onScheduledDateChange(tomorrow)
                  }}
                >
                  Tomorrow 9 AM
                </Button>
              </div>
            )}

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Campaign will be automatically sent at the scheduled time
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}