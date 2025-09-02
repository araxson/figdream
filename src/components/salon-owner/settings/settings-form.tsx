'use client'

import { useState } from 'react'
import {
  Button,
  Input,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui'
import { bulkUpdateSettings } from '@/lib/data-access/settings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Save, Settings, Clock, Globe, CreditCard, HelpCircle, Info } from 'lucide-react'

type SettingValue = string | number | boolean

interface SettingTemplate {
  key: string
  label: string
  type: 'text' | 'email' | 'tel' | 'number' | 'boolean' | 'select'
  defaultValue: SettingValue
  options?: Array<{ value: string; label: string }>
}

interface SettingsFormProps {
  category: string
  templates: SettingTemplate[]
  currentSettings: Record<string, SettingValue>
  salonId: string
}

// Predefined options for select fields
const SELECT_OPTIONS = {
  timezone: [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time' },
    { value: 'America/Anchorage', label: 'Alaska Time' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  ],
  currency: [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'CAD', label: 'Canadian Dollar (C$)' },
    { value: 'AUD', label: 'Australian Dollar (A$)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
  ],
  date_format: [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY' },
  ],
  time_format: [
    { value: '12h', label: '12-hour (AM/PM)' },
    { value: '24h', label: '24-hour' },
  ],
}

export function SettingsForm({ 
  category, 
  templates, 
  currentSettings, 
  salonId 
}: SettingsFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Record<string, SettingValue>>(() => {
    // Initialize form data with current settings or defaults
    const initialData: Record<string, SettingValue> = {}
    templates.forEach(template => {
      initialData[template.key] = currentSettings[template.key] ?? template.defaultValue
    })
    return initialData
  })
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (key: string, value: SettingValue) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSaving(true)
    try {
      const updates = Object.entries(formData).map(([key, value]) => ({
        key,
        value
      }))
      
      await bulkUpdateSettings(updates, salonId)
      toast.success('Settings saved successfully')
      setHasChanges(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const renderField = (template: SettingTemplate) => {
    const value = formData[template.key]
    
    switch (template.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2 flex-1">
              <Label htmlFor={template.key} className="flex-1 cursor-pointer">
                {template.label}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-auto p-1">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">{template.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      This setting controls how {template.label.toLowerCase()} behaves in your salon management system.
                      {template.key.includes('notification') && ' Affects customer and staff notifications.'}
                      {template.key.includes('booking') && ' Impacts appointment scheduling and availability.'}
                      {template.key.includes('payment') && ' Changes payment processing behavior.'}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    id={template.key}
                    checked={value}
                    onCheckedChange={(checked) => handleChange(template.key, checked)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value ? 'Disable' : 'Enable'} {template.label.toLowerCase()}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      
      case 'select':
        const options = SELECT_OPTIONS[template.key as keyof typeof SELECT_OPTIONS] || template.options || []
        return (
          <div className="space-y-2">
            <Label htmlFor={template.key}>{template.label}</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select
                  value={String(value)}
                  onValueChange={(val) => handleChange(template.key, val)}
                >
                  <SelectTrigger id={template.key}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>
                <p>Choose {template.label.toLowerCase()} for your salon</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )
      
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={template.key}>{template.label}</Label>
            <Input
              id={template.key}
              type="number"
              value={value}
              onChange={(e) => handleChange(template.key, Number(e.target.value))}
            />
          </div>
        )
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={template.key}>{template.label}</Label>
            <Input
              id={template.key}
              type={template.type}
              value={value}
              onChange={(e) => handleChange(template.key, e.target.value)}
            />
          </div>
        )
    }
  }

  // Group boolean settings separately for better UX
  const booleanSettings = templates.filter(t => t.type === 'boolean')
  const otherSettings = templates.filter(t => t.type !== 'boolean')

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Accordion type="multiple" defaultValue={["basic", "preferences"]} className="w-full">
        {/* Basic Configuration Settings */}
        {otherSettings.length > 0 && (
          <AccordionItem value="basic">
            <AccordionTrigger className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Basic Configuration
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 md:grid-cols-2 pt-4">
                {otherSettings.map(template => (
                  <div key={template.key}>
                    {renderField(template)}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Feature Toggles & Preferences */}
        {booleanSettings.length > 0 && (
          <AccordionItem value="preferences">
            <AccordionTrigger className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Feature Preferences
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-4">
                {booleanSettings.map(template => (
                  <div key={template.key}>
                    {renderField(template)}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Advanced Settings */}
        <AccordionItem value="advanced">
          <AccordionTrigger className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Advanced Settings
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                These settings affect system behavior. Change with caution.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Auto-save Interval</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Select defaultValue="5">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 minute</SelectItem>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="10">10 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How often to automatically save changes</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Select defaultValue="60">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                          <SelectItem value="480">8 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>How long users stay logged in while inactive</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Submit button */}
      <div className="flex justify-end gap-4">
        {hasChanges && (
          <p className="text-sm text-muted-foreground self-center">
            You have unsaved changes
          </p>
        )}
        <Button type="submit" disabled={isSaving || !hasChanges}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
        </div>
      </form>
    </TooltipProvider>
  )
}