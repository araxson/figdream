import { createClient } from '@/lib/database/supabase/server'
import { getCustomerByUserId } from '@/lib/data-access/customers'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { 
  Heart, 
  Users, 
  Bell, 
  Calendar, 
  Shield, 
  Palette,
  AlertTriangle,
  Clock,
  MapPin,
  Star
} from 'lucide-react'
import { PreferencesForm } from './preferences-form'
import { StaffPreferences } from './staff-preferences'
import { ServicePreferences } from './service-preferences'
import { BookingPreferences } from './booking-preferences'
import type { Database } from '@/types/database.types'

type CustomerPreference = Database['public']['Tables']['customer_preferences']['Row']
type PreferenceType = Database['public']['Enums']['preference_type']

export default async function CustomerPreferencesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login/customer')
  }

  const customer = await getCustomerByUserId(user.id)
  
  if (!customer) {
    redirect('/register/customer')
  }

  // Fetch existing preferences
  const { data: preferences } = await supabase
    .from('customer_preferences')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  // Group preferences by type
  const preferencesByType = preferences?.reduce((acc, pref) => {
    if (!acc[pref.preference_type]) {
      acc[pref.preference_type] = []
    }
    acc[pref.preference_type].push(pref)
    return acc
  }, {} as Record<PreferenceType, CustomerPreference[]>) || {}

  // Fetch favorite staff members
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      staff_id,
      staff_profiles!inner(
        id,
        user_id,
        title,
        bio,
        profiles!inner(
          full_name,
          avatar_url
        )
      )
    `)
    .eq('customer_id', customer.id)
    .eq('status', 'completed')
    .order('appointment_date', { ascending: false })
    .limit(50)

  // Calculate most visited staff
  const staffFrequency = appointments?.reduce((acc, apt) => {
    if (apt.staff_id) {
      acc[apt.staff_id] = (acc[apt.staff_id] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>) || {}

  const favoriteStaff = Object.entries(staffFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([staffId, count]) => {
      const staffData = appointments?.find(a => a.staff_id === staffId)?.staff_profiles
      return {
        id: staffId,
        name: staffData?.profiles.full_name || 'Unknown',
        avatar: staffData?.profiles.avatar_url || '',
        title: staffData?.title || 'Staff',
        visitCount: count
      }
    })

  // Fetch frequently booked services
  const { data: appointmentServices } = await supabase
    .from('appointment_services')
    .select(`
      service_id,
      services!inner(
        id,
        name,
        description,
        service_categories(
          name
        )
      ),
      appointments!inner(
        customer_id
      )
    `)
    .eq('appointments.customer_id', customer.id)

  const serviceFrequency = appointmentServices?.reduce((acc, as) => {
    acc[as.service_id] = (acc[as.service_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const favoriteServices = Object.entries(serviceFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([serviceId, count]) => {
      const serviceData = appointmentServices?.find(a => a.service_id === serviceId)?.services
      return {
        id: serviceId,
        name: serviceData?.name || 'Unknown',
        category: serviceData?.service_categories?.name || 'General',
        bookingCount: count
      }
    })

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Preferences</h1>
        <p className="text-muted-foreground">
          Customize your salon experience and communication preferences
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferences Set</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{preferences?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active preferences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Staff</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteStaff.length}</div>
            <p className="text-xs text-muted-foreground">
              Based on visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Services</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteServices.length}</div>
            <p className="text-xs text-muted-foreground">
              Most booked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preferences Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health & Safety Preferences</CardTitle>
              <CardDescription>
                Important information for your safety and comfort
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PreferencesForm 
                customerId={customer.id}
                existingPreferences={preferencesByType}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
              <CardDescription>
                How would you like us to contact you?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Appointment Reminders</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified 24 hours before your appointment
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Promotional Offers</p>
                      <p className="text-sm text-muted-foreground">
                        Receive exclusive deals and discounts
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferred Staff Members</CardTitle>
              <CardDescription>
                Select your favorite stylists and professionals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaffPreferences 
                customerId={customer.id}
                favoriteStaff={favoriteStaff}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Preferences</CardTitle>
              <CardDescription>
                Customize your service experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServicePreferences 
                customerId={customer.id}
                favoriteServices={favoriteServices}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Preferences</CardTitle>
              <CardDescription>
                Set your preferred booking times and locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingPreferences customerId={customer.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}