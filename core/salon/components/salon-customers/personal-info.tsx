"use client"

import { useState } from "react"
import { Edit2, Save, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface EditableFieldProps {
  label: string
  value?: string | null
  field: string
  type?: string
  options?: { value: string; label: string }[]
  onSave: (field: string, value: string) => Promise<void>
}

function EditableField({
  label,
  value,
  field,
  type = 'text',
  options,
  onSave
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(field, editValue)
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <div className="flex gap-2">
          {type === 'select' && options ? (
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="flex-1"
              disabled={isSaving}
            />
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="flex items-center justify-between group">
        <span className="text-sm">
          {value || <span className="text-muted-foreground">Not set</span>}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

interface CustomerPersonalInfoProps {
  customer: {
    display_name?: string | null
    first_name?: string | null
    last_name?: string | null
    email?: string | null
    phone?: string | null
    date_of_birth?: string | null
  }
  onSave: (field: string, value: string) => Promise<void>
}

export function CustomerPersonalInfo({
  customer,
  onSave
}: CustomerPersonalInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <EditableField
            label="Display Name"
            value={customer.display_name}
            field="display_name"
            onSave={onSave}
          />
          <EditableField
            label="Email"
            value={customer.email}
            field="email"
            type="email"
            onSave={onSave}
          />
          <EditableField
            label="First Name"
            value={customer.first_name}
            field="first_name"
            onSave={onSave}
          />
          <EditableField
            label="Last Name"
            value={customer.last_name}
            field="last_name"
            onSave={onSave}
          />
          <EditableField
            label="Phone"
            value={customer.phone}
            field="phone"
            type="tel"
            onSave={onSave}
          />
          <EditableField
            label="Date of Birth"
            value={customer.date_of_birth}
            field="date_of_birth"
            type="date"
            onSave={onSave}
          />
        </div>
      </CardContent>
    </Card>
  )
}