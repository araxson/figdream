import { createClient } from "@/lib/database/supabase/server"
import { redirect } from "next/navigation"
import { 
  getLocationManagerData, 
  getLocationSettings 
} from "@/lib/data-access/location-manager"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Label,
  Separator,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui"
import { 
  Settings,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Info,
  Building
} from "lucide-react"

export default async function LocationSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login/location-manager")
  }
  
  // Get location manager's data and settings
  let locationData
  let settings
  
  try {
    locationData = await getLocationManagerData(user.id)
    settings = await getLocationSettings(locationData.locationId)
  } catch (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Error: Unable to load settings. {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
  
  const businessHours = settings.business_hours || {}
  const bookingRules = settings.booking_rules || {}
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Location Settings</h1>
        <p className="text-muted-foreground">
          View settings for {locationData.location.name}
        </p>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          As a location manager, you have read-only access to these settings. 
          Contact your salon owner to make changes.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="location" className="space-y-4">
        <TabsList>
          <TabsTrigger value="location">Location Info</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
          <TabsTrigger value="booking">Booking Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="location" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Information</CardTitle>
              <CardDescription>Basic details about your location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Location Name</Label>
                  <p className="font-medium">{locationData.location.name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div>
                    {locationData.location.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </h3>
                <div className="space-y-2">
                  <p>{locationData.location.address_line_1}</p>
                  {locationData.location.address_line_2 && (
                    <p>{locationData.location.address_line_2}</p>
                  )}
                  <p>
                    {locationData.location.city}, {locationData.location.state_province} {locationData.location.postal_code}
                  </p>
                  <p>{locationData.location.country}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                {locationData.location.phone && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    <p className="font-medium">{locationData.location.phone}</p>
                  </div>
                )}
                
                {locationData.location.email && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="font-medium">{locationData.location.email}</p>
                  </div>
                )}
              </div>
              
              {(locationData.location.latitude && locationData.location.longitude) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Coordinates</Label>
                    <p className="text-sm font-mono">
                      {locationData.location.latitude}, {locationData.location.longitude}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Operating hours for this location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const hours = businessHours[day] || { open: '09:00', close: '18:00', closed: false }
                  
                  return (
                    <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium capitalize w-24">{day}</span>
                      </div>
                      <div>
                        {hours.closed ? (
                          <Badge variant="secondary">Closed</Badge>
                        ) : (
                          <span className="text-sm">
                            {hours.open} - {hours.close}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Rules</CardTitle>
              <CardDescription>Configuration for appointment bookings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Advance Booking
                  </Label>
                  <p className="font-medium">
                    {bookingRules.advance_booking_days || 30} days in advance
                  </p>
                  <p className="text-xs text-muted-foreground">
                    How far in advance customers can book appointments
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Cancellation Window
                  </Label>
                  <p className="font-medium">
                    {bookingRules.cancellation_hours || 24} hours before appointment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Minimum notice required for cancellations
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Daily Booking Limit
                  </Label>
                  <p className="font-medium">
                    {bookingRules.max_bookings_per_day || 10} bookings per customer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Maximum appointments a customer can book per day
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Location Type
                  </Label>
                  <Badge variant="default">Physical Location</Badge>
                  <p className="text-xs text-muted-foreground">
                    In-person appointments only
                  </p>
                </div>
              </div>
              
              {bookingRules.special_notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Special Notes</Label>
                    <p className="text-sm">{bookingRules.special_notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Need to make changes?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Location settings can only be modified by salon owners. 
            Please contact your salon owner if you need to update any of these settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}