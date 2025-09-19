"use client"

import { User, Mail, Phone, MapPin, Edit, Save, X, Download, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { StaffProfile } from "../dal/staff-types"

interface StaffProfileHeaderProps {
  staff: StaffProfile
  isEditing: boolean
  onEdit: () => void
  onSave: () => Promise<void>
  onCancel: () => void
  onClose?: () => void
  showActions?: boolean
}

export function StaffProfileHeader({
  staff,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onClose,
  showActions = true
}: StaffProfileHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={staff.avatar_url} />
          <AvatarFallback className="text-xl">
            {staff.display_name?.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{staff.display_name}</h1>
            {staff.is_featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Featured
              </Badge>
            )}
            {!staff.is_bookable && (
              <Badge variant="destructive">Unavailable</Badge>
            )}
          </div>

          <p className="text-lg text-muted-foreground">{staff.title}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {staff.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{staff.email}</span>
              </div>
            )}
            {staff.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{staff.phone}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span>{staff.experience_years} years experience</span>
            <span>•</span>
            <span className="capitalize">{staff.employment_type?.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}