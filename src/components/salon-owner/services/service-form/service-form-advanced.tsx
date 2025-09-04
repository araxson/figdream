import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X } from 'lucide-react'
import type { Database } from '@/types/database.types'
import type { ServiceFormData } from './service-form-schema'

type Service = Database['public']['Tables']['services']['Row']

interface AdvancedTabProps {
  form: UseFormReturn<ServiceFormData>
  addons: Service[]
}

export function AdvancedTab({ form, addons }: AdvancedTabProps) {
  const [newEquipment, setNewEquipment] = useState('')
  const [newPrerequisite, setNewPrerequisite] = useState('')

  const addEquipment = () => {
    if (newEquipment.trim()) {
      const current = form.getValues('special_equipment') || []
      form.setValue('special_equipment', [...current, newEquipment.trim()])
      setNewEquipment('')
    }
  }

  const removeEquipment = (index: number) => {
    const current = form.getValues('special_equipment') || []
    form.setValue('special_equipment', current.filter((_, i) => i !== index))
  }

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      const current = form.getValues('prerequisites') || []
      form.setValue('prerequisites', [...current, newPrerequisite.trim()])
      setNewPrerequisite('')
    }
  }

  const removePrerequisite = (index: number) => {
    const current = form.getValues('prerequisites') || []
    form.setValue('prerequisites', current.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add-ons & Extras</CardTitle>
          <CardDescription>
            Configure additional services that can be added
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="allow_addons"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Allow Add-ons</FormLabel>
                  <FormDescription>
                    Customers can add extra services
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch('allow_addons') && addons.length > 0 && (
            <FormField
              control={form.control}
              name="addon_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Add-ons</FormLabel>
                  <FormDescription>
                    Select which add-on services can be added to this service
                  </FormDescription>
                  <div className="space-y-2">
                    {addons.map((addon) => (
                      <FormItem
                        key={addon.id}
                        className="flex items-center space-x-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(addon.id)}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              const updated = checked
                                ? [...current, addon.id]
                                : current.filter((id) => id !== addon.id)
                              field.onChange(updated)
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {addon.name} (+${addon.price})
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>
            Special equipment and prerequisites for this service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="special_equipment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Equipment</FormLabel>
                <FormDescription>
                  Equipment needed to perform this service
                </FormDescription>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newEquipment}
                      onChange={(e) => setNewEquipment(e.target.value)}
                      placeholder="e.g., Hair steamer"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addEquipment()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addEquipment}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {field.value?.map((item, index) => (
                      <Badge key={index} variant="secondary">
                        {item}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => removeEquipment(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prerequisites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prerequisites</FormLabel>
                <FormDescription>
                  Requirements before booking this service
                </FormDescription>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newPrerequisite}
                      onChange={(e) => setNewPrerequisite(e.target.value)}
                      placeholder="e.g., Consultation required"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addPrerequisite()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addPrerequisite}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {field.value?.map((item, index) => (
                      <Badge key={index} variant="secondary">
                        {item}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 p-0"
                          onClick={() => removePrerequisite(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}