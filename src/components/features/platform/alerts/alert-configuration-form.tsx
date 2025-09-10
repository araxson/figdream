'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const alertSchema = z.object({
  alert_name: z.string().min(1, 'Alert name is required'),
  metric_name: z.string().min(1, 'Metric name is required'),
  warning_threshold: z.number().optional(),
  critical_threshold: z.number().optional(),
  check_frequency_minutes: z.number().min(1).max(1440),
  notification_channels: z.array(z.string()).min(1, 'Select at least one channel'),
  is_enabled: z.boolean(),
})

type AlertFormData = z.infer<typeof alertSchema>

interface AlertConfigurationFormProps {
  onSuccess?: () => void
}

export function AlertConfigurationForm({ onSuccess }: AlertConfigurationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['email'])
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      check_frequency_minutes: 60,
      is_enabled: true,
      notification_channels: ['email'],
    },
  })

  const onSubmit = async (data: AlertFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('alert_configuration').insert({
        ...data,
        notification_channels: selectedChannels,
      })

      if (error) throw error

      toast.success('Alert created successfully')
      onSuccess?.()
    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error('Failed to create alert')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev => {
      const updated = prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
      setValue('notification_channels', updated)
      return updated
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="alert_name">Alert Name</Label>
        <Input
          id="alert_name"
          {...register('alert_name')}
          placeholder="e.g., High CPU Usage"
          disabled={isLoading}
        />
        {errors.alert_name && (
          <p className="text-sm text-destructive">{errors.alert_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="metric_name">Metric Name</Label>
        <Select
          onValueChange={(value) => setValue('metric_name', value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpu_usage">CPU Usage</SelectItem>
            <SelectItem value="memory_usage">Memory Usage</SelectItem>
            <SelectItem value="response_time">Response Time</SelectItem>
            <SelectItem value="error_rate">Error Rate</SelectItem>
            <SelectItem value="appointment_cancellation_rate">Cancellation Rate</SelectItem>
            <SelectItem value="revenue_drop">Revenue Drop</SelectItem>
          </SelectContent>
        </Select>
        {errors.metric_name && (
          <p className="text-sm text-destructive">{errors.metric_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="warning_threshold">Warning Threshold</Label>
          <Input
            id="warning_threshold"
            type="number"
            {...register('warning_threshold', { valueAsNumber: true })}
            placeholder="e.g., 75"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="critical_threshold">Critical Threshold</Label>
          <Input
            id="critical_threshold"
            type="number"
            {...register('critical_threshold', { valueAsNumber: true })}
            placeholder="e.g., 90"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="check_frequency_minutes">Check Frequency (minutes)</Label>
        <Input
          id="check_frequency_minutes"
          type="number"
          min="1"
          max="1440"
          {...register('check_frequency_minutes', { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.check_frequency_minutes && (
          <p className="text-sm text-destructive">
            {errors.check_frequency_minutes.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Notification Channels</Label>
        <div className="space-y-2">
          {['email', 'sms', 'push', 'slack'].map(channel => (
            <div key={channel} className="flex items-center space-x-2">
              <Checkbox
                id={channel}
                checked={selectedChannels.includes(channel)}
                onCheckedChange={() => toggleChannel(channel)}
                disabled={isLoading}
              />
              <Label htmlFor={channel} className="capitalize cursor-pointer">
                {channel}
              </Label>
            </div>
          ))}
        </div>
        {errors.notification_channels && (
          <p className="text-sm text-destructive">
            {errors.notification_channels.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_enabled"
          {...register('is_enabled')}
          disabled={isLoading}
        />
        <Label htmlFor="is_enabled">Enable alert immediately</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Alert'}
      </Button>
    </form>
  )
}