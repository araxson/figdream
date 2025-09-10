'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CreditCard, DollarSign, Percent, Shield } from 'lucide-react'
import { useState } from 'react'

export function SettingsPayment() {
  const [paymentSettings, setPaymentSettings] = useState({
    currency: 'USD',
    taxRate: 8.5,
    acceptCash: true,
    acceptCard: true,
    acceptOnline: true,
    requireDeposit: false,
    depositPercentage: 20,
    cancellationFee: 25,
    processingFee: 2.9,
    tipOptions: [15, 18, 20, 25]
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
  }

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Stripe',
      status: 'active',
      lastFour: '4242',
      type: 'card'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      status: 'inactive',
      email: 'salon@example.com',
      type: 'paypal'
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Configure accepted payment methods and processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.type === 'card' 
                        ? `•••• ${method.lastFour}`
                        : method.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={method.status === 'active' ? 'default' : 'secondary'}>
                    {method.status}
                  </Badge>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full">
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>
            Configure payment options and policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={paymentSettings.currency}
                onValueChange={(value) => 
                  setPaymentSettings({ ...paymentSettings, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                value={paymentSettings.taxRate}
                onChange={(e) => 
                  setPaymentSettings({ ...paymentSettings, taxRate: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Accepted Payment Types</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="cash">Cash Payments</Label>
                </div>
                <Switch
                  id="cash"
                  checked={paymentSettings.acceptCash}
                  onCheckedChange={(checked) => 
                    setPaymentSettings({ ...paymentSettings, acceptCash: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="card">Card Payments</Label>
                </div>
                <Switch
                  id="card"
                  checked={paymentSettings.acceptCard}
                  onCheckedChange={(checked) => 
                    setPaymentSettings({ ...paymentSettings, acceptCard: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="online">Online Payments</Label>
                </div>
                <Switch
                  id="online"
                  checked={paymentSettings.acceptOnline}
                  onCheckedChange={(checked) => 
                    setPaymentSettings({ ...paymentSettings, acceptOnline: checked })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Deposit & Cancellation</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="deposit">Require Deposit</Label>
                <Switch
                  id="deposit"
                  checked={paymentSettings.requireDeposit}
                  onCheckedChange={(checked) => 
                    setPaymentSettings({ ...paymentSettings, requireDeposit: checked })
                  }
                />
              </div>

              {paymentSettings.requireDeposit && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="depositPercentage">Deposit Percentage</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="depositPercentage"
                        type="number"
                        value={paymentSettings.depositPercentage}
                        onChange={(e) => 
                          setPaymentSettings({ 
                            ...paymentSettings, 
                            depositPercentage: parseInt(e.target.value) 
                          })
                        }
                      />
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cancellationFee">Cancellation Fee</Label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cancellationFee"
                        type="number"
                        value={paymentSettings.cancellationFee}
                        onChange={(e) => 
                          setPaymentSettings({ 
                            ...paymentSettings, 
                            cancellationFee: parseFloat(e.target.value) 
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}