'use client'

import * as React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Target, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { CreateCampaignInput, UpdateCampaignInput } from '@/lib/validations/marketing-schema'
import type { Segment } from './campaign-form.types'

interface CampaignFormAudienceProps {
  form: UseFormReturn<CreateCampaignInput | UpdateCampaignInput>
  segments: Segment[]
  locationIds: string[]
}

export function CampaignFormAudience({
  form,
  segments,
  locationIds
}: CampaignFormAudienceProps) {
  const watchedSegmentId = form.watch('segment_id')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Target Audience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="segment_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Segment</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a segment..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">All Customers</SelectItem>
                  {segments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{segment.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {segment.member_count || 0} members
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose a specific customer segment or send to all customers
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {locationIds.length > 1 && (
          <FormField
            control={form.control}
            name="location_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Locations</FormLabel>
                <FormDescription>
                  Select specific locations or leave empty to target all locations
                </FormDescription>
                <div className="space-y-2">
                  {locationIds.map((locationId) => (
                    <div key={locationId} className="flex items-center space-x-2">
                      <Checkbox
                        id={locationId}
                        checked={field.value?.includes(locationId) || false}
                        onCheckedChange={(checked) => {
                          const current = field.value || []
                          if (checked) {
                            field.onChange([...current, locationId])
                          } else {
                            field.onChange(current.filter(id => id !== locationId))
                          }
                        }}
                      />
                      <Label htmlFor={locationId}>
                        Location {locationId.slice(-8)}
                      </Label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            {watchedSegmentId 
              ? `Sending to ${segments.find(s => s.id === watchedSegmentId)?.member_count || 0} customers`
              : 'Sending to all customers'
            }
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}