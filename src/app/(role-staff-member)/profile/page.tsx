import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Calendar, Award, Briefcase } from "lucide-react"

export default async function StaffProfilePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get staff profile with full details
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      profiles (full_name, email, phone, avatar_url),
      salons (name, address),
      staff_services (
        services (name)
      )
    `)
    .eq("user_id", user.id)
    .single()

  if (!staffProfile) redirect("/error-403")

  const specialties = staffProfile.specialties || []
  const certifications = staffProfile.certifications || []
  const services = staffProfile.staff_services?.map((ss: any) => ss.services?.name) || []

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal and professional information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input 
                    id="full-name" 
                    defaultValue={staffProfile.profiles?.full_name || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input 
                    id="display-name" 
                    defaultValue={staffProfile.display_name || ""}
                    placeholder="How customers see your name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    defaultValue={staffProfile.profiles?.email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    defaultValue={staffProfile.profiles?.phone || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea 
                  id="bio" 
                  defaultValue={staffProfile.bio || ""}
                  placeholder="Tell customers about your experience and expertise"
                  rows={4}
                />
              </div>

              <Button>Save Personal Information</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
              <CardDescription>Your specialties and qualifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Specialties</Label>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty: string) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                  <Button size="sm" variant="outline">Add Specialty</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((cert: string) => (
                    <Badge key={cert} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                  <Button size="sm" variant="outline">Add Certification</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Services</Label>
                <div className="text-sm text-muted-foreground">
                  Services you're authorized to perform
                </div>
                <div className="flex flex-wrap gap-2">
                  {services.map((service: string) => (
                    <Badge key={service}>
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input 
                    id="experience" 
                    type="number"
                    defaultValue={staffProfile.years_experience || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input 
                    id="license" 
                    defaultValue={staffProfile.license_number || ""}
                  />
                </div>
              </div>

              <Button>Save Professional Details</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Work Schedule</CardTitle>
              <CardDescription>Your regular working hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-24">{day}</span>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        defaultValue="09:00"
                        className="w-32"
                      />
                      <span>to</span>
                      <Input 
                        type="time" 
                        defaultValue="17:00"
                        className="w-32"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4">Update Schedule</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
              <CardDescription>How you appear to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold">
                    {staffProfile.display_name || staffProfile.profiles?.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {staffProfile.title || "Hair Stylist"}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{staffProfile.salons?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{staffProfile.profiles?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{staffProfile.profiles?.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(staffProfile.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  Upload Profile Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your performance at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Appointments</span>
                  <Badge>1,247</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">4.8</span>
                    <Award className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Client Retention</span>
                  <Badge variant="secondary">85%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">This Month</span>
                  <Badge variant="outline">52 appointments</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Who to contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="emergency-name">Contact Name</Label>
                <Input 
                  id="emergency-name" 
                  defaultValue={staffProfile.emergency_contact_name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-phone">Contact Phone</Label>
                <Input 
                  id="emergency-phone" 
                  type="tel"
                  defaultValue={staffProfile.emergency_contact_phone || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency-relation">Relationship</Label>
                <Input 
                  id="emergency-relation" 
                  defaultValue={staffProfile.emergency_contact_relation || ""}
                />
              </div>
              <Button className="w-full">Update Emergency Contact</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}