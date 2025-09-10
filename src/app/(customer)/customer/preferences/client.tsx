'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Settings, AlertCircle, Heart, Save } from 'lucide-react'

type PreferenceType = Database['public']['Enums']['preference_type']

interface PreferenceData {
  allergies: string
  preferences: string
  restrictions: string
}

export function CustomerPreferencesClient() {
  const [preferenceData, setPreferenceData] = useState<PreferenceData>({
    allergies: '',
    preferences: '',
    restrictions: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadPreferences()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPreferences() {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('Not authenticated')

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.user.id)
        .single()

      if (!customer) {
        toast.error('Customer profile not found')
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('customer_preferences')
        .select('*')
        .eq('customer_id', customer.id)

      if (error) throw error

      // Parse preferences into data
      const newPreferenceData: PreferenceData = {
        allergies: '',
        preferences: '',
        restrictions: ''
      }

      if (data && data.length > 0) {
        data.forEach(pref => {
          if (pref.preference_type === 'allergies') {
            newPreferenceData.allergies = pref.preference_value
          } else if (pref.preference_type === 'preferences') {
            newPreferenceData.preferences = pref.preference_value
          } else if (pref.preference_type === 'restrictions') {
            newPreferenceData.restrictions = pref.preference_value
          }
        })
      }

      setPreferenceData(newPreferenceData)
    } catch (error) {
      console.error('Error loading preferences:', error)
      toast.error('Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
  }

  async function savePreferences() {
    try {
      setIsSaving(true)
      
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('Not authenticated')

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.user.id)
        .single()

      if (!customer) throw new Error('Customer profile not found')

      // Prepare preferences to save
      const preferencesToSave: Array<{
        customer_id: string
        preference_type: PreferenceType
        preference_value: string
      }> = []

      if (preferenceData.allergies) {
        preferencesToSave.push({
          customer_id: customer.id,
          preference_type: 'allergies',
          preference_value: preferenceData.allergies
        })
      }

      if (preferenceData.preferences) {
        preferencesToSave.push({
          customer_id: customer.id,
          preference_type: 'preferences',
          preference_value: preferenceData.preferences
        })
      }

      if (preferenceData.restrictions) {
        preferencesToSave.push({
          customer_id: customer.id,
          preference_type: 'restrictions',
          preference_value: preferenceData.restrictions
        })
      }

      // Delete existing preferences first
      await supabase
        .from('customer_preferences')
        .delete()
        .eq('customer_id', customer.id)

      // Insert new preferences if any
      if (preferencesToSave.length > 0) {
        const { error } = await supabase
          .from('customer_preferences')
          .insert(preferencesToSave)

        if (error) throw error
      }

      toast.success('Preferences saved successfully')
      await loadPreferences()
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Preferences</h1>
          <p className="text-muted-foreground">
            Manage your service preferences and special requirements
          </p>
        </div>
        <Button onClick={savePreferences} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="preferences" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preferences">
            <Heart className="mr-2 h-4 w-4" />
            Service Preferences
          </TabsTrigger>
          <TabsTrigger value="allergies">
            <AlertCircle className="mr-2 h-4 w-4" />
            Allergies & Sensitivities
          </TabsTrigger>
          <TabsTrigger value="restrictions">
            <Settings className="mr-2 h-4 w-4" />
            Restrictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Preferences</CardTitle>
              <CardDescription>
                Let us know your preferred services, products, or styling preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="preferences">Your Preferences</Label>
                <Textarea
                  id="preferences"
                  placeholder="e.g., I prefer organic products, like shorter haircuts, enjoy scalp massages..."
                  value={preferenceData.preferences}
                  onChange={(e) =>
                    setPreferenceData(prev => ({
                      ...prev,
                      preferences: e.target.value
                    }))
                  }
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  This information helps our staff provide you with a better, personalized experience
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allergies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Allergies & Sensitivities</CardTitle>
              <CardDescription>
                Important: Please list any allergies or sensitivities to products or ingredients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="allergies">Known Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="e.g., allergic to latex, sensitive to fragrances, reactions to certain dyes..."
                  value={preferenceData.allergies}
                  onChange={(e) =>
                    setPreferenceData(prev => ({
                      ...prev,
                      allergies: e.target.value
                    }))
                  }
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  This information is critical for your safety and will be shared with your service providers
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restrictions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Restrictions</CardTitle>
              <CardDescription>
                Any services or treatments you prefer to avoid
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="restrictions">Restrictions</Label>
                <Textarea
                  id="restrictions"
                  placeholder="e.g., no chemical treatments, avoid heat styling, no nail extensions..."
                  value={preferenceData.restrictions}
                  onChange={(e) =>
                    setPreferenceData(prev => ({
                      ...prev,
                      restrictions: e.target.value
                    }))
                  }
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Let us know what services or treatments you&apos;d prefer to avoid
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}