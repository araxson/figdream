"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Button, Skeleton } from "@/components/ui"
import { FavoriteCard } from "./favorite-card"
import { 
  Heart, 
  Search, 
  Filter, 
  Store, 
  User, 
  Scissors,
  Grid,
  List,
  SortAsc
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
type FavoriteType = 'salon' | 'staff' | 'service'
type Favorite = {
  id: string
  type: FavoriteType
  itemId: string
  itemName: string
  itemImage?: string
  itemDescription?: string
  addedAt: string
  lastVisited?: string
  bookingCount: number
  rating?: number
  price?: number
  duration?: number
  location?: string
}
export function FavoritesList() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FavoriteType | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy] = useState<'recent' | 'popular' | 'name'>('recent')
  useEffect(() => {
    fetchFavorites()
  }, [])
  async function fetchFavorites() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      // Fetch favorites from customer_preferences or dedicated table
      // Using mock data for now
      const mockFavorites: Favorite[] = [
        {
          id: "1",
          type: 'salon',
          itemId: "salon-1",
          itemName: "Glamour Studio Downtown",
          itemImage: "/placeholder-salon.jpg",
          itemDescription: "Full-service luxury salon",
          addedAt: "2024-11-01",
          lastVisited: "2024-12-15",
          bookingCount: 8,
          rating: 4.8,
          location: "123 Main St, Downtown"
        },
        {
          id: "2",
          type: 'staff',
          itemId: "staff-1",
          itemName: "Sarah Johnson",
          itemImage: "/placeholder-staff.jpg",
          itemDescription: "Senior Hair Stylist - Color Specialist",
          addedAt: "2024-10-15",
          lastVisited: "2024-12-10",
          bookingCount: 5,
          rating: 5.0,
          location: "Glamour Studio Downtown"
        },
        {
          id: "3",
          type: 'service',
          itemId: "service-1",
          itemName: "Premium Hair Color & Style",
          itemDescription: "Full color treatment with cut and style",
          addedAt: "2024-09-20",
          bookingCount: 3,
          rating: 4.9,
          price: 150,
          duration: 180
        },
        {
          id: "4",
          type: 'salon',
          itemId: "salon-2",
          itemName: "Zen Beauty Spa",
          itemImage: "/placeholder-salon2.jpg",
          itemDescription: "Relaxing spa and beauty treatments",
          addedAt: "2024-11-15",
          bookingCount: 2,
          rating: 4.7,
          location: "456 Oak Ave, Midtown"
        },
        {
          id: "5",
          type: 'service',
          itemId: "service-2",
          itemName: "Express Manicure",
          itemDescription: "Quick professional manicure",
          addedAt: "2024-12-01",
          bookingCount: 6,
          rating: 4.6,
          price: 35,
          duration: 30
        }
      ]
      setFavorites(mockFavorites)
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }
  const filteredFavorites = favorites
    .filter(fav => {
      const matchesTab = activeTab === 'all' || fav.type === activeTab
      const matchesSearch = fav.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (fav.itemDescription && fav.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesTab && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        case 'popular':
          return b.bookingCount - a.bookingCount
        case 'name':
          return a.itemName.localeCompare(b.itemName)
        default:
          return 0
      }
    })
  const stats = {
    salons: favorites.filter(f => f.type === 'salon').length,
    staff: favorites.filter(f => f.type === 'staff').length,
    services: favorites.filter(f => f.type === 'service').length,
    total: favorites.length
  }
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salons</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.salons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.staff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.services}</div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Favorites</CardTitle>
              <CardDescription>Your saved salons, staff, and services</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">All Favorites</TabsTrigger>
                <TabsTrigger value="salon">Salons</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="service">Services</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search favorites..."
                    className="pl-8 w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <SortAsc className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <TabsContent value={activeTab} className="mt-4">
              {filteredFavorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Start adding your favorite salons, staff members, and services to quickly access them here.
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 
                  "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : 
                  "space-y-4"
                }>
                  {filteredFavorites.map((favorite) => (
                    <FavoriteCard
                      key={favorite.id}
                      favorite={favorite}
                      viewMode={viewMode}
                      onRemove={() => {
                        setFavorites(favorites.filter(f => f.id !== favorite.id))
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}