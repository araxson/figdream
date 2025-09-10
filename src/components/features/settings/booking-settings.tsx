'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function BookingSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Settings</CardTitle>
        <CardDescription>Configure booking rules and policies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="online-booking">Allow Online Booking</Label>
            <Switch id="online-booking" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="advance-booking">Advance Booking Period</Label>
            <Select defaultValue="30">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="min-notice">Minimum Notice (hours)</Label>
            <Input id="min-notice" type="number" defaultValue="24" className="w-32" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="cancellation">Cancellation Period (hours)</Label>
            <Input id="cancellation" type="number" defaultValue="24" className="w-32" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="deposit">Require Deposit</Label>
            <Switch id="deposit" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="deposit-amount">Deposit Amount (%)</Label>
            <Input id="deposit-amount" type="number" defaultValue="20" className="w-32" />
          </div>
        </div>
        
        <Button className="w-full">Save Settings</Button>
      </CardContent>
    </Card>
  )
}