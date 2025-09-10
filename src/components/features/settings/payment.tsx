'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PaymentSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>Configure payment processing and fees</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="payment-provider">Payment Provider</Label>
            <Select defaultValue="stripe">
              <SelectTrigger id="payment-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="publishable-key">Publishable Key</Label>
            <Input id="publishable-key" type="password" placeholder="pk_live_..." />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="secret-key">Secret Key</Label>
            <Input id="secret-key" type="password" placeholder="sk_live_..." />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="webhook-secret">Webhook Secret</Label>
            <Input id="webhook-secret" type="password" placeholder="whsec_..." />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="platform-fee">Platform Fee (%)</Label>
            <Input id="platform-fee" type="number" defaultValue="2.5" step="0.1" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="min-payout">Minimum Payout Amount ($)</Label>
            <Input id="min-payout" type="number" defaultValue="10" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="test-mode">Test Mode</Label>
              <Switch id="test-mode" />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-payout">Automatic Payouts</Label>
              <Switch id="auto-payout" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="refunds">Allow Refunds</Label>
              <Switch id="refunds" defaultChecked />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">Test Connection</Button>
          <Button>Save Payment Settings</Button>
        </div>
      </CardContent>
    </Card>
  )
}