"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProfileSectionProps } from "../profile-view-utils/profile-view-types"

export function ProfileInfoSection({ staff, isEditing, formData, onFormDataChange }: ProfileSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              {isEditing ? (
                <Input
                  value={formData.first_name}
                  onChange={(e) => onFormDataChange({ ...formData, first_name: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.first_name || "Not provided"}</p>
              )}
            </div>
            <div>
              <Label>Last Name</Label>
              {isEditing ? (
                <Input
                  value={formData.last_name}
                  onChange={(e) => onFormDataChange({ ...formData, last_name: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.last_name || "Not provided"}</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.email || "Not provided"}</p>
              )}
            </div>
            <div>
              <Label>Phone</Label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.phone || "Not provided"}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            {isEditing ? (
              <Textarea
                value={formData.bio}
                onChange={(e) => onFormDataChange({ ...formData, bio: e.target.value })}
                rows={4}
              />
            ) : (
              <p className="text-sm mt-1">{staff.bio || "No bio provided"}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Experience</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => onFormDataChange({ ...formData, experience_years: parseInt(e.target.value) })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.experience_years} years</p>
              )}
            </div>
            <div>
              <Label>Employment Type</Label>
              {isEditing ? (
                <Select
                  value={formData.employment_type}
                  onValueChange={(v) => onFormDataChange({ ...formData, employment_type: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm mt-1 capitalize">
                  {staff.employment_type?.replace('_', ' ')}
                </p>
              )}
            </div>
            <div>
              <Label>Commission Rate</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.commission_rate}
                  onChange={(e) => onFormDataChange({ ...formData, commission_rate: parseFloat(e.target.value) })}
                />
              ) : (
                <p className="text-sm mt-1">{staff.commission_rate}%</p>
              )}
            </div>
            <div>
              <Label>Hourly Rate</Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => onFormDataChange({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                />
              ) : (
                <p className="text-sm mt-1">${staff.hourly_rate}/hr</p>
              )}
            </div>
          </div>

          <div>
            <Label>Specializations</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(staff.specializations || []).map((spec, index) => (
                <Badge key={index} variant="secondary">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Languages</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(staff.languages || []).map((lang, index) => (
                <Badge key={index} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="bookable"
                checked={isEditing ? formData.is_bookable : staff.is_bookable}
                onCheckedChange={(checked) =>
                  isEditing && onFormDataChange({ ...formData, is_bookable: checked })
                }
                disabled={!isEditing}
              />
              <Label htmlFor="bookable">Available for Booking</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={isEditing ? formData.is_featured : staff.is_featured}
                onCheckedChange={(checked) =>
                  isEditing && onFormDataChange({ ...formData, is_featured: checked })
                }
                disabled={!isEditing}
              />
              <Label htmlFor="featured">Featured Staff</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}