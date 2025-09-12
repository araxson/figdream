'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { updateCustomer } from '@/lib/api/dal/customers'
import type { CustomerDTO } from '@/lib/api/dal/customers'
import type { ProfileDTO } from '@/lib/api/dal/profiles'

interface ProfileInfoClientProps {
  initialCustomer: CustomerDTO
  initialProfile: ProfileDTO
}

export function ProfileInfoClient({ 
  initialCustomer
}: ProfileInfoClientProps) {
  const [customer, setCustomer] = useState(initialCustomer)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    email: customer.email || '',
    phone: customer.phone || ''
  })

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateCustomer({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone
      })
      
      if (updated) {
        setCustomer(updated)
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setEditing(false)
    setFormData({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      email: customer.email || '',
      phone: customer.phone || ''
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              <User className="h-4 w-4 inline mr-2" />
              First Name
            </Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}