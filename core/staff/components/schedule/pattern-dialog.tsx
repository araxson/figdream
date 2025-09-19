"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SchedulePatternDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Array<{ id: string; display_name: string }>
  onApplySchedule: () => void
}

export function SchedulePatternDialog({
  open,
  onOpenChange,
  staff,
  onApplySchedule
}: SchedulePatternDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set Recurring Schedule</DialogTitle>
          <DialogDescription>
            Define a weekly schedule pattern that repeats automatically
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Staff Member</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pattern Type</Label>
              <Select defaultValue="weekly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Weekly Schedule Grid */}
          <div className="space-y-2">
            <Label>Weekly Schedule</Label>
            <div className="border rounded-lg p-4 space-y-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                <div key={day} className="flex items-center gap-4">
                  <Switch id={day.toLowerCase()} />
                  <Label htmlFor={day.toLowerCase()} className="w-24">
                    {day}
                  </Label>
                  <Input type="time" defaultValue="09:00" className="w-32" />
                  <span>to</span>
                  <Input type="time" defaultValue="17:00" className="w-32" />
                  <Button variant="outline" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Break
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>End Date (Optional)</Label>
              <Input type="date" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onApplySchedule}>
            Apply Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}