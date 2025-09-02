'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { Plus, Trash2, AlertTriangle, Shield, Heart } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import type { Database } from '@/types/database.types'

type CustomerPreference = Database['public']['Tables']['customer_preferences']['Row']
type PreferenceType = Database['public']['Enums']['preference_type']

const preferenceSchema = z.object({
  preference_type: z.enum(['allergies', 'preferences', 'restrictions'] as const),
  preference_value: z.string().min(1, 'Please enter a preference value'),
})

type PreferenceFormData = z.infer<typeof preferenceSchema>

interface PreferencesFormProps {
  customerId: string
  existingPreferences: Record<PreferenceType, CustomerPreference[]>
}

export function PreferencesForm({ 
  customerId, 
  existingPreferences 
}: PreferencesFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preferences, setPreferences] = useState(existingPreferences)

  const form = useForm<PreferenceFormData>({
    resolver: zodResolver(preferenceSchema),
    defaultValues: {
      preference_type: 'preferences',
      preference_value: '',
    }
  })

  const handleAddPreference = async (data: PreferenceFormData) => {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      const { data: newPref, error } = await supabase
        .from('customer_preferences')
        .insert({
          customer_id: customerId,
          preference_type: data.preference_type,
          preference_value: data.preference_value,
        })
        .select()
        .single()

      if (error) throw error
      
      // Update local state
      setPreferences(prev => ({
        ...prev,
        [data.preference_type]: [...(prev[data.preference_type] || []), newPref]
      }))
      
      toast.success('Preference added successfully')
      form.reset()
    } catch (error) {
      console.error('Error adding preference:', error)
      toast.error('Failed to add preference')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemovePreference = async (id: string, type: PreferenceType) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('customer_preferences')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Update local state
      setPreferences(prev => ({
        ...prev,
        [type]: prev[type]?.filter(p => p.id !== id) || []
      }))
      
      toast.success('Preference removed')
    } catch (error) {
      console.error('Error removing preference:', error)
      toast.error('Failed to remove preference')
    }
  }

  const getIcon = (type: PreferenceType) => {
    switch (type) {
      case 'allergies':
        return <AlertTriangle className="h-4 w-4" />
      case 'restrictions':
        return <Shield className="h-4 w-4" />
      case 'preferences':
        return <Heart className="h-4 w-4" />
    }
  }

  const getVariant = (type: PreferenceType) => {
    switch (type) {
      case 'allergies':
        return 'destructive' as const
      case 'restrictions':
        return 'secondary' as const
      case 'preferences':
        return 'default' as const
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Preference */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddPreference)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="preference_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="allergies">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Allergies
                        </div>
                      </SelectItem>
                      <SelectItem value="restrictions">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Restrictions
                        </div>
                      </SelectItem>
                      <SelectItem value="preferences">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Preferences
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preference_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Sensitive to strong fragrances"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            <Plus className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Adding...' : 'Add Preference'}
          </Button>
        </form>
      </Form>

      {/* Existing Preferences */}
      <div className="space-y-4">
        {/* Allergies */}
        {preferences.allergies && preferences.allergies.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Allergies
            </h3>
            <Alert variant="destructive" className="mb-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                These allergies will be shared with your service providers for your safety
              </AlertDescription>
            </Alert>
            <div className="flex flex-wrap gap-2">
              {preferences.allergies.map((pref) => (
                <Badge 
                  key={pref.id} 
                  variant={getVariant('allergies')}
                  className="flex items-center gap-1 pr-1"
                >
                  {pref.preference_value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemovePreference(pref.id, 'allergies')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Restrictions */}
        {preferences.restrictions && preferences.restrictions.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Restrictions
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferences.restrictions.map((pref) => (
                <Badge 
                  key={pref.id} 
                  variant={getVariant('restrictions')}
                  className="flex items-center gap-1 pr-1"
                >
                  {pref.preference_value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemovePreference(pref.id, 'restrictions')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* General Preferences */}
        {preferences.preferences && preferences.preferences.length > 0 && (
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              General Preferences
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferences.preferences.map((pref) => (
                <Badge 
                  key={pref.id} 
                  variant={getVariant('preferences')}
                  className="flex items-center gap-1 pr-1"
                >
                  {pref.preference_value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemovePreference(pref.id, 'preferences')}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {Object.keys(preferences).length === 0 || 
         Object.values(preferences).every(arr => arr.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No preferences set yet. Add your preferences above to personalize your experience.
          </p>
        )}
      </div>
    </div>
  )
}