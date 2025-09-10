'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Save } from 'lucide-react'
import { useState } from 'react'

interface TipSettings {
  enableDigitalTipping: boolean
  defaultTipPercentages: number[]
  allowCustomTips: boolean
  minimumTipAmount: number
  maximumTipAmount: number
  tipPooling: boolean
  tipPoolPercentage: number
  autoPromptTipping: boolean
  tipThankYouMessage: string
}

export function TipsSettings() {
  const [settings, setSettings] = useState<TipSettings>({
    enableDigitalTipping: true,
    defaultTipPercentages: [15, 18, 20, 25],
    allowCustomTips: true,
    minimumTipAmount: 1,
    maximumTipAmount: 500,
    tipPooling: false,
    tipPoolPercentage: 0,
    autoPromptTipping: true,
    tipThankYouMessage: "Thank you for your generous tip! We really appreciate it."
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save tip settings
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const addTipPercentage = () => {
    if (settings.defaultTipPercentages.length < 6) {
      setSettings({
        ...settings,
        defaultTipPercentages: [...settings.defaultTipPercentages, 10]
      })
    }
  }

  const updateTipPercentage = (index: number, value: string) => {
    const newPercentages = [...settings.defaultTipPercentages]
    newPercentages[index] = parseInt(value) || 0
    setSettings({
      ...settings,
      defaultTipPercentages: newPercentages
    })
  }

  const removeTipPercentage = (index: number) => {
    if (settings.defaultTipPercentages.length > 1) {
      const newPercentages = settings.defaultTipPercentages.filter((_, i) => i !== index)
      setSettings({
        ...settings,
        defaultTipPercentages: newPercentages
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Tips Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Digital Tipping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable digital tipping</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to add tips through the booking system
              </p>
            </div>
            <Switch
              checked={settings.enableDigitalTipping}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                enableDigitalTipping: checked
              })}
            />
          </div>

          {settings.enableDigitalTipping && (
            <>
              <div className="space-y-3">
                <Label>Default tip percentages</Label>
                <div className="grid gap-2">
                  {settings.defaultTipPercentages.map((percentage, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={percentage}
                        onChange={(e) => updateTipPercentage(index, e.target.value)}
                        className="w-20"
                        min="0"
                        max="50"
                      />
                      <span>%</span>
                      {settings.defaultTipPercentages.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTipPercentage(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {settings.defaultTipPercentages.length < 6 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addTipPercentage}
                      className="w-fit"
                    >
                      Add Percentage
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow custom tip amounts</Label>
                  <p className="text-sm text-muted-foreground">
                    Let customers enter their own tip amount
                  </p>
                </div>
                <Switch
                  checked={settings.allowCustomTips}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    allowCustomTips: checked
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minTip">Minimum tip amount ($)</Label>
                  <Input
                    id="minTip"
                    type="number"
                    value={settings.minimumTipAmount}
                    onChange={(e) => setSettings({
                      ...settings,
                      minimumTipAmount: parseFloat(e.target.value) || 0
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTip">Maximum tip amount ($)</Label>
                  <Input
                    id="maxTip"
                    type="number"
                    value={settings.maximumTipAmount}
                    onChange={(e) => setSettings({
                      ...settings,
                      maximumTipAmount: parseFloat(e.target.value) || 0
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-prompt for tips</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically ask for tips after service completion
                  </p>
                </div>
                <Switch
                  checked={settings.autoPromptTipping}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    autoPromptTipping: checked
                  })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tip Pooling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable tip pooling</Label>
              <p className="text-sm text-muted-foreground">
                Share a percentage of tips with the salon team
              </p>
            </div>
            <Switch
              checked={settings.tipPooling}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                tipPooling: checked
              })}
            />
          </div>

          {settings.tipPooling && (
            <div className="space-y-2">
              <Label htmlFor="poolPercentage">Tip pool percentage (%)</Label>
              <Input
                id="poolPercentage"
                type="number"
                value={settings.tipPoolPercentage}
                onChange={(e) => setSettings({
                  ...settings,
                  tipPoolPercentage: parseInt(e.target.value) || 0
                })}
                min="0"
                max="100"
              />
              <p className="text-sm text-muted-foreground">
                Percentage of each tip that goes to the shared pool
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thank You Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="thankYou">Custom thank you message</Label>
            <Textarea
              id="thankYou"
              value={settings.tipThankYouMessage}
              onChange={(e) => setSettings({
                ...settings,
                tipThankYouMessage: e.target.value
              })}
              placeholder="Enter a thank you message for tipping customers"
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}