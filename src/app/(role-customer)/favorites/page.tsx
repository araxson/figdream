import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MapPin, Calendar, User } from "lucide-react"

export default async function FavoritesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get customer
  const { data: customer } = await supabase
    .from("customers")
    .select(`
      *,
      profiles (full_name, email)
    `)
    .eq("user_id", user.id)
    .single()

  if (!customer) redirect("/error-403")

  // Favorites feature will be implemented when customer_favorites table is added to database
  // Using empty arrays as fallback until then
  const favoriteSalons: Array<never> = []
  const favoriteStaff: Array<never> = []
  const favoriteServices: Array<never> = []

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <p className="text-muted-foreground">Your saved salons, staff, and services</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Salons</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteSalons?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Saved locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteStaff?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Preferred stylists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Services</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteServices?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Saved services</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="salons" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="salons">Salons</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="salons">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Salons</CardTitle>
              <CardDescription>Your saved salon locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Favorites will be displayed here when customer_favorites table is implemented */}

                {(!favoriteSalons || favoriteSalons.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No favorite salons yet</p>
                    <p className="text-sm">Save salons you love for quick access!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Staff</CardTitle>
              <CardDescription>Your preferred service providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Favorite staff will be displayed here when customer_favorites table is implemented */}

                {(!favoriteStaff || favoriteStaff.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No favorite staff yet</p>
                    <p className="text-sm">Save your preferred stylists for easy booking!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Favorite Services</CardTitle>
              <CardDescription>Services you book frequently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Favorite services will be displayed here when customer_favorites table is implemented */}

                {(!favoriteServices || favoriteServices.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No favorite services yet</p>
                    <p className="text-sm">Save services you love for quick booking!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Book from your favorites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Book with favorite staff
            </Button>
            <Button variant="outline" className="justify-start">
              <MapPin className="h-4 w-4 mr-2" />
              Visit favorite salon
            </Button>
            <Button variant="outline" className="justify-start">
              <Heart className="h-4 w-4 mr-2" />
              Book favorite service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}