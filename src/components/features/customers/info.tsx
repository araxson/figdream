'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { cn } from '@/lib/utils'

type Customer = Database['public']['Tables']['customers']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileInfo() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Get customer data
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      if (customerData) {
        setCustomer(customerData)
        setFormData({
          first_name: customerData.first_name || '',
          last_name: customerData.last_name || '',
          email: customerData.email || profileData?.email || '',
          phone: customerData.phone || ''
        })
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching profile:', error)
      }
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function handleSave() {
    if (!customer) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', customer.id)

      if (error) throw error

      setEditing(false)
      await fetchProfile()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating profile:', error)
      }
    } finally {
      setSaving(false)
    }
  }

  if (!customer) {
    return (
      <Card>
        <CardContent className={cn("py-12 text-center")}>
          Loading profile...
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className={cn("flex items-center justify-between")}>
          <CardTitle>Profile Information</CardTitle>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          ) : (
            <div className={cn("flex gap-2")}>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false)
                  fetchProfile()
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-6")}>
        <div className={cn("grid gap-4 md:grid-cols-2")}>
          <div className={cn("space-y-2")}>
            <Label htmlFor="first_name">
              <User className={cn("h-4 w-4 inline mr-2")} />
              First Name
            </Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className={cn("space-y-2")}>
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              disabled={!editing}
            />
          </div>

          <div className={cn("space-y-2")}>
            <Label htmlFor="email">
              <Mail className={cn("h-4 w-4 inline mr-2")} />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
            />
          </div>

          <div className={cn("space-y-2")}>
            <Label htmlFor="phone">
              <Phone className={cn("h-4 w-4 inline mr-2")} />
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