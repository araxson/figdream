"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { StaffProfile } from "../../dal/staff-types"

interface StaffProfessionalInfoProps {
  staff: StaffProfile
  formData: {
    experience_years: number
    employment_type: string
    commission_rate: number
    hourly_rate: number
    specializations: string[]
    languages: string[]
  }
  isEditing: boolean
  onFormDataChange: (updates: Partial<StaffProfessionalInfoProps['formData']>) => void
}

export function StaffProfessionalInfo({
  staff,
  formData,
  isEditing,
  onFormDataChange
}: StaffProfessionalInfoProps) {
  return (
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
                onChange={(e) => onFormDataChange({ experience_years: parseInt(e.target.value) })}
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
                onValueChange={(v) => onFormDataChange({ employment_type: v })}
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
                onChange={(e) => onFormDataChange({ commission_rate: parseFloat(e.target.value) })}
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
                onChange={(e) => onFormDataChange({ hourly_rate: parseFloat(e.target.value) })}
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
      </CardContent>
    </Card>
  )
}