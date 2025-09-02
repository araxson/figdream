import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, MapPin, Clock, Phone, Globe, Mail, Instagram, Facebook } from "lucide-react"

export default async function SalonSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("*, salons (*)")
    .eq("user_id", user.id)
    .eq("role", "salon_owner")
    .single()

  if (!userRole) redirect("/error-403")

  const salon = userRole.salons

  // Get salon locations
  const { data: locations } = await supabase
    .from("salon_locations")
    .select("*")
    .eq("salon_id", userRole.salon_id)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Salon Settings</h1>
        <p className="text-muted-foreground">Manage your salon's information and settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your salon's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="salon-name">Salon Name</Label>
                <Input 
                  id="salon-name" 
                  defaultValue={salon?.name}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  defaultValue={salon?.description || ""}
                  placeholder="Tell customers about your salon"
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    defaultValue={salon?.phone}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    defaultValue={salon?.email}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  type="url"
                  defaultValue={salon?.website || ""}
                  placeholder="https://yoursalon.com"
                />
              </div>

              <Button>Save Basic Information</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Set your salon's operating hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                  <div key={day} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-32">
                      <Switch id={`${day}-open`} defaultChecked={day !== "Sunday"} />
                      <Label htmlFor={`${day}-open`} className="font-medium">
                        {day}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        defaultValue="09:00"
                        className="w-32"
                      />
                      <span>to</span>
                      <Input 
                        type="time" 
                        defaultValue="19:00"
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4">Save Business Hours</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Settings</CardTitle>
              <CardDescription>Manage your salon locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locations?.map((location, index) => (
                  <div key={location.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">
                        {location.is_primary ? "Primary Location" : `Location ${index + 1}`}
                      </h4>
                      {location.is_primary && (
                        <Badge>Primary</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input defaultValue={location.address} />
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>City</Label>
                          <Input defaultValue={location.city} />
                        </div>
                        <div className="space-y-2">
                          <Label>State</Label>
                          <Input defaultValue={location.state} />
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP Code</Label>
                          <Input defaultValue={location.zip_code} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Add New Location
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect your social accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="flex gap-2">
                  <Facebook className="h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="facebook" 
                    placeholder="facebook.com/yoursalon"
                    defaultValue={salon?.social_media?.facebook || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="flex gap-2">
                  <Instagram className="h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="instagram" 
                    placeholder="@yoursalon"
                    defaultValue={salon?.social_media?.instagram || ""}
                  />
                </div>
              </div>

              <Button className="w-full">Save Social Media</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>Configure booking preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="online-booking">Online Booking</Label>
                <Switch 
                  id="online-booking" 
                  defaultChecked={salon?.settings?.online_booking_enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="instant-booking">Instant Booking</Label>
                <Switch 
                  id="instant-booking"
                  defaultChecked={salon?.settings?.instant_booking_enabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Booking Window</Label>
                <Select defaultValue="30">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cancellation Policy</Label>
                <Select defaultValue="24">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No restriction</SelectItem>
                    <SelectItem value="2">2 hours notice</SelectItem>
                    <SelectItem value="6">6 hours notice</SelectItem>
                    <SelectItem value="12">12 hours notice</SelectItem>
                    <SelectItem value="24">24 hours notice</SelectItem>
                    <SelectItem value="48">48 hours notice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Save Booking Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="accept-cash">Accept Cash</Label>
                <Switch id="accept-cash" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="accept-card">Accept Cards</Label>
                <Switch id="accept-card" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require-deposit">Require Deposit</Label>
                <Switch id="require-deposit" />
              </div>

              <div className="space-y-2">
                <Label>Deposit Amount</Label>
                <Select defaultValue="20">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Save Payment Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}