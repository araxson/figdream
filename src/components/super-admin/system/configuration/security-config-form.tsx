'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Label, Switch, Alert, AlertDescription } from '@/components/ui'
import { Shield, Save, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import type { Database } from '@/types/database.types'
type SystemConfiguration = Database['public']['Tables']['system_configurations']['Row']
interface SecurityConfigFormProps {
  configurations: SystemConfiguration[]
}
export function SecurityConfigForm({ configurations: _configurations }: SecurityConfigFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    // Authentication
    require_email_verification: true,
    allow_registration: true,
    max_login_attempts: 5,
    lockout_duration_minutes: 30,
    session_timeout_minutes: 1440, // 24 hours
    // Password Policy
    min_password_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_chars: true,
    password_expiry_days: 90,
    password_history_count: 3,
    // Two-Factor Authentication
    enable_2fa: false,
    enforce_2fa_for_admins: true,
    // Security Headers
    enable_hsts: true,
    enable_csp: true,
    enable_xss_protection: true,
    // Rate Limiting
    api_rate_limit_per_minute: 60,
    login_rate_limit_per_hour: 10,
    // Data Protection
    encrypt_sensitive_data: true,
    audit_log_retention_days: 90,
    backup_retention_days: 30,
  })
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      // Update each configuration
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('system_configurations')
          .upsert({
            key,
            value: value.toString(),
            category: 'security',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'key'
          })
        if (error) throw error
      }
      toast.success('Security settings updated successfully')
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save security settings')
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Changes to security settings may affect user access. Review carefully before saving.
        </AlertDescription>
      </Alert>
      {/* Authentication Settings */}
      <div className="space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Authentication Settings
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="require_email_verification">Require Email Verification</Label>
            <Switch
              id="require_email_verification"
              checked={settings.require_email_verification}
              onCheckedChange={(checked) => setSettings({ ...settings, require_email_verification: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow_registration">Allow New Registration</Label>
            <Switch
              id="allow_registration"
              checked={settings.allow_registration}
              onCheckedChange={(checked) => setSettings({ ...settings, allow_registration: checked })}
            />
          </div>
          <div>
            <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
            <Input
              id="max_login_attempts"
              type="number"
              value={settings.max_login_attempts}
              onChange={(e) => setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="lockout_duration_minutes">Lockout Duration (minutes)</Label>
            <Input
              id="lockout_duration_minutes"
              type="number"
              value={settings.lockout_duration_minutes}
              onChange={(e) => setSettings({ ...settings, lockout_duration_minutes: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="session_timeout_minutes">Session Timeout (minutes)</Label>
            <Input
              id="session_timeout_minutes"
              type="number"
              value={settings.session_timeout_minutes}
              onChange={(e) => setSettings({ ...settings, session_timeout_minutes: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
      {/* Password Policy */}
      <div className="space-y-4">
        <h3 className="font-medium">Password Policy</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="min_password_length">Minimum Password Length</Label>
            <Input
              id="min_password_length"
              type="number"
              value={settings.min_password_length}
              onChange={(e) => setSettings({ ...settings, min_password_length: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="password_expiry_days">Password Expiry (days)</Label>
            <Input
              id="password_expiry_days"
              type="number"
              value={settings.password_expiry_days}
              onChange={(e) => setSettings({ ...settings, password_expiry_days: parseInt(e.target.value) })}
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="require_uppercase">Require Uppercase</Label>
            <Switch
              id="require_uppercase"
              checked={settings.require_uppercase}
              onCheckedChange={(checked) => setSettings({ ...settings, require_uppercase: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="require_lowercase">Require Lowercase</Label>
            <Switch
              id="require_lowercase"
              checked={settings.require_lowercase}
              onCheckedChange={(checked) => setSettings({ ...settings, require_lowercase: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="require_numbers">Require Numbers</Label>
            <Switch
              id="require_numbers"
              checked={settings.require_numbers}
              onCheckedChange={(checked) => setSettings({ ...settings, require_numbers: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="require_special_chars">Require Special Characters</Label>
            <Switch
              id="require_special_chars"
              checked={settings.require_special_chars}
              onCheckedChange={(checked) => setSettings({ ...settings, require_special_chars: checked })}
            />
          </div>
        </div>
      </div>
      {/* Two-Factor Authentication */}
      <div className="space-y-4">
        <h3 className="font-medium">Two-Factor Authentication</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable_2fa">Enable 2FA</Label>
            <Switch
              id="enable_2fa"
              checked={settings.enable_2fa}
              onCheckedChange={(checked) => setSettings({ ...settings, enable_2fa: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enforce_2fa_for_admins">Enforce 2FA for Admins</Label>
            <Switch
              id="enforce_2fa_for_admins"
              checked={settings.enforce_2fa_for_admins}
              onCheckedChange={(checked) => setSettings({ ...settings, enforce_2fa_for_admins: checked })}
            />
          </div>
        </div>
      </div>
      {/* Rate Limiting */}
      <div className="space-y-4">
        <h3 className="font-medium">Rate Limiting</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="api_rate_limit_per_minute">API Rate Limit (per minute)</Label>
            <Input
              id="api_rate_limit_per_minute"
              type="number"
              value={settings.api_rate_limit_per_minute}
              onChange={(e) => setSettings({ ...settings, api_rate_limit_per_minute: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="login_rate_limit_per_hour">Login Rate Limit (per hour)</Label>
            <Input
              id="login_rate_limit_per_hour"
              type="number"
              value={settings.login_rate_limit_per_hour}
              onChange={(e) => setSettings({ ...settings, login_rate_limit_per_hour: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
      {/* Data Protection */}
      <div className="space-y-4">
        <h3 className="font-medium">Data Protection</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="encrypt_sensitive_data">Encrypt Sensitive Data</Label>
            <Switch
              id="encrypt_sensitive_data"
              checked={settings.encrypt_sensitive_data}
              onCheckedChange={(checked) => setSettings({ ...settings, encrypt_sensitive_data: checked })}
            />
          </div>
          <div>
            <Label htmlFor="audit_log_retention_days">Audit Log Retention (days)</Label>
            <Input
              id="audit_log_retention_days"
              type="number"
              value={settings.audit_log_retention_days}
              onChange={(e) => setSettings({ ...settings, audit_log_retention_days: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="backup_retention_days">Backup Retention (days)</Label>
            <Input
              id="backup_retention_days"
              type="number"
              value={settings.backup_retention_days}
              onChange={(e) => setSettings({ ...settings, backup_retention_days: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Security Settings
          </>
        )}
      </Button>
    </div>
  )
}