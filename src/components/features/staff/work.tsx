'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function WorkInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Information</CardTitle>
        <CardDescription>Your professional details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="employee-id">Employee ID</Label>
          <Input id="employee-id" defaultValue="EMP-2025-003" disabled />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="position">Position</Label>
          <Select defaultValue="senior-stylist">
            <SelectTrigger id="position">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior-stylist">Junior Stylist</SelectItem>
              <SelectItem value="stylist">Stylist</SelectItem>
              <SelectItem value="senior-stylist">Senior Stylist</SelectItem>
              <SelectItem value="master-stylist">Master Stylist</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Input id="experience" type="number" defaultValue="8" />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="commission">Commission Rate (%)</Label>
          <Input id="commission" type="number" defaultValue="40" />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="license">License Number</Label>
          <Input id="license" defaultValue="LIC-123456" />
        </div>
      </CardContent>
    </Card>
  )
}