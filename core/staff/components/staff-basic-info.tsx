"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { StaffProfile } from "../dal/staff-types"

interface StaffBasicInfoProps {
  staff: StaffProfile
  formData: {
    display_name: string
    first_name: string
    last_name: string
    title: string
    email: string
    phone: string
    bio: string
    is_bookable: boolean
    is_featured: boolean
  }
  isEditing: boolean
  onFormDataChange: (updates: Partial<StaffBasicInfoProps['formData']>) => void
}

export function StaffBasicInfo({
  staff,
  formData,
  isEditing,
  onFormDataChange
}: StaffBasicInfoProps) {
  return (
    <>
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Display Name</Label>
              {isEditing ? (
                <Input
                  value={formData.display_name}
                  onChange={(e) => onFormDataChange({ display_name: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.display_name}</p>
              )}
            </div>
            <div>
              <Label>Title</Label>
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e) => onFormDataChange({ title: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.title}</p>
              )}
            </div>
            <div>
              <Label>First Name</Label>
              {isEditing ? (
                <Input
                  value={formData.first_name}
                  onChange={(e) => onFormDataChange({ first_name: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.first_name}</p>
              )}
            </div>
            <div>
              <Label>Last Name</Label>
              {isEditing ? (
                <Input
                  value={formData.last_name}
                  onChange={(e) => onFormDataChange({ last_name: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.last_name}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormDataChange({ email: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.email}</p>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => onFormDataChange({ phone: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.phone}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            {isEditing ? (
              <Textarea
                value={formData.bio}
                onChange={(e) => onFormDataChange({ bio: e.target.value })}
                rows={4}
              />
            ) : (
              <p className="text-sm mt-1">{staff.bio || "No bio provided"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Available for Booking</Label>
              <p className="text-sm text-muted-foreground">Allow customers to book with this staff member</p>
            </div>
            {isEditing ? (
              <Switch
                checked={formData.is_bookable}
                onCheckedChange={(checked) => onFormDataChange({ is_bookable: checked })}
              />
            ) : (
              <Switch checked={staff.is_bookable} disabled />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Featured Staff</Label>
              <p className="text-sm text-muted-foreground">Highlight this staff member on the website</p>
            </div>
            {isEditing ? (
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) => onFormDataChange({ is_featured: checked })}
              />
            ) : (
              <Switch checked={staff.is_featured} disabled />
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}