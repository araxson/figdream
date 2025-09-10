'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Shield, Key, Smartphone, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { useState } from 'react'

export function SettingsSecurity() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    requireStrongPassword: true,
    ipWhitelisting: false,
    auditLogging: true
  })

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const loginHistory = [
    {
      id: 1,
      date: new Date().toISOString(),
      ip: '192.168.1.1',
      device: 'Chrome on MacOS',
      location: 'New York, US',
      status: 'success'
    },
    {
      id: 2,
      date: new Date(Date.now() - 86400000).toISOString(),
      ip: '192.168.1.2',
      device: 'Safari on iPhone',
      location: 'New York, US',
      status: 'success'
    },
    {
      id: 3,
      date: new Date(Date.now() - 172800000).toISOString(),
      ip: '192.168.1.3',
      device: 'Chrome on Windows',
      location: 'Unknown',
      status: 'failed'
    }
  ]

  const handlePasswordChange = () => {
    // Handle password change
    setPasswordForm({ current: '', new: '', confirm: '' })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Overview</CardTitle>
          <CardDescription>
            Manage your account security and access controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Security Score</p>
                <p className="text-2xl font-bold">85/100</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Key className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Last Password Change</p>
                <p className="text-sm text-muted-foreground">30 days ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <Smartphone className="h-8 w-8 text-purple-600" />
              <div>
                <p className="font-medium">2FA Status</p>
                <Badge variant="default">Enabled</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password regularly for better security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current Password</Label>
            <Input
              id="current"
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New Password</Label>
            <Input
              id="new"
              type="password"
              value={passwordForm.new}
              onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
            />
            {securitySettings.requireStrongPassword && (
              <p className="text-xs text-muted-foreground">
                Must contain at least 8 characters, including uppercase, lowercase, number, and symbol
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input
              id="confirm"
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            />
          </div>
          <Button onClick={handlePasswordChange}>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>
            Configure advanced security options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                id="2fa"
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => 
                  setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="audit">Audit Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Track all account activities and changes
                </p>
              </div>
              <Switch
                id="audit"
                checked={securitySettings.auditLogging}
                onCheckedChange={(checked) => 
                  setSecuritySettings({ ...securitySettings, auditLogging: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ip">IP Whitelisting</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict access to specific IP addresses
                </p>
              </div>
              <Switch
                id="ip"
                checked={securitySettings.ipWhitelisting}
                onCheckedChange={(checked) => 
                  setSecuritySettings({ ...securitySettings, ipWhitelisting: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="timeout">Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after {securitySettings.sessionTimeout} minutes of inactivity
                </p>
              </div>
              <Input
                id="timeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => 
                  setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })
                }
                className="w-20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Login Activity</CardTitle>
          <CardDescription>
            Monitor access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginHistory.map((login) => (
              <div key={login.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {login.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{login.device}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(login.date).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{login.location}</p>
                  <p className="text-xs text-muted-foreground">{login.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}