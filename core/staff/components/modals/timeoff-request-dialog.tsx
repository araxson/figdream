"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

interface TimeOffRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Array<{ id: string; display_name: string }>
  onSubmitRequest: () => void
}

export function TimeOffRequestDialog({
  open,
  onOpenChange,
  staff,
  onSubmitRequest
}: TimeOffRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Time Off</DialogTitle>
          <DialogDescription>
            Submit a time-off request for approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" />
            </div>
          </div>

          <div>
            <Label>Type</Label>
            <Select defaultValue="vacation">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Reason / Notes</Label>
            <Textarea placeholder="Optional notes..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmitRequest}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}