"use client"

import { Edit, Save, X, Share2, Download } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { ProfileHeaderProps } from "../profile-view-utils/profile-view-types"

export function ProfileHeaderSection({
  staff,
  isEditing,
  formData,
  onFormDataChange,
  onEdit,
  onSave,
  onCancel,
  onClose,
  showActions
}: ProfileHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={staff.avatar_url} />
          <AvatarFallback className="text-xl">
            {staff.display_name?.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? (
              <Input
                value={formData.display_name}
                onChange={(e) => onFormDataChange({ ...formData, display_name: e.target.value })}
                className="max-w-xs"
              />
            ) : (
              staff.display_name
            )}
          </h2>
          <p className="text-muted-foreground">
            {isEditing ? (
              <Input
                value={formData.title}
                onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                className="max-w-xs mt-1"
              />
            ) : (
              staff.title
            )}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant={staff.is_bookable ? "default" : "secondary"}>
              {staff.is_bookable ? "Bookable" : "Not Bookable"}
            </Badge>
            <Badge variant={staff.is_featured ? "default" : "outline"}>
              {staff.is_featured ? "Featured" : "Regular"}
            </Badge>
            <Badge variant={staff.status === "available" ? "success" : "secondary"}>
              {staff.status}
            </Badge>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}