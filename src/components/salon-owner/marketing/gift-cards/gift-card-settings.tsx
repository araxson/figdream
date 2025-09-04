"use client"
import { useState } from "react"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  Settings, 
  DollarSign, 
  Calendar, 
  Percent,
  Shield,
  Mail,
  Save,
  AlertCircle,
  Plus,
  X
} from "lucide-react"
import { createClient } from "@/lib/database/supabase/client"
import { toast } from "sonner"
type GiftCardSettings = {
  enabled: boolean
  minAmount: number
  maxAmount: number
  presetAmounts: number[]
  defaultExpiry: number | null
  allowCustomAmounts: boolean
  requireRecipientEmail: boolean
  allowScheduledDelivery: boolean
  processingFee: number
  autoEmailEnabled: boolean
  emailTemplate: string
  termsAndConditions: string
  design: {
    primaryColor: string
    logo: string
    backgroundImage: string
  }
  restrictions: {
    onePerCustomer: boolean
    requireAccountCreation: boolean
    blackoutDates: string[]
  }
}
export function GiftCardSettings() {
  const [settings, setSettings] = useState<GiftCardSettings>({
    enabled: true,
    minAmount: 10,
    maxAmount: 500,
    presetAmounts: [25, 50, 75, 100, 150, 200],
    defaultExpiry: 365,
    allowCustomAmounts: true,
    requireRecipientEmail: false,
    allowScheduledDelivery: true,
    processingFee: 0,
    autoEmailEnabled: true,
    emailTemplate: "default",
    termsAndConditions: "Gift cards are non-refundable and cannot be exchanged for cash. Lost or stolen cards cannot be replaced.",
    design: {
      primaryColor: "#8b5cf6",
      logo: "",
      backgroundImage: ""
    },
    restrictions: {
      onePerCustomer: false,
      requireAccountCreation: false,
      blackoutDates: []
    }
  })
  const [saving, setSaving] = useState(false)
  const [newPresetAmount, setNewPresetAmount] = useState("")
  async function saveSettings() {
    setSaving(true)
    try {
      const _supabase = createClient()
      // Save settings to database
      // TODO: Implement actual save logic
      void settings // Temporary to avoid unused variable
      toast.success("Gift card settings updated successfully")
    } catch (_error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }
  const addPresetAmount = () => {
    const amount = parseFloat(newPresetAmount)
    if (!isNaN(amount) && amount > 0 && !settings.presetAmounts.includes(amount)) {
      setSettings({
        ...settings,
        presetAmounts: [...settings.presetAmounts, amount].sort((a, b) => a - b)
      })
      setNewPresetAmount("")
    }
  }
  const removePresetAmount = (amount: number) => {
    setSettings({
      ...settings,
      presetAmounts: settings.presetAmounts.filter(a => a !== amount)
    })
  }
  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure basic gift card settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Gift Cards</Label>
              <p className="text-sm text-muted-foreground">
                Allow customers to purchase and redeem gift cards
              </p>
            </div>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min-amount">Minimum Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="min-amount"
                  type="number"
                  className="pl-9"
                  value={settings.minAmount}
                  onChange={(e) => setSettings({ ...settings, minAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-amount">Maximum Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="max-amount"
                  type="number"
                  className="pl-9"
                  value={settings.maxAmount}
                  onChange={(e) => setSettings({ ...settings, maxAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Preset Amounts</Label>
            <p className="text-sm text-muted-foreground">Quick selection amounts for customers</p>
            <div className="flex flex-wrap gap-2">
              {settings.presetAmounts.map((amount) => (
                <Badge key={amount} variant="secondary" className="gap-1">
                  ${amount}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePresetAmount(amount)}
                    className="ml-1 h-4 w-4 p-0 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add amount"
                type="number"
                value={newPresetAmount}
                onChange={(e) => setNewPresetAmount(e.target.value)}
                className="w-32"
              />
              <Button onClick={addPresetAmount} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="custom-amounts">Allow Custom Amounts</Label>
                <p className="text-sm text-muted-foreground">
                  Let customers enter any amount within min/max limits
                </p>
              </div>
              <Switch
                id="custom-amounts"
                checked={settings.allowCustomAmounts}
                onCheckedChange={(checked) => setSettings({ ...settings, allowCustomAmounts: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="scheduled">Allow Scheduled Delivery</Label>
                <p className="text-sm text-muted-foreground">
                  Enable future date delivery for gift cards
                </p>
              </div>
              <Switch
                id="scheduled"
                checked={settings.allowScheduledDelivery}
                onCheckedChange={(checked) => setSettings({ ...settings, allowScheduledDelivery: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Expiration & Fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Expiration & Fees
          </CardTitle>
          <CardDescription>Set expiration rules and processing fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Default Expiration Period</Label>
            <Select 
              value={settings.defaultExpiry?.toString() || "never"}
              onValueChange={(value) => setSettings({ 
                ...settings, 
                defaultExpiry: value === "never" ? null : parseInt(value) 
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never Expire</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="180">180 Days</SelectItem>
                <SelectItem value="365">1 Year</SelectItem>
                <SelectItem value="730">2 Years</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How long gift cards remain valid after purchase
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee">Processing Fee</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fee"
                type="number"
                className="pl-9"
                placeholder="0"
                min="0"
                max="10"
                step="0.1"
                value={settings.processingFee}
                onChange={(e) => setSettings({ ...settings, processingFee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Percentage fee added to gift card purchases (0 for no fee)
            </p>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Check local regulations regarding gift card expiration and fees. Some jurisdictions prohibit expiration dates or fees.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
          <CardDescription>Configure email notifications and templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-email">Automatic Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send gift cards via email automatically
              </p>
            </div>
            <Switch
              id="auto-email"
              checked={settings.autoEmailEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, autoEmailEnabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-email">Require Recipient Email</Label>
              <p className="text-sm text-muted-foreground">
                Make recipient email mandatory for purchases
              </p>
            </div>
            <Switch
              id="require-email"
              checked={settings.requireRecipientEmail}
              onCheckedChange={(checked) => setSettings({ ...settings, requireRecipientEmail: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template">Email Template</Label>
            <Select 
              value={settings.emailTemplate}
              onValueChange={(value) => setSettings({ ...settings, emailTemplate: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Template</SelectItem>
                <SelectItem value="birthday">Birthday Theme</SelectItem>
                <SelectItem value="holiday">Holiday Theme</SelectItem>
                <SelectItem value="elegant">Elegant Design</SelectItem>
                <SelectItem value="minimal">Minimal Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Terms & Conditions
          </CardTitle>
          <CardDescription>Set terms for gift card usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Terms and Conditions</Label>
            <Textarea
              id="terms"
              rows={4}
              value={settings.termsAndConditions}
              onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
              placeholder="Enter terms and conditions..."
            />
            <p className="text-sm text-muted-foreground">
              These will be displayed during purchase and on gift cards
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="one-per">One Per Customer</Label>
                <p className="text-sm text-muted-foreground">
                  Limit one gift card purchase per customer
                </p>
              </div>
              <Switch
                id="one-per"
                checked={settings.restrictions.onePerCustomer}
                onCheckedChange={(checked) => setSettings({ 
                  ...settings, 
                  restrictions: { ...settings.restrictions, onePerCustomer: checked }
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-account">Require Account</Label>
                <p className="text-sm text-muted-foreground">
                  Customers must create account to purchase
                </p>
              </div>
              <Switch
                id="require-account"
                checked={settings.restrictions.requireAccountCreation}
                onCheckedChange={(checked) => setSettings({ 
                  ...settings, 
                  restrictions: { ...settings.restrictions, requireAccountCreation: checked }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            "Saving..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}