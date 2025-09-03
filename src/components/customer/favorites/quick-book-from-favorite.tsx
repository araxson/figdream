"use client"
import { useState } from "react"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui"
import { Calendar, Clock, DollarSign, MapPin, Loader2 } from "lucide-react"
import { Badge, Separator, Label, RadioGroup, RadioGroupItem } from "@/components/ui"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
type FavoriteType = 'salon' | 'staff' | 'service'
type Favorite = {
  id: string
  type: FavoriteType
  itemId: string
  itemName: string
  itemDescription?: string
  price?: number
  duration?: number
  location?: string
}
interface QuickBookFromFavoriteProps {
  favorite: Favorite
  size?: 'default' | 'sm' | 'lg' | 'icon'
}
export function QuickBookFromFavorite({ favorite, size = 'default' }: QuickBookFromFavoriteProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [booking, setBooking] = useState(false)
  const router = useRouter()
  // Generate next 7 days for quick selection
  const quickDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i)
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEE, MMM d'),
      date
    }
  })
  // Mock available time slots
  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM'
  ]
  const handleQuickBook = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time")
      return
    }
    setBooking(true)
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Booking confirmed!")
      setOpen(false)
      // Redirect to appropriate booking page based on favorite type
      switch (favorite.type) {
        case 'salon':
          router.push(`/book/${favorite.itemId}`)
          break
        case 'staff':
          router.push(`/book/staff/${favorite.itemId}`)
          break
        case 'service':
          router.push(`/book/service/${favorite.itemId}`)
          break
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      toast.error("Failed to create booking")
    } finally {
      setBooking(false)
    }
  }
  const getBookingUrl = () => {
    switch (favorite.type) {
      case 'salon':
        return `/book/${favorite.itemId}`
      case 'staff':
        return `/book/staff/${favorite.itemId}`
      case 'service':
        return `/book/service/${favorite.itemId}`
      default:
        return '/book'
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size}>
          <Calendar className="h-4 w-4 mr-2" />
          Book Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Book</DialogTitle>
          <DialogDescription>
            Select a date and time for your appointment
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Item Details */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{favorite.itemName}</h4>
              <Badge variant="outline">
                {favorite.type}
              </Badge>
            </div>
            {favorite.itemDescription && (
              <p className="text-sm text-muted-foreground">{favorite.itemDescription}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
              {favorite.price && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${favorite.price}</span>
                </div>
              )}
              {favorite.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{favorite.duration} min</span>
                </div>
              )}
              {favorite.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{favorite.location}</span>
                </div>
              )}
            </div>
          </div>
          <Separator />
          {/* Date Selection */}
          <div className="space-y-3">
            <Label>Select Date</Label>
            <RadioGroup value={selectedDate} onValueChange={setSelectedDate}>
              <div className="grid grid-cols-2 gap-2">
                {quickDates.map((date) => (
                  <div key={date.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={date.value} id={date.value} />
                    <Label
                      htmlFor={date.value}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {date.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
          <Separator />
          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <Label>Available Times</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className="w-full"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {/* Selected Summary */}
          {selectedDate && selectedTime && (
            <div className="bg-primary/10 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium">Appointment Summary</p>
              <div className="text-sm text-muted-foreground">
                <p>{favorite.itemName}</p>
                <p>{format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')} at {selectedTime}</p>
                {favorite.price && <p>Total: ${favorite.price}</p>}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleQuickBook}
            disabled={!selectedDate || !selectedTime || booking}
          >
            {booking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(getBookingUrl())}
          >
            Full Booking Options
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}