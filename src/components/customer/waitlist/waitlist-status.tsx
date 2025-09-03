"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button, Progress } from "@/components/ui"
import { Clock, Users, Calendar, Bell, X } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
interface WaitlistStatusProps {
  waitlistId?: string
}
export function WaitlistStatus({ waitlistId }: WaitlistStatusProps) {
  const [waitlistEntry, setWaitlistEntry] = useState<{
    id: string
    position: number
    totalInQueue: number
    serviceName: string
    salonName: string
    staffName: string
    joinedAt: string
    estimatedWait: string
    status: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchWaitlistStatus()
  }, [waitlistId])
  async function fetchWaitlistStatus() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      // Mock waitlist data
      const mockEntry = {
        id: "wl-001",
        position: 3,
        totalInQueue: 8,
        serviceName: "Premium Hair Color & Style",
        salonName: "Glamour Studio Downtown",
        staffName: "Sarah Johnson",
        joinedAt: "2024-12-20T10:00:00",
        estimatedWait: "2-3 days",
        status: 'waiting'
      }
      setWaitlistEntry(mockEntry)
    } catch (error) {
      console.error("Error fetching waitlist status:", error)
    } finally {
      setLoading(false)
    }
  }
  const handleLeaveWaitlist = async () => {
    try {
      // Leave waitlist logic
      toast.success("You've been removed from the waitlist")
      setWaitlistEntry(null)
    } catch (_error) {
      toast.error("Failed to leave waitlist")
    }
  }
  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  if (!waitlistEntry) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">You&apos;re not currently on any waitlist</p>
        </CardContent>
      </Card>
    )
  }
  const progressPercentage = ((waitlistEntry.totalInQueue - waitlistEntry.position + 1) / waitlistEntry.totalInQueue) * 100
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Waitlist Status</CardTitle>
            <CardDescription>
              Your position in the queue
            </CardDescription>
          </div>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Waiting
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/10 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Your Position</span>
            <span className="text-2xl font-bold">#{waitlistEntry.position}</span>
          </div>
          <Progress value={progressPercentage} />
          <p className="text-xs text-muted-foreground text-center">
            {waitlistEntry.position - 1} people ahead of you
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{waitlistEntry.serviceName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{waitlistEntry.staffName} at {waitlistEntry.salonName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Joined {format(new Date(waitlistEntry.joinedAt), 'MMM d, h:mm a')}</span>
          </div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Estimated Wait Time</span>
          </div>
          <p className="text-lg font-semibold">{waitlistEntry.estimatedWait}</p>
          <p className="text-xs text-muted-foreground mt-1">
            We&apos;ll notify you as soon as a spot opens up
          </p>
        </div>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleLeaveWaitlist}
        >
          <X className="h-4 w-4 mr-2" />
          Leave Waitlist
        </Button>
      </CardContent>
    </Card>
  )
}