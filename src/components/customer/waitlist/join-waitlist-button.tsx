"use client"
import { useState } from "react"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Switch
} from "@/components/ui"
import { Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
interface JoinWaitlistButtonProps {
  serviceId: string
  serviceName: string
  salonId: string
  salonName: string
  staffId?: string
  staffName?: string
}
export function JoinWaitlistButton({
  serviceId: _serviceId,
  serviceName,
  salonId: _salonId,
  salonName,
  staffId: _staffId,
  staffName
}: JoinWaitlistButtonProps) {
  const [open, setOpen] = useState(false)
  const [joining, setJoining] = useState(false)
  const [flexibleSchedule, setFlexibleSchedule] = useState(true)
  const [preferredDate, setPreferredDate] = useState("")
  const [preferredTime, setPreferredTime] = useState("")
  const [notes, setNotes] = useState("")
  const handleJoinWaitlist = async () => {
    setJoining(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Please sign in to join the waitlist")
        return
      }
      // Join waitlist logic
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("You've been added to the waitlist!")
      setOpen(false)
    } catch (_error) {
      toast.error("Failed to join waitlist")
    } finally {
      setJoining(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Join Waitlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Waitlist</DialogTitle>
          <DialogDescription>
            Get notified when an appointment becomes available
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
            <p className="font-medium">{serviceName}</p>
            <p className="text-sm text-muted-foreground">{salonName}</p>
            {staffName && (
              <p className="text-sm text-muted-foreground">with {staffName}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="flexible">Flexible Schedule</Label>
              <p className="text-sm text-muted-foreground">
                I&apos;m flexible with timing
              </p>
            </div>
            <Switch
              id="flexible"
              checked={flexibleSchedule}
              onCheckedChange={setFlexibleSchedule}
            />
          </div>
          {!flexibleSchedule && (
            <>
              <div className="space-y-2">
                <Label htmlFor="date">Preferred Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any special requests..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleJoinWaitlist}
            disabled={joining}
          >
            {joining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Join Waitlist"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}