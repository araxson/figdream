'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Scissors,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  avatar?: string
  rating: number
  totalBookings: number
  revenue: number
  availability: 'available' | 'busy' | 'off'
  schedule: {
    today: string
    tomorrow: string
  }
  services: string[]
  performance: {
    bookingRate: number
    customerSatisfaction: number
    revenue: number
  }
  isActive: boolean
}

interface StaffEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: StaffMember
  onSave: (staff: StaffMember) => void
}

export function StaffEditDialog({ open, onOpenChange, staff, onSave }: StaffEditDialogProps) {
  const [editedStaff, setEditedStaff] = React.useState(staff)

  React.useEffect(() => {
    setEditedStaff(staff)
  }, [staff])

  const handleSave = () => {
    onSave(editedStaff)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-2xl")}>
        <DialogHeader>
          <DialogTitle className={cn("text-xl flex items-center gap-2")}>
            <User className={cn("h-5 w-5")} />
            Edit Staff Member
          </DialogTitle>
          <DialogDescription>
            Update staff member information and settings
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className={cn("max-h-[60vh]")}>
          <div className={cn("grid gap-6 py-4 pr-4")}>
            {/* Personal Information Section */}
            <div className={cn("space-y-4")}>
              <div className={cn("flex items-center gap-2")}>
                <Badge variant="outline" className={cn("gap-1")}>
                  <User className={cn("h-3 w-3")} />
                  Personal Information
                </Badge>
              </div>
              <div className={cn("grid grid-cols-2 gap-4")}>
                <div className={cn("space-y-2")}>
                  <Label htmlFor="name" className={cn("flex items-center gap-2")}>
                    <User className={cn("h-4 w-4 text-muted-foreground")} />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={editedStaff.name}
                    onChange={(e) => setEditedStaff({ ...editedStaff, name: e.target.value })}
                    className={cn("focus:ring-2")}
                    placeholder="Enter full name"
                  />
                </div>
                <div className={cn("space-y-2")}>
                  <Label htmlFor="role" className={cn("flex items-center gap-2")}>
                    <Briefcase className={cn("h-4 w-4 text-muted-foreground")} />
                    Role
                  </Label>
                  <Select
                    value={editedStaff.role}
                    onValueChange={(value) => setEditedStaff({ ...editedStaff, role: value })}
                  >
                    <SelectTrigger id="role" className={cn("focus:ring-2")}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stylist">Stylist</SelectItem>
                      <SelectItem value="Senior Stylist">Senior Stylist</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Receptionist">Receptionist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact Information Section */}
            <div className={cn("space-y-4")}>
              <div className={cn("flex items-center gap-2")}>
                <Badge variant="outline" className={cn("gap-1")}>
                  <Mail className={cn("h-3 w-3")} />
                  Contact Information
                </Badge>
              </div>
              <div className={cn("grid grid-cols-2 gap-4")}>
                <div className={cn("space-y-2")}>
                  <Label htmlFor="email" className={cn("flex items-center gap-2")}>
                    <Mail className={cn("h-4 w-4 text-muted-foreground")} />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedStaff.email}
                    onChange={(e) => setEditedStaff({ ...editedStaff, email: e.target.value })}
                    className={cn("focus:ring-2")}
                    placeholder="email@example.com"
                  />
                </div>
                <div className={cn("space-y-2")}>
                  <Label htmlFor="phone" className={cn("flex items-center gap-2")}>
                    <Phone className={cn("h-4 w-4 text-muted-foreground")} />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={editedStaff.phone}
                    onChange={(e) => setEditedStaff({ ...editedStaff, phone: e.target.value })}
                    className={cn("focus:ring-2")}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Services Section */}
            <div className={cn("space-y-4")}>
              <div className={cn("flex items-center gap-2")}>
                <Badge variant="outline" className={cn("gap-1")}>
                  <Scissors className={cn("h-3 w-3")} />
                  Services & Skills
                </Badge>
              </div>
              <div className={cn("space-y-2")}>
                <Label htmlFor="services" className={cn("flex items-center gap-2")}>
                  <Scissors className={cn("h-4 w-4 text-muted-foreground")} />
                  Services Offered
                  <span className={cn("text-xs text-muted-foreground")}>*comma separated</span>
                </Label>
                <Textarea
                  id="services"
                  value={editedStaff.services.join(', ')}
                  onChange={(e) => setEditedStaff({ 
                    ...editedStaff, 
                    services: e.target.value.split(',').map(s => s.trim()) 
                  })}
                  className={cn("focus:ring-2 min-h-[80px]")}
                  placeholder="Haircut, Color, Styling, Treatment..."
                />
                <div className={cn("flex flex-wrap gap-2 mt-2")}>
                  {editedStaff.services.map((service, idx) => (
                    <Badge key={idx} variant="secondary" className={cn("gap-1")}>
                      <Scissors className={cn("h-3 w-3")} />
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {/* Status Section */}
            <div className={cn("space-y-4")}>
              <div className={cn("flex items-center gap-2")}>
                <Badge variant="outline" className={cn("gap-1")}>
                  <AlertCircle className={cn("h-3 w-3")} />
                  Account Status
                </Badge>
              </div>
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg",
                "bg-muted/50 border"
              )}>
                <div className={cn("space-y-1")}>
                  <Label htmlFor="active" className={cn("text-base font-medium")}>
                    Active Status
                  </Label>
                  <p className={cn("text-sm text-muted-foreground")}>
                    {editedStaff.isActive 
                      ? "Staff member can accept appointments" 
                      : "Staff member is temporarily unavailable"
                    }
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={editedStaff.isActive}
                  onCheckedChange={(checked) => setEditedStaff({ ...editedStaff, isActive: checked })}
                  className={cn("data-[state=checked]:bg-green-600")}
                />
              </div>
              {editedStaff.isActive && (
                <div className={cn("flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20")}>
                  <CheckCircle className={cn("h-4 w-4 text-green-600")} />
                  <span className={cn("text-sm text-green-700 dark:text-green-400")}>
                    This staff member is active and can receive bookings
                  </span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className={cn("gap-2")}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className={cn("gap-2")}
          >
            <X className={cn("h-4 w-4")} />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className={cn("gap-2")}
          >
            <Save className={cn("h-4 w-4")} />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}